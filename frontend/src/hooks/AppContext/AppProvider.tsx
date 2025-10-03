import { useCallback, useState } from "react";
import * as r4 from "fhir/r4";
import { IAppContext, AppContext } from "./AppContext";
import IEHRDataClient from "@/lib/client/IEHRDataClient";
import IAppData from "@/lib/app-data/IAppData";
import EHRDataClientMock from "@/lib/client/EHRDataClientMock";

export interface IAppProviderProps {
    children: React.ReactNode;
}

const DEFAULT_APP_CONTEXT: IAppContext = {
    patientId: null,
    patient: null,
    setPatientId: (patientId: string | null) => { },
    setPatient: (patient: r4.Patient | null) => { },

    ehrDataClient: new EHRDataClientMock(),
    appData: null,
    setEhrDataClient: (client: IEHRDataClient | null) => { },
    setAppData: (appData: IAppData | null) => { },
}

export function AppProvider(props: IAppProviderProps) {
    const [patientId, setPatientId] = useState<string | null>(DEFAULT_APP_CONTEXT.patientId);
    const [patient, setPatient] = useState<r4.Patient | null>(DEFAULT_APP_CONTEXT.patient);

    const [ehrDataClient, setEhrDataClient] = useState<IEHRDataClient | null>(DEFAULT_APP_CONTEXT.ehrDataClient);
    const [appData, setAppData] = useState<IAppData | null>(DEFAULT_APP_CONTEXT.appData);

    return (
        <AppContext.Provider value={{
            patientId, patient, setPatientId, setPatient,
            ehrDataClient, appData, setEhrDataClient, setAppData
        }}>
            {props.children}
        </AppContext.Provider>
    );
}