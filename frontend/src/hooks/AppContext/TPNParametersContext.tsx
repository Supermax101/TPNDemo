import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { Protocol } from '@/types/Protocol';
import { LineType } from '@/types/LineType';
import { FatEmulsion } from '@/types/FatEmulsion';
import { ActiveProtocol } from '@/types/ActiveProtocol';
import { StrengthProduct } from '@/types/StrengthProduct';
import { NonNutritionalLine, CalculationResult } from '@/lib/calculations/types';
import { 
    calculateSummary, 
    calculateEnteralVolume, 
    calculatePNLipidDose, 
    validateTreatmentPlan 
} from '@/lib/calculations/nnl-calculator';
import { useAppContext } from './AppContext';

// TPN Clinical Parameters Type
export interface TPNClinicalParameters {
    protocol: string;
    lineType: string;
    totalFluidIntake: number;
    infusionDuration: number;
    fatEmulsionType: string;
    fatDose?: number;
    fatInfusionDuration?: number;
    includeEnteralFeeding?: boolean;
    enteralFeedingVolume?: number;
    enteralFeedingFrequency?: number;
    nonNutritionalLines?: any;
}

export interface Step1FormData {
    // Basic parameters
    protocol: Protocol | null;
    lineType: LineType | null;
    totalFluidIntake: number | string;
    infuseOver: number | string;
    
    // Fat emulsion
    fatEmulsion: FatEmulsion | null;
    toRunOver: number | string;
    
    // Enteral feeding
    includeEnteralFeedingInTotalFluidIntake: boolean;
    enteralFeedingVolume: number | string;
    enteralEveryHours: number | string;
    enteralActiveProtocol: ActiveProtocol | null;
    enteralStrength: StrengthProduct | null;
    
    // Non-nutritional lines - Enhanced for interactive builder
    showNonNutritionalLines: boolean;
    nonNutritionalLines: NonNutritionalLine[];
    
    // Patient data for calculations
    dosingWeight: number | string;
}

interface TPNParametersContextType {
    formData: Step1FormData;
    updateFormData: (updates: Partial<Step1FormData>) => void;
    resetFormData: () => void;
    getTPNClinicalParameters: () => TPNClinicalParameters;
    isFormComplete: () => boolean;
    isPNLipidDoseValid: () => boolean;
    
    // Enhanced with calculations
    calculations: CalculationResult;
    enteralVolume: number;
    pnLipidDose: number;
    validationResult: { isValid: boolean; message?: string };
}

const defaultFormData: Step1FormData = {
    protocol: null,
    lineType: null,
    totalFluidIntake: '',
    infuseOver: 24,
    fatEmulsion: null,
    toRunOver: '',
    includeEnteralFeedingInTotalFluidIntake: false,
    enteralFeedingVolume: '',
    enteralEveryHours: '',
    enteralActiveProtocol: null,
    enteralStrength: null,
    showNonNutritionalLines: false,
    nonNutritionalLines: [{
        lineNumber: 1,
        dose: "1",
        additives: [{ 
            additive: "Sodium Chloride", 
            conc: "0.9" 
        }]
    }],
    dosingWeight: ''
};

const TPNParametersContext = createContext<TPNParametersContextType | undefined>(undefined);

