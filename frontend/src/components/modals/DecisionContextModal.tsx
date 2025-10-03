import React, { useState, useMemo } from 'react';
import { Modal, Table, TextInput, Text, Badge, Group } from '@mantine/core';
import { IconSearch, IconSortAscending, IconSortDescending, IconSitemap } from '@tabler/icons-react';

interface LabContextItem {
  name: string;
  context: 'High' | 'Medium' | 'Low';
  value?: string;
  unit?: string;
}

interface DecisionContextModalProps {
  opened: boolean;
  onClose: () => void;
  labContext?: LabContextItem[];
}

export default function DecisionContextModal({
  opened,
  onClose,
  labContext = []
}: DecisionContextModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'none' | 'name' | 'context'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Default lab context items (AppTemplate pattern)
  const defaultItems: LabContextItem[] = [
    { name: 'AST', context: 'High', value: '45', unit: 'U/L' },
    { name: 'Potassium', context: 'Medium', value: '3.2', unit: 'mEq/L' },
    { name: 'Calcium', context: 'Low', value: '8.5', unit: 'mg/dL' },
    { name: 'Sodium', context: 'Low', value: '132', unit: 'mEq/L' },
    { name: 'Albumin', context: 'Low', value: '2.8', unit: 'g/dL' },
    { name: 'Phosphorus', context: 'Medium', value: '3.8', unit: 'mg/dL' },
    { name: 'Magnesium', context: 'Low', value: '1.5', unit: 'mg/dL' },
  ];

  const items = labContext.length > 0 ? labContext : defaultItems;

  // Handle sort toggle
  const handleSort = (column: 'name' | 'context') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortBy !== 'none') {
      filtered.sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortBy === 'context') {
          const contextOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          comparison = contextOrder[a.context] - contextOrder[b.context];
        }
        return sortDirection === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }, [items, searchQuery, sortBy, sortDirection]);

  // Get context badge props
  const getContextBadgeProps = (context: string) => {
    switch (context) {
      case 'High':
        return { color: 'red', variant: 'filled' as const };
      case 'Medium':
        return { color: 'orange', variant: 'filled' as const };
      case 'Low':
        return { color: 'green', variant: 'filled' as const };
      default:
        return { color: 'gray', variant: 'filled' as const };
    }
  };

  // Get sort icon
  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? <IconSortAscending size={14} /> : <IconSortDescending size={14} />;
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconSitemap size={20} />
          <Text fw={600}>Decision Context</Text>
        </Group>
      }
      size="lg"
      centered
    >
      <Text size="sm" c="dimmed" mb="md">
        The following serum and/or profile values are the primary factors driving the suggested TPN compositions.
      </Text>

      {/* Search Filter */}
      <TextInput
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.currentTarget.value)}
        placeholder="Filter lab values..."
        leftSection={<IconSearch size={16} />}
        mb="md"
        size="sm"
      />

      {/* AppTemplate-style Table */}
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th 
              style={{ cursor: 'pointer' }}
              onClick={() => handleSort('name')}
            >
              <Group gap="xs">
                <Text size="sm" fw={500}>Name</Text>
                {getSortIcon('name')}
              </Group>
            </Table.Th>
            
            <Table.Th>
              <Text size="sm" fw={500}>Value</Text>
            </Table.Th>
            
            <Table.Th 
              style={{ cursor: 'pointer' }}
              onClick={() => handleSort('context')}
            >
              <Group gap="xs">
                <Text size="sm" fw={500}>Context</Text>
                {getSortIcon('context')}
              </Group>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        
        <Table.Tbody>
          {filteredAndSortedItems.map((item, index) => (
            <Table.Tr key={index}>
              <Table.Td>
                <Text size="sm" fw={500}>{item.name}</Text>
              </Table.Td>
              
              <Table.Td>
                <Text size="sm">
                  {item.value && item.unit ? `${item.value} ${item.unit}` : '-'}
                </Text>
              </Table.Td>
              
              <Table.Td>
                <Badge 
                  size="sm" 
                  {...getContextBadgeProps(item.context)}
                >
                  {item.context}
                </Badge>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {filteredAndSortedItems.length === 0 && (
        <Text size="sm" c="dimmed" ta="center" py="md">
          No lab values match your search criteria.
        </Text>
      )}
    </Modal>
  );
}