import { Badge, Container, Divider, Group, SimpleGrid, Space, Text } from "@mantine/core";
import * as r4 from "fhir/r4";
import PatientSexBadge from "../core/badge/PatientSexBadge";
import WhiteBadge from "../core/badge/WhiteBadge";
import PatientWeightBadge from "../core/badge/PatientWeightBadge";
import PatientUtils from "@/lib/PatientUtils";
import DateUtils from "@/lib/DateUtils";

export interface IPatientInformationTableProps {
    patient: r4.Patient | undefined;
    sex: r4.Patient["gender"];
    gestationalAge?: number;
    birthWeight?: number;
    age?: number;
    therapyDays?: number | undefined;
    dosingWeight?: number;
    dob: string;
    ward: string;
    lastUpdateDate: Date | undefined;
    orderDate: Date | undefined;
    dueDate: Date | undefined;
}

export default function PatientInformationTable(props: IPatientInformationTableProps) {
    const { gestationalAge, birthWeight, age, therapyDays, dosingWeight, dob, ward, lastUpdateDate, orderDate, dueDate } = props;
    const sGestationalAge = gestationalAge ? `${gestationalAge} weeks` : "";
    const sBirthWeight = birthWeight ? `${birthWeight} kgs` : "";
    const sAge = age ? `${age.toLocaleString()} days` : "";
    const sTherapyDays = therapyDays ? `${therapyDays} days` : "";
    const sDosingWeight = dosingWeight ? `${dosingWeight} kgs` : "";
    const sLastUpdateDate = DateUtils.formatDate(lastUpdateDate);
    const sOrderDate = DateUtils.formatDate(orderDate);
    const sDueDate = DateUtils.formatDate(dueDate);

    return (
        <Container mx={0} pl={0}>
            <Text c="#5b5b67" size="sm" fw="700" pb={10}>Patient Profile</Text>

            {/* Sex */}
            <Group justify="space-between" my={6}>
                <Text size="sm" ml={6}>Sex</Text>
                <Text size="sm" fw={500} mr={2} style={{ textTransform: "capitalize" }}>{props.sex || 'unknown'}</Text>
            </Group>
            <Divider my={4} />

            <Group justify="space-between" my={6}>
                <Text size="sm" ml={6}>Gestational Age</Text>
                {sGestationalAge ? <Text size="sm" fw={500} mr={2}>{sGestationalAge}</Text> : null}
            </Group>
            <Divider my={4} />

            <Group justify="space-between" my={6}>
                <Text size="sm" ml={6}>Birth Weight</Text>
                {sBirthWeight ? <Text size="sm" fw={500} mr={2}>{sBirthWeight}</Text> : null}
            </Group>
            <Divider my={4} />

            <Group justify="space-between" my={6}>
                <Text size="sm" ml={6}>Age</Text>
                {sAge ? <Text size="sm" fw={500} mr={2}>{sAge}</Text> : null}
            </Group>
            <Divider my={4} />

            <Group justify="space-between" my={6}>
                <Text size="sm" ml={6}>Therapy Day</Text>
                {sTherapyDays ? <Text size="sm" fw={500} mr={2}>{sTherapyDays}</Text> : null}
            </Group>
            <Divider my={4} />

            <Group justify="space-between" my={6}>
                <Text size="sm" ml={6}>Dosing Weight</Text>
                {sDosingWeight ? <Text size="sm" fw={500} mr={2}>{sDosingWeight}</Text> : null}
            </Group>
            <Divider my={4} />

            <Group justify="space-between" my={6}>
                <Text size="sm" ml={6}>Birthday</Text>
                {dob ? <Text size="sm" fw={500} mr={2}>{dob}</Text> : null}
            </Group>
            <Divider my={4} />

            <Group justify="space-between" my={6}>
                <Text size="sm" ml={6}>Ward</Text>
                {ward ? <Text size="sm" fw={500} mr={2}>{ward}</Text> : null}
            </Group>
            <Divider my={4} />

            {/* DATE TABLE */}
            <Space my={10} />
            <Text c="#5b5b67" size="sm" fw="700" pb={10}>Date</Text>

            <Group justify="space-between" my={6}>
                <Text size="sm" ml={6}>Last Update</Text>
                <Text size="sm" fw={500} mr={2}>{sLastUpdateDate}</Text>
            </Group>
            <Divider my={4} />

            <Group justify="space-between" my={6}>
                <Text size="sm" ml={6}>Order Date</Text>
                <Text size="sm" fw={500} mr={2}>{sOrderDate}</Text>
            </Group>
            <Divider my={4} />

            <Group justify="space-between" my={6}>
                <Text size="sm" ml={6}>Due Date</Text>
                <Text size="sm" fw={500} mr={2}>{sDueDate}</Text>
            </Group>
        </Container>
    );
}