import { IModelComponentResults } from "@/lib/app-data/IAppData";
import { Table } from "@mantine/core";

export interface IMainComponentsTableProps {
    components?: IModelComponentResults;
    selectedOption: 1 | 2 | 3;
}

export default function MainComponentsTable(props: IMainComponentsTableProps) {
    const data = props.components?.results ?? [];
    const { selectedOption } = props;

    const rows = data.map((row, idx) => {
        return (
            <Table.Tr key={`MainComponentsTable-${row.id}`}>
                <Table.Td>{row.component}</Table.Td>

                {/* If option is selected, put a blue border on left/right */}
                <Table.Td style={{ borderLeft: selectedOption === 1 ? "2px solid blue" : "none", borderRight: selectedOption === 1 ? "2px solid blue" : "none", borderBottom: (selectedOption === 1 && idx === data.length - 1) ? "2px solid blue" : "none" }}>{row.option1Value}</Table.Td>
                <Table.Td style={{ borderLeft: selectedOption === 2 ? "2px solid blue" : "none", borderRight: selectedOption === 2 ? "2px solid blue" : "none", borderBottom: (selectedOption === 2 && idx === data.length - 1) ? "2px solid blue" : "none" }}>{row.option2Value}</Table.Td>
                <Table.Td style={{ borderLeft: selectedOption === 3 ? "2px solid blue" : "none", borderRight: selectedOption === 3 ? "2px solid blue" : "none", borderBottom: (selectedOption === 3 && idx === data.length - 1) ? "2px solid blue" : "none" }}>{row.option3Value}</Table.Td>
                <Table.Td>{row.unit}</Table.Td>
                {/* Placeholder for Total value with NNL */}
                <Table.Td style={{ color: '#98a2b3' }}>—</Table.Td>
            </Table.Tr>
        );
    });

    return (
        <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Lab</Table.Th>
                    <Table.Th style={{ border: selectedOption === 1 ? "2px solid blue" : "none" }}>Option 1</Table.Th>
                    <Table.Th style={{ border: selectedOption === 2 ? "2px solid blue" : "none" }}>Option 2</Table.Th>
                    <Table.Th style={{ border: selectedOption === 3 ? "2px solid blue" : "none" }}>Option 3</Table.Th>
                    <Table.Th>Unit</Table.Th>
                    <Table.Th>Total value with NNL</Table.Th>
                </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
                {rows}
            </Table.Tbody>
        </Table>
    );
}