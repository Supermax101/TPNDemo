import * as r4 from "fhir/r4";

type Sex = r4.Patient["gender"];

export interface ILabResult {
    id: string;
    component: string;
    unit: string;
    values: { value: string, date: Date }[];
}

export interface INonNutritionalLinesPreviewData {
    addictive: string;
    dose: number;
    unit: string;
    freq: string;
}

/**
 * Results that come from the model output (3 different options) - LEGACY FORMAT
 */
export interface IModelComponentResults {
    results: { id: string; component: string; unit: string; option1Value: string; option2Value: string; option3Value: string }[];
}

export interface IModelCharacteristicOption {
    osmolarity: number;

    // Energy...
    energyPnAndFat: number;
    energyFat: number;
    energyFatPercent: number;
    energyProtein: number;
    energyProteinPercent: number;
    energyCarbohydrate: number;
    energyCarbohydratePercent: number;

    // Macro-Nutrients...
    fatInfusionRate: number;
    fatVolumeDosage: number;
    fatVolumeRate: number;
    glucoseInfusionRate: number;
    nonproteinCaloriesToNitrogenRatio: number;
    aminoAcidConcentration: number;

    // Electrolytes...
    calciumPhosphateRatio: number;
    chlorideAcetateRatio: number;
    maxPotassiumInfusionRate: number;
}

/**
 * NEW: AppTemplate predictions format from Azure
 */
export interface IAppTemplatePredictions {
    [componentName: string]: {
        unit: string;
        stepsize: number;
        ion?: boolean;
        toEpic?: boolean;
        vals: {
            // For adjustable components
            start?: number;
            center?: number;
            end?: number;
            min?: number;
            max?: number;
            lower?: number;
            upper?: number;
            target?: number;
        } | {
            // For calculated totals
            total: number;
        };
    };
}

/**
 * Historical data structures (optional - for future FHIR integration)
 */
export interface IHistoricalLabEntry {
    date: string;
    name?: string;
    code?: { display: string };
    value?: number;
    valueQuantity?: { value: number; unit: string };
    unit?: string;
    interpretation?: string;
    normalRange?: { min: number; max: number };
    effectiveDateTime?: string;
}

export interface IHistoricalDoseEntry {
    date: string;
    orderDate?: string;
    protocol?: string;
    totalDose?: number;
    dose?: number;
    duration?: number;
    infusionDuration?: number;
    components?: Record<string, any>;
}

export interface IHistoricalOrderEntry {
    date: string;
    orderDate?: string;
    orderId?: string;
    id?: string;
    status?: string;
}

export default interface IAppData {
    // Patient Details...
    patient: r4.Patient;
    mrn: string;
    acc: string;
    sex: Sex | undefined;
    gestationalAge: number;
    birthWeight: number;
    age: number;
    therapyDays: number;
    dosingWeight: number;
    birthdate: Date | undefined;
    ward: string;

    // Dates...
    lastUpdateDate: Date | undefined;
    orderDate: Date | undefined;
    dueDate: Date | undefined;

    // Labs (Step 1)...
    todaysLabs: ILabResult[];
    historicalLabs: ILabResult[];
    nonNutritionalLinesPreviewData: INonNutritionalLinesPreviewData[];
    nonNutritionalLinesMessage: string;

    // NEW: AppTemplate predictions format (preferred)
    predictions?: IAppTemplatePredictions;

    // LEGACY: Model Results (components keep 3 options, characteristics use single object)
    modelResults: IModelComponentResults;
    modelCharacteristics: IModelCharacteristicOption;  // Single characteristics object instead of array

    // OPTIONAL: Historical data (for future FHIR integration)
    labHistory?: IHistoricalLabEntry[];
    doseHistory?: IHistoricalDoseEntry[];
    orderHistory?: IHistoricalOrderEntry[];
}