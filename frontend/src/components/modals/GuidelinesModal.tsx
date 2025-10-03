import { Modal, Tabs, Text, Table, SegmentedControl, Container, List } from "@mantine/core"
import { useState } from "react";

export interface IGuidelinesModalProps {
    opened: boolean;
    onClose: () => void;
}

interface ITableEntry {
    component: string;
    value: string;
    unit?: string;
    note?: string;
}

const tableEntries: ITableEntry[] = [
    { component: "Sodium", value: "3", unit: "mEq/kg/day", note: "--" },
    { component: "Potassium", value: "2", unit: "mEq/kg/day", note: "--" },
    { component: "Magnesium", value: "0.2-0.3", unit: "mEq/kg/day", note: "--" },
    { component: "Calcium", value: "400-500", unit: "mg/kg/day", note: "--" },
    { component: "Phosphorus", value: "1", unit: "mMol/kg/day", note: "--" },
    { component: "Zinc", value: "250-400", unit: "mcg/kg/day", note: "--" },
    { component: "Copper", value: "10-20", unit: "mcg/kg/day", note: "Adjust if bilirubin > 2" },
    { component: "Selenium", value: "2", unit: "mcg/kg/day", note: "Add after 1 month on PN" },
    { component: "Carnitine", value: "3-5", unit: "mg/kg/day", note: "For high triglyceride levels" },
    { component: "Heparin", value: "0-5", unit: "Unit/kg/h", note: "Varies by line type" },
    { component: "Potassium", value: "2.2", unit: "mEq/kg", note: "mEq/kg" },
    { component: "Ranitidine", value: "0-2", unit: "mg/kg/day", note: "Only if needed for specific conditions" },
    { component: "Acetate/Chloride", value: "Varies", unit: "mEq/kg/day", note: "Adjust based on metabolic needs and bicarbonate" },
];

export default function GuidelinesModal({ opened, onClose }: IGuidelinesModalProps) {
    const [currentTab, setCurrentTab] = useState<string>("components")

    return (
        <Modal opened={opened} onClose={onClose} title={<Text fw={600} size="lg">Guidelines</Text>} size="xl" padding="md" radius="lg" >
            <Text c="gray" size="md">General Guidelines for TPN Components</Text>

            <SegmentedControl fullWidth size="md" my={10}
                value={currentTab}
                onChange={setCurrentTab}
                data={[{ value: "components", label: "Components" }, { value: "references", label: "References" }]}
            />

            {/* Components */}
            {(currentTab === "components") && (
                <Container>
                    <Table>
                        <Table.Thead>
                            <Table.Th>Component</Table.Th>
                            <Table.Th>Value</Table.Th>
                            <Table.Th>Unit</Table.Th>
                            <Table.Th>Note</Table.Th>
                        </Table.Thead>

                        <Table.Tbody>
                            {tableEntries.map((entry, index) => (
                                <Table.Tr key={`GuidelinesModal-${index}`}>
                                    <Table.Td py={10}><Text fw={600} size="sm">{entry.component}</Text></Table.Td>
                                    <Table.Td py={10}><Text size="sm" ta="right">{entry.value}</Text></Table.Td>
                                    <Table.Td py={10}><Text size="sm">{entry.unit}</Text></Table.Td>
                                    <Table.Td py={10}><Text size="sm" ta="right">{entry.note}</Text></Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Container>
            )}

            {/* References */}
            {(currentTab === "references") && (
                <Container>
                    <List type="ordered" className="list-decimal" size="sm">
                        <List.Item my={20}><Text size="sm">American Academy of Pediatrics Committee on Nutrition (2009). Parenteral Nutrition. In R.E. Kleinman, Pediatric Nutrition Handbook (6th ed., pp. 519-540). Elk Grove Village, IL: American Academy of Pediatrics.</Text></List.Item>
                        <List.Item my={20}><Text size="sm">te Braake FW, van den Akker CH, Riedijk MA, van Goudoever JB. Parenteral amino acid and energyManagement of IV Fluids and TPN administration to premature infants in early life. Semin Fetal Neonatal Med. 2007 Feb; 12(1): 11-8.</Text></List.Item>
                        <List.Item my={20}><Text size="sm">Ehrenkranz RA. Early nutritional support and outcomes in ELBW infants. Early Hum Dev. 2010 July; 86(1)suppl: 21-25.</Text></List.Item>
                        <List.Item my={20}><Text size="sm">Ehrenkranz RA, Dusick AM, Vohr BR, Wright LL, Wrage LA, Poole WK et al. Growth in the neonatal intensive care unit influences neurodevelopmental and growth outcomes of extremely low birth weight infants. Pediatrics. 2006; 117: 1253–1261.</Text></List.Item>
                        <List.Item my={20}><Text size="sm">Stephens BE et al. First-week protein and energy intakes are associated with 18-month developmental outcomes in extremely low birth weight infants. Pediatrics. 2009; 123: 1337-1343.</Text></List.Item>
                        <List.Item my={20}><Text size="sm">Uthaya S, Modi N. Practical preterm parenteral nutrition: Systematic literature review and recommendations for practice. Early Hum Dev. 2014 Nov 26; 90(11): 747-53.</Text></List.Item>
                        <List.Item my={20}><Text size="sm">Vlaardingerbroek H, van Goudoever J. Intravenous Lipids in Preterm Infants: Impact on Laboratory and Clinical Outcomes and Long-Term Consequences. Calder PC, Waitzberg DL, Koletzko B (eds): Intravenous Lipid Emulsions. World Rev Nutr Diet. Basel, Karger, 2015;112: 71–80</Text></List.Item>
                    </List>

                </Container>
            )}
        </Modal>
    );
}