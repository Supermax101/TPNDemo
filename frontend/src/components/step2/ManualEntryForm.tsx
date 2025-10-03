import { useState } from "react";
import { Divider, Text } from "@mantine/core";
import ComponentEntry from "./ComponentEntry";
import ComponentTable from "./ComponentTable";
import { Component } from "@/types/Component";

export interface IManualEntryFormProps {

}

export default function ManualEntryForm(props: IManualEntryFormProps) {
    const [components, setComponents] = useState<Map<Component, string>>(new Map());

    return (
        <div>
            <Text>Manual Entry</Text>
            <ComponentEntry
                onAddComponent={(component, value) => { setComponents(new Map(components.set(component, value))); }}
                onReset={() => { setComponents(new Map()); }}
            />

            {/* Text with line on both sides */}
            <div className="flex items-center w-full text-center" style={{ margin: "20px 0" }}>
                <Divider style={{ flexGrow: 1 }} />
                <Text c="gray" size="xs" ta="center" tt="uppercase" my={10} mx={10}>Added Components ({components.size})</Text>
                <Divider style={{ flexGrow: 1 }} />
            </div>

            <ComponentTable
                components={Array.from(components).map(([component, value]) => ({ component, value }))}
                onRemoveComponent={(component) => { components.delete(component); setComponents(new Map(components)); }}
            />
        </div>
    );
}