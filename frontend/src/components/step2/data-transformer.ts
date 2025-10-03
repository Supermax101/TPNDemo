// AppTemplate-compatible data transformation
// This file provides utilities to transform backend predictions into AppTemplate format

// AppTemplate Prediction type (matching their structure exactly)
export interface AppTemplatePrediction {
  unit: string;
  stepsize: number;
  vals: {
    start: number;
    center: number; 
    end: number;
    min: number;
    max: number;
    lower: number;
    upper: number;
    target: number;
  } | {
    total: number;
  };
}

// Transform backend predictions to AppTemplate format
export function transformToAppTemplateFormat(predictions: any): Record<string, AppTemplatePrediction> {
  const result: Record<string, AppTemplatePrediction> = {};
  
  if (!predictions || typeof predictions !== 'object') {
    console.warn('[TRANSFORM] No valid predictions data');
    return generateFallbackAppTemplatePredictions();
  }

  // Handle direct AppTemplate format
  if (isAppTemplateFormat(predictions)) {
    return predictions;
  }

  // Handle raw Choice 1/2/3 format from CosmosDB (if we ever receive it)
  if (predictions['Choice 1'] && predictions['Choice 2'] && predictions['Choice 3']) {
    console.warn('[TRANSFORM] We expected reformatted data, but got raw choices. Check Azure Function reformat_output.');
    // We should not reach here since reformat_output should handle this
    return generateFallbackAppTemplatePredictions();
  }

  // Transform from our backend format to AppTemplate format
  Object.entries(predictions).forEach(([componentName, predictionData]: [string, any]) => {
    if (!predictionData || typeof predictionData !== 'object') return;

    // Handle different backend formats
    if (predictionData.vals) {
      // Direct vals format - ensure stepsize is valid and user-friendly
      let stepsize = predictionData.stepsize || 0.1;
      if (stepsize <= 0) {
        console.warn(`[TRANSFORM] Invalid stepsize for ${componentName}: ${stepsize}, using 0.1`);
        stepsize = 0.1;
      }
      
      // Fix: Override large step sizes for smoother slider UX
      if (componentName === 'Zinc Chloride' && stepsize >= 10) {
        stepsize = 5; // Zinc: 10 → 5 (still clinical but smoother)
      } else if ((componentName === 'Fat' || componentName === 'Heparin') && stepsize >= 0.5) {
        stepsize = 0.1; // Fat/Heparin: 0.5 → 0.1 (much smoother)
      } else if ((componentName === 'Dextrose' || componentName === 'Copper' || componentName === 'Selenium') && stepsize >= 1) {
        stepsize = 0.5; // Others: 1 → 0.5 (moderate improvement)
      }
      
      result[componentName] = {
        unit: predictionData.unit || '',
        stepsize: stepsize,
        vals: predictionData.vals
      };
    } else if (predictionData.target !== undefined || predictionData.total !== undefined) {
      // Our enhanced format
      if (predictionData.target !== undefined) {
        let stepsize = predictionData.stepSize || predictionData.stepsize || 0.1;
        if (stepsize <= 0) {
          console.warn(`[TRANSFORM] Invalid stepsize for ${componentName}: ${stepsize}, using 0.1`);
          stepsize = 0.1;
        }
        
        // 🔧 FIX: Override large step sizes for smoother slider UX (same as above)
        const originalStepsize = stepsize;
        if (componentName === 'Zinc Chloride' && stepsize >= 10) {
          stepsize = 5; // Zinc: 10 → 5 (still clinical but smoother)
        } else if ((componentName === 'Fat' || componentName === 'Heparin') && stepsize >= 0.5) {
          stepsize = 0.1; // Fat/Heparin: 0.5 → 0.1 (much smoother)
        } else if ((componentName === 'Dextrose' || componentName === 'Copper' || componentName === 'Selenium') && stepsize >= 1) {
          stepsize = 0.5; // Others: 1 → 0.5 (moderate improvement)
        }

        result[componentName] = {
          unit: predictionData.unit || '',
          stepsize: stepsize,
          vals: {
            start: predictionData.startGradient || predictionData.min || 0,
            center: predictionData.target || 0, // FIX: Use target as center for alignment
            end: predictionData.endGradient || predictionData.max || 0,
            min: predictionData.min || 0,
            max: predictionData.max || 10,
            lower: predictionData.lowerBound || predictionData.min || 0,
            upper: predictionData.upperBound || predictionData.max || 0,
            target: predictionData.target || 0
          }
        };

      } else {
        result[componentName] = {
          unit: predictionData.unit || '',
          stepsize: 0.01,
          vals: {
            total: predictionData.total || predictionData.current || 0
          }
        };
      }
    }
  });
  
  // Auto-expand congested slider ranges for better visual spacing
  const expandedResult = autoExpandCongestedRanges(result);
  
  return Object.keys(expandedResult).length > 0 ? expandedResult : generateFallbackAppTemplatePredictions();
}

