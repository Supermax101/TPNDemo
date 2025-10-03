import React, { useMemo, useRef, useEffect } from 'react';
import { 
  Card, 
  Text, 
  Stack, 
  Table, 
  Box,
  Alert
} from '@mantine/core';

interface HistoricalDataTabProps {
  labHistory?: any[];
  doseHistory?: any[];
  orderHistory?: any[];
  isLoading?: boolean;
}

// Utility function to format dates consistently
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch {
    return dateString;
  }
}

// Utility function to check if a date is today
function isToday(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  } catch {
    return false;
  }
}

// Utility function to get date column label - simplified without "Latest" functionality
function getDateColumnLabel(dateString: string, isLabTable: boolean = true): React.ReactNode {
  const formattedDate = formatDate(dateString);
  
  if (isToday(dateString)) {
    return (
      <div style={{ lineHeight: '1.2' }}>
        <div style={{ color: '#1971c2', fontWeight: 500 }}>
          {isLabTable ? "Today's Lab" : "Today"}
        </div>
        <div style={{ fontSize: '12px', marginTop: '2px' }}>
          {formattedDate}
        </div>
      </div>
    );
  } else {
    // Show only the date for all historical data (no "Latest" labels)
    return formattedDate;
  }
}

// These functions are no longer needed since we removed "Latest" labeling
// function findLatestLabDate(labMatrix: Record<string, any>, sortedDates: string[]): string | null {
//   for (const date of sortedDates) {
//     const hasData = Object.values(labMatrix).some((lab: any) => lab.values[date]);
//     if (hasData) return date;
//   }
//   return null;
// }

// function findLatestMedicationDate(doseMatrix: Record<string, any>, sortedDates: string[]): string | null {
//   for (const date of sortedDates) {
//     const hasData = Object.values(doseMatrix).some((med: any) => med[date]);
//     if (hasData) return date;
//   }
//   return null;
// }

// Utility function to get all unique dates and sort them (newest first)
function extractAndSortDates(labHistory: any[], doseHistory: any[]): string[] {
  const dateSet = new Set<string>();
  
  // Extract dates from lab history
  labHistory.forEach(lab => {
    lab.values?.forEach((value: any) => {
      if (value.date) {
        dateSet.add(formatDate(value.date));
      }
    });
  });
  
  // Extract dates from dose history
  doseHistory.forEach(dose => {
    if (dose.date) {
      dateSet.add(formatDate(dose.date));
    }
  });
  
  // Sort dates (oldest first) - Epic EHR style to match Step 1
  return Array.from(dateSet).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA.getTime() - dateB.getTime();
  });
}

// Transform lab data to horizontal matrix
function transformLabsToMatrix(labHistory: any[], sortedDates: string[]) {
  const labMatrix: Record<string, { unit: string; values: Record<string, any> }> = {};
  
  labHistory.forEach(lab => {
    const labName = lab.component;
    const unit = lab.unit || '';
    
    if (!labMatrix[labName]) {
      labMatrix[labName] = { unit, values: {} };
    }
    
    lab.values?.forEach((value: any) => {
      const formattedDate = formatDate(value.date);
      labMatrix[labName].values[formattedDate] = {
        value: value.value,
        isNormal: true // Could add validation logic here
      };
    });
  });
  
  return labMatrix;
}

// Transform dose data to horizontal matrix  
function transformDosesToMatrix(doseHistory: any[], sortedDates: string[]) {
  const doseMatrix: Record<string, Record<string, any>> = {};
  
  doseHistory.forEach(dose => {
    const medName = dose.component || 'Unknown Medication';
    const formattedDate = formatDate(dose.date);
    
    if (!doseMatrix[medName]) {
      doseMatrix[medName] = {};
    }
    
    doseMatrix[medName][formattedDate] = {
      dose: dose.dose,
      rate: dose.rate,
      route: dose.route,
      duration: dose.duration,
      status: dose.status
    };
  });
  
  return doseMatrix;
}

