import { Select } from "@mantine/core";
import { Component } from "@/types/Component";

export interface IComponentSelectProps {
    component: Component | null;
    setComponent: (component: Component | null) => void;

    mb?: number;
}

export default function ComponentSelect(props: IComponentSelectProps) {
    return (
        <Select
            data={[
                { value: "fat-dose", label: "Fat Dose" },
                { value: "aa-dose", label: "AA Dose" },
                { value: "acetate", label: "Acetate" },
                { value: "calcium", label: "Calcium" }
            ]}
            label="Component"
            value={props.component}
            onChange={(value: string | null) => { props.setComponent(value as Component); }}
            placeholder="Select component"
            radius="md"
            mb={props.mb}
        />
    );
}