// Auto-expand congested slider ranges for better visual spacing
function autoExpandCongestedRanges(predictions: Record<string, AppTemplatePrediction>): Record<string, AppTemplatePrediction> {
  const result = { ...predictions };
  
  Object.entries(result).forEach(([componentName, prediction]) => {
    if (!prediction.vals || 'total' in prediction.vals) {
      return; // Skip total components
    }
    
    const vals = prediction.vals as any;
    const { min, max, target, lower, upper } = vals;
    const currentRange = max - min;
    
    // 🔧 Detect congestion: if range is too small relative to target value
    const targetValue = target || ((min + max) / 2);
    const minDesiredRange = Math.max(targetValue * 0.4, 2); // At least 40% of target value or 2 units
    
    if (currentRange < minDesiredRange) {
      
      // Calculate expanded range
      const expansionNeeded = minDesiredRange - currentRange;
      const expandMin = expansionNeeded * 0.4; // Expand 40% below
      const expandMax = expansionNeeded * 0.6; // Expand 60% above
      
      const newMin = Math.max(0, min - expandMin); // Don't go below 0
      const newMax = max + expandMax;
      
      // Update all range values proportionally
      result[componentName] = {
        ...prediction,
        vals: {
          ...vals,
          min: Math.round(newMin * 100) / 100,
          max: Math.round(newMax * 100) / 100,
          start: Math.round(newMin * 100) / 100,
          end: Math.round(newMax * 100) / 100,
          // Keep target, lower, upper unchanged - they're clinically determined
          target,
          lower: lower || newMin,
          upper: upper || newMax
        }
      };
      
    }
  });
  
  return result;
}