export const TPNParametersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [formData, setFormData] = useState<Step1FormData>(defaultFormData);
    const appContext = useAppContext();

    const updateFormData = (updates: Partial<Step1FormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const resetFormData = () => {
        // Preserve dosing weight from EHR when resetting
        const ehrDosingWeight = appContext.appData?.dosingWeight || '';
        setFormData({
            ...defaultFormData,
            dosingWeight: ehrDosingWeight
        });
    };

    // Auto-sync dosing weight from EHR data when available
    useEffect(() => {
        if (appContext.appData?.dosingWeight) {
            // Always update dosing weight when patient data changes
            // This ensures switching patients updates the dosing weight
            setFormData(prev => ({ 
                ...prev, 
                dosingWeight: appContext.appData!.dosingWeight 
            }));
        }
    }, [appContext.appData?.dosingWeight]); // Only depend on the dosing weight value
    
    // Reset form data when patient changes (detected by patient ID change)
    useEffect(() => {
        if (appContext.patientId) {
            // When a new patient is loaded, reset the form but preserve the new dosing weight
            const newDosingWeight = appContext.appData?.dosingWeight || '';
            setFormData({
                ...defaultFormData,
                dosingWeight: newDosingWeight
            });
        }
    }, [appContext.patientId]); // Reset when patient ID changes

    // Real-time calculations using useMemo for performance
    const calculations = useMemo(() => {
        return calculateSummary(formData.nonNutritionalLines, formData.dosingWeight);
    }, [formData.nonNutritionalLines, formData.dosingWeight]);

    const enteralVolume = useMemo(() => {
        return calculateEnteralVolume(
            formData.enteralFeedingVolume,
            formData.enteralEveryHours,
            formData.dosingWeight
        );
    }, [formData.enteralFeedingVolume, formData.enteralEveryHours, formData.dosingWeight]);

    const pnLipidDose = useMemo(() => {
        return calculatePNLipidDose(
            formData.totalFluidIntake,
            calculations.totalVolume,
            enteralVolume,
            formData.includeEnteralFeedingInTotalFluidIntake
        );
    }, [formData.totalFluidIntake, calculations.totalVolume, enteralVolume, formData.includeEnteralFeedingInTotalFluidIntake]);

    const validationResult = useMemo(() => {
        return validateTreatmentPlan(
            formData.nonNutritionalLines,
            formData.includeEnteralFeedingInTotalFluidIntake,
            formData.enteralFeedingVolume,
            formData.enteralEveryHours
        );
    }, [formData.nonNutritionalLines, formData.includeEnteralFeedingInTotalFluidIntake, formData.enteralFeedingVolume, formData.enteralEveryHours]);

    const getTPNClinicalParameters = (): TPNClinicalParameters => {
        // Convert form data to TPN model format
        return {
            // Protocol and line type
            protocol: formData.protocol === 'neonatal' ? 'neonatal' : 'pediatric',
            lineType: formData.lineType === 'central' ? 'central' : 'peripheral',
            
            // Fluid and infusion parameters
            totalFluidIntake: Number(formData.totalFluidIntake) || 150, // default mL/kg
            infusionDuration: Number(formData.infuseOver) || 24, // default 24 hours
            
            // Fat emulsion parameters
            fatEmulsionType: mapFatEmulsionType(formData.fatEmulsion),
            fatDose: calculateFatDose(formData.totalFluidIntake, formData.fatEmulsion),
            fatInfusionDuration: Number(formData.toRunOver) || 24,
            
            // Enteral feeding parameters
            includeEnteralFeeding: formData.includeEnteralFeedingInTotalFluidIntake,
            enteralFeedingVolume: Number(formData.enteralFeedingVolume) || undefined,
            enteralFeedingFrequency: Number(formData.enteralEveryHours) || undefined
        };
    };

    const isFormComplete = (): boolean => {
        // Check only the VISIBLE required fields in Basic Parameters:
        // 1. protocol, 2. lineType, 3. totalFluidIntake, 4. infuseOver, 5. dosingWeight, 6. fatEmulsion
        
        const hasProtocol = formData.protocol !== null;
        const hasLineType = formData.lineType !== null;
        const hasFatEmulsion = formData.fatEmulsion !== null;
        
        // Check numeric fields are valid numbers > 0
        const totalFluidIntakeNum = Number(formData.totalFluidIntake);
        const infuseOverNum = Number(formData.infuseOver);
        const dosingWeightNum = Number(formData.dosingWeight);
        
        const hasValidTotalFluidIntake = !isNaN(totalFluidIntakeNum) && totalFluidIntakeNum > 0;
        const hasValidInfuseOver = !isNaN(infuseOverNum) && infuseOverNum > 0;
        const hasValidDosingWeight = !isNaN(dosingWeightNum) && dosingWeightNum > 0;
        
        return hasProtocol && 
               hasLineType && 
               hasValidTotalFluidIntake && 
               hasValidInfuseOver && 
               hasValidDosingWeight &&
               hasFatEmulsion;
    };

    const isPNLipidDoseValid = (): boolean => {
        // PN+Lipid Dose must be at least 10 mL/kg
        return !isNaN(pnLipidDose) && isFinite(pnLipidDose) && pnLipidDose >= 10;
    };

    return (
        <TPNParametersContext.Provider value={{
            formData,
            updateFormData,
            resetFormData,
            getTPNClinicalParameters,
            isFormComplete,
            isPNLipidDoseValid,
            calculations,
            enteralVolume,
            pnLipidDose,
            validationResult
        }}>
            {children}
        </TPNParametersContext.Provider>
    );
};

export const useTPNParameters = () => {
    const context = useContext(TPNParametersContext);
    if (context === undefined) {
        throw new Error('useTPNParameters must be used within a TPNParametersProvider');
    }
    return context;
};

// Helper functions
function mapFatEmulsionType(fatEmulsion: FatEmulsion | null): 'SMOFlipid_20' | 'Intralipid_20' | 'Omegaven_10' {
    if (!fatEmulsion) return 'SMOFlipid_20'; // default
    
    // Map your fat emulsion types to model expected values
    switch (fatEmulsion) {
        case 'smof':
            return 'SMOFlipid_20';
        case 'intralipid':
            return 'Intralipid_20';
        case 'omegaven':
            return 'Omegaven_10';
        default:
            return 'SMOFlipid_20';
    }
}

function calculateFatDose(totalFluidIntake: number | string, fatEmulsion: FatEmulsion | null): number {
    const fluidIntake = Number(totalFluidIntake) || 150;
    
    // Calculate fat dose based on fluid intake and fat emulsion type
    // This is a simplified calculation - you may need to adjust based on your clinical protocols
    if (!fatEmulsion) return 0;
    
    // Typical fat dose is 1-3 g/kg/day
    // For 20% emulsion: 1g = 5mL, so 2g/kg = 10mL/kg
    const fatPercentage = 0.15; // 15% of total fluid as fat emulsion
    return fluidIntake * fatPercentage / 5; // Convert mL to grams for 20% emulsion
}