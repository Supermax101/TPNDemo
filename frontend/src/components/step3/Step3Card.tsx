import { useState, useEffect, useCallback } from "react";
import { 
    Card, 
    Text, 
    Group, 
    Button, 
    Textarea, 
    Badge, 
    Stack, 
    Box, 
    Alert, 
    Accordion,
    Code,
    Divider,
    CopyButton,
    ActionIcon,
    Tooltip
} from "@mantine/core";
import { IconCheck, IconX, IconCopy, IconDownload, IconCalculator } from "@tabler/icons-react";

// HL7v2 Response Types
interface HL7v2GenerationResponse {
    success: boolean;
    hl7_message?: string;
    formatted_message?: string;
    validation?: HL7v2ValidationResult;
    metadata?: any;
    error?: string;
}

interface HL7v2ValidationResult {
    is_valid: boolean;
    message_type?: string;
    message_control_id?: string;
    patient_id?: string;
    segment_count?: number;
    errors?: string[];
    warnings?: string[];
}

interface Step3CardProps {
    patientData: any;
    predictionComponents: Record<string, any>; // AppTemplate predictions format
    enhancedSelectedValues?: Record<string, number>; // Final tweaked values from Step 2
    clinicalParameters?: any; // Clinical parameters for HL7 generation
    hasTweakedValues?: boolean; // Whether user has made modifications
    onBack: () => void;
    onRegenerate?: () => void;
    onRecalculate?: () => void; // New recalculate function for Step 2 predictions
    isModified?: boolean; // Whether Step 2 components have been modified
    isMockMode?: boolean; // Whether using mock client
    ehrDataClient?: any; // EHR data client for mock HL7v2 generation
}

