// TPN Non-Nutritional Lines Calculator
// Ported from prototype calculator.ts - exact formulas preserved

import { NonNutritionalLine, CalculationResult, ValidationResult, CONCENTRATION_LIMITS } from './types';

/**
 * Calculate GIR, Na, K, and total volume from non-nutritional lines
 * @param nonNutritionalLines - Array of non-nutritional line data
 * @param dosingWeight - Patient dosing weight in kg
 * @returns Calculation results including totalGIR, totalNa, totalK, totalVolume
 */
export const calculateSummary = (
  nonNutritionalLines: NonNutritionalLine[], 
  dosingWeight: string | number
): CalculationResult => {
  const DCW = dosingWeight && !isNaN(parseFloat(String(dosingWeight))) ? parseFloat(String(dosingWeight)) : NaN;
  let totalGIR = 0;
  let totalNa = 0;
  let totalK = 0;
  let totalDose = 0;

  // Calculate for each line
  nonNutritionalLines.forEach(line => {
    if (!line.dose || line.dose.trim() === "" || isNaN(parseFloat(line.dose))) return;
    
    const dose = parseFloat(line.dose);
    totalDose += dose;
    
    // Calculate for each additive in the line
    line.additives.forEach(additive => {
      if (!additive.additive || additive.additive.trim() === "" || 
          !additive.conc || additive.conc.trim() === "" || isNaN(parseFloat(additive.conc))) return;
      
      const conc = parseFloat(additive.conc);
      
      // Calculate GIR: glucose = conc value for Dextrose
      if (additive.additive === "Dextrose") {
        const glucose = conc;
        const gir = (glucose * 10 * dose) / DCW / 60;
        totalGIR += gir;
      }

      // Calculate Na: z = conc/0.9 for Sodium Chloride
      if (additive.additive === "Sodium Chloride") {
        const z = conc / 0.9;
        const na = (dose * 24 * 154 * z) / 1000 / DCW;
        totalNa += na;
      }

      // Calculate Na: z = conc/0.9 for Sodium Acetate
      if (additive.additive === "Sodium Acetate") {
        const z = conc / 0.9;
        const na = (dose * 24 * 109.7 * z) / 1000 / DCW;
        totalNa += na;
      }

      // Calculate Na: z = conc/0.9 for Sodium Bicarbonate
      if (additive.additive === "Sodium Bicarbonate") {
        const z = conc / 0.9;
        const na = (dose * 24 * 107.1 * z) / 1000 / DCW;
        totalNa += na;
      }

      // Calculate Na: z = conc/0.9 for Sodium Citrate
      if (additive.additive === "Sodium Citrate") {
        const z = conc / 0.9;
        const na = (dose * 24 * 91.8 * z) / 1000 / DCW;
        totalNa += na;
      }

      // Calculate K: z = conc/0.9 for Potassium Chloride
      if (additive.additive === "Potassium Chloride") {
        const z = conc / 0.9;
        const k = (dose * 24 * 121 * z) / 1000 / DCW;
        totalK += k;
      }

      // Calculate K: z = conc/0.9 for Potassium Acetate
      if (additive.additive === "Potassium Acetate") {
        const z = conc / 0.9;
        const k = (dose * 24 * 92 * z) / 1000 / DCW;
        totalK += k;
      }
    });
  });

  // Calculate Volume: x = (sum of Doses from all valid rows) * 24 / DCW
  // Return 0 if no valid dosing weight (don't use fallback)
  const totalVolume = totalDose > 0 && !isNaN(DCW) && DCW > 0 ? (totalDose * 24) / DCW : 0;

  return { totalGIR, totalNa, totalK, totalVolume };
};

/**
 * Calculate enteral feed volume
 * @param feedingVolume - Volume per feeding
 * @param feedingEvery - Hours between feedings
 * @param dosingWeight - Patient dosing weight in kg
 * @returns Enteral volume calculation result
 */
