import DateUtils from "@/lib/DateUtils";
import { ILabResult } from "@/lib/app-data/IAppData";
import { Table, Text, Box } from "@mantine/core";
import BlueBadge from "../core/badge/BlueBadge";
import { useEffect, useState, useMemo } from "react";
import { useMediaQuery } from "@mantine/hooks";

export interface IInputParametersTableProps {
    keyPrefix?: string
    labData: ILabResult[];
}

export default function InputParametersTable(props: IInputParametersTableProps) {
    const [dateHeaders, setDateHeaders] = useState<Date[]>([]);
    
    // Responsive breakpoints
    const isMobile = useMediaQuery('(max-width: 768px)');
    const isTablet = useMediaQuery('(max-width: 1024px)');
    
    // Determine max date columns based on screen size
    const maxDateColumns = useMemo(() => {
        if (isMobile) return 3; // Show only last 3 days on mobile
        if (isTablet) return 5; // Show only last 5 days on tablet
        return 11; // Show up to 11 days on desktop
    }, [isMobile, isTablet]);

    // Clean up lab names from HAPI FHIR
    const cleanLabName = (labName: string): string => {
        // Apply transformations in order
        let cleaned = labName
            .replace('Calcium.ionized', 'Calcium')
            .replace('Carbon dioxide,', 'Carbon dioxide')
            .replace('Aspartate aminotransferase', 'AST')
            .replace(/Alanine Aminotransferase(\s*-\s*ALT)?/i, 'ALT'); // Handle "Alanine Aminotransferase - ALT" or just "Alanine Aminotransferase"
        
        return cleaned;
    };

    // Debug: Log what data InputParametersTable receives
    
    if (props.labData && props.labData.length > 0) {
        if (props.labData[0].values && props.labData[0].values.length > 0) {
        }
    }

    // Helper: canonical YYYY-MM-DD key at local midnight
    const getDayKey = (d: string | number | Date): string => {
        const date = new Date(d as any);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    useEffect(() => {
        
        if (props.labData.length > 0) {
            // First, collect all unique dates
            const dayKeyToDate = new Map<string, Date>();
            
            for (const row of props.labData) {
                for (const v of (row.values || [])) {
                    const key = getDayKey(v.date as unknown as string | number | Date);
                    if (!dayKeyToDate.has(key)) {
                        const [y, m, dd] = key.split('-').map(Number);
                        dayKeyToDate.set(key, new Date(y, m - 1, dd));
                    }
                }
            }
            
            // Sort all dates
            const allSortedDates = Array.from(dayKeyToDate.values()).sort((a, b) => a.getTime() - b.getTime());
            
            let finalDates: Date[];
            
            if (allSortedDates.length === 1) {
                // Today view - keep as is
                finalDates = allSortedDates;
            } else {
                // History view - include today and past 10 days
                const today = new Date();
                const tenDaysAgo = new Date(today.getTime() - (10 * 24 * 60 * 60 * 1000));
                
                // Filter to include today and dates within past 10 days
                const filteredDates = allSortedDates.filter(date => {
                    return date >= tenDaysAgo && date <= today;
                });
                
                // Sort oldest to newest (left to right flow) and limit based on screen size
                finalDates = filteredDates.sort((a, b) => a.getTime() - b.getTime()).slice(-maxDateColumns);
            }
            
            setDateHeaders(finalDates);
        } else {
            setDateHeaders([]);
        }
    }, [props.labData, maxDateColumns]);

    const isSingleDateColumn = dateHeaders.length === 1;
    
    // Calculate responsive column widths - Small increase for history view only
    const getColumnWidth = useMemo(() => {
        if (isSingleDateColumn) return { dateCol: 0, unitCol: 70, labCol: 200 }; // Keep original sizes for today view
        
        const availableSpace = isMobile ? 370 : isTablet ? 650 : 1100; // Small increase for history view
        const unitWidth = 75; // Small increase from 70
        const labWidth = isMobile ? 130 : 190; // Small increase for history view
        const remainingSpace = availableSpace - unitWidth - labWidth;
        const dateColWidth = Math.max(65, remainingSpace / dateHeaders.length); // Small increase from 60px to 65px
        
        return {
            dateCol: dateColWidth,
            unitCol: unitWidth,
            labCol: labWidth
        };
    }, [isSingleDateColumn, dateHeaders.length, isMobile, isTablet]);
    
    // Calculate minimum table width
    const minTableWidth = useMemo(() => {
        if (isSingleDateColumn) return "100%";
        return `${(getColumnWidth.dateCol * dateHeaders.length) + getColumnWidth.unitCol + getColumnWidth.labCol}px`;
    }, [isSingleDateColumn, dateHeaders.length, getColumnWidth]);

    // Create rows. For a single date (Today), show Lab | Value | Unit.
    // For multiple dates (History), show Lab | Unit | date columns.
    const rows = props.labData.map((row, index) => {
        if (isSingleDateColumn) {
            const latest = row.values && row.values.length > 0 ? row.values[0].value : "-";
            return (
                <Table.Tr key={`${props.keyPrefix}-${row.id}-${index}`}>
                    <Table.Td fw={600} style={{ padding: 6 }}>{cleanLabName(row.component)}</Table.Td>
                    <Table.Td ta="right" style={{ padding: 6, whiteSpace: "nowrap" }}>{latest}</Table.Td>
                    <Table.Td ta="right" style={{ padding: 6, whiteSpace: "nowrap" }}>{row.unit}</Table.Td>
                </Table.Tr>
            );
        }

        // Map values by day to align with headers
        const valueByDay = new Map<string, string>();
        (row.values || []).forEach(v => {
            const key = getDayKey(v.date as unknown as string | number | Date);
            valueByDay.set(key, String(v.value));
        });

        // History view - Date columns | Unit | Lab
        return (
            <Table.Tr 
                key={`${props.keyPrefix}-${row.id}-${index}`}
                style={{ 
                    borderBottom: '1px solid #F1F3F4',
                    '&:hover': { backgroundColor: '#FAFBFC' }
                }}
            >
                {dateHeaders.map((d) => {
                    const key = getDayKey(d);
                    const val = valueByDay.get(key) ?? '-';
                    return (
                        <Table.Td 
                            ta="center" 
                            style={{ 
                                padding: '8px 6px', 
                                whiteSpace: "nowrap", 
                                width: getColumnWidth.dateCol, 
                                minWidth: getColumnWidth.dateCol,
                                borderRight: '1px solid #F5F5F5'
                            }} 
                            key={`${props.keyPrefix}-${row.id}-${key}`}
                        >
                            <Text 
                                size="xs" 
                                fw={val !== '-' ? 500 : 400} 
                                c={val !== '-' ? 'dark' : 'dimmed'}
                            >
                                {val}
                            </Text>
                        </Table.Td>
                    );
                })}
                <Table.Td 
                    ta="center" 
                    style={{ 
                        padding: '8px 6px', 
                        width: getColumnWidth.unitCol,
                        minWidth: getColumnWidth.unitCol,
                        maxWidth: getColumnWidth.unitCol,
                        whiteSpace: "nowrap",
                        borderRight: '1px solid #F5F5F5',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}
                >
                    <Text size="xs" c="dimmed" fw={500} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {row.unit}
                    </Text>
                </Table.Td>
                <Table.Td 
                    fw={600} 
                    style={{ 
                        padding: 8,
                        width: getColumnWidth.labCol,
                        minWidth: getColumnWidth.labCol
                    }}
                >
                    <Text size="xs" fw={500} c="dark">
                        {cleanLabName(row.component)}
                    </Text>
                </Table.Td>
            </Table.Tr>
        );
    });

    return (
        <Box 
            p="lg" 
            style={{ 
                border: '1px solid #E6E8EE', 
                borderRadius: 16, 
                backgroundColor: 'white', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
        >
             <Box style={{ overflowX: 'auto', overflowY: 'hidden', flex: 1, minHeight: 0 }}>
             <Table 
                highlightOnHover 
                horizontalSpacing="xs" 
                verticalSpacing="xs"
                 style={{ 
                     width: "100%", 
                     tableLayout: "auto", // Changed from "fixed" to allow flexible sizing
                     minWidth: minTableWidth
                 }}
             >
                <Table.Thead>
                    <Table.Tr 
                        bg="#EEE"
                    >
                        {isSingleDateColumn && (
                            <Table.Th fw="normal" style={{ padding: 6, width: '40%' }}>Lab</Table.Th>
                        )}
                        {isSingleDateColumn ? (
                            <>
                                <Table.Th fw="normal" ta="right" style={{ padding: 6, width: '40%' }}>Value</Table.Th>
                                <Table.Th fw="normal" ta="right" style={{ padding: 6, width: '20%' }}>Unit</Table.Th>
                            </>
                        ) : (
                            // History view - Date columns | Unit | Lab
                            <>
                                {dateHeaders.map((value) => (
                                    DateUtils.isToday(value)
                                        ? <Table.Th 
                                            fw="normal" 
                                            ta="center" 
                                            style={{ 
                                                padding: 8, 
                                                whiteSpace: "nowrap", 
                                                width: getColumnWidth.dateCol, 
                                                minWidth: getColumnWidth.dateCol,
                                                borderRight: '1px solid #E9ECEF'
                                            }} 
                                            key={`${props.keyPrefix}-InputParametersTable-${value.toISOString()}`}
                                        >
                                            <BlueBadge text="TODAY" />
                                        </Table.Th>
                                        : <Table.Th 
                                            fw="normal" 
                                            ta="center" 
                                            style={{ 
                                                padding: 8, 
                                                whiteSpace: "nowrap", 
                                                width: getColumnWidth.dateCol, 
                                                minWidth: getColumnWidth.dateCol,
                                                borderRight: '1px solid #E9ECEF'
                                            }} 
                                            key={`${props.keyPrefix}-InputParametersTable-${value.toISOString()}`}
                                        >
                            <Text size="xs" fw={500} c="dark">
                                {DateUtils.formatDateForTableHeader(value)}
                            </Text>
                                        </Table.Th>
                                ))}
                                <Table.Th 
                                    fw="normal" 
                                    ta="center" 
                                    style={{ 
                                        padding: 8, 
                                        width: getColumnWidth.unitCol,
                                        minWidth: getColumnWidth.unitCol,
                                        maxWidth: getColumnWidth.unitCol,
                                        borderRight: '1px solid #E9ECEF'
                                    }}
                                >
                                    <Text size="xs" fw={600} c="dark">Unit</Text>
                                </Table.Th>
                                <Table.Th 
                                    fw="normal" 
                                    ta="left" 
                                    style={{ 
                                        padding: 8,
                                        width: getColumnWidth.labCol,
                                        minWidth: getColumnWidth.labCol
                                    }}
                                >
                                    <Text size="xs" fw={600} c="dark">Lab</Text>
                                </Table.Th>
                            </>
                        )}
                    </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                    {rows}
                </Table.Tbody>
            </Table>
            </Box>
        </Box>
    );
}