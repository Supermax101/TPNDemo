// TPN Calculation Types
// Ported from prototype calculator.ts

export interface Additive {
  additive: string;
  conc: string;
}

export interface NonNutritionalLine {
  lineNumber: number;
  dose: string;
  additives: Additive[];
}

export interface CalculationResult {
  totalGIR: number;
  totalNa: number;
  totalK: number;
  totalVolume: number;
}

export interface EnteralCalculationResult {
  volume: number;
  kcal: number;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// Supported additive types with their concentration limits
export const SUPPORTED_ADDITIVES = [
  "Dextrose",
  "Sodium Chloride", 
  "Sodium Acetate",
  "Sodium Bicarbonate",
  "Sodium Citrate",
  "Potassium Chloride",
  "Potassium Acetate"
] as const;

export const CONCENTRATION_LIMITS = {
  "Dextrose": 20,
  "Sodium Chloride": 1,
  "Sodium Acetate": 1,
  "Sodium Bicarbonate": 1,
  "Sodium Citrate": 1,
  "Potassium Chloride": 1,
  "Potassium Acetate": 1
} as const;