// Horizontal Labs Table Component (No individual scrolling)
function HorizontalLabsTable({ labHistory = [], sortedDates }: { labHistory?: any[]; sortedDates: string[] }) {
  const labMatrix = useMemo(() => transformLabsToMatrix(labHistory, sortedDates), [labHistory, sortedDates]);
  const labNames = Object.keys(labMatrix);
  
  if (labNames.length === 0) {
    return (
      <div style={{ marginBottom: '0px' }}>
        <Alert variant="light" color="blue" style={{ border: '1px solid #E6E8EE', borderRadius: '8px', margin: 0 }}>
          <Stack gap="xs">
            <Text size="xs" fw={500}>No Historical Labs</Text>
            <Text size="xs" c="dimmed">
              No historical laboratory data available for this patient.
            </Text>
          </Stack>
        </Alert>
      </div>
    );
  }
  
  return (
    <div style={{ marginBottom: '0px' }}>
      <div style={{ 
        border: '1px solid #E6E8EE', 
        borderRadius: '8px', 
        backgroundColor: 'white', 
        overflow: 'visible' 
      }}>
        <Table 
          striped 
          highlightOnHover 
          withColumnBorders
          styles={{
            table: {
              fontSize: '11px',
              minWidth: `${250 + sortedDates.length * 70}px`,
              tableLayout: 'fixed'
            },
            th: {
              padding: '4px 6px',
              whiteSpace: 'nowrap',
              verticalAlign: 'top',
              borderColor: '#dee2e6',
              fontSize: '11px',
              lineHeight: '1.2',
              minHeight: '26px',
              fontWeight: 600
            },
            td: {
              padding: '6px 8px',
              whiteSpace: 'nowrap',
              verticalAlign: 'top',
              borderColor: '#dee2e6',
              fontSize: '11px',
              lineHeight: '1.2',
              minHeight: '24px'
            },
            tr: {
              minHeight: '24px'
            }
          }}
        >
          <Table.Thead style={{ position: 'sticky', left: 0, zIndex: 10 }}>
            <Table.Tr>
              {sortedDates.map((date, index) => (
                <Table.Th 
                  key={date}
                  style={{ 
                    minWidth: '70px',
                    width: '70px',
                    textAlign: 'center',
                    background: '#f8f9fa',
                    whiteSpace: 'nowrap',
                    padding: '6px 4px',
                    fontSize: '11px',
                    fontWeight: 600
                  }}
                >
                  {getDateColumnLabel(date, true)}
                </Table.Th>
              ))}
              <Table.Th 
                style={{ 
                  position: 'sticky', 
                  right: 0, 
                  background: '#f8f9fa',
                  zIndex: 11,
                  minWidth: '240px',
                  width: '240px',
                  maxWidth: '240px',
                  borderLeft: '2px solid #ced4da',
                  padding: '6px 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  boxShadow: '-2px 0 4px rgba(0,0,0,0.1)',
                  transform: 'translateZ(0)',
                  willChange: 'transform'
                }}
              >
                Lab Name
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {labNames.map(labName => (
              <Table.Tr key={labName}>
                {sortedDates.map(date => {
                  const labValue = labMatrix[labName].values[date];
                  return (
                    <Table.Td 
                      key={date}
                      style={{ 
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        padding: '6px 8px',
                        minWidth: '90px',
                        width: '90px'
                      }}
                    >
                      {labValue ? (
                        <Text size="xs" fw={500} style={{ fontSize: '12px', lineHeight: '1.3' }}>
                          {labValue.value}
                        </Text>
                      ) : (
                        <Text size="xs" c="dimmed" style={{ fontSize: '12px', lineHeight: '1.3' }}>-</Text>
                      )}
                    </Table.Td>
                  );
                })}
                <Table.Td 
                  style={{ 
                    position: 'sticky', 
                    right: 0, 
                    background: 'white',
                    zIndex: 9,
                    borderLeft: '2px solid #ced4da',
                    fontWeight: 500,
                    padding: '6px 10px',
                    minWidth: '240px',
                    width: '240px',
                    maxWidth: '240px',
                    boxShadow: '-2px 0 4px rgba(0,0,0,0.1)',
                    transform: 'translateZ(0)',
                    willChange: 'transform'
                  }}
                >
                  <Text size="xs" fw={500} style={{ fontSize: '12px', lineHeight: '1.3', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    {labName}
                    {labMatrix[labName].unit && (
                      <Text component="span" size="xs" c="dimmed" ml={3} style={{ fontSize: '11px' }}>
                        ({labMatrix[labName].unit})
                      </Text>
                    )}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>
    </div>
  );
}

// Horizontal Medications Table Component (No individual scrolling)
function HorizontalMedicationsTable({ doseHistory = [], sortedDates }: { doseHistory?: any[]; sortedDates: string[] }) {
  const doseMatrix = useMemo(() => transformDosesToMatrix(doseHistory, sortedDates), [doseHistory, sortedDates]);
  const medNames = Object.keys(doseMatrix);
  
  if (medNames.length === 0) {
    return (
      <div style={{ marginTop: '0px' }}>
        <Alert variant="light" color="green" style={{ border: '1px solid #E6E8EE', borderRadius: '8px', margin: 0 }}>
          <Stack gap="xs">
            <Text size="xs" fw={500}>No TPN History</Text>
            <Text size="xs" c="dimmed">
              No previous TPN orders found for this patient.
            </Text>
          </Stack>
        </Alert>
      </div>
    );
  }
  
  return (
    <div style={{ marginTop: '0px' }}>
      <div style={{ 
        border: '1px solid #E6E8EE', 
        borderRadius: '8px', 
        backgroundColor: 'white', 
        overflow: 'visible' 
      }}>
        <Table 
          striped 
          highlightOnHover 
          withColumnBorders
          styles={{
            table: {
              fontSize: '11px',
              minWidth: `${250 + sortedDates.length * 70}px`,
              tableLayout: 'fixed'
            },
            th: {
              padding: '4px 6px',
              whiteSpace: 'nowrap',
              verticalAlign: 'top',
              borderColor: '#dee2e6',
              fontSize: '11px',
              lineHeight: '1.2',
              minHeight: '26px',
              fontWeight: 600
            },
            td: {
              padding: '6px 8px',
              whiteSpace: 'nowrap',
              verticalAlign: 'top',
              borderColor: '#dee2e6',
              fontSize: '11px',
              lineHeight: '1.2',
              minHeight: '24px'
            },
            tr: {
              minHeight: '24px'
            }
          }}
        >
          <Table.Thead style={{ position: 'sticky', left: 0, zIndex: 10 }}>
            <Table.Tr>
              {sortedDates.map((date, index) => (
                <Table.Th 
                  key={date}
                  style={{ 
                    minWidth: '70px',
                    width: '70px',
                    textAlign: 'center',
                    background: '#f8f9fa',
                    whiteSpace: 'nowrap',
                    padding: '6px 4px',
                    fontSize: '11px',
                    fontWeight: 600
                  }}
                >
                  {getDateColumnLabel(date, false)}
                </Table.Th>
              ))}
              <Table.Th 
                style={{ 
                  position: 'sticky', 
                  right: 0, 
                  background: '#f8f9fa',
                  zIndex: 11,
                  minWidth: '240px',
                  width: '240px',
                  maxWidth: '240px',
                  borderLeft: '2px solid #ced4da',
                  padding: '6px 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  boxShadow: '-2px 0 4px rgba(0,0,0,0.1)',
                  transform: 'translateZ(0)',
                  willChange: 'transform'
                }}
              >
                Medication
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {medNames.map(medName => (
              <Table.Tr key={medName}>
                {sortedDates.map(date => {
                  const doseValue = doseMatrix[medName][date];
                  return (
                    <Table.Td 
                      key={date}
                      style={{ 
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        padding: '6px 8px',
                        minWidth: '90px',
                        width: '90px'
                      }}
                    >
                      {doseValue ? (
                        <Text size="xs" fw={500} style={{ fontSize: '12px', lineHeight: '1.3' }}>
                          {doseValue.dose}
                        </Text>
                      ) : (
                        <Text size="xs" c="dimmed" style={{ fontSize: '12px', lineHeight: '1.3' }}>-</Text>
                      )}
                    </Table.Td>
                  );
                })}
                <Table.Td 
                  style={{ 
                    position: 'sticky', 
                    right: 0, 
                    background: 'white',
                    zIndex: 9,
                    borderLeft: '2px solid #ced4da',
                    padding: '6px 10px',
                    minWidth: '240px',
                    width: '240px',
                    maxWidth: '240px',
                    boxShadow: '-2px 0 4px rgba(0,0,0,0.1)',
                    transform: 'translateZ(0)',
                    willChange: 'transform'
                  }}
                >
                  <Text size="xs" fw={500} style={{ fontSize: '12px', lineHeight: '1.3', whiteSpace: 'normal', wordBreak: 'break-word' }}>{medName}</Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>
    </div>
  );
}

export default function HistoricalDataTab({ 
  labHistory = [], 
  doseHistory = [], 
  orderHistory = [],
  isLoading = false 
}: HistoricalDataTabProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Extract and sort all unique dates
  const sortedDates = useMemo(() => 
    extractAndSortDates(labHistory, doseHistory), 
    [labHistory, doseHistory]
  );

  // Scroll to the right (newest data) when component mounts or data changes - Epic EHR style
  useEffect(() => {
    if (scrollContainerRef.current && sortedDates.length > 0) {
      const container = scrollContainerRef.current;
      // Small delay to ensure the content is rendered
      const scrollToRight = () => {
        container.scrollLeft = container.scrollWidth - container.clientWidth;
      };
      
      // Try immediate scroll and backup with setTimeout
      scrollToRight();
      setTimeout(scrollToRight, 100);
    }
  }, [sortedDates, labHistory, doseHistory]);

  if (isLoading) {
    return (
      <Card withBorder p="lg">
        <Text size="xs" c="dimmed" ta="center">
          Loading historical data...
        </Text>
      </Card>
    );
  }

  if (sortedDates.length === 0) {
    return (
      <Card withBorder p="lg">
        <Stack align="center" gap="md">
          <Text size="sm" fw={600} c="dimmed">No Historical Data</Text>
          <Text size="xs" c="dimmed" ta="center">
            No historical lab or medication data available for this patient.
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Synchronized horizontal scroll container - Single scrollbar controls both tables */}
      <div 
        ref={scrollContainerRef}
        style={{ 
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: '0px',
          backgroundColor: '#fafbfc',
          maxWidth: '100%',
          width: '100%',
          position: 'relative',
          // Force horizontal scrollbar to always be visible
          scrollbarWidth: 'thin', // For Firefox
          scrollbarColor: '#888 #f1f1f1' // For Firefox
        }}
        className="historical-data-scroll"
      >
        <div style={{ 
          minWidth: `${250 + sortedDates.length * 70}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          {/* Labs Section */}
          <HorizontalLabsTable 
            labHistory={labHistory} 
            sortedDates={sortedDates} 
          />
          
          {/* Medications Section */}
          <HorizontalMedicationsTable 
            doseHistory={doseHistory} 
            sortedDates={sortedDates} 
          />
        </div>
      </div>
    </div>
  );
}