import React, { useState, useMemo, useEffect, useCallback, useRef, useContext } from 'react';
import { Table, TextInput, Group, Text, NumberInput, Badge, Tooltip } from '@mantine/core';
import { IconSearch, IconSortAscending, IconSortDescending } from '@tabler/icons-react';

import ComponentSlider from './ComponentSlider';
import { AppTemplatePrediction, round2 } from './data-transformer';
import { calculateSummary } from '@/lib/calculations/nnl-calculator';
import { useTPNParameters } from '@/hooks/AppContext/TPNParametersContext';
import { AppContext } from '@/hooks/AppContext/AppContext';

// Clinical correlation mapping between TPN components and lab values
const CLINICAL_CORRELATIONS: Record<string, string[]> = {
  'Fat': ['Triglycerides'],
  'TrophAmine': ['Creatinine', 'Carbon dioxide'],
  'Dextrose': ['Glucose'], 
  'Sodium': ['Sodium'],
  'Potassium': ['Potassium'],
  'Calcium': ['Calcium'],
  'Magnesium': ['Magnesium'],
  'Phosphate': ['Phosphate'],
  'Acetate': ['Carbon dioxide']
};

// Helper function to get latest lab value for a component
const getLatestLabValue = (labComponent: string, todaysLabs: any[], historicalLabs: any[]): string | null => {
  // First, try today's labs
  const todaysLab = todaysLabs.find(lab => 
    lab.component.toLowerCase().includes(labComponent.toLowerCase()) ||
    labComponent.toLowerCase().includes(lab.component.toLowerCase())
  );
  
  if (todaysLab && todaysLab.values && todaysLab.values.length > 0) {
    const latestValue = todaysLab.values[todaysLab.values.length - 1];
    return `${latestValue.value} ${todaysLab.unit}`;
  }
  
  // If not in today's labs, try historical labs
  const historicalLab = historicalLabs.find(lab =>
    lab.component.toLowerCase().includes(labComponent.toLowerCase()) ||
    labComponent.toLowerCase().includes(lab.component.toLowerCase())
  );
  
  if (historicalLab && historicalLab.values && historicalLab.values.length > 0) {
    const latestValue = historicalLab.values[historicalLab.values.length - 1];
    return `${latestValue.value} ${historicalLab.unit}`;
  }
  
  return null;
};

// Helper function to generate tooltip content
const generateTooltipContent = (componentName: string, todaysLabs: any[], historicalLabs: any[]): string | null => {
  const correlatedLabs = CLINICAL_CORRELATIONS[componentName];
  if (!correlatedLabs) return null;
  
  const labValues = correlatedLabs
    .map(labName => {
      const value = getLatestLabValue(labName, todaysLabs, historicalLabs);
      return value ? `${labName}: ${value}` : null;
    })
    .filter(Boolean);
  
  if (labValues.length === 0) return null;
  
  return labValues.join(', ');
};

interface AppTemplateComponentsProps {
  predictions: Record<string, AppTemplatePrediction>;
  selectedDosage: Record<string, number>;
  onSelectedDosageChange: (newDosage: Record<string, number>) => void;
  onModifiedChange: (isModified: boolean) => void;
  showFatComponents?: boolean;
  isLoading?: boolean;
}