export const calculateEnteralVolume = (
  feedingVolume: string | number,
  feedingEvery: string | number,
  dosingWeight: string | number
): number => {
  const DCW = dosingWeight && !isNaN(parseFloat(String(dosingWeight))) ? parseFloat(String(dosingWeight)) : NaN;
  
  if (feedingVolume && feedingEvery && !isNaN(parseFloat(String(feedingVolume))) && !isNaN(parseFloat(String(feedingEvery))) && !isNaN(DCW)) {
    const volume = parseFloat(String(feedingVolume));
    const every = parseFloat(String(feedingEvery));
    return (volume * 24) / every / DCW;
  }
  return 0;
};

/**
 * Calculate total volume from all lines
 * @param totalFluidIntake - TPN/Lipid fluid intake
 * @param enteralVolume - Calculated enteral volume
 * @param enteralToggle - Whether enteral feeding is enabled
 * @param nonNutritionalVolume - Volume from non-nutritional lines
 * @returns Total volume calculation
 */
export const calculateTotalVolume = (
  totalFluidIntake: string | number,
  enteralVolume: number,
  enteralToggle: boolean,
  nonNutritionalVolume: number
): number => {
  const tpnLipid = totalFluidIntake ? parseFloat(String(totalFluidIntake)) : 0;
  const enteralContribution = enteralToggle ? enteralVolume : 0;
  return tpnLipid + enteralContribution + nonNutritionalVolume;
};

/**
 * Calculate PN+Lipid dose (Total Fluid - NNL - Enteral)
 * @param totalFluidIntake - Total fluid dose
 * @param nonNutritionalVolume - Volume from NNL
 * @param enteralVolume - Volume from enteral feeds
 * @param enteralToggle - Whether enteral is enabled
 * @returns PN+Lipid dose in mL/kg
 */
export const calculatePNLipidDose = (
  totalFluidIntake: string | number,
  nonNutritionalVolume: number,
  enteralVolume: number,
  enteralToggle: boolean
): number => {
  const totalFluid = totalFluidIntake ? parseFloat(String(totalFluidIntake)) : 0;
  const enteralContribution = enteralToggle ? enteralVolume : 0;
  return totalFluid - nonNutritionalVolume - enteralContribution;
};

/**
 * Validate treatment plan data
 * @param nonNutritionalLines - Array of non-nutritional line data
 * @param enteralToggle - Whether enteral feeding is enabled
 * @param feedingVolume - Volume per feeding
 * @param feedingEvery - Hours between feedings
 * @returns Validation result with isValid flag and optional message
 */
export const validateTreatmentPlan = (
  nonNutritionalLines: NonNutritionalLine[],
  enteralToggle: boolean,
  feedingVolume: string | number,
  feedingEvery: string | number
): ValidationResult => {
  // Check if NNL has additive but no dose or concentration
  const hasIncompleteNNL = nonNutritionalLines.some(line => 
    line.additives.some(additive => additive.additive && (
      !line.dose || line.dose.trim() === "" || 
      !additive.conc || additive.conc.trim() === ""
    ))
  );
  
  if (hasIncompleteNNL) {
    return { isValid: false, message: "Missing NNL/Enteral Feeds Value" };
  }
  
  // Check if enteral is toggled but missing values
  if (enteralToggle && (!feedingVolume || !feedingEvery || String(feedingVolume).trim() === "" || String(feedingEvery).trim() === "")) {
    return { isValid: false, message: "Missing NNL/Enteral Feeds Value" };
  }
  
  return { isValid: true };
};

/**
 * Validate concentration limits for additives
 * @param additive - Additive type
 * @param concentration - Concentration value
 * @returns Whether concentration is within limits
 */
export const validateConcentration = (additive: string, concentration: number): boolean => {
  const limit = CONCENTRATION_LIMITS[additive as keyof typeof CONCENTRATION_LIMITS];
  return limit ? concentration <= limit : true;
};

/**
 * Get maximum allowed concentration for an additive
 * @param additive - Additive type
 * @returns Maximum concentration
 */
export const getMaxConcentration = (additive: string): number => {
  return CONCENTRATION_LIMITS[additive as keyof typeof CONCENTRATION_LIMITS] || 100;
};
