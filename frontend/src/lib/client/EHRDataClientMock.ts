import * as r4 from "fhir/r4";
import IEHRDataClient from "./IEHRDataClient";
import IAppData, { ILabResult, IModelCharacteristicOption, IModelComponentResults } from "../app-data/IAppData";

// TPN Types (formerly from TPNModelClient)
export interface TPNPatientData {
    mrn: string;
    dosingWeight: number;
    [key: string]: any;
}

export interface TPNLabData {
    component: string;
    value: string | number;
    unit: string;
    [key: string]: any;
}

export interface TPNClinicalParameters {
    protocol: string;
    lineType: string;
    totalFluidIntake: number;
    infusionDuration: number;
    fatEmulsionType: string;
    [key: string]: any;
}

/**
 * Completely Self-Contained Mock EHR Data Client
 * 
 * Returns hardcoded data for the entire Step 1 → Step 2 → Step 3 flow
 * Based on real HAPI patient data for consistency
 * 
 * ⚠️  PURE FRONTEND MOCK - NO BACKEND CALLS AT ALL
 */
export default class EHRDataClientMock implements IEHRDataClient {
    
    // Hardcoded patient data - Jonathan Paul from HAPI FHIR
    private mockPatientData = {
        id: "mock-patient-demo",
        resourceType: "Patient" as const,
        identifier: [{
            use: "usual" as const,
            type: {
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                    code: "MR",
                    display: "Medical Record Number"
                }]
            },
            system: "http://hospital.org/mrn",
            value: "MRN82961206"
        }],
        active: true,
        name: [{
            use: "official" as const,
            family: "Paul",
            given: ["Jonathan"]
        }],
        gender: "male" as const,
        birthDate: "2025-08-17",
        extension: [{
            url: "http://hl7.org/fhir/StructureDefinition/patient-birthWeight",
            valueQuantity: {
                value: 2.5,
                unit: "kg",
                system: "http://unitsofmeasure.org",
                code: "kg"
            }
        }, {
            url: "http://hl7.org/fhir/StructureDefinition/patient-gestationalAge",
            valueQuantity: {
                value: 37,
                unit: "weeks",
                system: "http://unitsofmeasure.org",
                code: "wk"
            }
        }]
    };

    // Today's lab data - Jonathan Paul from HAPI FHIR (exact values and names)
    private mockLabsData: ILabResult[] = [
        { id: "1", component: "Albumin", unit: "g/dL", values: [{ date: new Date(), value: "2.82" }] },
        { id: "2", component: "Calcium", unit: "mg/dL", values: [{ date: new Date(), value: "10.27" }] },
        { id: "3", component: "Chloride", unit: "mEq/L", values: [{ date: new Date(), value: "111.25" }] },
        { id: "4", component: "Carbon dioxide", unit: "mEq/L", values: [{ date: new Date(), value: "21.59" }] },
        { id: "5", component: "Glucose", unit: "mg/dL", values: [{ date: new Date(), value: "52.23" }] },
        { id: "6", component: "Potassium", unit: "mEq/L", values: [{ date: new Date(), value: "3.73" }] },
        { id: "7", component: "Magnesium", unit: "mg/dL", values: [{ date: new Date(), value: "1.79" }] },
        { id: "8", component: "Sodium", unit: "mEq/L", values: [{ date: new Date(), value: "143.84" }] },
        { id: "9", component: "Phosphate", unit: "mg/dL", values: [{ date: new Date(), value: "6.58" }] },
        { id: "10", component: "Urea nitrogen", unit: "mg/dL", values: [{ date: new Date(), value: "4.12" }] },
        { id: "11", component: "Creatinine", unit: "mg/dL", values: [{ date: new Date(), value: "0.32" }] },
        { id: "12", component: "Triglyceride", unit: "mg/dL", values: [{ date: new Date(), value: "102.47" }] },
        { id: "13", component: "Alkaline phosphatase", unit: "U/L", values: [{ date: new Date(), value: "399.95" }] },
        { id: "14", component: "ALT", unit: "U/L", values: [{ date: new Date(), value: "19.37" }] },
        { id: "15", component: "AST", unit: "U/L", values: [{ date: new Date(), value: "20.6" }] },
        { id: "16", component: "Calcium", unit: "mmol/L", values: [{ date: new Date(), value: "4.68" }] }
    ];

    // Historical labs - Jonathan Paul from HAPI FHIR (exact history)
    private mockHistoricalLabs: ILabResult[] = [
        { id: "1", component: "Albumin", unit: "g/dL", values: [
            { date: new Date("2025-09-23T07:30:00Z"), value: "3.22" },
            { date: new Date("2025-09-25T07:30:00Z"), value: "3.05" },
            { date: new Date("2025-10-01T07:30:00Z"), value: "3.24" }
        ]},
        { id: "2", component: "Calcium", unit: "mg/dL", values: [
            { date: new Date("2025-09-28T07:30:00Z"), value: "8.61" },
            { date: new Date("2025-09-29T07:30:00Z"), value: "9.38" }
        ]},
        { id: "3", component: "Chloride", unit: "mEq/L", values: [
            { date: new Date("2025-09-24T07:30:00Z"), value: "108.27" },
            { date: new Date("2025-09-26T07:30:00Z"), value: "105.33" },
            { date: new Date("2025-09-27T07:30:00Z"), value: "104.02" },
            { date: new Date("2025-09-29T07:30:00Z"), value: "110.26" },
            { date: new Date("2025-09-30T07:30:00Z"), value: "108.29" }
        ]},
        { id: "4", component: "Carbon dioxide", unit: "mEq/L", values: [
            { date: new Date("2025-09-25T07:30:00Z"), value: "22.81" },
            { date: new Date("2025-09-26T07:30:00Z"), value: "21.68" },
            { date: new Date("2025-09-28T07:30:00Z"), value: "23.72" },
            { date: new Date("2025-09-29T07:30:00Z"), value: "24.09" }
        ]},
        { id: "5", component: "Glucose", unit: "mg/dL", values: [
            { date: new Date("2025-09-23T07:30:00Z"), value: "82.58" },
            { date: new Date("2025-09-29T07:30:00Z"), value: "75.19" }
        ]},
        { id: "6", component: "Potassium", unit: "mEq/L", values: [
            { date: new Date("2025-09-24T07:30:00Z"), value: "3.95" },
            { date: new Date("2025-09-28T07:30:00Z"), value: "4.03" },
            { date: new Date("2025-09-30T07:30:00Z"), value: "4.55" }
        ]},
        { id: "7", component: "Magnesium", unit: "mg/dL", values: [
            { date: new Date("2025-09-23T07:30:00Z"), value: "2.1" },
            { date: new Date("2025-10-01T07:30:00Z"), value: "2.13" }
        ]},
        { id: "8", component: "Sodium", unit: "mEq/L", values: [
            { date: new Date("2025-09-25T07:30:00Z"), value: "140.22" },
            { date: new Date("2025-09-30T07:30:00Z"), value: "138.54" }
        ]},
        { id: "9", component: "Phosphate", unit: "mg/dL", values: [
            { date: new Date("2025-09-23T07:30:00Z"), value: "6.76" },
            { date: new Date("2025-09-27T07:30:00Z"), value: "6.29" },
            { date: new Date("2025-09-30T07:30:00Z"), value: "5.92" }
        ]},
        { id: "10", component: "Urea nitrogen", unit: "mg/dL", values: [
            { date: new Date("2025-09-23T07:30:00Z"), value: "9.98" },
            { date: new Date("2025-09-24T07:30:00Z"), value: "3.64" },
            { date: new Date("2025-09-27T07:30:00Z"), value: "12.07" },
            { date: new Date("2025-10-01T07:30:00Z"), value: "9.61" }
        ]},
        { id: "11", component: "Creatinine", unit: "mg/dL", values: [
            { date: new Date("2025-09-24T07:30:00Z"), value: "0.3" },
            { date: new Date("2025-09-27T07:30:00Z"), value: "0.61" },
            { date: new Date("2025-09-29T07:30:00Z"), value: "0.55" }
        ]},
        { id: "12", component: "Triglyceride", unit: "mg/dL", values: [
            { date: new Date("2025-09-26T07:30:00Z"), value: "128.76" },
            { date: new Date("2025-09-28T07:30:00Z"), value: "117.02" }
        ]},
        { id: "13", component: "Alkaline phosphatase", unit: "U/L", values: [
            { date: new Date("2025-09-24T07:30:00Z"), value: "516.38" },
            { date: new Date("2025-09-25T07:30:00Z"), value: "452.82" },
            { date: new Date("2025-09-26T07:30:00Z"), value: "295.61" },
            { date: new Date("2025-09-28T07:30:00Z"), value: "454.88" },
            { date: new Date("2025-10-01T07:30:00Z"), value: "216.67" }
        ]},
        { id: "14", component: "ALT", unit: "U/L", values: [
            { date: new Date("2025-09-25T07:30:00Z"), value: "22.85" },
            { date: new Date("2025-09-27T07:30:00Z"), value: "41.62" },
            { date: new Date("2025-09-30T07:30:00Z"), value: "41.47" }
        ]},
        { id: "15", component: "AST", unit: "U/L", values: [
            { date: new Date("2025-09-24T07:30:00Z"), value: "69.36" },
            { date: new Date("2025-09-26T07:30:00Z"), value: "33.2" },
            { date: new Date("2025-09-27T07:30:00Z"), value: "62.18" },
            { date: new Date("2025-10-01T07:30:00Z"), value: "37.78" }
        ]},
        { id: "16", component: "Calcium", unit: "mmol/L", values: [
            { date: new Date("2025-09-23T07:30:00Z"), value: "4.28" },
            { date: new Date("2025-09-25T07:30:00Z"), value: "3.92" },
            { date: new Date("2025-09-30T07:30:00Z"), value: "4.11" }
        ]}
    ];

    // Rich TPN historical component data (similar to Denis Parker's rich FHIR data)
    // Extended to 14 days (2 weeks) for richer display
    private mockRichTpnHistory: any[] = [
        // Day 1 (oldest) - 7/09/2025
        {
            component: "Amino Acid",
            date: "2025-07-09T14:30:00Z",
            dose: "2.12",
            unit: "g/kg/day",
            displayValue: "2.12",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Dextrose",
            date: "2025-07-09T14:30:00Z",
            dose: "6.85",
            unit: "mg/kg/min",
            displayValue: "6.85",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Fat",
            date: "2025-07-09T14:30:00Z",
            dose: "1.95",
            unit: "g/kg/day",
            displayValue: "1.95",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Sodium",
            date: "2025-07-09T14:30:00Z",
            dose: "2.48",
            unit: "mEq/kg/day",
            displayValue: "2.48",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Potassium",
            date: "2025-07-09T14:30:00Z",
            dose: "1.95",
            unit: "mEq/kg/day",
            displayValue: "1.95",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Calcium",
            date: "2025-07-09T14:30:00Z",
            dose: "35.25",
            unit: "mg/kg/day",
            displayValue: "35.25",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Phosphate",
            date: "2025-07-09T14:30:00Z",
            dose: "0.95",
            unit: "mmol/kg/day",
            displayValue: "0.95",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Magnesium",
            date: "2025-07-09T14:30:00Z",
            dose: "0.18",
            unit: "mEq/kg/day",
            displayValue: "0.18",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Acetate",
            date: "2025-07-09T14:30:00Z",
            dose: "1.25",
            unit: "mEq/kg/day",
            displayValue: "1.25",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Chloride",
            date: "2025-07-09T14:30:00Z",
            dose: "0.95",
            unit: "mEq/kg/day",
            displayValue: "0.95",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Mvi",
            date: "2025-07-09T14:30:00Z",
            dose: "0.85",
            unit: "mL/kg/day",
            displayValue: "0.85",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Copper",
            date: "2025-07-09T14:30:00Z",
            dose: "12.5",
            unit: "mcg/kg/day",
            displayValue: "12.5",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Zinc Chloride",
            date: "2025-07-09T14:30:00Z",
            dose: "185",
            unit: "mcg/kg/day",
            displayValue: "185",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Selenium",
            date: "2025-07-09T14:30:00Z",
            dose: "1.2",
            unit: "mcg/kg/day",
            displayValue: "1.2",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },

        // Day 2 - 7/10/2025
        {
            component: "Amino Acid",
            date: "2025-07-10T14:30:00Z",
            dose: "2.25",
            unit: "g/kg/day",
            displayValue: "2.25",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Dextrose",
            date: "2025-07-10T14:30:00Z",
            dose: "7.25",
            unit: "mg/kg/min",
            displayValue: "7.25",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Fat",
            date: "2025-07-10T14:30:00Z",
            dose: "2.15",
            unit: "g/kg/day",
            displayValue: "2.15",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Sodium",
            date: "2025-07-10T14:30:00Z",
            dose: "2.68",
            unit: "mEq/kg/day",
            displayValue: "2.68",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Potassium",
            date: "2025-07-10T14:30:00Z",
            dose: "2.18",
            unit: "mEq/kg/day",
            displayValue: "2.18",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Calcium",
            date: "2025-07-10T14:30:00Z",
            dose: "38.85",
            unit: "mg/kg/day",
            displayValue: "38.85",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Phosphate",
            date: "2025-07-10T14:30:00Z",
            dose: "1.08",
            unit: "mmol/kg/day",
            displayValue: "1.08",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Magnesium",
            date: "2025-07-10T14:30:00Z",
            dose: "0.22",
            unit: "mEq/kg/day",
            displayValue: "0.22",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Acetate",
            date: "2025-07-10T14:30:00Z",
            dose: "1.42",
            unit: "mEq/kg/day",
            displayValue: "1.42",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Chloride",
            date: "2025-07-10T14:30:00Z",
            dose: "1.12",
            unit: "mEq/kg/day",
            displayValue: "1.12",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Mvi",
            date: "2025-07-10T14:30:00Z",
            dose: "0.92",
            unit: "mL/kg/day",
            displayValue: "0.92",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Copper",
            date: "2025-07-10T14:30:00Z",
            dose: "14.2",
            unit: "mcg/kg/day",
            displayValue: "14.2",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Zinc Chloride",
            date: "2025-07-10T14:30:00Z",
            dose: "205",
            unit: "mcg/kg/day",
            displayValue: "205",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Selenium",
            date: "2025-07-10T14:30:00Z",
            dose: "1.4",
            unit: "mcg/kg/day",
            displayValue: "1.4",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },

        // Continue with more days 3-14 to extend to 2 weeks total
        {
            component: "Fat",
            date: "2025-07-18T14:30:00Z",
            dose: "2.85",
            unit: "g/kg/day",
            displayValue: "2.85",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Sodium",
            date: "2025-07-18T14:30:00Z",
            dose: "3.21",
            unit: "mEq/kg/day",
            displayValue: "3.21",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Potassium", 
            date: "2025-07-18T14:30:00Z",
            dose: "2.85",
            unit: "mEq/kg/day",
            displayValue: "2.85",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Calcium",
            date: "2025-07-18T14:30:00Z",
            dose: "48.92",
            unit: "mg/kg/day", 
            displayValue: "48.92",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Phosphate",
            date: "2025-07-18T14:30:00Z",
            dose: "1.35",
            unit: "mmol/kg/day",
            displayValue: "1.35", 
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Magnesium",
            date: "2025-07-18T14:30:00Z",
            dose: "0.31",
            unit: "mEq/kg/day",
            displayValue: "0.31",
            medicationType: "TPN Component", 
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Acetate",
            date: "2025-07-18T14:30:00Z",
            dose: "1.89",
            unit: "mEq/kg/day",
            displayValue: "1.89",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition", 
            source: "extension"
        },
        {
            component: "Chloride",
            date: "2025-07-18T14:30:00Z",
            dose: "1.56",
            unit: "mEq/kg/day",
            displayValue: "1.56",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Mvi",
            date: "2025-07-18T14:30:00Z",
            dose: "1.12",
            unit: "mL/kg/day",
            displayValue: "1.12",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Copper",
            date: "2025-07-18T14:30:00Z", 
            dose: "18.5",
            unit: "mcg/kg/day",
            displayValue: "18.5",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Zinc Chloride",
            date: "2025-07-18T14:30:00Z",
            dose: "285",
            unit: "mcg/kg/day",
            displayValue: "285",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Selenium",
            date: "2025-07-18T14:30:00Z",
            dose: "2.1",
            unit: "mcg/kg/day", 
            displayValue: "2.1",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        
        // Day 2
        {
            component: "Amino Acid",
            date: "2025-07-19T14:30:00Z",
            dose: "2.95",
            unit: "g/kg/day",
            displayValue: "2.95",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Dextrose",
            date: "2025-07-19T14:30:00Z",
            dose: "9.12",
            unit: "mg/kg/min", 
            displayValue: "9.12",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Fat",
            date: "2025-07-19T14:30:00Z",
            dose: "3.02",
            unit: "g/kg/day",
            displayValue: "3.02",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Sodium",
            date: "2025-07-19T14:30:00Z",
            dose: "3.45",
            unit: "mEq/kg/day",
            displayValue: "3.45",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Potassium",
            date: "2025-07-19T14:30:00Z",
            dose: "3.02",
            unit: "mEq/kg/day",
            displayValue: "3.02", 
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Calcium",
            date: "2025-07-19T14:30:00Z",
            dose: "52.18",
            unit: "mg/kg/day",
            displayValue: "52.18",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Phosphate",
            date: "2025-07-19T14:30:00Z",
            dose: "1.48",
            unit: "mmol/kg/day",
            displayValue: "1.48",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Magnesium",
            date: "2025-07-19T14:30:00Z",
            dose: "0.35",
            unit: "mEq/kg/day",
            displayValue: "0.35",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Acetate", 
            date: "2025-07-19T14:30:00Z",
            dose: "2.05",
            unit: "mEq/kg/day",
            displayValue: "2.05",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Chloride",
            date: "2025-07-19T14:30:00Z",
            dose: "1.72",
            unit: "mEq/kg/day",
            displayValue: "1.72",
            medicationType: "TPN Component", 
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Mvi",
            date: "2025-07-19T14:30:00Z",
            dose: "1.18",
            unit: "mL/kg/day",
            displayValue: "1.18",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Copper",
            date: "2025-07-19T14:30:00Z",
            dose: "19.8",
            unit: "mcg/kg/day",
            displayValue: "19.8",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Zinc Chloride",
            date: "2025-07-19T14:30:00Z", 
            dose: "295",
            unit: "mcg/kg/day",
            displayValue: "295",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Selenium",
            date: "2025-07-19T14:30:00Z",
            dose: "2.3",
            unit: "mcg/kg/day",
            displayValue: "2.3",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition", 
            source: "extension"
        },

        // Day 3
        {
            component: "Amino Acid",
            date: "2025-07-20T14:30:00Z",
            dose: "3.08",
            unit: "g/kg/day",
            displayValue: "3.08",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Dextrose",
            date: "2025-07-20T14:30:00Z",
            dose: "9.85",
            unit: "mg/kg/min",
            displayValue: "9.85",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition", 
            source: "extension"
        },
        {
            component: "Fat",
            date: "2025-07-20T14:30:00Z",
            dose: "3.18",
            unit: "g/kg/day",
            displayValue: "3.18",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Sodium",
            date: "2025-07-20T14:30:00Z",
            dose: "3.68",
            unit: "mEq/kg/day",
            displayValue: "3.68",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Potassium",
            date: "2025-07-20T14:30:00Z",
            dose: "3.18", 
            unit: "mEq/kg/day",
            displayValue: "3.18",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Calcium",
            date: "2025-07-20T14:30:00Z",
            dose: "55.65",
            unit: "mg/kg/day",
            displayValue: "55.65",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Phosphate",
            date: "2025-07-20T14:30:00Z",
            dose: "1.62",
            unit: "mmol/kg/day",
            displayValue: "1.62",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Magnesium",
            date: "2025-07-20T14:30:00Z",
            dose: "0.38",
            unit: "mEq/kg/day",
            displayValue: "0.38",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Acetate",
            date: "2025-07-20T14:30:00Z",
            dose: "2.21",
            unit: "mEq/kg/day",
            displayValue: "2.21",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Chloride",
            date: "2025-07-20T14:30:00Z", 
            dose: "1.88",
            unit: "mEq/kg/day",
            displayValue: "1.88",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Mvi",
            date: "2025-07-20T14:30:00Z",
            dose: "1.25",
            unit: "mL/kg/day",
            displayValue: "1.25",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Copper",
            date: "2025-07-20T14:30:00Z",
            dose: "21.2",
            unit: "mcg/kg/day",
            displayValue: "21.2",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Zinc Chloride",
            date: "2025-07-20T14:30:00Z",
            dose: "308",
            unit: "mcg/kg/day",
            displayValue: "308",
            medicationType: "TPN Component", 
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Selenium",
            date: "2025-07-20T14:30:00Z",
            dose: "2.5",
            unit: "mcg/kg/day",
            displayValue: "2.5",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },

        // Day 4
        {
            component: "Amino Acid",
            date: "2025-07-21T14:30:00Z",
            dose: "3.15",
            unit: "g/kg/day",
            displayValue: "3.15",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Dextrose", 
            date: "2025-07-21T14:30:00Z",
            dose: "10.45",
            unit: "mg/kg/min",
            displayValue: "10.45",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Fat",
            date: "2025-07-21T14:30:00Z",
            dose: "3.25",
            unit: "g/kg/day",
            displayValue: "3.25",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Sodium",
            date: "2025-07-21T14:30:00Z",
            dose: "3.82",
            unit: "mEq/kg/day",
            displayValue: "3.82",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Potassium",
            date: "2025-07-21T14:30:00Z",
            dose: "3.35",
            unit: "mEq/kg/day",
            displayValue: "3.35",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Calcium",
            date: "2025-07-21T14:30:00Z",
            dose: "58.94",
            unit: "mg/kg/day",
            displayValue: "58.94",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Phosphate",
            date: "2025-07-21T14:30:00Z",
            dose: "1.75",
            unit: "mmol/kg/day",
            displayValue: "1.75",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Magnesium",
            date: "2025-07-21T14:30:00Z",
            dose: "0.42",
            unit: "mEq/kg/day",
            displayValue: "0.42",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Acetate",
            date: "2025-07-21T14:30:00Z", 
            dose: "2.38",
            unit: "mEq/kg/day",
            displayValue: "2.38",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Chloride",
            date: "2025-07-21T14:30:00Z",
            dose: "2.05",
            unit: "mEq/kg/day",
            displayValue: "2.05",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Mvi",
            date: "2025-07-21T14:30:00Z",
            dose: "1.32",
            unit: "mL/kg/day",
            displayValue: "1.32",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition", 
            source: "extension"
        },
        {
            component: "Copper",
            date: "2025-07-21T14:30:00Z",
            dose: "22.5",
            unit: "mcg/kg/day",
            displayValue: "22.5",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Zinc Chloride",
            date: "2025-07-21T14:30:00Z",
            dose: "318",
            unit: "mcg/kg/day",
            displayValue: "318",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Selenium",
            date: "2025-07-21T14:30:00Z",
            dose: "2.7",
            unit: "mcg/kg/day",
            displayValue: "2.7",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },

        // Day 5 (most recent)
        {
            component: "Amino Acid",
            date: "2025-07-22T14:30:00Z",
            dose: "3.22",
            unit: "g/kg/day",
            displayValue: "3.22",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Dextrose",
            date: "2025-07-22T14:30:00Z",
            dose: "11.18",
            unit: "mg/kg/min",
            displayValue: "11.18",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Fat",
            date: "2025-07-22T14:30:00Z",
            dose: "3.42",
            unit: "g/kg/day",
            displayValue: "3.42",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Sodium",
            date: "2025-07-22T14:30:00Z",
            dose: "3.95",
            unit: "mEq/kg/day",
            displayValue: "3.95",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Potassium",
            date: "2025-07-22T14:30:00Z",
            dose: "3.48",
            unit: "mEq/kg/day",
            displayValue: "3.48",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Calcium",
            date: "2025-07-22T14:30:00Z",
            dose: "62.15",
            unit: "mg/kg/day",
            displayValue: "62.15",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Phosphate",
            date: "2025-07-22T14:30:00Z",
            dose: "1.89",
            unit: "mmol/kg/day",
            displayValue: "1.89",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Magnesium",
            date: "2025-07-22T14:30:00Z",
            dose: "0.45",
            unit: "mEq/kg/day",
            displayValue: "0.45",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Acetate",
            date: "2025-07-22T14:30:00Z",
            dose: "2.55",
            unit: "mEq/kg/day",
            displayValue: "2.55",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Chloride",
            date: "2025-07-22T14:30:00Z",
            dose: "2.22",
            unit: "mEq/kg/day",
            displayValue: "2.22",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Mvi",
            date: "2025-07-22T14:30:00Z",
            dose: "1.38",
            unit: "mL/kg/day",
            displayValue: "1.38",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Copper",
            date: "2025-07-22T14:30:00Z",
            dose: "23.8",
            unit: "mcg/kg/day",
            displayValue: "23.8",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Zinc Chloride",
            date: "2025-07-22T14:30:00Z",
            dose: "325",
            unit: "mcg/kg/day",
            displayValue: "325",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        },
        {
            component: "Selenium",
            date: "2025-07-22T14:30:00Z",
            dose: "2.9",
            unit: "mcg/kg/day",
            displayValue: "2.9",
            medicationType: "TPN Component",
            originalMedication: "Total Parenteral Nutrition",
            source: "extension"
        }
    ];

    // Hardcoded realistic TPN predictions based on HAPI patient profile
    private mockAppTemplatePredictions: Record<string, any> = {
        "Amino Acid": { 
            unit: "g/kg/day", 
            vals: { start: 2.5, center: 3.0, end: 3.5, min: 2.0, max: 4.0, lower: 2.5, upper: 3.5, target: 3.0 }
        },
        "Dextrose": { 
            unit: "mg/kg/min", 
            vals: { start: 9.5, center: 10.7, end: 12.0, min: 8.0, max: 15.0, lower: 9.5, upper: 12.0, target: 10.7 }
        },
        "Fat": { 
            unit: "g/kg/day", 
            vals: { start: 2.8, center: 3.2, end: 3.6, min: 2.0, max: 4.0, lower: 2.8, upper: 3.6, target: 3.2 }
        },
        "Sodium": { 
            unit: "mEq/kg/day", 
            vals: { start: 3.0, center: 3.5, end: 4.0, min: 2.0, max: 5.0, lower: 3.0, upper: 4.0, target: 3.5 }
        },
        "Potassium": { 
            unit: "mEq/kg/day", 
            vals: { start: 2.8, center: 3.2, end: 3.6, min: 2.0, max: 4.0, lower: 2.8, upper: 3.6, target: 3.2 }
        },
        "Calcium": { 
            unit: "mg/kg/day", 
            vals: { start: 40, center: 45, end: 50, min: 30, max: 60, lower: 40, upper: 50, target: 45 }
        },
        "Phosphate": { 
            unit: "mmol/kg/day", 
            vals: { start: 1.2, center: 1.5, end: 1.8, min: 1.0, max: 2.0, lower: 1.2, upper: 1.8, target: 1.5 }
        },
        "Magnesium": { 
            unit: "mEq/kg/day", 
            vals: { start: 0.3, center: 0.4, end: 0.5, min: 0.2, max: 0.6, lower: 0.3, upper: 0.5, target: 0.4 }
        },
        "Acetate": { 
            unit: "mEq/kg/day", 
            vals: { start: 2.0, center: 2.3, end: 2.6, min: 1.5, max: 3.0, lower: 2.0, upper: 2.6, target: 2.3 }
        },
        "Chloride": { 
            unit: "mEq/kg/day", 
            vals: { start: 1.5, center: 1.8, end: 2.1, min: 1.0, max: 2.5, lower: 1.5, upper: 2.1, target: 1.8 }
        },
        "MVI": { 
            unit: "mL/kg/day", 
            vals: { start: 1.0, center: 1.2, end: 1.4, min: 0.8, max: 1.6, lower: 1.0, upper: 1.4, target: 1.2 }
        },
        "Copper": { 
            unit: "mcg/kg/day", 
            vals: { start: 15, center: 20, end: 25, min: 10, max: 30, lower: 15, upper: 25, target: 20 }
        },
        "Zinc": { 
            unit: "mcg/kg/day", 
            vals: { start: 250, center: 300, end: 350, min: 200, max: 400, lower: 250, upper: 350, target: 300 }
        },
        "Selenium": { 
            unit: "mcg/kg/day", 
            vals: { start: 2.0, center: 2.5, end: 3.0, min: 1.5, max: 3.5, lower: 2.0, upper: 3.0, target: 2.5 }
        },
        "Heparin": { 
            unit: "units/kg/hr", 
            vals: { start: 0.3, center: 0.5, end: 0.7, min: 0.1, max: 1.0, lower: 0.3, upper: 0.7, target: 0.5 }
        }
    };

    constructor() {
        // Completely self-contained - no backend dependencies
    }

    // Main method - returns complete patient data instantly
    public async getPatientDetails(patientId: string): Promise<IAppData> {
        const currentDate = new Date();
        const birthDate = new Date(this.mockPatientData.birthDate);
        const ageInDays = Math.floor((currentDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));

        return {
            // Patient FHIR resource
            patient: this.mockPatientData as r4.Patient,
            
            // Patient details (flat structure like HAPI) - Jonathan Paul
            mrn: "MRN82961206",
            acc: "MRN82961206",
            sex: "male" as const,
            gestationalAge: 37,
            birthWeight: 2.5,
            age: ageInDays,
            therapyDays: 5, // Based on TPN history
            dosingWeight: 2.72, // Current weight (matches HAPI)
            birthdate: birthDate,
            ward: "NICU",
            
            // Dates
            lastUpdateDate: new Date("2025-07-22T15:28:57.000Z"),
            orderDate: new Date("2025-07-20T14:30:00Z"),
            dueDate: currentDate,
            
            // Labs (exactly like HAPI format)
            todaysLabs: this.mockLabsData,
            historicalLabs: this.mockHistoricalLabs,
            
            // Rich TPN historical data (similar to Denis Parker's data for HistoricalDataTab)
            doseHistory: this.mockRichTpnHistory,
            
            nonNutritionalLinesPreviewData: [],
            nonNutritionalLinesMessage: "No non-nutritional lines configured.",
            
            // Model results (empty initially - filled by predictions)
            modelResults: { results: [] },
            modelCharacteristics: {
                osmolarity: 0,
                energyPnAndFat: 0,
                energyFat: 0,
                energyFatPercent: 0,
                energyProtein: 0,
                energyProteinPercent: 0,
                energyCarbohydrate: 0,
                energyCarbohydratePercent: 0,
                fatInfusionRate: 0,
                fatVolumeDosage: 0,
                fatVolumeRate: 0,
                glucoseInfusionRate: 0,
                nonproteinCaloriesToNitrogenRatio: 0,
                aminoAcidConcentration: 0,
                calciumPhosphateRatio: 0,
                chlorideAcetateRatio: 0,
                maxPotassiumInfusionRate: 0
            }
        };
    }

    // 🎯 COMPLETELY HARDCODED PREDICTIONS - NO BACKEND CALLS
    public async getTpnPredictionsAsync(patientId: string, clinicalParameters: TPNClinicalParameters): Promise<{
        modelResults: IModelComponentResults;
        modelCharacteristics: IModelCharacteristicOption;
    }> {
        // Add a small delay to simulate processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
            modelResults: { results: [] }, // Legacy format - not used in new AppTemplate flow
            modelCharacteristics: {
                osmolarity: 850,
                energyPnAndFat: 82.7,
                energyFat: 15.0,
                energyFatPercent: 18.1,
                energyProtein: 14.4,
                energyProteinPercent: 17.4,
                energyCarbohydrate: 53.3,
                energyCarbohydratePercent: 64.5,
                fatInfusionRate: 1.5,
                fatVolumeDosage: 7.5,
                fatVolumeRate: 0.31,
                glucoseInfusionRate: 10.89,
                nonproteinCaloriesToNitrogenRatio: 305.98,
                aminoAcidConcentration: 2.4,
                calciumPhosphateRatio: 0.94,
                chlorideAcetateRatio: 1.21,
                maxPotassiumInfusionRate: 2.2
            }
        };
    }

    // 🎯 HARDCODED HL7v2 GENERATION - NO BACKEND CALLS (Step 3)
    public async generateMockHL7v2(predictionComponents: any, patientData: any, selectedOption: string = 'final'): Promise<any> {
        // Add a small delay to simulate processing
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Generate realistic HL7v2 message with current timestamp
        const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, '').slice(0, 14);
        const orderNumber = `TPN${timestamp}`;
        
        // Build HL7v2 message based on current predictions/slider values
        const hl7Message = this.buildMockHL7Message(orderNumber, timestamp, predictionComponents);
        const formattedMessage = this.formatHL7ForDisplay(hl7Message);
        
        return {
            success: true,
            hl7_message: hl7Message,
            formatted_message: formattedMessage,
            validation: {
                is_valid: true,
                message_type: "RDE^O01",
                message_control_id: orderNumber,
                patient_id: "MRN20195294^^^CH001^MR",
                segment_count: 15,
                errors: [],
                warnings: ["Mock HL7v2 message - for testing only"]
            },
            metadata: {
                message_type: "RDE^O01",
                patient_mrn: "MRN20195294",
                selected_option: selectedOption,
                components_count: 13,
                encoding: "HL7v2.5",
                order_control: "NW",
                generation_timestamp: new Date().toISOString()
            }
        };
    }

    private buildMockHL7Message(orderNumber: string, timestamp: string, predictionComponents: any): string {
        // Extract values from predictions (with slider modifications if any)
        const predictions = this.mockAppTemplatePredictions;
        
        // Check if we received AppTemplate format with enhanced values
        let enhancedValues: Record<string, number> = {};
        if (predictionComponents && typeof predictionComponents === 'object' && predictionComponents.format === 'appTemplate') {
            enhancedValues = predictionComponents.enhancedValues || {};
        }
        
        // MSH - Message Header
        const msh = `MSH|^~\\&|TPN_PREDICTOR|Children's Hospital|CPOE_SYSTEM|Children's Hospital|${timestamp}||RDE^O01^RDE_O01|${orderNumber}|P|2.5`;
        
        // PID - Patient Identification
        const pid = `PID|1||MRN20195294^^^CH001^MR||PATIENT^MOCK^DEMO|||F||||||||||||||||||||||`;
        
        // ORC - Common Order
        const orc = `ORC|NW|${orderNumber}|${orderNumber}||NW|||||${timestamp}||SYSTEM^TPN^PREDICTOR^^^MD`;
        
        // RXE - Pharmacy/Treatment Encoded Order
        const rxe = `RXE||TPN001^TOTAL PARENTERAL NUTRITION^LOCAL|150.0||mL||TPN formulation based on MOCK predictions. Infuse over 24 hours via central line. Monitor glucose, electrolytes.||G|150.0||0||||||||||||||||||||||||||||||||${timestamp}`;
        
        // RXR - Pharmacy/Treatment Route
        const rxr = `RXR|IV^INTRAVENOUS^HL70162`;
        
        // RXC - Pharmacy/Treatment Component Order (one for each component)
        const rxcSegments: string[] = [];
        
        // Build components based on current predictions (use enhanced values if slider was tweaked)
        const components = [
            { name: "Amino Acid", code: "AMINO10", display: "AMINO ACID 10 % INTRAVENOUS SOLUTION", value: enhancedValues["Amino Acid"] || predictions["Amino Acid"]?.vals?.target || 3.0, unit: "g" },
            { name: "Dextrose", code: "D70W", display: "DEXTROSE 70 % IN WATER (D70W) INTRAVENOUS SOLUTION", value: enhancedValues["Dextrose"] || predictions["Dextrose"]?.vals?.target || 10.7, unit: "g" },
            { name: "Fat", code: "LIPID20", display: "LIPID EMULSION 20% INTRAVENOUS SOLUTION", value: enhancedValues["Fat"] || predictions["Fat"]?.vals?.target || 3.2, unit: "g" },
            { name: "Sodium", code: "NACL4", display: "SODIUM CHLORIDE 4 MEQ/ML INTRAVENOUS SOLUTION", value: enhancedValues["Sodium"] || predictions["Sodium"]?.vals?.target || 3.5, unit: "mEq" },
            { name: "Potassium", code: "KCL2", display: "POTASSIUM CHLORIDE 2 MEQ/ML INTRAVENOUS SOLUTION", value: enhancedValues["Potassium"] || predictions["Potassium"]?.vals?.target || 3.2, unit: "mEq" },
            { name: "Calcium", code: "CAGLUC100", display: "CALCIUM GLUCONATE 100 MG/ML (10 %) INTRAVENOUS SOLUTION", value: enhancedValues["Calcium"] || predictions["Calcium"]?.vals?.target || 45, unit: "mg" },
            { name: "Phosphate", code: "NAPO4_3MMOL", display: "SODIUM PHOSPHATE 3 MMOL/ML INTRAVENOUS SOLUTION", value: enhancedValues["Phosphate"] || predictions["Phosphate"]?.vals?.target || 1.5, unit: "mmol" },
            { name: "Magnesium", code: "MGSO4_1MEQ", display: "MAGNESIUM SULFATE 1 MEQ/ML INJ DILUTION", value: enhancedValues["Magnesium"] || predictions["Magnesium"]?.vals?.target || 0.4, unit: "mEq" },
            { name: "Acetate", code: "NAACET2", display: "SODIUM ACETATE 2 MEQ/ML INTRAVENOUS SOLUTION", value: enhancedValues["Acetate"] || predictions["Acetate"]?.vals?.target || 2.3, unit: "mEq" },
            { name: "Chloride", code: "NACL4", display: "SODIUM CHLORIDE 4 MEQ/ML INTRAVENOUS SOLUTION", value: enhancedValues["Chloride"] || predictions["Chloride"]?.vals?.target || 1.8, unit: "mEq" },
            { name: "MVI", code: "MVIPEDS", display: "MVI, PEDI WITH VIT K INTRAVENOUS SOLN", value: enhancedValues["MVI"] || predictions["MVI"]?.vals?.target || 1.2, unit: "mL" },
            { name: "Copper", code: "CUCL04MG", display: "CUPRIC CHLORIDE 0.4 MG/ML INTRAVENOUS SOLUTION", value: enhancedValues["Copper"] || predictions["Copper"]?.vals?.target || 20, unit: "mcg" },
            { name: "Zinc", code: "ZNCL1MG", display: "ZINC CHLORIDE 1 MG/ML INTRAVENOUS SOLUTION", value: enhancedValues["Zinc"] || predictions["Zinc"]?.vals?.target || 300, unit: "mcg" }
        ];
        
        components.forEach(comp => {
            rxcSegments.push(`RXC|A|${comp.code}^${comp.display} (INGREDIENT FOR TPN)^LOCAL|${comp.value}|${comp.unit}||${comp.value}|${comp.unit}`);
        });
        
        // Combine all segments with \r separator and add MLLP framing
        const allSegments = [msh, pid, orc, rxe, rxr, ...rxcSegments];
        return `\x0B${allSegments.join('\r')}\x1C\r`;
    }

    private formatHL7ForDisplay(hl7Message: string): string {
        // Remove MLLP framing for display
        let clean = hl7Message.replace(/\x0B|\x1C\r?/g, '');
        
        // Format each segment on its own line with segment name prefix
        const segments = clean.split('\r').filter(seg => seg.trim());
        const formatted = segments.map(segment => {
            const segmentType = segment.substring(0, 3);
            return `${segmentType}: ${segment}`;
        }).join('\n');
        
        return formatted;
    }

    // All other methods return cached/derived data
    public async getPatient(patientId: string): Promise<r4.Patient> {
        return this.mockPatientData as r4.Patient;
    }

    public async getMrn(patient: r4.Patient): Promise<string> {
        return "MRN20195294";
    }

    public async getAcc(patient: r4.Patient): Promise<string> {
        return "MRN20195294";
    }

    public async getPatientSex(patient: r4.Patient): Promise<r4.Patient["gender"]> {
        return "female";
    }

    public async getPatientGestationalAge(patient: r4.Patient): Promise<number> {
        return 33.5;
    }

    public async getPatientBirthWeight(patient: r4.Patient): Promise<number> {
        return 1.37;
    }

    public async getPatientAge(patient: r4.Patient): Promise<number> {
        const birthDate = new Date("2025-06-26");
        const currentDate = new Date();
        return Math.floor((currentDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    public async getPatientTherapyDays(patient: r4.Patient): Promise<number> {
        return 5;
    }

    public async getPatientDosingWeight(patient: r4.Patient): Promise<number> {
        return 1.43;
    }

    public async getPatientBirthdate(patient: r4.Patient): Promise<Date | undefined> {
        return new Date("2025-06-26");
    }

    public async getPatientWard(patient: r4.Patient): Promise<string> {
        return "NICU";
    }

    public async getTodaysLabs(patientId: string): Promise<ILabResult[]> {
        return this.mockLabsData;
    }

    public async getHistoricalLabs(patientId: string): Promise<ILabResult[]> {
        return this.mockHistoricalLabs;
    }

    public async getModelResults(patientId: string, clinicalParams?: any): Promise<IModelComponentResults> {
        // Use same backend pipeline via getTpnPredictionsAsync
        const predictions = await this.getTpnPredictionsAsync(patientId, clinicalParams || {});
        return predictions.modelResults;
    }

    public async getModelCharacteristicsOptions(patientId: string, clinicalParams?: any): Promise<IModelCharacteristicOption[]> {
        // Use same backend pipeline via getTpnPredictionsAsync
        const predictions = await this.getTpnPredictionsAsync(patientId, clinicalParams || {});
        return [predictions.modelCharacteristics];
    }

    public async getNonNutritionalLinesPreviewData(patientId: string): Promise<{ addictive: string; dose: number; unit: string; freq: string; }[]> {
        return [];
    }

    public async getNonNutritionalLinesMessage(patientId: string): Promise<string> {
        return "No non-nutritional lines configured.";
    }
}