// Transform raw Choice 1/2/3 format from CosmosDB to AppTemplate format
function transformChoiceFormatToAppTemplate(rawChoices: any): Record<string, AppTemplatePrediction> {
  const result: Record<string, AppTemplatePrediction> = {};
  
  const choice1 = rawChoices['Choice 1'] || {};
  const choice2 = rawChoices['Choice 2'] || {};
  const choice3 = rawChoices['Choice 3'] || {};

  // Define step sizes (matching predict.py)
  const stepSizes: Record<string, number> = {
    'Fat': 0.5,
    'TrophAmine': 0.1,
    'Dextrose': 1,
    'Acetate': 0.1,
    'Calcium': 0.1,
    'Copper': 1,
    'Heparin': 0.5,
    'Magnesium': 0.1,
    'MVI Pediatric': 0.1,
    'Phosphate': 0.1,
    'Potassium': 0.1,
    'Selenium': 1,
    'Sodium': 0.1,
    'Zinc Chloride': 10,
    'Chloride': 0.1
  };

  // Define units (matching predict.py output)
  const units: Record<string, string> = {
    'Fat': 'g/kg',
    'TrophAmine': 'g/kg',
    'Dextrose': '%',
    'Acetate': 'mEq/kg',
    'Calcium': 'mEq/kg',
    'Copper': 'mcg/kg',
    'Heparin': 'Units/mL',
    'Magnesium': 'mEq/kg',
    'MVI Pediatric': 'mL/kg',
    'Phosphate': 'mmol/kg',
    'Potassium': 'mEq/kg',
    'Selenium': 'mcg/kg',
    'Sodium': 'mEq/kg',
    'Zinc Chloride': 'mcg/kg',
    'Chloride': 'mEq/kg',
    'PN Dose': 'mL/kg',
    'Ca:PO4': 'mmol:mmol',
    'GIR': 'mg/kg/min',
    'Total PN kcal': 'kcal/kg'
  };

  // Components that are totals (not adjustable)
  const totalComponents = ['PN Dose', 'Ca:PO4', 'Total PN kcal', 'GIR', 'Estimated Chloride'];

  // Process each component in Choice 1 (center prediction)
  Object.keys(choice1).forEach(componentName => {
    const choice1Value = choice1[componentName];
    const choice2Value = choice2[componentName] || 0;
    const choice3Value = choice3[componentName] || 0;
    
    // Handle "Chloride" -> "Estimated Chloride" renaming
    const displayName = componentName === 'Chloride' ? 'Estimated Chloride' : componentName;
    
    if (totalComponents.includes(componentName) || totalComponents.includes(displayName)) {
      // Total components (not adjustable)
      result[displayName] = {
        unit: units[componentName] || '',
        stepsize: 0.01,
        vals: {
          total: round2(choice1Value)
        }
      };
    } else {
      // Adjustable components
      const stepSize = stepSizes[componentName] || 0.1;
      
      // Calculate min/max (with reasonable defaults)
      const values = [choice1Value, choice2Value, choice3Value].filter(v => v > 0);
      const minVal = Math.min(...values, choice1Value * 0.5);
      const maxVal = Math.max(...values, choice1Value * 1.5);
      
      result[displayName] = {
        unit: units[componentName] || '',
        stepsize: stepSize,
        vals: {
          start: round2(choice2Value), // Choice 2 as start
          center: round2(choice1Value), // Choice 1 as center
          end: round2(choice3Value), // Choice 3 as end
          min: round2(Math.max(0, minVal)),
          max: round2(maxVal),
          lower: round2(choice2Value), // Choice 2 as lower bound
          upper: round2(choice3Value), // Choice 3 as upper bound
          target: round2(choice1Value) // Choice 1 as target
        }
      };
    }
  });

  return result;
}

// Check if data is already in AppTemplate format
function isAppTemplateFormat(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  
  const firstComponent = Object.values(data)[0] as any;
  return firstComponent && 
         firstComponent.vals && 
         firstComponent.unit !== undefined &&
         (firstComponent.stepsize !== undefined || 'total' in firstComponent.vals);
}