export default function Step3Card({ 
    patientData, 
    predictionComponents, 
    enhancedSelectedValues = {},
    clinicalParameters,
    hasTweakedValues = false,
    onBack, 
    onRegenerate,
    onRecalculate,
    isModified = false,
    isMockMode = false,
    ehrDataClient
}: Step3CardProps) {
    const [hl7Response, setHl7Response] = useState<HL7v2GenerationResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showRaw, setShowRaw] = useState(false);

    const generateHL7Message = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Mock mode - use client's built-in HL7 generator
            if (ehrDataClient && ehrDataClient.generateMockHL7v2) {
                // Create prediction components payload with enhanced values
                const componentsPayload = {
                    format: 'appTemplate',
                    appTemplatePredictions: predictionComponents,
                    enhancedValues: enhancedSelectedValues
                };
                
                const mockResponse = await ehrDataClient.generateMockHL7v2(
                    componentsPayload,
                    patientData,
                    'final'
                );
                
                if (mockResponse.success) {
                    setHl7Response(mockResponse);
                } else {
                    setError(mockResponse.error || 'Failed to generate HL7v2 message');
                }
            } else {
                setError('Mock HL7v2 generator not available');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, [patientData, predictionComponents, enhancedSelectedValues, ehrDataClient]);

    useEffect(() => {
        generateHL7Message();
    }, [generateHL7Message]);



    const handleDownload = () => {
        if (!hl7Response?.hl7_message) return;

        const blob = new Blob([hl7Response.hl7_message], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TPN_Order_${hl7Response.metadata?.patient_mrn}_${new Date().toISOString().slice(0, 10)}.hl7`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const renderValidationBadge = (validation: HL7v2ValidationResult) => {
        return validation.is_valid ? (
            <Badge color="green" variant="filled" leftSection={<IconCheck size={12} />}>
                Valid HL7v2
            </Badge>
        ) : (
            <Badge color="red" variant="filled" leftSection={<IconX size={12} />}>
                Invalid HL7v2
            </Badge>
        );
    };



    if (loading) {
        return (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack>
                    <Text size="lg" fw={600}>Generating HL7v2 Message...</Text>
                    <Text c="dimmed">Creating TPN medication order from predictions...</Text>
                </Stack>
            </Card>
        );
    }

    if (error) {
        return (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack>
                    <Alert color="red" title="HL7v2 Generation Error">
                        {error}
                    </Alert>
                    <Group>
                        <Button variant="light" onClick={onBack}>
                            Back to Predictions
                        </Button>

                    </Group>
                </Stack>
            </Card>
        );
    }

    if (!hl7Response || !hl7Response.success) {
        
        return (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack>
                    <Alert color="orange" title="No HL7v2 Message Generated">
                        Unable to generate HL7v2 message. Please try again.
                    </Alert>
                    <Group>
                        <Button variant="light" onClick={onBack}>
                            Back to Predictions
                        </Button>

                    </Group>
                </Stack>
            </Card>
        );
    }

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack>
                {/* Enhanced Header - Neutral Theme */}
                <Box
                    mb="lg"
                    p="md"
                    style={{
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #f1f3f5 100%)',
                        border: '1px solid #e9ecef',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(108, 117, 125, 0.08)'
                    }}
                >
                    <Group justify="space-between" align="flex-start">
                        <Box>
                            <Text 
                                size="lg" 
                                fw={700} 
                                c="#495057"
                                style={{ letterSpacing: '0.5px' }}
                            >
                                HL7v2 TPN Medication Order
                            </Text>
                            <Text size="sm" c="#6c757d" fw={500} mt={4}>
                                Unsigned medication order generated from TPN predictions
                            </Text>
                        </Box>
                        {hl7Response.validation && (
                            <Box style={{ flexShrink: 0 }}>
                                {renderValidationBadge(hl7Response.validation)}
                            </Box>
                        )}
                    </Group>
                </Box>

                {/* Enhanced Message Metadata - Neutral Theme */}
                {hl7Response.metadata && (
                    <Box
                        p="md"
                        style={{
                            background: 'linear-gradient(135deg, #f8f9fa 0%, #f1f3f5 100%)',
                            border: '1px solid #e9ecef',
                            borderRadius: '8px',
                            boxShadow: '0 1px 4px rgba(108, 117, 125, 0.08)'
                        }}
                    >
                        <Group wrap="wrap" gap="lg" justify="center">
                            <Box 
                                style={{
                                    textAlign: 'center',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    background: 'rgba(108, 117, 125, 0.08)'
                                }}
                            >
                                <Text size="xs" tt="uppercase" fw={600} c="#495057" style={{ letterSpacing: '0.3px' }}>Patient MRN</Text>
                                <Text size="sm" fw={600} c="#343a40" mt={2}>{hl7Response.metadata.patient_mrn}</Text>
                            </Box>
                            <Box 
                                style={{
                                    textAlign: 'center',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    background: 'rgba(108, 117, 125, 0.08)'
                                }}
                            >
                                <Text size="xs" tt="uppercase" fw={600} c="#495057" style={{ letterSpacing: '0.3px' }}>Message Type</Text>
                                <Text size="sm" fw={600} c="#343a40" mt={2}>{hl7Response.metadata.message_type}</Text>
                            </Box>
                            <Box 
                                style={{
                                    textAlign: 'center',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    background: 'rgba(108, 117, 125, 0.08)'
                                }}
                            >
                                <Text size="xs" tt="uppercase" fw={600} c="#495057" style={{ letterSpacing: '0.3px' }}>Components</Text>
                                <Text size="sm" fw={600} c="#343a40" mt={2}>{hl7Response.metadata.components_count}</Text>
                            </Box>
                            <Box 
                                style={{
                                    textAlign: 'center',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    background: 'rgba(108, 117, 125, 0.08)'
                                }}
                            >
                                <Text size="xs" tt="uppercase" fw={600} c="#495057" style={{ letterSpacing: '0.3px' }}>Generated</Text>
                                <Text size="sm" fw={600} c="#343a40" mt={2}>
                                    {new Date(hl7Response.metadata.generation_timestamp).toLocaleString()}
                                </Text>
                            </Box>
                        </Group>
                    </Box>
                )}

                {/* HL7v2 Message Display */}
                <Box>
                    <Group justify="space-between" mb="sm">
                        <Text fw={600}>HL7v2 Message</Text>
                        <Group gap="xs">
                            <Button 
                                size="compact-sm" 
                                variant={showRaw ? "filled" : "light"}
                                onClick={() => setShowRaw(!showRaw)}
                            >
                                {showRaw ? 'Formatted' : 'Raw'}
                            </Button>
                            <CopyButton value={hl7Response.hl7_message || ''}>
                                {({ copied, copy }) => (
                                    <Tooltip label={copied ? 'Copied!' : 'Copy message'}>
                                        <ActionIcon 
                                            color={copied ? 'teal' : 'gray'} 
                                            onClick={copy}
                                            variant="light"
                                        >
                                            <IconCopy size={16} />
                                        </ActionIcon>
                                    </Tooltip>
                                )}
                            </CopyButton>
                            <Tooltip label="Download HL7 file">
                                <ActionIcon onClick={handleDownload} variant="light">
                                    <IconDownload size={16} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    </Group>

                    <Textarea
                        value={showRaw ? hl7Response.hl7_message : hl7Response.formatted_message}
                        readOnly
                        autosize
                        minRows={8}
                        maxRows={20}
                        styles={{
                            input: {
                                fontFamily: 'monospace',
                                fontSize: '12px',
                                backgroundColor: '#f8f9fa'
                            }
                        }}
                    />
                </Box>

                {/* Validation Details */}
                {hl7Response.validation && (
                    <Accordion>
                        <Accordion.Item value="validation">
                            <Accordion.Control>
                                <Group>
                                    <Text fw={600}>Validation Details</Text>
                                    {renderValidationBadge(hl7Response.validation)}
                                </Group>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Stack gap="sm">
                                    <Group wrap="wrap">
                                        <Box>
                                            <Text size="xs" tt="uppercase" fw={700} c="dimmed">Message Control ID</Text>
                                            <Code>{hl7Response.validation.message_control_id || 'N/A'}</Code>
                                        </Box>
                                        <Box>
                                            <Text size="xs" tt="uppercase" fw={700} c="dimmed">Patient ID</Text>
                                            <Code>{hl7Response.validation.patient_id || 'N/A'}</Code>
                                        </Box>
                                        <Box>
                                            <Text size="xs" tt="uppercase" fw={700} c="dimmed">Segment Count</Text>
                                            <Code>{hl7Response.validation.segment_count || 0}</Code>
                                        </Box>
                                    </Group>

                                    {hl7Response.validation.errors && hl7Response.validation.errors.length > 0 && (
                                        <Alert color="red" title="Validation Errors">
                                            <Stack gap="xs">
                                                {hl7Response.validation.errors.map((error, index) => (
                                                    <Text key={index} size="sm">• {error}</Text>
                                                ))}
                                            </Stack>
                                        </Alert>
                                    )}

                                    {hl7Response.validation.warnings && hl7Response.validation.warnings.length > 0 && (
                                        <Alert color="yellow" title="Validation Warnings">
                                            <Stack gap="xs">
                                                {hl7Response.validation.warnings.map((warning, index) => (
                                                    <Text key={index} size="sm">• {warning}</Text>
                                                ))}
                                            </Stack>
                                        </Alert>
                                    )}

                                    {hl7Response.validation.is_valid && 
                                     (!hl7Response.validation.errors || hl7Response.validation.errors.length === 0) && 
                                     (!hl7Response.validation.warnings || hl7Response.validation.warnings.length === 0) && (
                                        <Alert color="green" title="Validation Passed">
                                            The HL7v2 message is valid and ready for use.
                                        </Alert>
                                    )}
                                </Stack>
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>
                )}

                <Divider />

                {/* Action Buttons */}
                <Group justify="space-between">
                    <Button variant="light" onClick={onBack}>
                        Back to Predictions
                    </Button>
                    <Group>
                        <Button onClick={handleDownload}>
                            Download HL7 File
                        </Button>
                    </Group>
                </Group>
            </Stack>
        </Card>
    );
} 