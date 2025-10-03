import React, { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import { Stack, Card, Group, Text, Button, Alert, Tabs, Loader, Box } from '@mantine/core';
import { IconRefresh, IconBook, IconAlertCircle, IconCheck, IconFileText, IconSparkles, IconTable, IconArrowLeft } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

import AppTemplateComponents from './AppTemplateComponents';
import CharacteristicsTable from './CharacteristicsTable';
import HistoricalDataTab from './HistoricalDataTab';
import ReferencesModal from '../modals/ReferencesModal';
import DecisionContextModal from '../modals/DecisionContextModal';

import { transformToAppTemplateFormat, generateFallbackAppTemplatePredictions, AppTemplatePrediction, round2 } from './data-transformer';

import { AppContext } from '@/hooks/AppContext/AppContext';
import { useTPNParameters } from '@/hooks/AppContext/TPNParametersContext';
import IAppData from '@/lib/app-data/IAppData';
import EHRDataClientMock from '@/lib/client/EHRDataClientMock';

interface Step2CardProps {
    clinicalParameters?: any;
    loadingPredictions?: boolean;
    predictionError?: string | null;
  enhancedSelectedValues?: Record<string, number>;
  onEnhancedValuesChange?: (values: Record<string, number>) => void;
  onGenerateOrder?: () => void; // Navigate to Step 3 for HL7v2 order generation
  onBack?: () => void; // Navigate back to Step 1
}

export default function Step2Card({ 
  clinicalParameters,
  loadingPredictions = false,
  predictionError,
  enhancedSelectedValues,
  onEnhancedValuesChange,
  onGenerateOrder,
  onBack
}: Step2CardProps) {
  const { appData, setAppData, ehrDataClient } = useContext(AppContext);
  
  // Get PN+Lipid dose, weight, and fat type from step 1
  const { pnLipidDose, formData } = useTPNParameters();
  
  // Helper function to safely extract a numeric value from AppTemplate vals
  const extractValue = (vals: any): number => {
    if ('target' in vals) return vals.target;
    if ('total' in vals) return vals.total;
    if ('center' in vals) return vals.center;
    return 0;
  };
  
  // Helper function to calculate PN Dose using the formula:
  // PN Dose = pnLipidDose - (Fat Dose × Weight / divisor)
  // divisor = 0.1 for Omegaven, 0.2 for SMOFlipid/Intralipid
  const calculatePNDose = (fatDoseValue: number): number => {
    const weight = Number(formData.dosingWeight) || 0;
    const fatType = formData.fatEmulsion;
    
    // Determine divisor based on fat type
    const divisor = fatType === 'omegaven' ? 0.1 : 0.2;
    
    // Apply formula: PN Dose = pnLipidDose - (Fat Dose × Weight / divisor)
    const pnDose = pnLipidDose - (fatDoseValue * weight / divisor);
    
    return Math.max(0, pnDose); // Ensure non-negative
  };
  
  // AppTemplate state management (EXACT pattern)
  const [predictions, setPredictions] = useState<Record<string, AppTemplatePrediction>>({});
  const [selectedDosage, setSelectedDosage] = useState<Record<string, number>>({});
  const [modifiedComponents, setModifiedComponents] = useState(false);

  // Sync internal selectedDosage with external enhancedSelectedValues
  useEffect(() => {
    if (enhancedSelectedValues && Object.keys(enhancedSelectedValues).length > 0) {
      setSelectedDosage(enhancedSelectedValues);
    }
  }, [enhancedSelectedValues]);

  // Sync external state when internal selectedDosage changes
  useEffect(() => {
    if (onEnhancedValuesChange && Object.keys(selectedDosage).length > 0) {
      onEnhancedValuesChange(selectedDosage);
    }
  }, [selectedDosage, onEnhancedValuesChange]);

 

  // UI state
  const [activeTab, setActiveTab] = useState<string>('components');
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const [referencesModalOpened, setReferencesModalOpened] = useState(false);
  const [decisionContextModalOpened, setDecisionContextModalOpened] = useState(false);


  // Transform appData predictions to AppTemplate format
  useEffect(() => {
    const appDataPredictions = appData?.predictions;
    
    if (appDataPredictions && Object.keys(appDataPredictions).length > 0) {
      const appTemplatePredictions = transformToAppTemplateFormat(appDataPredictions);
      
      // Calculate PN Dose using formula: pnLipidDose - (Fat Dose × Weight / divisor)
      if (pnLipidDose && appTemplatePredictions['PN Dose'] && appTemplatePredictions['Fat']) {
        // Get Fat dose value
        const fatDoseValue = extractValue(appTemplatePredictions['Fat'].vals);
        
        // Calculate PN Dose using the formula
        const calculatedPNDose = calculatePNDose(fatDoseValue);
        
        appTemplatePredictions['PN Dose'] = {
          ...appTemplatePredictions['PN Dose'],
          vals: {
            ...appTemplatePredictions['PN Dose'].vals,
            total: calculatedPNDose
          }
        };
      }
      
      setPredictions(appTemplatePredictions);
      setUsingFallbackData(false);
    } else if (appData?.modelResults) {
      const fallbackPredictions = generateFallbackAppTemplatePredictions(pnLipidDose);
      
      // Calculate PN Dose using formula: pnLipidDose - (Fat Dose × Weight / divisor)
      if (pnLipidDose && fallbackPredictions['PN Dose'] && fallbackPredictions['Fat']) {
        // Get Fat dose value
        const fatDoseValue = extractValue(fallbackPredictions['Fat'].vals);
        
        // Calculate PN Dose using the formula
        const calculatedPNDose = calculatePNDose(fatDoseValue);
        
        fallbackPredictions['PN Dose'] = {
          ...fallbackPredictions['PN Dose'],
          vals: {
            ...fallbackPredictions['PN Dose'].vals,
            total: calculatedPNDose
          }
        };
      }
      
      setPredictions(fallbackPredictions);
      setUsingFallbackData(true);
    } else {
      setPredictions({});
    }
  }, [appData?.predictions, appData?.modelResults, pnLipidDose, formData.dosingWeight, formData.fatEmulsion]);

  // Get patient context from appData for calculations
  const patientContext = useMemo(() => {
    if (!appData) return null;
    
    return {
      // Clinical parameters for dosing
      protocol: clinicalParameters?.protocol || 'neonatal',
      admin_duration: clinicalParameters?.infusionDuration || 24,
      fat_emulsion: clinicalParameters?.fatEmulsionType || 'SMOFlipid_20',
      infusion_site: clinicalParameters?.lineType || 'Central',
      dose: clinicalParameters?.totalFluidIntake || 150,
      
      // Patient data for calculations
      weight: appData?.dosingWeight || 2.5
    };
  }, [appData, clinicalParameters]);

  // Show fat components based on fat emulsion type
  const showFatComponents = useMemo(() => {
    const fatEmulsion = patientContext?.fat_emulsion?.toUpperCase() || '';
    return !fatEmulsion.includes('NOFAT') && !fatEmulsion.includes('NONE');
  }, [patientContext?.fat_emulsion]);

  // Check if we have component data
  const hasComponentData = useMemo(() => {
    return predictions && Object.keys(predictions).length > 0;
  }, [predictions]);


  // Check if we have characteristics data
  const hasCharacteristicsData = useMemo(() => {
    return appData?.modelCharacteristics;
  }, [appData?.modelCharacteristics]);

  // Reset to baseline (AppTemplate pattern)
  const resetToBaseline = useCallback(() => {
    // Clear selectedDosage to trigger re-initialization with baselines
    setSelectedDosage({});
    setModifiedComponents(false);
  }, []);

  // Recalculate function (Frontend-only for mock mode)
  const performRecalculation = useCallback(async () => {
    if (!appData || isRecalculating || !patientContext) {
      return;
    }
    
    setIsRecalculating(true);
      
      try {
        // Frontend-only recalculation: Update predictions with selected dosage values
        const updatedPredictions = { ...predictions };
        
        Object.entries(selectedDosage).forEach(([componentName, value]) => {
          if (updatedPredictions[componentName]) {
            updatedPredictions[componentName] = {
              ...updatedPredictions[componentName],
              vals: {
                ...updatedPredictions[componentName].vals,
                target: value
              }
            };
          }
        });
        
        setPredictions(updatedPredictions);
        
        // Update appData with new predictions
        if (setAppData && appData) {
          const updatedAppData: IAppData = {
            ...appData,
            predictions: updatedPredictions
          };
          setAppData(updatedAppData);
        }

        // Clear selectedDosage after successful recalculation
        setSelectedDosage({});
        
        // Mark as unmodified
        setModifiedComponents(false);

        // Show success notification
        notifications.show({
          title: 'Recalculation Complete',
          message: 'TPN components have been successfully updated.',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      
    } catch (error) {
      console.error('[STEP2] Recalculation error:', error);
      
      // Show error notification
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unknown error occurred during recalculation.';
        
      notifications.show({
        title: 'Recalculation Failed',
        message: errorMessage,
        color: 'red',
        icon: <IconAlertCircle size={16} />,
        autoClose: false,
      });
      
    } finally {
      setIsRecalculating(false);
    }
  }, [appData, selectedDosage, predictions, patientContext, isRecalculating, setAppData]);

    return (
    <Stack gap="sm">
      <Card padding="md" radius="md" withBorder>
        
        {/* TPN Configuration Display - Clean Text Only */}
        {patientContext && (
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            width: '100%', 
            marginBottom: '8px',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Text size="sm" fw={600} c="#000000">
              Protocol: {patientContext.protocol || 'neonatal'}
            </Text>
            <Text size="sm" fw={600} c="#000000">
              Infusion Site: {patientContext.infusion_site || 'central'}
            </Text>
            <Text size="sm" fw={600} c="#000000">
              Admin Duration: {patientContext.admin_duration || '22'} hours
            </Text>
            <Text size="sm" fw={600} c={patientContext.fat_emulsion === 'NOFAT' ? '#666666' : '#000000'}>
              Fat Emulsion: {patientContext.fat_emulsion === 'NOFAT' ? 'N/A' : (patientContext.fat_emulsion || 'smof')}
            </Text>
            <Text size="sm" fw={600} c="#000000">
              Dosing Weight: {patientContext.weight || '1.19'} kg
            </Text>
          </div>
        )}

        {/* Error Alert */}
        {predictionError && (
          <Alert icon={<IconAlertCircle size="1rem" />} title="Prediction Error" color="red" mb="sm">
            {predictionError}
          </Alert>
        )}

        {/* Fallback Data Warning */}
        {usingFallbackData && (
          <Alert 
            title="Using Fallback Data" 
            color="orange" 
            mb="sm"
          >
            Unable to load enhanced prediction format. Using basic component data.
          </Alert>
        )}

        {/* Navigation and Main Content */}
                 <Tabs 
          value={activeTab} 
          onChange={(value) => value && setActiveTab(value)} 
          keepMounted={false}
          styles={{
            list: {
              gap: '1.5rem',
              justifyContent: 'flex-start'
            },
            tab: {
              color: '#000000',
              fontWeight: 700,
              fontSize: '0.9rem',
              padding: '0.6rem 1.2rem',
              '&[data-active]': {
                color: '#000000',
                fontWeight: 700
              },
              '&:hover': {
                color: '#333333'
              }
            }
          }}
        >
          <Tabs.List mb="sm">
            <Tabs.Tab 
              value="components"
            >
              Components
            </Tabs.Tab>
            <Tabs.Tab 
              value="characteristics"
            >
              Characteristics
            </Tabs.Tab>
            <Tabs.Tab 
              value="historical"
            >
              Historical Data
            </Tabs.Tab>
          </Tabs.List>

          {/* Components Tab */}
          <Tabs.Panel value="components">
            {!hasComponentData ? (
              <Alert 
                icon={<IconAlertCircle size="1rem" />} 
                title="No Component Data" 
                color="yellow" 
                                 mt="sm"
              >
                No prediction data available. Please generate predictions first.
              </Alert>
            ) : (
              <>
                <AppTemplateComponents
                  predictions={predictions}
                  selectedDosage={selectedDosage}
                  onSelectedDosageChange={(newDosage) => {
                    setSelectedDosage(newDosage);
                  }}
                  onModifiedChange={(isModified) => {
                    setModifiedComponents(isModified);
                  }}
                  showFatComponents={showFatComponents}
                  isLoading={isRecalculating}
                />
              </>
                          )}
          </Tabs.Panel>

          {/* Characteristics Tab */}
          <Tabs.Panel value="characteristics">
            {hasCharacteristicsData ? (
              <CharacteristicsTable modelCharacteristics={appData?.modelCharacteristics} />
            ) : (
              <Alert 
                icon={<IconAlertCircle size="1rem" />} 
                title="No Characteristics Data Available" 
                color="yellow" 
                                 mt="sm"
              >
                Characteristics data is not available. Please generate predictions first.
              </Alert>
            )}
          </Tabs.Panel>

          {/* Historical Data Tab */}
          <Tabs.Panel value="historical">
            <HistoricalDataTab 
              labHistory={appData?.historicalLabs || []} 
              doseHistory={appData?.doseHistory || []}
              orderHistory={appData?.orderHistory || []}
            />
          </Tabs.Panel>
        </Tabs>

                    {/* Action Buttons */}
        <Group justify="space-between" mt="sm">
          {/* Left side - Back button */}
          <Group gap="xs">
            <Button 
              variant="filled"
              size="sm"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => {
                if (onBack) {
                  onBack();
                }
              }}
              styles={{
                root: {
                  backgroundColor: '#6c757d',
                  border: 'none',
                  '&:hover': {
                    backgroundColor: '#007bff'
                  }
                }
              }}
            >
              Back
            </Button>
          </Group>

          {/* Right side - Action buttons */}
          <Group gap="xs">
            {/* Show modification indicator - red bold message inline */}
            <Text size="xs" c={modifiedComponents ? "red" : "transparent"} fw={500} style={{ 
              minHeight: '18px',
              fontStyle: 'italic',
              maxWidth: '400px',
              lineHeight: '1.3'
            }}>
              {modifiedComponents ? "A recommended value has changed. To update the TPN characteristics, please click Recalculate. (Note: mock version does not support the Recalculate function.)" : ""}
            </Text>
            
            {/* References and Decision Context buttons */}
            <Button
              variant="subtle"
              size="sm"
              leftSection={<IconBook size={16} />}
              onClick={() => setReferencesModalOpened(true)}
            >
              References
            </Button>
            <Button
              variant="subtle"
              size="sm"
              onClick={() => setDecisionContextModalOpened(true)}
            >
              Decision Context
            </Button>

            {/* Recalculate Button - Fixed layout to prevent movement */}
            <Button
              variant="filled"
              size="sm"
              leftSection={!isRecalculating ? <IconRefresh size={16} /> : null}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                
                if (modifiedComponents && !isRecalculating) {
                  // Check if mock mode - show notification instead of recalculating
                  if (ehrDataClient instanceof EHRDataClientMock) {
                    notifications.show({
                      title: 'Mock Mode',
                      message: 'Recalculate function is not supported in mock version. The adjusted values will be used as-is.',
                      color: 'blue',
                      icon: <IconAlertCircle size={16} />,
                      autoClose: 5000
                    });
                  } else {
                    performRecalculation().catch(error => {
                      console.error('[RECALC] Recalculation failed:', error);
                    });
                  }
                }
              }}
              loading={isRecalculating}
              disabled={!modifiedComponents || isRecalculating}
              fw={600}
              title={
                isRecalculating
                  ? "Recalculation in progress"
                  : !modifiedComponents
                  ? "No changes to recalculate"
                  : (ehrDataClient instanceof EHRDataClientMock)
                  ? "Click to acknowledge (mock mode does not recalculate)"
                  : "Recalculate TPN components with modified values"
              }
              styles={{
                root: {
                  backgroundColor: modifiedComponents ? '#dc3545' : '#6c757d',
                  border: 'none',
                  cursor: modifiedComponents ? 'pointer' : 'not-allowed',
                  opacity: modifiedComponents ? 1 : 0.6,
                  minWidth: '120px', // Fixed width to prevent layout shift
                  '&:hover': {
                    backgroundColor: modifiedComponents ? '#c82333' : '#6c757d'
                  }
                }
              }}
            >
              Recalculate
            </Button>

            {/* HL7v2 Order Generation Button */}
            <Button
                      variant="filled"
                      size="sm"
                      leftSection={<IconFileText size={16} />}
                      onClick={() => {
                        if (onGenerateOrder) {
                          onGenerateOrder();
                        }
                      }}
                      disabled={
                        modifiedComponents || isRecalculating || !hasComponentData
                      }
                      fw={600}
                      styles={{
                        root: {
                          backgroundColor: (!modifiedComponents && !isRecalculating && hasComponentData) ? '#28a745' : '#6c757d',
                          border: 'none',
                          cursor: (!modifiedComponents && !isRecalculating && hasComponentData) ? 'pointer' : 'not-allowed',
                          opacity: (!modifiedComponents && !isRecalculating && hasComponentData) ? 1 : 0.6,
                          '&:hover': {
                            backgroundColor: (!modifiedComponents && !isRecalculating && hasComponentData) ? '#218838' : '#6c757d'
                          }
                        }
                      }}
                      title={
                        modifiedComponents 
                          ? "Please recalculate changes before generating order"
                          : isRecalculating
                          ? "Please wait - recalculation in progress"
                          : !hasComponentData
                          ? "No prediction data available"
                          : "Generate HL7v2 order with current values"
                      }
                    >
                      Generate HL7v2 Order
                                    </Button>
          </Group>
        </Group>
            </Card>

      {/* Modals */}
      <ReferencesModal 
        opened={referencesModalOpened}
        onClose={() => setReferencesModalOpened(false)}
      />
      <DecisionContextModal 
        opened={decisionContextModalOpened}
        onClose={() => setDecisionContextModalOpened(false)}
      />
    </Stack>
    );
}