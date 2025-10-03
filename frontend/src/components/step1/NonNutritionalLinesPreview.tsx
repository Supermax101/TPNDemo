import { Text, Table, Box, Card, Alert, Space } from "@mantine/core";
import BlueBadge from "../core/badge/BlueBadge";
import { IconInfoCircle } from "@tabler/icons-react";
import { INonNutritionalLinesPreviewData } from "@/lib/app-data/IAppData";
export interface INonNutritionalLinesPreviewProps {
    data: INonNutritionalLinesPreviewData[];
    message: string;
}

export default function NonNutritionalLinesPreview(props: INonNutritionalLinesPreviewProps) {
    const rows = props.data.map((entry, index) => (
        <Table.Tr key={`NonNutritionalLinesPreview-${index}`}>
            <Table.Td fw="bold">{entry.addictive}</Table.Td>
            <Table.Td fw="bold" ta="right">{entry.dose}</Table.Td>
            <Table.Td fw="bold" ta="right">{entry.unit}</Table.Td>
            <Table.Td><BlueBadge text={entry.freq} /></Table.Td>
        </Table.Tr>
    ));

    return (
        <Box my={20}>
            <Text c="gray" size="xs" tt="uppercase" my={10}>Preview</Text>

            <Box bg="#F5F5F5" p={10}>
                <Table withTableBorder bg="white">
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th c="gray">Addictive</Table.Th>
                            <Table.Th c="gray">Dose</Table.Th>
                            <Table.Th c="gray">Unit</Table.Th>
                            <Table.Th c="gray">Freq</Table.Th>
                        </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                        {rows}
                    </Table.Tbody>
                </Table>
            </Box>
            <Space h="md" />

            <Alert variant="light" color="yellow" title="Non-nutritional lines provides" icon={<IconInfoCircle />}>
                {props.message}
            </Alert>
        </Box>
    );
}