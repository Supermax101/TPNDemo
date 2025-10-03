import * as r4 from "fhir/r4";
import IAppData, { ILabResult, IModelCharacteristicOption, IModelComponentResults } from "../app-data/IAppData";

/**
 * This interface is responsible for getting the EHR Data needed by this application
 */
export default interface IEHRDataClient {
    getPatientDetails(patientId: string): Promise<IAppData>;

    getPatient(patientId: string): Promise<r4.Patient>;
    getMrn(patient: r4.Patient): Promise<string>;
    getAcc(patient: r4.Patient): Promise<string>;
    getPatientSex(patient: r4.Patient): Promise<r4.Patient["gender"]>;
    getPatientGestationalAge(patient: r4.Patient): Promise<number>;     // Weeks
    getPatientBirthWeight(patient: r4.Patient): Promise<number>;        // Kgs
    getPatientAge(patient: r4.Patient): Promise<number>;                // Days
    getPatientTherapyDays(patient: r4.Patient): Promise<number>;
    getPatientDosingWeight(patient: r4.Patient): Promise<number>;       // Kgs
    getPatientBirthdate(patient: r4.Patient): Promise<Date | undefined>;
    getPatientWard(patient: r4.Patient): Promise<string>;
    getTodaysLabs(patientId: string): Promise<ILabResult[]>;
    getHistoricalLabs(patientId: string): Promise<ILabResult[]>;

    getModelResults(patientId: string, clinicalParams?: any): Promise<IModelComponentResults>;
    getModelCharacteristicsOptions(patientId: string, clinicalParams?: any): Promise<IModelCharacteristicOption[]>;

    getNonNutritionalLinesPreviewData(paitentId: string): Promise<{ addictive: string; dose: number; unit: string; freq: string; }[]>;
    getNonNutritionalLinesMessage(paitentId: string): Promise<string>;
}