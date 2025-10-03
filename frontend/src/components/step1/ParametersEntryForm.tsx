import { useState, useEffect, useRef } from "react";
import { Text, SimpleGrid, NumberInput, Button, Space, Switch, Alert, Box, Group } from "@mantine/core";
import { Protocol } from "@/types/Protocol";
import { LineType } from "@/types/LineType";
import { FatEmulsion } from "@/types/FatEmulsion";
import ProtocolSelect from "../core/select/ProtocolSelect";
import LineTypeSelect from "../core/select/LineTypeSelect";
import { IconEye, IconEyeOff, IconCalculator } from "@tabler/icons-react";
import EnteralFeedsEntryForm from "./EnteralFeedsEntryForm";
import NonNutritionalLinesPreview from "./NonNutritionalLinesPreview";
import FatEmulsionSelect from "../core/select/FatEmulsionSelect";
import { INonNutritionalLinesPreviewData } from "@/lib/app-data/IAppData";
import { useTPNParameters } from "@/hooks/AppContext/TPNParametersContext";
import InteractiveNNLBuilder from "./InteractiveNNLBuilder";
import CalculationSummaryDisplay from "./CalculationSummaryDisplay";

export interface IParametersEntryFormProps {
    nonNutritionalLinesData: INonNutritionalLinesPreviewData[];
    nonNutritionalLinesMessage: string;
}

