import { useState } from "react";
import { TextInput, Button, Group } from "@mantine/core";
import ComponentSelect from "../core/select/ComponentSelect";
import { Component } from "@/types/Component";

export interface ICompoenntEntryProps {
    onAddComponent: (component: Component, value: string) => void;
    onReset: () => void;
}

export default function ComponentEntry(props: ICompoenntEntryProps) {
    const [component, setComponent] = useState<Component | null>(null);
    const [value, setValue] = useState<string>('');

    return (
        <div>
            <ComponentSelect component={component} setComponent={setComponent} mb={10} />
            <TextInput label="Component Value" placeholder="Enter value" mb={10} value={value} onChange={(event) => setValue(event.currentTarget.value)} />

            <Group>
                <Button color="black" variant="filled" radius="md" size="xs" style={{ minWidth: "100px" }}
                    onClick={() => {
                        if (!component || !value) { return; }
                        props.onAddComponent(component as Component, value);
                        setComponent(null);
                        setValue('');
                    }}>Add</Button>
                <Button color="black" variant="outline" radius="md" size="xs" onClick={props.onReset}>Reset</Button>
            </Group>
        </div>
    );
}