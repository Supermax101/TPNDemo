import React, { useState, useMemo } from 'react';
import { Table, TextInput, Group, Text, NumberInput, ActionIcon, Badge } from '@mantine/core';
import { IconSearch, IconSortAscending, IconSortDescending } from '@tabler/icons-react';

import ComponentSlider from './ComponentSlider';
import { IEnhancedComponentData } from './enhanced-types';

interface EnhancedComponentsTableProps {
    components: IEnhancedComponentData[];
    selectedValues: Record<string, number>;
    onValueChange: (componentId: string, value: number) => void;
    isLoading?: boolean;
    showFatComponents?: boolean;
}

export default function EnhancedComponentsTable({
    components,
    selectedValues,
    onValueChange,
    isLoading = false,
    showFatComponents = true
}: EnhancedComponentsTableProps) {

    // AppTemplate exact search and sort state
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'none' | 'asc' | 'desc'>('none');

    // AppTemplate exact sort toggle
    const toggleSort = () => {
        setSortBy(current => 
            current === 'none' ? 'asc' :
            current === 'asc' ? 'desc' : 'none'
        );
    };

    // AppTemplate exact filtering and sorting logic
    const filteredAndSortedComponents = useMemo(() => {
        if (!components || components.length === 0) {
            return [];
        }

        // STEP 1: Filter components (AppTemplate logic)
        let filtered = components.filter(component => {
            // Filter by fat components visibility
            if (!showFatComponents && component.component.toLowerCase().includes('fat')) {
                return false;
            }
            
            // Filter by search query (AppTemplate behavior)
            const searchTerm = searchQuery.trim().toLowerCase();
            if (searchTerm) {
                return component.component.toLowerCase().includes(searchTerm);
            }
            
            return true;
        });

        // STEP 2: Sort components (AppTemplate logic)
        if (sortBy === 'asc') {
            filtered = [...filtered].sort((a, b) => a.component.localeCompare(b.component));
        } else if (sortBy === 'desc') {
            filtered = [...filtered].sort((a, b) => b.component.localeCompare(a.component));
        }

        return filtered;
    }, [components, searchQuery, sortBy, showFatComponents]);

    // AppTemplate round2 function
    const round2 = (val: number) => Math.round(val * 100) / 100;

    // Check if any components are modified (for "ood" styling)
    const isModified = Object.keys(selectedValues).length > 0;

    return (
        <div className="table-responsive" style={{ marginTop: '0.25rem', padding: '0.25rem' }}>
            {/* AppTemplate Search Filter */}
            <TextInput
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                placeholder="Filter components…"
                leftSection={<IconSearch size={16} />}
                mb="xs"
                size="sm"
            />

            {/* AppTemplate Table Structure - Compact Mode */}
            <Table 
                striped 
                highlightOnHover 
                withTableBorder
                styles={{
                    table: {
                        fontSize: '12px'
                    },
                    th: {
                        padding: '4px 8px',  // Reduced padding
                        whiteSpace: 'nowrap',
                        fontWeight: 600,
                        backgroundColor: '#f8f9fa',
                        borderColor: '#dee2e6',
                        fontSize: '12px',
                        height: '30px',  // Fixed smaller header height
                        verticalAlign: 'middle'
                    },
                    td: {
                        padding: '2px 8px',  // Very tight padding
                        whiteSpace: 'nowrap',
                        borderColor: '#dee2e6',
                        fontSize: '12px',
                        verticalAlign: 'middle',
                        height: '36px',  // Much smaller row height
                        maxHeight: '36px'
                    },
                    tr: {
                        height: '36px',  // Consistent row height
                        maxHeight: '36px'
                    }
                }}
            >
                <Table.Thead>
                    <Table.Tr>
                        {/* Component Column with Sort */}
                        <Table.Th 
                            style={{ cursor: 'pointer' }}
                            onClick={toggleSort}
                        >
                            <Group gap="xs">
                                <Text size="sm" fw={500}>Component</Text>
                                {sortBy === 'asc' && <IconSortAscending size={14} />}
                                {sortBy === 'desc' && <IconSortDescending size={14} />}
                            </Group>
                        </Table.Th>
                        
                        {/* Dosage Column (AppTemplate name) */}
                        <Table.Th>
                            <Text size="sm" fw={500}>Dosage</Text>
                        </Table.Th>
                        
                        {/* Value Column - ABSOLUTELY FIXED width */}
                        <Table.Th style={{ 
                            textAlign: 'center',
                            width: '110px',
                            minWidth: '110px',
                            maxWidth: '110px',
                            padding: '4px',
                            overflow: 'hidden'
                        }}>
                            <Text size="sm" fw={500}>Value</Text>
                        </Table.Th>
                        {/* Total value with NNL */}
                        <Table.Th style={{ textAlign: 'end' }}>
                            <Text size="sm" fw={500}>Total value with NNL</Text>
                        </Table.Th>
                    </Table.Tr>
                </Table.Thead>
                
                <Table.Tbody>
                    {filteredAndSortedComponents.map((component) => {
                        const currentValue = selectedValues[component.id] ?? component.current;
                        
                        // Check value mismatches
                        if (selectedValues[component.id] !== undefined && selectedValues[component.id] !== component.current) {
                            // Values differ - using selected value
                        }
                        
                        // AppTemplate logic: components with 'total' are read-only totals
                        const isTotal = component.isTotal || ('total' in component.prediction.vals && !('target' in component.prediction.vals));
                        
                        return (
                            <Table.Tr 
                                key={component.id}
                                style={{
                                    // AppTemplate totals styling
                                    fontWeight: isTotal ? 'bold' : 'normal'
                                }}
                            >
                                {/* Component Name */}
                                <Table.Td 
                                    style={{ 
                                        fontWeight: isTotal ? 'bold' : 'normal',
                                        backgroundColor: isTotal ? 'rgba(29, 146, 159, 0.12)' : undefined,
                                        whiteSpace: 'nowrap',
                                        minWidth: '80px',
                                        verticalAlign: 'middle'
                                    }}
                                >
                                    <Group gap={4}> {/* Very tight spacing */}
                                        <Text size="sm" fw={isTotal ? 600 : 400}>
                                            {component.component}
                                        </Text>
                                    </Group>
                                </Table.Td>

                                {/* Dosage Column (Slider for adjustable components) - Compact */}
                                <Table.Td 
                                    style={{ 
                                        backgroundColor: isTotal ? 'rgba(51, 154, 240, 0.12)' : undefined,
                                        whiteSpace: 'nowrap',
                                        minWidth: '280px', // Reduced from 350px for compact sliders
                                        maxWidth: '300px',
                                        verticalAlign: 'middle',
                                        padding: '1px 8px' // Override to be more compact
                                    }}
                                >
                                    {!isTotal ? (
                                        <ComponentSlider
                                            min={component.min}
                                            max={component.max}
                                            step={component.stepSize}
                                            value={currentValue}
                                            onChange={(value) => onValueChange(component.id, value)}
                                            gradient={[component.startGradient, component.centerGradient, component.endGradient]}
                                            lower={component.lowerBound}
                                            target={component.targetMarker}
                                            upper={component.upperBound}
                                            disabled={isLoading}
                                        />
                                    ) : (
                                        // Empty cell for totals (no slider) - AppTemplate pattern
                                        <span />
                                    )}
                                </Table.Td>

                                {/* Value Column - ABSOLUTELY FIXED width */}
                                <Table.Td 
                                    style={{ 
                                        textAlign: 'center',
                                        fontWeight: isTotal ? 'bold' : 'normal',
                                        backgroundColor: isTotal ? 'rgba(29, 146, 159, 0.12)' : undefined,
                                        // AppTemplate "ood" styling: red italic when totals are out of date due to modifications
                                        color: isTotal && isModified ? 'red' : undefined,
                                        fontStyle: isTotal && isModified ? 'italic' : 'normal',
                                        whiteSpace: 'nowrap',
                                        width: '110px',
                                        minWidth: '110px',
                                        maxWidth: '110px',
                                        verticalAlign: 'middle',
                                        padding: '4px',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}
                                >
                                    {!isTotal ? (
                                        // ULTIMATE FIXED-SIZE BOX - No Mantine components interfering
                                        <div 
                                            style={{ 
                                                position: 'absolute',
                                                left: '50%',
                                                top: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                width: '100px',
                                                height: '32px',
                                                border: '1px solid #E6E8EE',
                                                borderRadius: '4px',
                                                backgroundColor: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <input
                                                type="number"
                                                value={currentValue}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    if (!isNaN(val)) {
                                                        const clampedValue = Math.max(component.min, Math.min(component.max, val));
                                                        onValueChange(component.id, clampedValue);
                                                    }
                                                }}
                                                min={component.min}
                                                max={component.max}
                                                step={component.stepSize}
                                                style={{
                                                    width: '50px',
                                                    height: '30px',
                                                    border: 'none',
                                                    outline: 'none',
                                                    textAlign: 'center',
                                                    fontSize: '11px',
                                                    fontWeight: '500',
                                                    backgroundColor: 'transparent',
                                                    color: '#000'
                                                }}
                                            />
                                            <div style={{
                                                width: '49px',
                                                height: '30px',
                                                backgroundColor: '#f8f9fa',
                                                borderLeft: '1px solid #E6E8EE',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '9px',
                                                color: '#868e96',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                paddingLeft: '2px',
                                                paddingRight: '2px'
                                            }}>
                                                {component.unit}
                                            </div>
                                        </div>
                                    ) : (
                                        // Total display - Same fixed width as input boxes
                                        <div 
                                            style={{ 
                                                position: 'absolute',
                                                left: '50%',
                                                top: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                width: '100px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                textAlign: 'center',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {round2(currentValue)?.toFixed(2)} {component.unit}
                                        </div>
                                    )}
                                </Table.Td>

                                {/* Total value with NNL (placeholder) */}
                                <Table.Td style={{ textAlign: 'end', color: '#98a2b3', whiteSpace: 'nowrap', minWidth: '140px', verticalAlign: 'middle' }}>
                                    —
                                </Table.Td>
                            </Table.Tr>
                        );
                    })}
                </Table.Tbody>
            </Table>

            {/* Loading State */}
            {isLoading && (
                <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                }}>
                    <Text size="sm" c="dimmed">Recalculating...</Text>
                </div>
            )}

            {/* AppTemplate CSS for totals and manual inputs */}
            <style jsx>{`
                .table-responsive {
                    padding: 0.5rem;
                }

                .table-responsive tr.totals {
                    font-weight: bold;
                }

                .table-responsive tr.totals th,
                .table-responsive tr.totals td {
                    background-color: rgba(29, 146, 159, 0.12);
                }

                .table-responsive tr.totals td.ood {
                    color: red;
                    font-style: italic;
                }

                .table-responsive th,
                .table-responsive td {
                    white-space: nowrap;
                    min-width: 80px;
                    vertical-align: middle;
                }

                .input-group.manual {
                    width: 120px;
                }
            `}</style>
        </div>
    );
} 