export default function ParametersEntryForm(props: IParametersEntryFormProps) {
    // Use TPNParameters context for form state
    const { formData, updateFormData, pnLipidDose } = useTPNParameters();
    
    // Local state for non-nutritional lines display
    const [showNonNutritionalLines, setShowNonNutritionalLines] = useState<boolean>(false);

    // Handle individual field changes using context
    const handleProtocolChange = (newProtocol: Protocol | null) => {
        updateFormData({ protocol: newProtocol });
    };

    const handleLineTypeChange = (newLineType: LineType | null) => {
        updateFormData({ lineType: newLineType });
    };

    const handleTotalFluidIntakeChange = (value: number | string) => {
        updateFormData({ totalFluidIntake: value });
    };

    const handleInfuseOverChange = (value: number | string) => {
        updateFormData({ infuseOver: value });
    };

    const handleFatEmulsionChange = (newFatEmulsion: FatEmulsion | null) => {
        updateFormData({ fatEmulsion: newFatEmulsion });
    };

    const handleEnteralFeedingChange = () => {
        const newValue = !formData.includeEnteralFeedingInTotalFluidIntake;
        updateFormData({ includeEnteralFeedingInTotalFluidIntake: newValue });
    };

    const handleDosingWeightChange = (value: number | string) => {
        updateFormData({ dosingWeight: value });
    };

    const totalFluidIntakeLabel = <><Text size="10px" display="inline" fw={700}>Total Fluid Intake</Text><Text display="inline" c="gray" size="10px"> (mL/kg)</Text></>;
    const infuseOverLabel = <><Text size="10px" display="inline" fw={700}>Admin Duration</Text><Text display="inline" c="gray" size="10px"> (hours)</Text></>;
    const toRunOverLabel = <><Text size="10px" display="inline" fw={700}>To Run Over</Text><Text display="inline" c="gray" size="10px"> (hours)</Text></>;
    const dosingWeightLabel = <><Text size="10px" display="inline" fw={700}>Dosing Weight</Text><Text display="inline" c="gray" size="10px"> (kg)</Text></>;

    // Simple ref for NNL lines container (no dynamic height calculations needed)
    const linesContainerRef = useRef<HTMLDivElement | null>(null);

    return (
        <div style={{ height: '100%' }}>
            <Box p="sm" style={{ border: '1px solid #E6E8EE', borderRadius: 12, backgroundColor: 'white', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%', overflow: 'hidden' }}>
                {/* Fixed content area - no overall scrolling */}
                <div style={{ 
                    flex: 1, 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4, // Tighter spacing
                    overflow: 'hidden' // No overall scrolling
                }}>
                {/* Non-Nutritional Lines Section - Flexible height */}
                <Box style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    minHeight: 0, // Allow shrinking
                    flex: '0 1 auto' // Don't grow beyond content, can shrink
                }}>
                    <Text size="sm" fw={600} mb={4}>Non-Nutritional Lines</Text>
                    {/* NNL Lines - Only this scrolls (sized for 2+ full lines) */}
                    <div ref={linesContainerRef} style={{
                        maxHeight: '220px', // Enough for 2 full lines + partial 3rd line
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        paddingRight: 4
                    }}>
                        <InteractiveNNLBuilder mode="linesOnly" />
                    </div>
                    {/* Summary: always visible */}
                    <InteractiveNNLBuilder mode="summaryOnly" />
                </Box>

                {/* Enteral Feeds Section - Always visible (compact) */}
                <Box mb={2} style={{ flexShrink: 0 }}>
                    <Group justify="space-between" mb={2}>
                        <Text size="sm" fw={700}>Enteral Feeds</Text>
                        <Group gap={6}>
                            <Switch
                                checked={formData.includeEnteralFeedingInTotalFluidIntake}
                                onChange={handleEnteralFeedingChange}
                                size="xs"
                            />
                            <Text size="sm" fw={600}>
                                {formData.includeEnteralFeedingInTotalFluidIntake ? 'On' : 'Off'}
                            </Text>
                        </Group>
                    </Group>
                    {formData.includeEnteralFeedingInTotalFluidIntake && <EnteralFeedsEntryForm />}
                </Box>

                {/* Basic Parameters Section - Always visible (compact) */}
                <Box mb={2} style={{ flexShrink: 0 }}>
                    <Text size="sm" fw={700} mb={2}>Basic Parameters</Text>
                    <SimpleGrid cols={2} spacing={2}>
                        <ProtocolSelect protocol={formData.protocol} setProtocol={handleProtocolChange} />
                        <LineTypeSelect lineType={formData.lineType} setLineType={handleLineTypeChange} />
                        
                        <NumberInput 
                            label={totalFluidIntakeLabel} 
                            placeholder="Enter number" 
                            min={0} 
                            step={1}
                            value={formData.totalFluidIntake} 
                            onChange={handleTotalFluidIntakeChange}
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
                            label={infuseOverLabel} 
                            placeholder="24" 
                            min={24} 
                            max={24}
                            step={1}
                            value={24} 
                            onChange={() => {}} 
                            disabled
                            size="xs"
                            radius="md"
                            hideControls={true}
                            styles={{
                                input: { height: 22, fontSize: 11, padding: '0 6px', backgroundColor: '#f5f5f5', cursor: 'not-allowed' },
                                controls: { width: 20, height: '100%' },
                                control: { height: 10, minHeight: 10, fontSize: 9 },
                                label: { marginBottom: 2 }
                            }}
                        />
                        
                        <NumberInput 
                            label={dosingWeightLabel} 
                            placeholder="Enter weight" 
                            min={0} 
                            step={0.1} 
                            value={formData.dosingWeight} 
                            onChange={handleDosingWeightChange}
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
                        <FatEmulsionSelect fatEmulsion={formData.fatEmulsion} setFatEmulsion={handleFatEmulsionChange} />
                    </SimpleGrid>
                </Box>

                {/* PN+Lipid Dose - Always visible at bottom */}
                <Box 
                    p={6}
                    style={{
                        backgroundColor: '#6366f1',
                        borderRadius: '6px',
                        border: 'none',
                        flexShrink: 0, // Never shrink - always visible
                        marginTop: 'auto' // Push to bottom
                    }}
                >
                    <Text size="sm" fw={800} c="white">
                        PN+Lipid Dose: {isNaN(pnLipidDose) || !isFinite(pnLipidDose) || pnLipidDose < 10 ? '--' : pnLipidDose.toFixed(2)} mL/kg
                        {(!isNaN(pnLipidDose) && isFinite(pnLipidDose) && pnLipidDose < 10) && (
                            <span> (value must be ≥10 to generate predictions)</span>
                        )}
                    </Text>
                </Box>
                </div>
            </div>
            </Box>
        </div>
    );
}