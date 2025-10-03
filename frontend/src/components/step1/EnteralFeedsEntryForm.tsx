import { useState } from "react";
import { Container, Text, TextInput, SimpleGrid, NumberInput, Button, Box, Space, Alert } from "@mantine/core";
import { ActiveProtocol } from "@/types/ActiveProtocol";
import ActiveProtocolSelect from "../core/select/ActiveProtocolSelect";
import StrengthSelect from "../core/select/StrengthSelect";
import { StrengthProduct } from "@/types/StrengthProduct";
import { IconInfoCircle } from "@tabler/icons-react";
import { useTPNParameters } from "@/hooks/AppContext/TPNParametersContext";

export interface IEnteralFeedsEntryFormProps {

}

export default function EnteralFeedsEntryForm(props: IEnteralFeedsEntryFormProps) {
    const { formData, updateFormData, enteralVolume } = useTPNParameters();
    const [activeProtocol, setActiveProtocol] = useState<ActiveProtocol | null>(null);
    const [strength, setStrength] = useState<StrengthProduct | null>(null);

    const handleFeedingVolumeChange = (value: number | string) => {
        updateFormData({ enteralFeedingVolume: value });
    };

    const handleEveryHoursChange = (value: number | string) => {
        updateFormData({ enteralEveryHours: value });
    };

    // Calculate Kcal (simplified calculation for display)
    const calculateKcal = (): number => {
        // This is a simplified calculation - you may want to make this more sophisticated
        // Typically 20 cal/oz for standard formula, ~0.67 cal/mL
        return enteralVolume * 0.67;
    };

    const feedingVolumeLabel = <><Text size="10px" display="inline" fw={700}>Feeding Volume of</Text><Text display="inline" c="gray" size="10px"> (mL)</Text></>;
    const everyLabel = <><Text size="10px" display="inline" fw={700}>Every</Text><Text display="inline" c="gray" size="10px"> (hours)</Text></>;

    return (
        <Box mt={6}>
            {/* Simple 2-column input matching prototype */}
            <SimpleGrid cols={2} spacing={3} mb={4}>
                <NumberInput 
                    label={feedingVolumeLabel} 
                    placeholder="0" 
                    min={0} 
                    step={1}
                    value={formData.enteralFeedingVolume} 
                    onChange={handleFeedingVolumeChange}
                    size="xs"
                    radius="md"
                    hideControls={false}
                    styles={{
                        input: { height: 22, fontSize: 11, padding: '0 6px' },
                        controls: { width: 20, height: '100%' },
                        control: { height: 10, minHeight: 10, fontSize: 9 },
                        label: { marginBottom: 2 }
                    }}
                />
                <NumberInput 
                    label={everyLabel} 
                    placeholder="0" 
                    min={0} 
                    step={1}
                    value={formData.enteralEveryHours} 
                    onChange={handleEveryHoursChange}
                    size="xs"
                    radius="md"
                    hideControls={false}
                    styles={{
                        input: { height: 22, fontSize: 11, padding: '0 6px' },
                        controls: { width: 20, height: '100%' },
                        control: { height: 10, minHeight: 10, fontSize: 9 },
                        label: { marginBottom: 2 }
                    }}
                />
            </SimpleGrid>

            {/* Live calculation display - match prototype style */}
            <Text size="10px" fw={600} c="dark">
                The enteral feed regimen provides {enteralVolume.toFixed(2)} mL/kg fluid.
            </Text>
        </Box>
    );
}