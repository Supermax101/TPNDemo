import { useState } from "react";
import { Button, NumberInput, Select, Group, Box, Text, ActionIcon, Alert } from "@mantine/core";
import { IconPlus, IconTrash, IconAlertTriangle } from "@tabler/icons-react";
import { NonNutritionalLine, Additive, SUPPORTED_ADDITIVES } from "@/lib/calculations/types";
import { getMaxConcentration } from "@/lib/calculations/nnl-calculator";
import { useTPNParameters } from "@/hooks/AppContext/TPNParametersContext";

export interface IInteractiveNNLBuilderProps {
    mode?: 'full' | 'linesOnly' | 'summaryOnly';
    startIndex?: number;
    maxLines?: number;
}

export default function InteractiveNNLBuilder(props: IInteractiveNNLBuilderProps = {}) {
    const { formData, updateFormData } = useTPNParameters();
    const nonNutritionalLines = formData.nonNutritionalLines;
    const [validationMessage, setValidationMessage] = useState<string | null>(null);
    const mode = props.mode || 'full';
    const startIndex = props.startIndex ?? 0;
    const maxLines = props.maxLines;

    const addNonNutritionalLine = () => {
        if (nonNutritionalLines.length >= 9) return; // Max 9 lines
        const nextLineNumber = nonNutritionalLines.length + 1;
        const newLine: NonNutritionalLine = { 
            lineNumber: nextLineNumber,
            dose: "",
            additives: [{ additive: "", conc: "" }]
        };
        updateFormData({ 
            nonNutritionalLines: [...nonNutritionalLines, newLine]
        });
    };

    const deleteNonNutritionalLine = (lineIndex: number) => {
        if (nonNutritionalLines.length === 1) {
            // If it's the last line, remove it completely
            updateFormData({ nonNutritionalLines: [] });
        } else {
            // If there are multiple lines, delete the selected one and renumber
            const updatedLines = nonNutritionalLines.filter((_, i) => i !== lineIndex);
            // Renumber the lines
            const renumberedLines = updatedLines.map((line, index) => ({
                ...line,
                lineNumber: index + 1
            }));
            updateFormData({ nonNutritionalLines: renumberedLines });
        }
    };

    const updateLinesDose = (lineIndex: number, dose: string) => {
        // Remove any non-numeric characters except decimal point
        const numericValue = dose.replace(/[^0-9.]/g, '');
        
        // Limit to max 3ml/hr
        let finalValue = numericValue;
        if (numericValue && !isNaN(parseFloat(numericValue))) {
            const num = parseFloat(numericValue);
            if (num > 3) {
                finalValue = "3";
                setValidationMessage("For patient safety, the maximum allowed dose is 3 mL/hr. Please do not select more than this.");
                setTimeout(() => setValidationMessage(null), 4000); // Clear after 4 seconds
            }
        }
        
        const updatedLines = nonNutritionalLines.map((line, i) => 
            i === lineIndex ? { ...line, dose: finalValue } : line
        );
        updateFormData({ nonNutritionalLines: updatedLines });
    };

    const addAdditiveToLine = (lineIndex: number) => {
        const updatedLines = nonNutritionalLines.map((line, i) => 
            i === lineIndex && line.additives.length < 2
                ? { ...line, additives: [...line.additives, { additive: "", conc: "" }] }
                : line
        );
        updateFormData({ nonNutritionalLines: updatedLines });
    };

    const removeAdditiveFromLine = (lineIndex: number, additiveIndex: number) => {
        const updatedLines = nonNutritionalLines.map((line, i) => 
            i === lineIndex 
                ? { ...line, additives: line.additives.filter((_, j) => j !== additiveIndex) }
                : line
        );
        updateFormData({ nonNutritionalLines: updatedLines });
    };

    const updateAdditive = (lineIndex: number, additiveIndex: number, field: 'additive' | 'conc', value: string) => {
        let finalValue = value;
        let shouldClearConcentration = false;
        
        // If changing additive type, clear the concentration
        if (field === 'additive') {
            shouldClearConcentration = true;
        }
        
        // Apply concentration limits based on additive type
        if (field === 'conc' && value) {
            // Remove any non-numeric characters except decimal point
            const numericValue = value.replace(/[^0-9.]/g, '');
            
            if (numericValue && !isNaN(parseFloat(numericValue))) {
                const num = parseFloat(numericValue);
                
                // Get the current additive type for this line
                const currentAdditive = nonNutritionalLines[lineIndex]?.additives[additiveIndex]?.additive || '';
                
                // Apply limits based on additive type
                const maxConc = getMaxConcentration(currentAdditive);
                if (num > maxConc) {
                    finalValue = String(maxConc);
                    setValidationMessage(`For patient safety, the maximum allowed concentration for ${currentAdditive} is ${maxConc}%. Please do not select more than this.`);
                    setTimeout(() => setValidationMessage(null), 4000); // Clear after 4 seconds
                } else {
                    finalValue = numericValue;
                }
            }
        }
        
        const updatedLines = nonNutritionalLines.map((line, i) => 
            i === lineIndex 
                ? {
                    ...line,
                    additives: line.additives.map((additive, j) => 
                        j === additiveIndex ? { 
                            ...additive, 
                            [field]: finalValue,
                            // Clear concentration when additive type changes
                            ...(shouldClearConcentration ? { conc: "" } : {})
                        } : additive
                    )
                }
                : line
        );
        updateFormData({ nonNutritionalLines: updatedLines });
    };

    // Helper to check if there are valid lines with both additive and values
    const hasValidLines = () => {
        return nonNutritionalLines.some(line => 
            line.dose && line.dose.trim() !== "" && !isNaN(parseFloat(line.dose)) &&
            line.additives.some(additive => 
                additive.additive && additive.additive.trim() !== "" &&
                additive.conc && additive.conc.trim() !== "" && !isNaN(parseFloat(additive.conc))
            )
        );
    };

    // Calculate totals - GIR calculation works with patient weight, shows 0 if no dextrose
    const calculateTotalGIR = (): number => {
        const dosingWeight = formData.dosingWeight && !isNaN(parseFloat(String(formData.dosingWeight))) 
            ? parseFloat(String(formData.dosingWeight)) 
            : 2.0; // Use fallback for GIR calculation
        
        let totalGIR = 0;
        
        nonNutritionalLines.forEach(line => {
            if (!line.dose || line.dose.trim() === "" || isNaN(parseFloat(line.dose))) return;
            const dose = parseFloat(line.dose);
            
            line.additives.forEach(additive => {
                if (additive.additive === "Dextrose" && additive.conc && !isNaN(parseFloat(additive.conc))) {
                    const glucose = parseFloat(additive.conc);
                    const gir = (glucose * 10 * dose) / dosingWeight / 60;
                    totalGIR += gir;
                }
            });
        });
        
        return totalGIR;
    };

    const calculateTotalNa = (): number => {
        const dosingWeight = formData.dosingWeight && !isNaN(parseFloat(String(formData.dosingWeight))) 
            ? parseFloat(String(formData.dosingWeight)) 
            : 2.0; // Use fallback for Na calculation - should show value based on default Sodium Chloride
        
        let totalNa = 0;
        
        nonNutritionalLines.forEach(line => {
            if (!line.dose || line.dose.trim() === "" || isNaN(parseFloat(line.dose))) return;
            const dose = parseFloat(line.dose);
            
            line.additives.forEach(additive => {
                if (additive.conc && !isNaN(parseFloat(additive.conc))) {
                    const conc = parseFloat(additive.conc);
                    const z = conc / 0.9;
                    
                    if (additive.additive === "Sodium Chloride") {
                        const na = (dose * 24 * 154 * z) / 1000 / dosingWeight;
                        totalNa += na;
                    } else if (additive.additive === "Sodium Acetate") {
                        const na = (dose * 24 * 109.7 * z) / 1000 / dosingWeight;
                        totalNa += na;
                    }
                }
            });
        });
        
        return totalNa;
    };

    const calculateTotalK = (): number => {
        const dosingWeight = formData.dosingWeight && !isNaN(parseFloat(String(formData.dosingWeight))) 
            ? parseFloat(String(formData.dosingWeight)) 
            : 2.0; // Use fallback for K calculation - will show value if potassium additives are added
        
        let totalK = 0;
        
        nonNutritionalLines.forEach(line => {
            if (!line.dose || line.dose.trim() === "" || isNaN(parseFloat(line.dose))) return;
            const dose = parseFloat(line.dose);
            
            line.additives.forEach(additive => {
                if (additive.conc && !isNaN(parseFloat(additive.conc))) {
                    const conc = parseFloat(additive.conc);
                    const z = conc / 0.9;
                    
                    if (additive.additive === "Potassium Chloride") {
                        const k = (dose * 24 * 121 * z) / 1000 / dosingWeight;
                        totalK += k;
                    } else if (additive.additive === "Potassium Acetate") {
                        const k = (dose * 24 * 92 * z) / 1000 / dosingWeight;
                        totalK += k;
                    }
                }
            });
        });
        
        return totalK;
    };

    const calculateTotalVolume = (): number => {
        const dosingWeight = formData.dosingWeight && !isNaN(parseFloat(String(formData.dosingWeight))) 
            ? parseFloat(String(formData.dosingWeight)) 
            : null; // No fallback - return 0 if no patient weight available
        
        if (!dosingWeight) return 0; // Return 0.00 when no patient weight data
        
        let totalDose = 0;
        
        nonNutritionalLines.forEach(line => {
            if (line.dose && !isNaN(parseFloat(line.dose))) {
                totalDose += parseFloat(line.dose);
            }
        });
        
        return totalDose > 0 ? (totalDose * 24) / dosingWeight : 0;
    };

    if (nonNutritionalLines.length === 0) {
        if (mode === 'summaryOnly') {
            return (
                <div className="nnl-summary-section">
                    <div className="nnl-summary-header">
                        <Text size="xs" c="dimmed">Non-nutritional lines provides</Text>
                    </div>
                    <div className="nnl-summary-content" style={{ lineHeight: 1.2 }}>
                        <Text size="xs" fw={700} c="black">GIR of {calculateTotalGIR().toFixed(2)} mg/kg/min</Text>
                        <Text size="xs" fw={700} c="black">Na of {calculateTotalNa().toFixed(1)} mEq/kg over 24 hours</Text>
                        <Text size="xs" fw={700} c="black">K of {calculateTotalK().toFixed(1)} mEq/kg over 24 hours</Text>
                        <Text size="xs" fw={700} c="black">NNL fluid of {calculateTotalVolume().toFixed(2)} mL/kg over 24 hours</Text>
                    </div>
                </div>
            );
        }
        // In linesOnly mode, show a single add button
        return (
            <Button
                onClick={addNonNutritionalLine}
                variant="light"
                size="xs"
                fullWidth
                leftSection={<IconPlus size={12} />}
                styles={{ root: { paddingTop: 6, paddingBottom: 6 } }}
                style={{ borderStyle: 'dashed' }}
            >
                Add Line 1
            </Button>
        );
    }

    return (
        <Box>
            {/* Safety Validation Message */}
            {validationMessage && (
                <Alert 
                    variant="light" 
                    color="orange" 
                    title="Safety Limit Exceeded" 
                    icon={<IconAlertTriangle />}
                    mb="md"
                    styles={{
                        root: {
                            border: '1px solid #ffaa00',
                            backgroundColor: '#fff8e1'
                        }
                    }}
                >
                    {validationMessage}
                </Alert>
            )}
            
            {/* Lines container with Joe's card-based design */}
            {mode !== 'summaryOnly' && (
            <div className="nnl-lines-container">
                {nonNutritionalLines
                    .map((line, idx) => ({ line, index: idx }))
                    .slice(startIndex, maxLines ? startIndex + maxLines : undefined)
                    .map(({ line, index: lineIndex }) => (
                    <div key={lineIndex} className="nnl-line-card">
                        {/* Line Header with Dose - Joe's style */}
                        <div className="nnl-line-header">
                            <Text size="xs" fw={700} className="nnl-line-number">Line {line.lineNumber}</Text>
                            <div className="nnl-dose-section">
                                <NumberInput
                                    value={line.dose}
                                    onChange={(value) => updateLinesDose(lineIndex, String(value ?? ""))}
                                    placeholder="Dose"
                                    size="xs"
                                    max={3}
                                    min={0}
                                    step={0.1}
                                    radius="md"
                                    hideControls={false}
                                    allowNegative={false}
                                    className="nnl-dose-input"
                                    styles={{ 
                                        input: { 
                                            height: '24px',
                                            fontSize: '12px',
                                            backgroundColor: 'white',
                                            textAlign: 'center'
                                        },
                                        controls: {
                                            width: '20px',
                                            height: '100%'
                                        },
                                        control: {
                                            height: '12px',
                                            minHeight: '12px',
                                            fontSize: '10px'
                                        }
                                    }}
                                />
                                <Text size="xs" c="dimmed" className="nnl-dose-unit">mL/hr</Text>
                            </div>
                            <div className="nnl-line-actions">
                                <ActionIcon
                                    onClick={() => deleteNonNutritionalLine(lineIndex)}
                                    variant="subtle"
                                    size="xs"
                                    c="gray"
                                    className="nnl-delete-line"
                                    title="Delete line"
                                >
                                    <IconTrash size={10} />
                                </ActionIcon>
                            </div>
                        </div>

                        {/* Additives - Joe's grid layout */}
                        <div className="nnl-additives-section">
                            {line.additives.map((additive, additiveIndex) => (
                                <div key={additiveIndex} className="nnl-additive-row">
                                    <div className="nnl-additive-select">
                                        <Select
                                            value={additive.additive}
                                            onChange={(value) => updateAdditive(lineIndex, additiveIndex, 'additive', value || '')}
                                            placeholder="Additive"
                                            data={SUPPORTED_ADDITIVES.map(item => ({ value: item, label: item }))}
                                            size="xs"
                                            radius="md"
                                            styles={{
                                                input: {
                                                    height: '24px',
                                                    fontSize: '12px',
                                                    backgroundColor: 'white'
                                                }
                                            }}
                                        />
                                    </div>
                                    
                                    <div className="nnl-concentration-section">
                                        <NumberInput
                                            value={additive.conc}
                                            onChange={(value) => updateAdditive(lineIndex, additiveIndex, 'conc', String(value ?? ""))}
                                            placeholder="Conc"
                                            size="xs"
                                            disabled={!additive.additive}
                                            min={0}
                                            step={0.1}
                                            max={additive.additive ? getMaxConcentration(additive.additive) : undefined}
                                            radius="md"
                                            hideControls={false}
                                            allowNegative={false}
                                            className="nnl-conc-input"
                                            styles={{ 
                                                input: { 
                                                    height: '24px',
                                                    fontSize: '12px',
                                                    backgroundColor: 'white',
                                                    textAlign: 'center'
                                                },
                                                controls: {
                                                    width: '20px',
                                                    height: '100%'
                                                },
                                                control: {
                                                    height: '12px',
                                                    minHeight: '12px',
                                                    fontSize: '10px'
                                                }
                                            }}
                                        />
                                        <Text size="xs" c="dimmed">%</Text>
                                    </div>
                                    
                                    <div className="nnl-additive-actions">
                                        {additive.additive && (
                                            <ActionIcon
                                                onClick={() => updateAdditive(lineIndex, additiveIndex, 'additive', '')}
                                                variant="subtle"
                                                size="xs"
                                                c="gray"
                                                title="Clear additive"
                                            >
                                                <Text size="xs" fw={700}>×</Text>
                                            </ActionIcon>
                                        )}
                                        {line.additives.length > 1 && (
                                            <ActionIcon
                                                onClick={() => removeAdditiveFromLine(lineIndex, additiveIndex)}
                                                variant="subtle"
                                                size="xs"
                                                c="red"
                                                title="Remove row"
                                            >
                                                <IconTrash size={8} />
                                            </ActionIcon>
                                        )}
                                        {additiveIndex === line.additives.length - 1 && line.additives.length < 2 && (
                                            <ActionIcon
                                                onClick={() => addAdditiveToLine(lineIndex)}
                                                variant="subtle"
                                                size="xs"
                                                c="blue"
                                                title="Add row"
                                            >
                                                <IconPlus size={8} />
                                            </ActionIcon>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            )}
            
            {/* Add Line Button - Same width as cards */}
            {mode !== 'summaryOnly' && nonNutritionalLines.length < 9 && (
                <Button
                    onClick={addNonNutritionalLine}
                    variant="outline"
                    size="xs"
                    fullWidth
                    leftSection={<IconPlus size={12} />}
                    style={{ 
                        borderStyle: 'dashed',
                        borderColor: '#dee2e6',
                        color: '#6c757d',
                        backgroundColor: 'transparent'
                    }}
                    styles={{ root: { paddingTop: 6, paddingBottom: 6 } }}
                >
                    Add Line {nonNutritionalLines.length + 1}
                </Button>
            )}

            {/* Summary section - Always visible */}
            {mode !== 'linesOnly' && (
            <div className="nnl-summary-section">
                <div className="nnl-summary-header">
                    <Text size="xs" c="dimmed">Non-nutritional lines provides</Text>
                </div>
                <div className="nnl-summary-content" style={{ lineHeight: 1.2 }}>
                    <Text size="xs" fw={700} c="black">GIR of {calculateTotalGIR().toFixed(2)} mg/kg/min</Text>
                    <Text size="xs" fw={700} c="black">Na of {calculateTotalNa().toFixed(1)} mEq/kg over 24 hours</Text>
                    <Text size="xs" fw={700} c="black">K of {calculateTotalK().toFixed(1)} mEq/kg over 24 hours</Text>
                    <Text size="xs" fw={700} c="black">NNL fluid of {calculateTotalVolume().toFixed(2)} mL/kg over 24 hours</Text>
                </div>
            </div>
            )}
        </Box>
    );
}
