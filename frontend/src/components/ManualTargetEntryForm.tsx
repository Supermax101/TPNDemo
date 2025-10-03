import { useState, useCallback } from "react";
import { Text, TextInput, Button, Group } from "@mantine/core";

export interface IManualTargetEntryFormProps {
    onAddClick: (component: string, value: string) => void;
}

export default function ManualTargetEntryForm(props: IManualTargetEntryFormProps) {
    const [component, setComponent] = useState<string>("");
    const [componentValue, setComponentValue] = useState<string>("");

    const onResetClick = useCallback(() => {
        setComponent("");
        setComponentValue("");
    }, []);

    return (
        <div>
            <Text>Manual Target</Text>
            <TextInput my={10} label="Component" placeholder="Enter component" value={component} onChange={(e) => setComponent(e.currentTarget.value)} />
            <TextInput my={10} label="Value" placeholder="Enter value" value={componentValue} onChange={(e) => setComponentValue(e.currentTarget.value)} />

            <Group>
                <Button color="black" onClick={() => props.onAddClick(component, componentValue)}>Add</Button>
                <Button color="white" variant="outline" onClick={onResetClick}>Reset</Button>
            </Group>
        </div>
    );
}