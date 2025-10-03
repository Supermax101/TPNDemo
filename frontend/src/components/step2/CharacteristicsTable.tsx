import { Table, Badge, Text } from "@mantine/core";

export interface ICharacteristicsTableProps {
    modelCharacteristics?: any;  // Updated to accept the actual characteristics structure from predictions
}

export default function CharacteristicsTable(props: ICharacteristicsTableProps) {
    const { modelCharacteristics: characteristics } = props;

    // Helper function to format numbers with proper rounding
    const formatValue = (value: number | undefined): string => {
        if (value === undefined || value === null || isNaN(value)) return '-';
        
        // Round to 2 decimal places and remove unnecessary trailing zeros
        const rounded = Math.round(value * 100) / 100;
        return rounded.toString();
    };

    // If no characteristics data, show loading state
    if (!characteristics) {
        return (
            <div style={{ border: '1px solid #E6E8EE', borderRadius: 12, backgroundColor: 'white', overflow: 'hidden' }}>
                <Table 
                    styles={{
                        table: {
                            fontSize: '11px',
                        },
                        th: {
                            padding: '4px 8px',
                            whiteSpace: 'nowrap',
                            verticalAlign: 'middle',
                            borderColor: '#dee2e6'
                        },
                        td: {
                            padding: '2px 8px',
                            whiteSpace: 'nowrap',
                            verticalAlign: 'middle',
                            borderColor: '#dee2e6'
                        }
                    }}
                >
                    <Table.Thead>
                        <Table.Tr bg="#EEE">
                            <Table.Th fw="normal"><Text size="xs"></Text></Table.Th>
                            <Table.Th fw="normal"><Text size="xs">Name</Text></Table.Th>
                            <Table.Th ta="right" fw="normal"><Text size="xs">Value</Text></Table.Th>
                            <Table.Th ta="right" fw="normal"><Text size="xs">Unit</Text></Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        <Table.Tr>
                            <Table.Td colSpan={4} ta="center">
                                <Text size="xs" c="dimmed">Loading characteristics...</Text>
                            </Table.Td>
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </div>
        );
    }

    // Extract values from the actual data structure (matching full_pred_output.json)
    const osmolarity = characteristics["Mixture Compatability"]?.["Osmolarity"];

    const energyValues: { name: string, unit: string, value: number | undefined }[] = [
        { name: "Energy (PN & Fat)", unit: "Kcal/kg", value: characteristics["Energy Contribution With Protein"]?.["Total (kcal/kg)"] },
        { name: "Energy (Fat)", unit: "Kcal/kg", value: characteristics["Energy Contribution With Protein"]?.["Lipids (kcal/kg)"] },
        { name: "% Energy (Fat)", unit: "%", value: characteristics["Energy Contribution With Protein"]?.["Lipids (%)"] ? characteristics["Energy Contribution With Protein"]["Lipids (%)"] * 100 : undefined },
        { name: "Energy (Protein)", unit: "Kcal/kg", value: characteristics["Energy Contribution With Protein"]?.["Protein (kcal/kg)"] },
        { name: "% Energy (Protein)", unit: "%", value: characteristics["Energy Contribution With Protein"]?.["Protein (%)"] ? characteristics["Energy Contribution With Protein"]["Protein (%)"] * 100 : undefined },
        { name: "Energy (Carbohydrate)", unit: "Kcal/kg", value: characteristics["Energy Contribution With Protein"]?.["Dextrose (kcal/kg)"] },
        { name: "% Energy (Carbohydrate)", unit: "%", value: characteristics["Energy Contribution With Protein"]?.["Dextrose (%)"] ? characteristics["Energy Contribution With Protein"]["Dextrose (%)"] * 100 : undefined },
    ];

    const macroNutrientsValues: { name: string, unit: string, value: number | undefined }[] = [
        { name: "Fat Infusion Rate", unit: "g/kg/day", value: characteristics["Macronutrients"]?.["Lipids (g/kg)"] },
        { name: "Fat Volume Dosage", unit: "mL/kg/day", value: characteristics["Macronutrients"]?.["Volume (mL/kg)"] },
        { name: "Fat Volume Rate", unit: "mL/kg/hr", value: characteristics["Macronutrients"]?.["Volume (mL/kg)"] ? characteristics["Macronutrients"]["Volume (mL/kg)"] / 24 : undefined },
        { name: "Glucose Infusion Rate (PN)", unit: "g/kg/hr", value: characteristics["Macronutrients"]?.["Glucose Infusion Rate (mg/kg/min)"] ? characteristics["Macronutrients"]["Glucose Infusion Rate (mg/kg/min)"] * 0.06 : undefined },
        { name: "Nonprotein Calories to Nitrogen Ratio (PN)", unit: "Kcal/g", value: characteristics["Macronutrients"]?.["Non-Protein (kcal):Nitrogen (g)"] },
        { name: "Amino Acid Concentration", unit: "g/dL", value: characteristics["Macronutrients"]?.["Amino Acid Concentration (%)"] },
    ];

    const electorlytesValues: { name: string, unit: string, value: number | undefined }[] = [
        { name: "Calcium:Phosphate Ratio (PN)", unit: "mg/mg", value: characteristics["Mixture Compatability"]?.["Calcium:Phosphate Ratio (mmol:mmol)"] },
        { name: "Chloride:Acetate Ratio (PN)", unit: "mmol/mmol", value: characteristics["Electrolytes"]?.["Estimated Chloride:Acetate Ratio"] },
        { name: "Max Potassium Infusion Rate", unit: "mEq/kg/hr", value: characteristics["Electrolytes"]?.["Potassium (mEq/kg/hr)"] },
    ];

    // NEW: Vitamins section
    const vitaminsValues: { name: string, unit: string, value: number | undefined }[] = [
        { name: "Multi-vitamins", unit: "mL/kg", value: characteristics["Vitamins"]?.["Multi-vitamins (mL/kg)"] },
        { name: "Multi-vitamins (Total)", unit: "mL", value: characteristics["Vitamins"]?.["Multi-vitamins (mL)"] },
    ];

    // NEW: Trace Elements section
    const traceElementsValues: { name: string, unit: string, value: number | undefined }[] = [
        { name: "Copper", unit: "mcg/kg", value: characteristics["Trace Elements"]?.["Copper (mcg/kg)"] },
        { name: "Copper (Total)", unit: "mcg", value: characteristics["Trace Elements"]?.["Copper (mcg)"] },
        { name: "Selenium", unit: "mcg/kg", value: characteristics["Trace Elements"]?.["Selenium (mcg/kg)"] },
        { name: "Selenium (Total)", unit: "mcg", value: characteristics["Trace Elements"]?.["Selenium (mcg)"] },
        { name: "Zinc", unit: "mcg/kg", value: characteristics["Trace Elements"]?.["Zinc (mcg/kg)"] },
        { name: "Zinc (Total)", unit: "mg", value: characteristics["Trace Elements"]?.["Zinc (mg)"] },
    ];

    // NEW: Additives section  
    const additivesValues: { name: string, unit: string, value: number | undefined }[] = [
        { name: "Heparin", unit: "Units/mL", value: characteristics["Additives"]?.["Heparin (Units/mL)"] },
        { name: "Heparin Rate", unit: "Units/kg/hr", value: characteristics["Additives"]?.["Heparin (Units/kg/hr)"] },
    ];

    return (
        <div style={{ border: '1px solid #E6E8EE', borderRadius: 12, backgroundColor: 'white', overflow: 'hidden' }}>
            <Table 
                styles={{
                    table: {
                        fontSize: '11px',
                    },
                    th: {
                        padding: '4px 8px',
                        whiteSpace: 'nowrap',
                        verticalAlign: 'middle',
                        borderColor: '#dee2e6'
                    },
                    td: {
                        padding: '2px 8px',
                        whiteSpace: 'nowrap',
                        verticalAlign: 'middle',
                        borderColor: '#dee2e6'
                    }
                }}
            >
                <Table.Thead>
                    <Table.Tr bg="#EEE">
                        <Table.Th fw="normal"><Text size="xs"></Text></Table.Th>
                        <Table.Th fw="normal"><Text size="xs">Name</Text></Table.Th>
                        <Table.Th ta="right" fw="normal"><Text size="xs">Value</Text></Table.Th>
                        <Table.Th ta="right" fw="normal"><Text size="xs">Unit</Text></Table.Th>
                    </Table.Tr>
                </Table.Thead>

            <Table.Tbody>

                {/* Osmolarity */}
                <Table.Tr>
                    <Table.Td></Table.Td>
                    <Table.Td><Text size="xs">Osmolarity</Text></Table.Td>
                    <Table.Td ta="right"><Text size="xs">{formatValue(osmolarity)}</Text></Table.Td>
                    <Table.Td ta="right"><Text size="xs">mOsm/L</Text></Table.Td>
                </Table.Tr>

                {/* Energy */}
                <Table.Tr bg="#EEE">
                    <Table.Td><Badge size="xs" color="dark" variant="filled" fw={600}>ENERGY</Badge></Table.Td>
                    <Table.Td></Table.Td>
                    <Table.Td ta="right"><Text size="xs"></Text></Table.Td>
                    <Table.Td ta="right"><Text size="xs"></Text></Table.Td>
                </Table.Tr>

                {/* Energy Values */}
                {energyValues.map((value, index) => {
                    return (
                        <Table.Tr key={`Energy-${index}`}>
                            <Table.Td></Table.Td>
                            <Table.Td><Text size="xs">{value.name}</Text></Table.Td>
                            <Table.Td ta="right"><Text size="xs">{formatValue(value.value)}</Text></Table.Td>
                            <Table.Td ta="right"><Text size="xs">{value.unit}</Text></Table.Td>
                        </Table.Tr>
                    );
                })}

                {/* Macro-Nutrients */}
                <Table.Tr bg="#EEE">
                    <Table.Td><Badge size="xs" color="dark" variant="filled" fw={600}>MACRO-NUTRIENTS</Badge></Table.Td>
                    <Table.Td></Table.Td>
                    <Table.Td ta="right"><Text size="xs"></Text></Table.Td>
                    <Table.Td ta="right"><Text size="xs"></Text></Table.Td>
                </Table.Tr>

                {/* Macro-Nutrients Values */}
                {macroNutrientsValues.map((value, index) => {
                    return (
                        <Table.Tr key={`MacroNutrients-${index}`}>
                            <Table.Td></Table.Td>
                            <Table.Td><Text size="xs">{value.name}</Text></Table.Td>
                            <Table.Td ta="right"><Text size="xs">{formatValue(value.value)}</Text></Table.Td>
                            <Table.Td ta="right"><Text size="xs">{value.unit}</Text></Table.Td>
                        </Table.Tr>
                    );
                })}

                {/* Electrolytes */}
                <Table.Tr bg="#EEE">
                    <Table.Td><Badge size="xs" color="dark" variant="filled" fw={600}>ELECTROLYTES</Badge></Table.Td>
                    <Table.Td></Table.Td>
                    <Table.Td ta="right"><Text size="xs"></Text></Table.Td>
                    <Table.Td ta="right"><Text size="xs"></Text></Table.Td>
                </Table.Tr>

                {/* Electrolytes Values */}
                {electorlytesValues.map((value, index) => {
                    return (
                        <Table.Tr key={`Electrolytes-${index}`}>
                            <Table.Td></Table.Td>
                            <Table.Td>{value.name}</Table.Td>
                            <Table.Td ta="right"><Text size="xs">{formatValue(value.value)}</Text></Table.Td>
                            <Table.Td ta="right"><Text size="xs">{value.unit}</Text></Table.Td>
                        </Table.Tr>
                    );
                })}

                {/* Vitamins */}
                <Table.Tr bg="#EEE">
                    <Table.Td><Badge size="xs" color="dark" variant="filled" fw={600}>VITAMINS</Badge></Table.Td>
                    <Table.Td></Table.Td>
                    <Table.Td ta="right"><Text size="xs"></Text></Table.Td>
                    <Table.Td ta="right"><Text size="xs"></Text></Table.Td>
                </Table.Tr>

                {/* Vitamins Values */}
                {vitaminsValues.map((value, index) => {
                    return (
                        <Table.Tr key={`Vitamins-${index}`}>
                            <Table.Td></Table.Td>
                            <Table.Td>{value.name}</Table.Td>
                            <Table.Td ta="right"><Text size="xs">{formatValue(value.value)}</Text></Table.Td>
                            <Table.Td ta="right"><Text size="xs">{value.unit}</Text></Table.Td>
                        </Table.Tr>
                    );
                })}

                {/* Trace Elements */}
                <Table.Tr bg="#EEE">
                    <Table.Td><Badge size="xs" color="dark" variant="filled" fw={600}>TRACE ELEMENTS</Badge></Table.Td>
                    <Table.Td></Table.Td>
                    <Table.Td ta="right"><Text size="xs"></Text></Table.Td>
                    <Table.Td ta="right"><Text size="xs"></Text></Table.Td>
                </Table.Tr>

                {/* Trace Elements Values */}
                {traceElementsValues.map((value, index) => {
                    return (
                        <Table.Tr key={`TraceElements-${index}`}>
                            <Table.Td></Table.Td>
                            <Table.Td>{value.name}</Table.Td>
                            <Table.Td ta="right"><Text size="xs">{formatValue(value.value)}</Text></Table.Td>
                            <Table.Td ta="right"><Text size="xs">{value.unit}</Text></Table.Td>
                        </Table.Tr>
                    );
                })}

                {/* Additives */}
                <Table.Tr bg="#EEE">
                    <Table.Td><Badge size="xs" color="dark" variant="filled" fw={600}>ADDITIVES</Badge></Table.Td>
                    <Table.Td></Table.Td>
                    <Table.Td ta="right"><Text size="xs"></Text></Table.Td>
                    <Table.Td ta="right"><Text size="xs"></Text></Table.Td>
                </Table.Tr>

                {/* Additives Values */}
                {additivesValues.map((value, index) => {
                    return (
                        <Table.Tr key={`Additives-${index}`}>
                            <Table.Td></Table.Td>
                            <Table.Td>{value.name}</Table.Td>
                            <Table.Td ta="right"><Text size="xs">{formatValue(value.value)}</Text></Table.Td>
                            <Table.Td ta="right"><Text size="xs">{value.unit}</Text></Table.Td>
                        </Table.Tr>
                    );
                })}
            </Table.Tbody>
        </Table>
        </div>
    );
}