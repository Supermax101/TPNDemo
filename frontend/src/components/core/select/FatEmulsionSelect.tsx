import { Select } from "@mantine/core";
import { FatEmulsion } from "@/types/FatEmulsion";

export interface IFatEmulsionSelectProps {
    fatEmulsion: FatEmulsion | null;
    setFatEmulsion: (fatEmulsion: FatEmulsion | null) => void;
}

export default function FatEmulsionSelect(props: IFatEmulsionSelectProps) {
    return (
        <Select
            data={[
                { value: "smof", label: "SMOF" },
                { value: "intralipid", label: "Intralipid" },
                { value: "omegaven", label: "Omegaven" }
            ]}
            label="Fat Emulsion"
            value={props.fatEmulsion}
            onChange={(value: string | null) => { props.setFatEmulsion(value as FatEmulsion); }}
            placeholder="Select type"
            radius="md"
            size="xs"
            styles={{ input: { height: 22, fontSize: 11, padding: '0 6px' }, label: { marginBottom: 2 } }}
        />
    );
}