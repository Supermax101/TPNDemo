import { useCallback } from "react";
import * as r4 from "fhir/r4";
import { Button, Group, Stack } from "@mantine/core";
import PatientHeader from "./PatientHeader";
import PatientInformationTable from "./PatientInformationTable";
import IAppData from "@/lib/app-data/IAppData";
import DateUtils from "@/lib/DateUtils";
import { useDisclosure } from "@mantine/hooks";
import PatientDetailsModal from "../modals/PatientDetailsModal";

type Sex = r4.Patient["gender"];

export interface IPatientLeftSidebarProps {
    appData?: IAppData | null;
    onEditProfileSave: (sex: Sex, gestationalAge: number, birthWeight: number, age: number, therapyDay: number, dosingWeight: number, ward: string) => void;
}

export default function PatientLeftSidebar(props: IPatientLeftSidebarProps) {
    const { appData } = props;
    const [patientDetailsModalOpened, { open: openPatientDetailsModal, close: closePatientDetailsModal }] = useDisclosure();

    const onEditProfileSave = useCallback((sex: Sex, gestationalAge: number, birthWeight: number, age: number, therapyDay: number, dosingWeight: number, ward: string) => {
        props.onEditProfileSave(sex, gestationalAge, birthWeight, age, therapyDay, dosingWeight, ward);
        closePatientDetailsModal();
    }, [closePatientDetailsModal, props]);

    return (
        <>
            {/* Patient Details Modal */}
            <PatientDetailsModal
                opened={patientDetailsModalOpened}
                sex={appData?.sex}
                gestationalAge={appData?.gestationalAge}
                birthWeight={appData?.birthWeight}
                age={appData?.age}
                therapyDay={appData?.therapyDays}
                dosingWeight={appData?.dosingWeight}
                ward={appData?.ward ?? ""}
                onClose={closePatientDetailsModal}
                onSave={onEditProfileSave}
            />

            <Stack flex={1} style={{ maxWidth: 230 }}>
                <PatientHeader
                    patient={appData?.patient ?? null}
                    mrn={appData?.mrn ?? ""}
                    acc={appData?.acc ?? ""}
                />
                {/* Edit Profile button removed per design */}

                <PatientInformationTable
                    patient={appData?.patient}
                    sex={appData?.sex}
                    gestationalAge={appData?.gestationalAge}
                    birthWeight={appData?.birthWeight}
                    age={appData?.age}
                    therapyDays={appData?.therapyDays}
                    dosingWeight={appData?.dosingWeight}
                    dob={appData?.birthdate ? DateUtils.toYYYYMMDDWithDashes(appData?.birthdate) : ""}
                    ward={appData?.ward ?? ""}
                    lastUpdateDate={appData?.lastUpdateDate}
                    orderDate={appData?.orderDate}
                    dueDate={appData?.dueDate}
                />
            </Stack>
        </>
    );
}