// Generate fallback predictions in AppTemplate format
export function generateFallbackAppTemplatePredictions(pnLipidDoseFromStep1?: number): Record<string, AppTemplatePrediction> {
  return {
    'Fat': {
      unit: 'g/kg',
      stepsize: 0.5,
      vals: {
        start: 0.5,
        center: 1.0,
        end: 1.5,
        min: 0.0,
        max: 3.5,
        lower: 0.0,
        upper: 1.5,
        target: 1.0
      }
    },
    'TrophAmine': {
      unit: 'g/kg',
      stepsize: 0.1,
      vals: {
        start: 1.5,
        center: 2.0,
        end: 2.5,
        min: 1.0,
        max: 4.0,
        lower: 1.5,
        upper: 3.0,
        target: 2.0
      }
    },
    'Dextrose': {
      unit: '%',
      stepsize: 1.0,
      vals: {
        start: 8.0,
        center: 10.0,
        end: 12.0,
        min: 5.0,
        max: 15.0,
        lower: 8.0,
        upper: 12.0,
        target: 10.0
      }
    },
    'Sodium': {
      unit: 'mEq/kg',
      stepsize: 0.1,
      vals: {
        start: 2.0,
        center: 3.0,
        end: 4.0,
        min: 0.0,
        max: 5.0,
        lower: 2.0,
        upper: 4.0,
        target: 3.0
      }
    },
    'Potassium': {
      unit: 'mEq/kg',
      stepsize: 0.1,
      vals: {
        start: 1.5,
        center: 2.0,
        end: 2.5,
        min: 0.0,
        max: 3.0,
        lower: 1.5,
        upper: 2.5,
        target: 2.0
      }
    },
    'Calcium': {
      unit: 'mEq/kg',
      stepsize: 0.1,
      vals: {
        start: 1.0,
        center: 1.5,
        end: 2.0,
        min: 0.0,
        max: 3.0,
        lower: 1.0,
        upper: 2.0,
        target: 1.5
      }
    },
    'Magnesium': {
      unit: 'mEq/kg',
      stepsize: 0.05,
      vals: {
        start: 0.1,
        center: 0.15,
        end: 0.2,
        min: 0.0,
        max: 0.5,
        lower: 0.1,
        upper: 0.2,
        target: 0.15
      }
    },
    'Phosphate': {
      unit: 'mmol/kg',
      stepsize: 0.1,
      vals: {
        start: 0.5,
        center: 0.8,
        end: 1.0,
        min: 0.0,
        max: 1.5,
        lower: 0.5,
        upper: 1.0,
        target: 0.8
      }
    },
    'Acetate': {
      unit: 'mEq/kg',
      stepsize: 0.1,
      vals: {
        start: 2.0,
        center: 3.0,
        end: 4.0,
        min: 0.0,
        max: 6.0,
        lower: 2.0,
        upper: 4.0,
        target: 3.0
      }
    },
    'MVI Pediatric': {
      unit: 'mL/kg',
      stepsize: 0.1,
      vals: {
        start: 1.0,
        center: 1.5,
        end: 2.0,
        min: 0.5,
        max: 2.5,
        lower: 1.0,
        upper: 2.0,
        target: 1.5
      }
    },
    'Zinc Chloride': {
      unit: 'mcg/kg',
      stepsize: 50,
      vals: {
        start: 200,
        center: 300,
        end: 400,
        min: 100,
        max: 500,
        lower: 200,
        upper: 400,
        target: 300
      }
    },
    'Copper': {
      unit: 'mcg/kg',
      stepsize: 5,
      vals: {
        start: 15,
        center: 20,
        end: 25,
        min: 10,
        max: 40,
        lower: 15,
        upper: 25,
        target: 20
      }
    },
    'Selenium': {
      unit: 'mcg/kg',
      stepsize: 1,
      vals: {
        start: 2,
        center: 3,
        end: 4,
        min: 1,
        max: 5,
        lower: 2,
        upper: 4,
        target: 3
      }
    },
    'Heparin': {
      unit: 'units/mL',
      stepsize: 0.1,
      vals: {
        start: 0.3,
        center: 0.5,
        end: 0.7,
        min: 0.0,
        max: 1.0,
        lower: 0.3,
        upper: 0.7,
        target: 0.5
      }
    },
    // Calculated totals
    'PN Dose': {
      unit: 'mL/kg',
      stepsize: 0.01,
      vals: {
        total: pnLipidDoseFromStep1 || 115.0  // Use PN+Lipid dose from step 1 if available
      }
    },
    'Ca:PO4': {
      unit: 'mmol:mmol',
      stepsize: 0.01,
      vals: {
        total: 1.08
      }
    },
    'Total PN kcal': {
      unit: 'kcal/kg',
      stepsize: 0.01,
      vals: {
        total: 59.8
      }
    },
    'GIR': {
      unit: 'mg/kg/min',
      stepsize: 0.01,
      vals: {
        total: 9.2
      }
    },
    'Estimated Chloride': {
      unit: 'mEq/kg',
      stepsize: 0.01,
      vals: {
        total: 1.9
      }
    }
  };
}

// Utility function to round to 2 decimal places (AppTemplate style)
export const round2 = (val: number): number => Math.round(val * 100) / 100; 