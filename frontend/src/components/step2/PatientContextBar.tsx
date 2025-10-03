import React from 'react';
import { Group, Card, Text, Badge, Stack, Divider, Box, Flex } from '@mantine/core';
import { IconUser, IconWeight, IconClock, IconFlask, IconDroplet, IconStethoscope } from '@tabler/icons-react';

interface PatientContextBarProps {
  patientContext: {
    mrn?: string;
    name?: string;
    age?: number;
    weight?: number;
    sex?: string;
    gestationalAge?: number;
  };
  clinicalParameters?: {
    protocol?: string;
    lineType?: string;
    totalFluidIntake?: number;
    infusionDuration?: number;
    fatEmulsionType?: string;
    includeEnteralFeeding?: boolean;
  };
}

export default function PatientContextBar({ 
  patientContext, 
  clinicalParameters 
}: PatientContextBarProps) {
  
  const ParameterItem = ({ icon, label, value, color = "blue" }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color?: string;
  }) => (
    <Flex align="center" gap="xs" style={{ minWidth: 'fit-content' }}>
      <Box 
        p={4} 
        style={{ 
          borderRadius: 6, 
          backgroundColor: `var(--mantine-color-${color}-0)`,
          color: `var(--mantine-color-${color}-6)`
        }}
      >
        {icon}
      </Box>
      <div>
        <Text size="xs" c="dimmed" mb={1}>{label}</Text>
        <Text size="sm" fw={600} c="dark">{value}</Text>
      </div>
    </Flex>
  );

  return (
    <Card 
      withBorder 
      p="lg" 
      radius="md"
      style={{ 
        background: 'linear-gradient(135deg, #f8f9ff 0%, #f1f3ff 100%)',
        border: '1px solid #e7eaff'
      }}
    >
      {/* Patient Information Section */}
      <Box mb="md">
        <Text size="sm" c="dimmed" mb="xs" fw={500}>Patient Information</Text>
        <Group gap="xl" wrap="wrap">
          <ParameterItem
            icon={<IconUser size={16} />}
            label="Patient"
            value={`${patientContext?.name || 'Unknown Patient'} (${patientContext?.mrn || 'N/A'})`}
            color="blue"
          />
          
          <ParameterItem
            icon={<IconStethoscope size={16} />}
            label="Age/Sex"
            value={`${patientContext?.age ? `${patientContext.age} days` : 'N/A'} / ${patientContext?.sex || 'N/A'}`}
            color="teal"
          />
          
          <ParameterItem
            icon={<IconWeight size={16} />}
            label="Dosing Weight"
            value={`${patientContext?.weight ? `${patientContext.weight} kg` : '2.5 kg'}`}
            color="green"
          />
          
          {patientContext?.gestationalAge && (
            <ParameterItem
              icon={<IconClock size={16} />}
              label="Gestational Age"
              value={`${patientContext.gestationalAge} weeks`}
              color="orange"
            />
          )}
        </Group>
      </Box>

      <Divider variant="dashed" my="md" color="gray.3" />

      {/* Clinical Parameters Section */}
      {clinicalParameters && (
        <Box>
          <Text size="sm" c="dimmed" mb="xs" fw={500}>TPN Configuration</Text>
          <Group gap="xl" wrap="wrap">
            <ParameterItem
              icon={<IconStethoscope size={16} />}
              label="Protocol"
              value={clinicalParameters.protocol || 'neonatal'}
              color="violet"
            />
            
            <ParameterItem
              icon={<IconDroplet size={16} />}
              label="Infusion Site"
              value={clinicalParameters.lineType || 'central'}
              color="blue"
            />
            
            <ParameterItem
              icon={<IconFlask size={16} />}
              label="PN+Lipid Dose"
              value={`${clinicalParameters.totalFluidIntake || 150} mL/kg`}
              color="cyan"
            />
            
            <ParameterItem
              icon={<IconClock size={16} />}
              label="Admin Duration"
              value={`${clinicalParameters.infusionDuration || 24} hours`}
              color="orange"
            />
            
            <ParameterItem
              icon={<IconFlask size={16} />}
              label="Fat Emulsion"
              value={clinicalParameters.fatEmulsionType === 'nofat' ? 'N/A' : (clinicalParameters.fatEmulsionType || 'smof')}
              color="yellow"
            />

            {clinicalParameters.includeEnteralFeeding !== undefined && (
              <Flex align="center" gap="xs">
                <Box 
                  p={4} 
                  style={{ 
                    borderRadius: 6, 
                    backgroundColor: clinicalParameters.includeEnteralFeeding ? 'var(--mantine-color-green-0)' : 'var(--mantine-color-gray-0)',
                    color: clinicalParameters.includeEnteralFeeding ? 'var(--mantine-color-green-6)' : 'var(--mantine-color-gray-6)'
                  }}
                >
                  <IconDroplet size={16} />
                </Box>
                <div>
                  <Text size="xs" c="dimmed" mb={1}>Enteral Feeds</Text>
                  <Badge 
                    color={clinicalParameters.includeEnteralFeeding ? 'green' : 'gray'} 
                    variant="light" 
                    size="sm"
                    fw={600}
                  >
                    {clinicalParameters.includeEnteralFeeding ? 'Included' : 'None'}
                  </Badge>
                </div>
              </Flex>
            )}
          </Group>
        </Box>
      )}
    </Card>
  );
} 