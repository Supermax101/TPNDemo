// Enhanced Step 2 Types - Updated to Match AppTemplate Structure

export interface IPredictionVals {
  // Core recommendation values
  start: number;      // Conservative recommendation
  center: number;     // Middle recommendation  
  end: number;        // Aggressive recommendation
  
  // Safe operating bounds
  min: number;        // Absolute minimum safe value
  max: number;        // Absolute maximum safe value
  
  // Optimal clinical range
  lower: number;      // Lower bound of optimal range
  upper: number;      // Upper bound of optimal range  
  target: number;     // Clinical target (optimal)
}

export interface IPredictionTotal {
  total: number;      // For calculated totals (PN Dose, GIR, etc.)
}

export interface IComponentPrediction {
  unit: string;
  stepsize: number;
  ion?: boolean;
  toEpic?: boolean;
  vals: IPredictionVals | IPredictionTotal;
}

export interface IEnhancedComponentData {
  id: string;
  component: string;
  unit: string;
  
  // New prediction structure (matches AppTemplate)
  prediction: IComponentPrediction;
  
  // Current user-selected value
  current: number;
  
  // For backward compatibility (deprecated)
  option1Value?: number;
  option2Value?: number; 
  option3Value?: number;
  
  // Enhanced slider configuration (derived from prediction.vals)
  min: number;
  max: number;
  stepSize: number;
  
  // Visual target zones (calculated from prediction.vals)
  lowerBound: number;
  upperBound: number;
  startGradient: number;
  centerGradient: number;
  endGradient: number;
  
  // Reference markers for the three recommendations
  startMarker: number;    // Conservative
  centerMarker: number;   // Middle
  endMarker: number;      // Aggressive
  targetMarker: number;   // Optimal
  
  // Configuration
  isTotal?: boolean;      // Is this a calculated total (read-only)?
  isModified?: boolean;   // Has user changed from default?
  toEpic?: boolean;
}

export interface IPatientContext {
  name: string;
  mrn: string;
  gestationalAge: number;
  birthWeight: number;
  dosingWeight: number;
  therapyDays: number;
  age: number;
  sex: string;
  lastOrderDate?: string;
  dueDate?: string;
}

export interface IClinicalParameters {
  protocol?: any;
  lineType?: any;
  totalFluidIntake?: number;
  infusionDuration?: number;
  fatEmulsionType?: any;
  includeEnteralFeeding?: boolean;
}

export interface IProtocolSummary {
  protocol: string;
  lineType: string;
  totalFluidIntake: number;
  infusionDuration: number;
  fatEmulsionType: string;
  dosingWeight: number;
}

export interface IEnhancedCharacteristics {
  osmolarity: number;
  energyPnAndFat: number;
  energyFat: number;
  energyFatPercent: number;
  energyProtein: number;
  energyProteinPercent: number;
  energyCarbohydrate: number;
  energyCarbohydratePercent: number;
  fatInfusionRate: number;
  fatVolumeDosage: number;
  fatVolumeRate: number;
  glucoseInfusionRate: number;
  nonproteinCaloriesToNitrogenRatio: number;
  aminoAcidConcentration: number;
  calciumPhosphateRatio: number;
  chlorideAcetateRatio: number;
  maxPotassiumInfusionRate: number;
}

export interface IHistoricalData {
  labValues: {
    component: string;
    values: { date: string; value: number }[];
  }[];
  previousOrders: {
    date: string;
    components: { component: string; value: number }[];
  }[];
}

// Options for three-option selection
// No option selection - AppTemplate uses single prediction set

// Helper function to check if prediction has target values (vs just total)
export function hasTargetValues(vals: IPredictionVals | IPredictionTotal): vals is IPredictionVals {
  return 'target' in vals;
}

// Helper function to check if prediction is a total
export function isTotal(vals: IPredictionVals | IPredictionTotal): vals is IPredictionTotal {
  return 'total' in vals;
} 