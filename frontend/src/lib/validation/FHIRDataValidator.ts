/**
 * FHIR Data Validator
 * ❌ MOVED TO BACKEND: All validation logic is now in backend/pipeline/validation_processor.py
 * 
 * This file now only contains TypeScript interfaces and deprecated placeholders
 * for frontend compatibility.
 */

import { TPNPatientData, TPNLabData, TPNClinicalParameters } from "../client/EHRDataClientMock";
import { ILabResult } from "../app-data/IAppData";

// ===== INTERFACES AND CONSTANTS (KEPT FOR TYPE SAFETY) =====

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    missingLabs: string[];
    missingPatientData: string[];
    missingClinicalParams: string[];
    dataCompleteness: number; // 0-100%
}

export interface RequiredDataField {
    key: string;
    displayName: string;
    required: boolean;
    unit?: string;
    loincCodes?: string[];
}

// Required TPN lab values with LOINC codes
export const REQUIRED_TPN_LABS: RequiredDataField[] = [
    { key: 'sodium', displayName: 'Sodium', required: true, unit: 'mEq/L', loincCodes: ['2951-2'] },
    { key: 'potassium', displayName: 'Potassium', required: true, unit: 'mEq/L', loincCodes: ['2823-3'] },
    { key: 'chloride', displayName: 'Chloride', required: true, unit: 'mEq/L', loincCodes: ['2075-0'] },
    { key: 'glucose', displayName: 'Glucose', required: true, unit: 'mg/dL', loincCodes: ['2345-7'] },
    { key: 'calcium', displayName: 'Calcium', required: true, unit: 'mg/dL', loincCodes: ['17861-6'] },
    { key: 'phosphorus', displayName: 'Phosphorus', required: true, unit: 'mg/dL', loincCodes: ['2777-1'] },
    { key: 'magnesium', displayName: 'Magnesium', required: true, unit: 'mg/dL', loincCodes: ['19123-9'] },
    { key: 'albumin', displayName: 'Albumin', required: true, unit: 'g/dL', loincCodes: ['1751-7'] },
    { key: 'totalBilirubin', displayName: 'Total Bilirubin', required: false, unit: 'mg/dL', loincCodes: ['1975-2'] },
    { key: 'directBilirubin', displayName: 'Direct Bilirubin', required: false, unit: 'mg/dL', loincCodes: ['1968-7'] },
    { key: 'ast', displayName: 'AST', required: false, unit: 'U/L', loincCodes: ['1920-8'] },
    { key: 'alt', displayName: 'ALT', required: false, unit: 'U/L', loincCodes: ['1742-6'] },
    { key: 'triglycerides', displayName: 'Triglycerides', required: false, unit: 'mg/dL', loincCodes: ['2571-8'] }
];

// Required patient data fields
export const REQUIRED_PATIENT_DATA: RequiredDataField[] = [
    { key: 'mrn', displayName: 'Medical Record Number', required: true },
    { key: 'age', displayName: 'Age (days)', required: true, unit: 'days' },
    { key: 'gestationalAge', displayName: 'Gestational Age', required: true, unit: 'weeks' },
    { key: 'birthWeight', displayName: 'Birth Weight', required: true, unit: 'kg' },
    { key: 'dosingWeight', displayName: 'Current Weight', required: true, unit: 'kg' },
    { key: 'sex', displayName: 'Sex', required: true }
];

// Required clinical parameters
export const REQUIRED_CLINICAL_PARAMS: RequiredDataField[] = [
    { key: 'protocol', displayName: 'TPN Protocol', required: true },
    { key: 'lineType', displayName: 'Infusion Site', required: true },
    { key: 'totalFluidIntake', displayName: 'Total Fluid Intake', required: true, unit: 'mL/kg/day' },
    { key: 'infusionDuration', displayName: 'Infusion Duration', required: true, unit: 'hours' },
    { key: 'fatEmulsionType', displayName: 'Fat Emulsion Type', required: true }
];

// ===== DEPRECATED VALIDATOR CLASS =====

/**
 * ❌ DEPRECATED: All validation logic moved to backend
 * Use backend/pipeline/validation_processor.py instead
 */
export class FHIRDataValidator {
    
    /**
     * ❌ DEPRECATED: Moved to backend
     */
    public static validateTPNModelData(
        patientData: TPNPatientData,
        labData: TPNLabData,
        clinicalParameters: TPNClinicalParameters,
        rawLabResults?: ILabResult[]
    ): ValidationResult {
        console.warn("[FHIR_DATA_VALIDATOR] ❌ DEPRECATED: Use backend validation instead");
        return {
            isValid: true,
            errors: [],
            warnings: [],
            missingLabs: [],
            missingPatientData: [],
            missingClinicalParams: [],
            dataCompleteness: 100
        };
    }

    /**
     * ❌ DEPRECATED: Moved to backend
     */
    public static getMissingFHIRResources(patientData: any, labData: any): string[] {
        console.warn("[FHIR_DATA_VALIDATOR] ❌ DEPRECATED: Use backend validation instead");
        return [];
    }

    /**
     * ❌ DEPRECATED: Moved to backend
     */
    public static isLabDataRecent(labData: any): boolean {
        console.warn("[FHIR_DATA_VALIDATOR] ❌ DEPRECATED: Use backend validation instead");
        return true;
    }

    /**
     * ❌ DEPRECATED: Moved to backend
     */
    public static getDataQualityScore(patientData: any, labData: any): number {
        console.warn("[FHIR_DATA_VALIDATOR] ❌ DEPRECATED: Use backend validation instead");
        return 100;
    }
}