export default function AppTemplateComponents({
  predictions,
  selectedDosage,
  onSelectedDosageChange,
  onModifiedChange,
  showFatComponents = true,
  isLoading = false
}: AppTemplateComponentsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'none' | 'asc' | 'desc'>('none');
  const appContext = useContext(AppContext);
  
  // Baselines tracking (AppTemplate pattern)
  const [baselines, setBaselines] = useState<Record<string, number>>({});
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
  
  // Get context for NNL calculations
  const { formData } = useTPNParameters();
  const { appData } = useContext(AppContext);

  // AppTemplate component ordering (exact from images) - moved outside to avoid dependency issues
  const componentOrder = useMemo(() => [
    'Fat',
    'PN Dose',
    'TrophAmine', 
    'Dextrose',
    'GIR',
    'Sodium',
    'Potassium',
    'Calcium',
    'Magnesium',
    'Phosphate',
    'Acetate',
    'MVI Pediatric',
    'Zinc Chloride',
    'Copper',
    'Selenium',
    'Heparin',
    'Ca:PO4',
    'Total PN kcal',
    'Estimated Chloride'
  ], []);

  // Define which components are part of NNL calculations
  const nnlRelevantComponents = useMemo(() => new Set([
    'Dextrose',
    'GIR', 
    'Sodium',
    'Potassium',
    'Acetate',
    'Estimated Chloride'
  ]), []);

  // Define special styled components (bold italic with blue values)
  const specialStyledComponents = useMemo(() => new Set([
    'PN Dose',
    'GIR',
    'Ca:PO4',
    'Total PN kcal',
    'Estimated Chloride'
  ]), []);

  // Calculate NNL contributions
  const nnlContributions = useMemo(() => {
    if (!formData?.nonNutritionalLines || !appData?.dosingWeight) {
      return {};
    }

    try {
      const nnlResults = calculateSummary(formData.nonNutritionalLines, appData.dosingWeight);
      
      // Map NNL results to component names that match our table
      return {
        'GIR': nnlResults.totalGIR || 0,
        'Sodium': nnlResults.totalNa || 0,
        'Potassium': nnlResults.totalK || 0,
        // Note: Dextrose, Acetate, and Estimated Chloride contributions 
        // can be added here when available from NNL calculations
      };
    } catch (error) {
      console.warn('[NNL-CALC] Error calculating NNL contributions:', error);
      return {};
    }
  }, [formData?.nonNutritionalLines, appData?.dosingWeight]);

  // AppTemplate exact sort toggle
  const toggleSort = () => {
    setSortBy(current => 
      current === 'none' ? 'asc' :
      current === 'asc' ? 'desc' : 'none'
    );
  };

  // AppTemplate exact filtering and sorting logic with proper ordering
  const filteredAndSortedRows = useMemo(() => {
    let rows = Object.entries(predictions).filter(([name]) => {
      if (!showFatComponents && name.toLowerCase().includes('fat')) return false;
      return name.toLowerCase().includes(searchQuery.trim().toLowerCase());
    });

    if (sortBy === 'asc') {
      rows = [...rows].sort(([a], [b]) => a.localeCompare(b));
    } else if (sortBy === 'desc') {
      rows = [...rows].sort(([a], [b]) => b.localeCompare(a));
    } else {
      // Default: use AppTemplate component ordering
      rows = [...rows].sort(([a], [b]) => {
        const indexA = componentOrder.indexOf(a);
        const indexB = componentOrder.indexOf(b);
        
        // If both components are in the order list, sort by their position
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        
        // If only one is in the order list, prioritize it
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        
        // If neither is in the order list, sort alphabetically
        return a.localeCompare(b);
      });
    }

    return rows;
  }, [predictions, searchQuery, sortBy, showFatComponents, componentOrder]);

  // Initialize baselines from predictions (AppTemplate pattern)
  useEffect(() => {
    
    const newBaselines: Record<string, number> = {};
    
    Object.entries(predictions).forEach(([name, pred]) => {
      if (!('total' in pred.vals)) {
        // Only adjustable components get baselines
        const targetValue = 'target' in pred.vals ? round2(pred.vals.target) : 0;
        newBaselines[name] = targetValue;
      } else {
      }
    });

    setBaselines(newBaselines);
    
    // Initialize selectedDosage with baselines if empty (AppTemplate pattern)
    if (Object.keys(selectedDosage).length === 0) {
      onSelectedDosageChange({ ...newBaselines });
    } else {
    }
  }, [predictions, selectedDosage, onSelectedDosageChange]);

  // Watch for modifications (AppTemplate pattern)
  // Trigger recalculate button/message when ANY component is modified
  useEffect(() => {
    const isModified = Object.entries(selectedDosage).some(([key, val]) => {
      const baseline = baselines[key];
      const hasBaseline = baseline !== undefined;
      const isDifferent = hasBaseline && baseline !== val;
      
      return hasBaseline && isDifferent;
    });
    
    onModifiedChange(isModified);
  }, [selectedDosage, baselines, onModifiedChange]);

  // Check if any component has been modified (for red total styling)
  const hasModifications = useMemo(() => {
    return Object.entries(selectedDosage).some(([key, val]) => 
      baselines[key] !== undefined && Math.abs(baselines[key] - val) > 0.001
    );
  }, [selectedDosage, baselines]);

  // AppTemplate enforceStep function with debouncing
  const enforceStep = useCallback((name: string, prediction: AppTemplatePrediction) => {
    clearTimeout(debounceTimers.current[name]);

    debounceTimers.current[name] = setTimeout(() => {
      let value = selectedDosage[name];
      if (isNaN(value) || 'total' in prediction.vals) return;

      const vals = prediction.vals as any; // We know it has target
      value = Math.max(vals.min, Math.min(vals.max, value));
      value = Math.round(value / prediction.stepsize) * prediction.stepsize;

      const newValue = round2(value);
      if (newValue !== selectedDosage[name]) {
        onSelectedDosageChange({
          ...selectedDosage,
          [name]: newValue
        });
      }
    }, 400);
  }, [selectedDosage, onSelectedDosageChange]);

  // Handle manual input changes
  const handleInputChange = (name: string, value: number) => {
    onSelectedDosageChange({
      ...selectedDosage,
      [name]: value
    });
  };

  // Handle slider changes
  const handleSliderChange = (name: string, value: number) => {
    const newDosage = {
      ...selectedDosage,
      [name]: round2(value)
    };
    onSelectedDosageChange(newDosage);
  };

  return (
    <div className="table-responsive" style={{ marginTop: '0.25rem', padding: '0.25rem' }}>
      {/* AppTemplate Table Structure (Bootstrap table-sm equivalent) */}
      <div style={{ border: '1px solid #E6E8EE', borderRadius: 12, backgroundColor: 'white', overflow: 'hidden' }}>
        <Table 
          striped 
          highlightOnHover
        styles={{
          table: {
            fontSize: '11px', // Even smaller for more compactness
          },
          th: {
            padding: '4px 8px', // Further reduced padding
            whiteSpace: 'nowrap',
            minWidth: '60px',
            verticalAlign: 'middle',
            borderColor: '#dee2e6'
          },
          td: {
            padding: '2px 8px', // Further reduced padding  
            whiteSpace: 'nowrap',
            minWidth: '60px',
            verticalAlign: 'middle',
            borderColor: '#dee2e6'
          }
        }}
      >
        <Table.Thead>
          <Table.Tr>
            {/* Component Column with Sort */}
            <Table.Th 
              style={{ cursor: 'pointer', minWidth: '100px' }}
              onClick={toggleSort}
            >
              <Group gap="xs">
                <Text size="sm" fw={500}>Component</Text>
                {sortBy === 'asc' && <IconSortAscending size={14} />}
                {sortBy === 'desc' && <IconSortDescending size={14} />}
              </Group>
            </Table.Th>
            
            {/* Dosage Column */}
            <Table.Th style={{ minWidth: '260px' }}>
              <Text size="sm" fw={500}>Dosage</Text>
            </Table.Th>
            
            {/* Value Column */}
            <Table.Th style={{ textAlign: 'end', minWidth: '70px' }}>
              <Text size="sm" fw={500}>Value</Text>
            </Table.Th>
            
            {/* Total value with NNL Column */}
            <Table.Th style={{ textAlign: 'end', minWidth: '90px' }}>
              <Text size="sm" fw={500}>Total value with NNL</Text>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        
        <Table.Tbody>
          {filteredAndSortedRows.map(([name, component]) => {
            const hasTarget = 'target' in component.vals;
            const isTotal = 'total' in component.vals;
            const currentValue = hasTarget 
              ? (selectedDosage[name] ?? (component.vals as any).target) 
              : (component.vals as any).total;
            
            // Special components turn red when ANY component is modified (they need recalculation)
            const isSpecialComponent = specialStyledComponents.has(name);
            const isTotalOutOfDate = isSpecialComponent && hasModifications;
            
            return (
              <Table.Tr 
                key={name}
                className={isTotal ? 'totals' : ''}
                style={{
                  fontWeight: isTotal ? 'bold' : 'normal',
                  height: isTotal ? '24px' : '48px' // Much more compact for totals
                }}
              >
                {/* Component Name */}
                <Table.Td style={{
                  fontWeight: 'bold', // All component names are bold
                  backgroundColor: isTotal ? 'rgba(248, 249, 250, 0.8)' : undefined,
                  verticalAlign: 'middle'
                }}>
                  <Group gap="xs">
                    {(() => {
                      // Generate clinical correlation tooltip content
                      const tooltipContent = appContext?.appData ? 
                        generateTooltipContent(name, appContext.appData.todaysLabs, appContext.appData.historicalLabs) 
                        : null;
                      
                      const hasTooltip = tooltipContent && CLINICAL_CORRELATIONS[name];
                      
                      const textComponent = (
                        <Text 
                          size="sm"
                          fw={700} // Bold for all component names
                          c={isTotalOutOfDate ? 'red' : undefined}
                          style={{
                            fontStyle: isSpecialComponent ? 'italic' : 'normal', // Italic for special components
                            cursor: hasTooltip ? 'help' : 'default' // Question mark cursor for components with tooltips
                          }}
                        >
                          {name}
                        </Text>
                      );
                      
                      // Wrap with tooltip if clinical correlation exists
                      return hasTooltip ? (
                        <Tooltip
                          label={tooltipContent}
                          multiline
                          w={200}
                          withArrow
                          position="top"
                          color="blue"
                          styles={{
                            tooltip: {
                              fontSize: '12px',
                              fontWeight: 500
                            }
                          }}
                        >
                          {textComponent}
                        </Tooltip>
                      ) : textComponent;
                    })()}
                    
                  </Group>
                </Table.Td>

                {/* Dosage Column (Slider for adjustable components) */}
                <Table.Td style={{
                  backgroundColor: isTotal ? 'rgba(248, 249, 250, 0.8)' : undefined,
                  verticalAlign: 'middle'
                }}>
                  {hasTarget ? (
                    <div style={{ minWidth: '320px', maxWidth: '480px', padding: '4px 0' }}>
                      <ComponentSlider
                        min={(component.vals as any).min}
                        max={(component.vals as any).max}
                        step={component.stepsize}
                        value={currentValue}
                        onChange={(value) => handleSliderChange(name, value)}
                        gradient={[(component.vals as any).start, (component.vals as any).center, (component.vals as any).end]}
                        lower={(component.vals as any).lower}
                        target={(component.vals as any).target}
                        upper={(component.vals as any).upper}
                        disabled={isLoading}
                      />
                    </div>
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      height: '20px',
                      fontSize: '11px',
                      color: '#6c757d',
                      fontStyle: 'italic',
                      fontWeight: 500
                    }}>
                      Calculated
                    </div>
                  )}
                </Table.Td>

                {/* Value Column */}
                <Table.Td 
                  className={isTotalOutOfDate ? 'ood' : ''}
                  style={{
                    textAlign: 'end',
                    fontWeight: isTotal ? 'bold' : 'normal',
                    backgroundColor: isTotal ? 'rgba(248, 249, 250, 0.8)' : undefined,
                    color: isTotalOutOfDate ? 'red' : undefined,
                    fontStyle: isTotalOutOfDate ? 'italic' : 'normal',
                    verticalAlign: 'middle'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    alignItems: 'center',
                    height: isTotal ? '20px' : '32px',
                    width: '100%'
                  }}>
                    {hasTarget ? (
                      // Manual input for adjustable components with integrated unit styling
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        height: '32px',
                        minWidth: '120px',
                        maxWidth: '160px', // Allow expansion for longer units
                        width: 'fit-content'
                      }}>
                        <NumberInput
                          value={currentValue}
                          onChange={(val) => {
                            if (typeof val === 'number') {
                              handleInputChange(name, val);
                            }
                          }}
                          onBlur={() => enforceStep(name, component)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              enforceStep(name, component);
                            }
                          }}
                          min={(component.vals as any).min}
                          max={(component.vals as any).max}
                          step={component.stepsize}
                          size="xs"
                          hideControls
                          styles={{
                            input: {
                              textAlign: 'right',
                              fontWeight: 700, // Bold for all values
                              fontSize: '12px',
                              padding: '4px 6px',
                              height: '26px',
                              border: 'none',
                              borderRadius: '0',
                              minWidth: '55px',
                              width: '70px', // Fixed input width
                              outline: 'none',
                              color: isSpecialComponent ? '#1e40af' : '#000000', // Dark blue for special components
                              '&:focus': {
                                outline: 'none',
                                boxShadow: 'none'
                              }
                            }
                          }}
                        />
                        <div style={{ 
                          backgroundColor: '#f8f9fa',
                          padding: '2px 6px',
                          fontSize: '10px',
                          color: '#6c757d',
                          fontWeight: 500,
                          borderLeft: '1px solid #dee2e6',
                          display: 'flex',
                          alignItems: 'center',
                          height: '26px',
                          whiteSpace: 'nowrap', // Prevent text wrapping
                          justifyContent: 'center',
                          minWidth: 'fit-content' // Allow unit to size naturally
                        }}>
                          {component.unit}
                        </div>
                      </div>
                    ) : (
                      // Read-only total display - flexible sizing to match input design
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        height: '20px',
                        minWidth: '90px',
                        maxWidth: '140px',
                        width: 'fit-content'
                      }}>
                        <Text 
                          size="sm" 
                          fw={700} // Bold for all values
                          c={isTotalOutOfDate ? 'red' : (isSpecialComponent ? '#1e40af' : undefined)} // Dark blue for special components
                          style={{
                            fontStyle: isTotalOutOfDate ? 'italic' : 'normal',
                            fontSize: '12px',
                            textAlign: 'right',
                            fontFamily: 'monospace',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {round2(currentValue)?.toFixed(2)} {component.unit}
                        </Text>
                      </div>
                    )}
                  </div>
                </Table.Td>

                {/* Total value with NNL Column */}
                <Table.Td 
                  style={{
                    textAlign: 'end',
                    fontWeight: isTotal ? 'bold' : 'normal',
                    backgroundColor: isTotal ? 'rgba(248, 249, 250, 0.8)' : undefined,
                    color: isTotalOutOfDate ? 'red' : undefined,
                    fontStyle: isTotalOutOfDate ? 'italic' : 'normal',
                    verticalAlign: 'middle'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    alignItems: 'center',
                    height: isTotal ? '20px' : '32px',
                    width: '100%'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      height: '20px',
                      minWidth: '110px',
                      maxWidth: '150px',
                      width: 'fit-content'
                    }}>
                      <Text 
                        size="sm" 
                        fw={700} // Bold for all values
                        c={(() => {
                          if (isTotalOutOfDate) return 'red';
                          if (!nnlRelevantComponents.has(name)) return 'dimmed';
                          
                          // NNL color coding logic
                          const nnlContribution = (nnlContributions as any)[name] || 0;
                          if (nnlContribution > 0) {
                            return '#339af0'; // Blue when NNL contribution exists
                          } else {
                            return 'black'; // Black when no NNL contribution
                          }
                        })()}
                        style={{
                          fontStyle: isTotalOutOfDate ? 'italic' : 'normal',
                          fontSize: '12px',
                          textAlign: 'right',
                          fontFamily: 'monospace',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {(() => {
                          // Only show NNL values for relevant components
                          if (!nnlRelevantComponents.has(name)) {
                            return '—'; // Em dash for non-NNL components
                          }
                          
                          const nnlContribution = (nnlContributions as any)[name] || 0;
                          const totalWithNNL = currentValue + nnlContribution;
                          
                          // Show total with NNL for relevant components
                          // GIR keeps 2 decimal places, all other NNL components get 1 decimal place
                          const decimalPlaces = name === 'GIR' ? 2 : 1;
                          return `${round2(totalWithNNL)?.toFixed(decimalPlaces)} ${component.unit}`;
                        })()}
                      </Text>
                    </div>
                  </div>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
      </div>

      {/* AppTemplate CSS for totals and "ood" styling */}
      <style jsx>{`
        .table-responsive {
          padding: 0.5rem;
        }

        .table-responsive tr.totals {
          font-weight: bold;
        }

        .table-responsive tr.totals th,
        .table-responsive tr.totals td {
          background-color: rgba(29, 146, 159, 0.12);
        }

        .table-responsive tr.totals td.ood {
          color: red;
          font-style: italic;
        }

        .table-responsive th,
        .table-responsive td {
          white-space: nowrap;
          vertical-align: middle;
        }

        .input-group.manual {
          width: 120px;
        }
      `}</style>
    </div>
  );
} 