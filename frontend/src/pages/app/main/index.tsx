import { useAppContext } from "@/hooks/AppContext/AppContext";
import { useTPNParameters } from "@/hooks/AppContext/TPNParametersContext";
import Step1Card from "@/components/step1/Step1Card";
import Step2Card from "@/components/step2/Step2Card";
import Step3Card from "@/components/step3/Step3Card";
import PatientHeader from "@/components/patient/PatientHeader";
import PatientLeftSidebar from "@/components/patient/PatientLeftSidebar";
import { useState, useEffect } from "react";
import { Group, Text, Button, Card, Loader, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import EHRDataClientMock from "@/lib/client/EHRDataClientMock";

// Disable static generation for this page since it uses context providers
export const getServerSideProps = async () => {
    return { props: {} };
};

export default function Home() {
    const appContext = useAppContext();
    const { formData: tpnParams, isFormComplete, isPNLipidDoseValid, resetFormData } = useTPNParameters();
    
    const [currentStep, setCurrentStep] = useState(1);
    const [loadingPredictions, setLoadingPredictions] = useState(false);
    const [predictionError, setPredictionError] = useState<string | null>(null);
    
    // Timer state for TPN generation
    const [predictionStartTime, setPredictionStartTime] = useState<Date | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0); // in seconds
    
    // State for enhanced selected values (user's slider adjustments)
    const [enhancedSelectedValues, setEnhancedSelectedValues] = useState<Record<string, number>>({});
    const [hasTweakedValues, setHasTweakedValues] = useState(false);

    // Reset form data when first mounting (fresh launch)
    useEffect(() => {
        resetFormData();
        setCurrentStep(1);
    }, []); // Empty dependency array - only runs once on mount

    // Timer effect for TPN generation
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        
        if (loadingPredictions && predictionStartTime) {
            interval = setInterval(() => {
                const now = new Date();
                const elapsed = Math.floor((now.getTime() - predictionStartTime.getTime()) / 1000);
                setElapsedTime(elapsed);
            }, 1000);
        } else {
            setElapsedTime(0);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [loadingPredictions, predictionStartTime]);

    // Format elapsed time as MM:SS or HH:MM:SS
    const formatElapsedTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    };

    // Convert TPN parameters to backend format (ignoring NNL/enteral for now as requested)
    const getClinicalParameters = () => {
        return {
            protocol: tpnParams.protocol || 'neonatal',
            lineType: tpnParams.lineType || 'central', 
            totalFluidIntake: Number(tpnParams.totalFluidIntake) || 150,
            infusionDuration: Number(tpnParams.infuseOver) || 24,
            fatEmulsionType: tpnParams.fatEmulsion || 'SMOFlipid_20',
            fatDose: 2.0, // Default
            fatInfusionDuration: 24, // Fixed default (toRunOver not required)
            includeEnteralFeeding: false, // Ignoring enteral for now
            enteralFeedingVolume: undefined, // Ignoring enteral for now
            enteralFeedingFrequency: undefined, // Ignoring enteral for now
            nonNutritionalLines: undefined // Ignoring NNL for now
        };
    };

    const validateClinicalParameters = (): boolean => {
        const required = ['protocol', 'lineType', 'totalFluidIntake', 'infuseOver', 'fatEmulsion', 'dosingWeight'];
        const missing = required.filter(param => !tpnParams[param as keyof typeof tpnParams]);
        
        if (missing.length > 0) {
            setPredictionError(`Missing required parameters: ${missing.join(', ')}`);
            return false;
        }
        
        return true;
    };

    // Additional UI-only validation (does not alter payload)
    const hasValidNonNutritionalLines = (): boolean => {
        const lines: any[] = (tpnParams as any).nonNutritionalLines || [];
        if (!Array.isArray(lines) || lines.length === 0) return false;
        // At least one line with a dose and at least one additive selected
        return lines.some((line) => {
            const doseOk = line?.dose && !isNaN(Number(line.dose)) && Number(line.dose) > 0;
            const additiveOk = Array.isArray(line?.additives) && line.additives.some((a: any) => a?.additive && String(a.additive).length > 0);
            return doseOk && additiveOk;
        });
    };

    const hasValidEnteralFeeds = (): boolean => {
        const include = (tpnParams as any).includeEnteralFeedingInTotalFluidIntake;
        const vol = Number((tpnParams as any).enteralFeedingVolume);
        const freq = Number((tpnParams as any).enteralEveryHours);
        
        // If switch is OFF, enteral feeds are not required - validation passes
        if (!include) return true;
        
        // If switch is ON, require both numeric values > 0
        return !isNaN(vol) && vol > 0 && !isNaN(freq) && freq > 0;
    };

    // Button loading state for animation
    const [buttonLoading, setButtonLoading] = useState(false);

    // ✅ SIMPLIFIED: Now only calls backend APIs
    const handleGeneratePrediction = async () => {
        // Validate required clinical parameters before prediction
        const isValid = validateClinicalParameters();
        
        if (!isValid) {
            return; // Stop if validation fails
        }

        // Show button loading animation for 2 seconds
        setButtonLoading(true);
        
        // Wait 2 seconds before proceeding
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Navigate to Step 2 and show loading
        setCurrentStep(2);
        setLoadingPredictions(true);
        setPredictionError(null);
        
        // Reset button loading state
        setButtonLoading(false);
        
        // Start timer
        setPredictionStartTime(new Date());
        setElapsedTime(0);

        try {
            const clinicalParameters = getClinicalParameters();
            const patientId = appContext.patientId || "test-patient";

            let predictions;
            let characteristics: any;

            // Mock client - use hardcoded predictions (NO backend calls)
            if (appContext.appData?.predictions) {
                predictions = { results: [] }; // Legacy format
                // Mock rich characteristics structure (matches Azure response format)
                characteristics = {
                    "Macronutrients": {
                        "Amino Acids (g/kg)": 2.6,
                        "Amino Acids (g)": 3.12,
                        "Amino Acid Concentration (%)": 0.02,
                        "Amino Acid Type": "Trophamine",
                        "Lipids (g/kg)": 1.0,
                        "Lipids (g)": 1.2,
                        "Dextrose Concentration (%)": 15.0,
                        "Glucose Infusion Rate (mg/kg/min)": 10.89,
                        "Non-Protein (kcal):Nitrogen (g)": 305.98,
                        "Volume (mL/kg)": 120.0
                    },
                    "Electrolytes": {
                        "Sodium (mEq/kg)": 3.5,
                        "Sodium (mEq/L)": 29.17,
                        "Potassium (mEq/kg)": 2.2,
                        "Potassium (mEq/L)": 18.33,
                        "Potassium (mEq/kg/hr)": 0.092,
                        "Calcium (mEq/kg)": 1.6,
                        "Calcium (mEq)": 1.92,
                        "Calcium (mEq/L)": 13.33,
                        "Calcium (mg/kg)": 320.0,
                        "Calcium (mg)": 384.0,
                        "Calcium (g/L)": 2.67,
                        "Magnesium (mEq/kg)": 0.4,
                        "Magnesium (mEq)": 0.48,
                        "Magnesium (mEq/L)": 3.33,
                        "Phosphate (mmol/kg)": 1.5,
                        "Phosphate (mmol)": 1.8,
                        "Phosphate (mmol/L)": 12.5,
                        "Phosphate (mmol/kg/hr)": 0.063,
                        "Estimated Chloride (mEq/kg)": 1.8,
                        "Acetate (mEq/kg)": 2.3,
                        "Estimated Chloride:Acetate Ratio": 0.78
                    },
                    "Energy Contribution With Protein": {
                        "Dextrose (kcal/kg)": 60.18,
                        "Dextrose (kcal)": 72.22,
                        "Dextrose (%)": 0.73,
                        "Lipids (kcal/kg)": 9.0,
                        "Lipids (kcal)": 10.8,
                        "Lipids (%)": 0.11,
                        "Protein (kcal/kg)": 10.4,
                        "Protein (kcal)": 12.48,
                        "Protein (%)": 0.13,
                        "Total (kcal/kg)": 82.7,
                        "Total (kcal)": 99.24
                    },
                    "Energy Contribution With Non-Protein": {
                        "Dextrose (kcal/kg)": 60.18,
                        "Dextrose (kcal)": 72.22,
                        "Dextrose (%)": 0.87,
                        "Lipids (kcal/kg)": 9.0,
                        "Lipids (kcal)": 10.8,
                        "Lipids (%)": 0.13,
                        "Non-Protein Total (kcal/kg)": 69.18,
                        "Non-Protein Total (kcal)": 83.02
                    },
                    "Mixture Compatability": {
                        "Osmolarity": 850.0,
                        "Calcium Phosphate Solubility Curve (mEq/kg Calcium)": 1.6,
                        "Cysteine (mg/g of amino acid )": 0.0,
                        "Calcium:Phosphate Ratio (mmol:mmol)": 0.94
                    },
                    "Vitamins": {
                        "Multi-vitamins (mL/kg)": 1.2,
                        "Multi-vitamins (mL)": 1.44
                    },
                    "Trace Elements": {
                        "Copper (mcg/kg)": 20.0,
                        "Copper (mcg)": 24.0,
                        "Selenium (mcg/kg)": 3.0,
                        "Selenium (mcg)": 3.6,
                        "Zinc (mcg/kg)": 300.0,
                        "Zinc (mg)": 360.0
                    },
                    "Additives": {
                        "Heparin (Units/mL)": 0.5,
                        "Heparin (Units/kg/hr)": 2.2
                    }
                };
            } else {
                // Fall back to mock client's method
                const mockResponse = await (appContext.ehrDataClient as EHRDataClientMock).getTpnPredictionsAsync(patientId, clinicalParameters);
                predictions = mockResponse.modelResults;
                characteristics = mockResponse.modelCharacteristics;
            }

            // Update app data with predictions
            if (appContext.appData) {
                appContext.setAppData({
                    ...appContext.appData,
                    modelResults: predictions,
                    modelCharacteristics: characteristics,
                    predictions: predictions as any // Also set AppTemplate format for enhanced components
                });
            }

        } catch (error) {
            setPredictionError(`Prediction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setCurrentStep(1); // Go back to Step 1 on error
        } finally {
            setLoadingPredictions(false);
            setPredictionStartTime(null); // Stop timer
        }
    };

    // Component render method with improved layout and spacing
    return (
        <div style={{ 
            display: 'flex', 
            height: '100vh', 
            overflow: 'hidden',
            marginTop: '0',
            paddingTop: '0' 
        }}
        className="app-container-responsive"
        >
            {/* Left Sidebar */}
            <div style={{ 
                width: '280px', 
                minWidth: '280px',
                backgroundColor: '#f8f9fa', 
                borderRight: '1px solid #dee2e6', 
                overflowY: 'auto',
                overflowX: 'hidden'
            }} 
            className="sidebar-responsive"
            >
                <div style={{ 
                    padding: '20px 16px 20px 20px', // top right bottom left - more left margin
                    marginLeft: '4px' // Additional left spacing from edge
                }}>
                    <PatientLeftSidebar 
                        appData={appContext.appData}
                        onEditProfileSave={(sex, gestationalAge, birthWeight, age, therapyDay, dosingWeight, ward) => {
                            // Handle profile save - update app data
                            if (appContext.appData) {
                                appContext.setAppData({
                                    ...appContext.appData,
                                    sex: sex || 'unknown',
                                    gestationalAge,
                                    birthWeight,
                                    age,
                                    therapyDays: therapyDay,
                                    dosingWeight,
                                    ward
                                });
                            }
                        }}
                    />
                </div>
            </div>

            {/* Main Content */}
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                overflow: 'hidden',
                minWidth: 0 // Allow content to shrink
            }}
            className="main-content-responsive"
            >
                {/* Content - Full height without header */}
                <div style={{ 
                    flex: 1, 
                    padding: '20px', 
                    overflowY: 'auto',
                    backgroundColor: '#fafafa',
                    margin: '0'
                }}>
                    {/* Error Alert */}
                    {predictionError && (
                        <Alert icon={<IconAlertCircle size="1rem" />} title="Prediction Error" color="red" mb="md">
                            {predictionError}
                        </Alert>
                    )}

                    {/* Loading State - TPN Prediction Process */}
                    {loadingPredictions && (
                        <div style={{ 
                                position: 'fixed', 
                                top: 0, 
                                left: 0, 
                                width: '100vw', 
                                height: '100vh', 
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                zIndex: 1000,
                                gap: '20px'
                            }}>
                                <Loader size="xl" color="gray" />
                                <Text size="xl" fw={600} c="gray">
                                    Generating TPN Predictions please wait
                                </Text>
                                {/* Timer Display */}
                                <Group align="center" gap="xs">
                                    <Text size="lg" fw={500} c="blue">
                                        ⏱️ Elapsed Time: {formatElapsedTime(elapsedTime)}
                                    </Text>
                                </Group>
                            </div>
                    )}

                    {/* Step 1: Clinical Parameters */}
                    {currentStep === 1 && (
                        <div style={{ display: 'grid', gridTemplateRows: '1fr auto', height: '100%' }}>
                            <Step1Card 
                                todaysLabs={appContext.appData?.todaysLabs || []}
                                historicalLabs={appContext.appData?.historicalLabs || []}
                                nonNutritionalLinesData={appContext.appData?.nonNutritionalLinesPreviewData || []}
                                nonNutritionalLinesMessage={appContext.appData?.nonNutritionalLinesMessage || ""}
                                />
                            
                            {/* Get Recommendations Button - Positioned Outside Table */}
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'flex-end', 
                                marginTop: '12px',
                                paddingRight: '16px'
                            }}>
                                <Button
                                    size="md"
                                    color="black"
                                    onClick={handleGeneratePrediction}
                                    disabled={!isFormComplete() || !hasValidNonNutritionalLines() || !hasValidEnteralFeeds() || !isPNLipidDoseValid() || loadingPredictions || buttonLoading}
                                    loading={buttonLoading}
                                    loaderProps={{ type: 'dots' }}
                                >
                                    {buttonLoading ? 'Loading...' : 'Get Recommendations'}
                                </Button>
                            </div>
                            

                        </div>
                    )}

                    {/* Step 2: Predictions and Adjustments */}
                    {currentStep === 2 && !loadingPredictions && appContext.appData?.modelResults && (
                        <div>
                            <Step2Card 
                                clinicalParameters={getClinicalParameters()}
                                loadingPredictions={loadingPredictions}
                                predictionError={predictionError}
                                enhancedSelectedValues={enhancedSelectedValues}
                                onEnhancedValuesChange={(values) => {
                                    setEnhancedSelectedValues(values);
                                    setHasTweakedValues(Object.keys(values).length > 0);
                                }}
                                onGenerateOrder={() => {
                                    setCurrentStep(3);
                                }}
                                onBack={() => {
                                    resetFormData();
                                    setCurrentStep(1);
                                }}
                            />
                        </div>
                    )}

                    {/* Step 3: Final Order and HL7v2 */}
                    {currentStep === 3 && appContext.appData?.modelResults && (
                        <Step3Card 
                            patientData={appContext.appData}
                            predictionComponents={appContext.appData?.predictions || {}}
                            enhancedSelectedValues={enhancedSelectedValues}
                            hasTweakedValues={hasTweakedValues}
                            onBack={() => setCurrentStep(2)}
                            onRegenerate={() => setCurrentStep(1)}
                            onRecalculate={() => {}}
                            clinicalParameters={getClinicalParameters()}
                            isMockMode={appContext.fhirUrl?.startsWith("mock://") || false}
                            ehrDataClient={appContext.ehrDataClient}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}





