import { useCallback, useState } from "react";
import * as r4 from "fhir/r4";
import { IAppContext, AppContext } from "./AppContext";
import Client from "fhirclient/lib/Client";
import { IPlasmaFHIRClient } from "@plasmahealth/plasma-fhir-client";
import IEHRDataClient from "@/lib/client/IEHRDataClient";
import IAppData from "@/lib/app-data/IAppData";
import EHRDataClientMock from "@/lib/client/EHRDataClientMock";

export interface IAppProviderProps {
    children: React.ReactNode;
}

const DEFAULT_APP_CONTEXT: IAppContext = {
    patientId: null,
    fhirUrl: "",
    accessToken: "",

    plasmaFhirClient: null,
    fhirClient: null,
    patient: null,
    setPatientId: (patientId: string | null) => { },
    setFhirUrl: (fhirUrl: string) => { },
    setAccessToken: (accessToken: string) => { },
    setPlasmaFhirClient: (client: IPlasmaFHIRClient | null) => { },
    setFhirClient: () => { },
    setPatient: (patient: r4.Patient | null) => { },


    ehrDataClient: new EHRDataClientMock(),
    appData: null,
    setEhrDataClient: (client: IEHRDataClient | null) => { },
    setAppData: (appData: IAppData | null) => { },
}

export function AppProvider(props: IAppProviderProps) {
    const [patientId, setPatientId] = useState<string | null>(DEFAULT_APP_CONTEXT.patientId);
    const [fhirUrl, setFhirUrl] = useState<string>(DEFAULT_APP_CONTEXT.fhirUrl);
    const [accessToken, setAccessToken] = useState<string>(DEFAULT_APP_CONTEXT.accessToken);
    const [plasmaFhirClient, setPlasmaFhirClient] = useState<IPlasmaFHIRClient | null>(DEFAULT_APP_CONTEXT.plasmaFhirClient);
    const [fhirClient, setFhirClient] = useState<Client | null>(DEFAULT_APP_CONTEXT.fhirClient);
    const [patient, setPatient] = useState<r4.Patient | null>(DEFAULT_APP_CONTEXT.patient);

    const [ehrDataClient, setEhrDataClient] = useState<IEHRDataClient | null>(DEFAULT_APP_CONTEXT.ehrDataClient);
    const [appData, setAppData] = useState<IAppData | null>(DEFAULT_APP_CONTEXT.appData);

    return (
        <AppContext.Provider value={{
            patientId, fhirUrl, accessToken, setPatientId, setFhirUrl, setAccessToken,
            plasmaFhirClient, fhirClient, patient, setPlasmaFhirClient, setFhirClient, setPatient,
            ehrDataClient, appData, setEhrDataClient, setAppData
        }}>
            {props.children}
        </AppContext.Provider>
    );
}