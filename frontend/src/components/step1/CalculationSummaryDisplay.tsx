import { Text, Box } from "@mantine/core";
import { useTPNParameters } from "@/hooks/AppContext/TPNParametersContext";

export default function CalculationSummaryDisplay() {
    const { calculations } = useTPNParameters();

    const formatNumber = (num: number, decimals: number = 2): string => {
        if (isNaN(num) || !isFinite(num)) return "0.00";
        return num.toFixed(decimals);
    };

    return (
        <Box 
            mt="sm" 
            p="sm" 
            style={{ 
                backgroundColor: 'white', 
                borderRadius: '4px',
                border: '1px solid #ced4da'
            }}
        >
            <Text size="xs" fw={600} c="gray.7" mb={4}>Non-nutritional lines provides</Text>
            <Text size="xs" c="dark" fw={700} mb={2}>GIR of {formatNumber(calculations.totalGIR)} mg/kg/min</Text>
            <Text size="xs" c="dark" fw={700} mb={2}>Na of {formatNumber(calculations.totalNa, 1)} mEq/kg over 24 hours</Text>
            <Text size="xs" c="dark" fw={700} mb={2}>K of {formatNumber(calculations.totalK, 1)} mEq/kg over 24 hours</Text>
            <Text size="xs" c="dark" fw={700}>NNL fluid of {formatNumber(calculations.totalVolume)} mL/kg over 24 hours</Text>
        </Box>
    );
}
