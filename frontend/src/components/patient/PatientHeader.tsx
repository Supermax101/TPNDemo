import * as r4 from "fhir/r4";
import { Avatar, Badge, Text } from "@mantine/core";
import BlueBadge from "../core/badge/BlueBadge";
import PatientUtils from "@/lib/PatientUtils";
import GrayBadge from "../core/badge/GrayBadge";

export interface IPatientHeaderProps {
    patient: r4.Patient | null;
    mrn: string;
    acc: string;
}

export default function PatientHeader(props: IPatientHeaderProps) {
    const { patient, mrn, acc } = props;
    const patientInitials = PatientUtils.getPatientInitials(patient);
    const patientName = PatientUtils.getPatientDisplayName(patient);

    return (
        <div>
            <Avatar size="lg" bg="#5E6271" color="white" radius="md" mb={8}>{patientInitials}</Avatar>
            <Text fw={700} pb={4} style={{ fontSize: "24px" }}>{patientName}</Text>
            <Text fw={600} pb={2} style={{ fontSize: "14px", color: "#102688" }}>MRN: {mrn}</Text>
            <Text fw={500} style={{ fontSize: "12px", color: "#5b5d69" }}>ACC: {acc}</Text>
        </div>
    );
}