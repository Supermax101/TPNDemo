import { createContext, useContext } from "react";
import * as r4 from "fhir/r4";
import IEHRDataClient from "@/lib/client/IEHRDataClient";
import IAppData from "@/lib/app-data/IAppData";
import EHRDataClientMock from "@/lib/client/EHRDataClientMock";
export interface IAppContext {
  patientId: string | null;
  patient: r4.Patient | null;

  setPatientId: (patientId: string | null) => void;
  setPatient: (patient: r4.Patient | null) => void;

  ehrDataClient: IEHRDataClient | null;
  appData: IAppData | null;
  setEhrDataClient: (client: IEHRDataClient | null) => void;
  setAppData: (appData: IAppData | null) => void;
}

export const AppContext = createContext<IAppContext>({
  patientId: null,
  patient: null,

  setPatientId: (patientId: string | null) => { },
  setPatient: (patient: r4.Patient | null) => { },

  ehrDataClient: new EHRDataClientMock(),
  appData: null,
  setEhrDataClient: (client: IEHRDataClient | null) => { },
  setAppData: (appData: IAppData | null) => { },
});

// Custom hook to use the AppContext
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
