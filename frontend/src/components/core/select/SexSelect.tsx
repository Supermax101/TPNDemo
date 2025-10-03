import { Select } from "@mantine/core";
import * as r4 from "fhir/r4";

type Sex = r4.Patient["gender"];

export interface ISexSelectProps {
    sex: Sex | undefined;
    setSex: (protocol: Sex | undefined) => void;
}

export default function SexSelect(props: ISexSelectProps) {
    return (
        <Select
            data={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
                { value: "unknown", label: "Unknown" },
            ]}
            label="Sex"
            value={props.sex}
            onChange={(value: string | null) => { props.setSex((value) ? value as Sex : undefined); }}
            placeholder="Select sex"
            radius="md"
        />
    );
}