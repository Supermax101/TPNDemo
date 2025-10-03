import { ActionIcon, Menu, Table } from "@mantine/core";
import BlueBadge from "../core/badge/BlueBadge";
import { Component } from "@/types/Component";
import { IconDotsVertical } from "@tabler/icons-react";

interface ITableEntry {
    component: Component;
    value: string;
}

function componentEntryToString(component: string): string {
    switch (component) {
        case "fat-dose": return "Fat Dose";
        case "aa-dose": return "AA Dose";
        case "acetate": return "Acetate";
        case "calcium": return "Calcium";
        default: return component;
    }
}

export interface IComponentTableProps {
    // components: Map<Component, string>;
    components: ITableEntry[];
    onRemoveComponent: (component: Component) => void;
}

export default function ComponentTable(props: IComponentTableProps) {
    return (
        <Table withTableBorder>
            <Table.Thead>
                <Table.Tr bg="#EEE">
                    <Table.Th c="gray">Component</Table.Th>
                    <Table.Th c="gray" ta="right">Target</Table.Th>
                    <Table.Th></Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {props.components.map((entry, index) => (
                    <Table.Tr key={`ComponentTable-${index}`}>
                        <Table.Td>{componentEntryToString(entry.component)}</Table.Td>
                        <Table.Td ta="right"><BlueBadge text={entry.value} /></Table.Td>
                        <Table.Td ta="right">
                            <Menu shadow="md">
                                <Menu.Target>
                                    <ActionIcon color="gray" variant="subtle">
                                        <IconDotsVertical size="18px" />
                                    </ActionIcon>
                                </Menu.Target>

                                <Menu.Dropdown>
                                    <Menu.Item onClick={() => props.onRemoveComponent(entry.component)}>Delete</Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        </Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );
}