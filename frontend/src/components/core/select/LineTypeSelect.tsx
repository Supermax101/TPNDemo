import { Select } from "@mantine/core";
import { LineType } from "@/types/LineType";

export interface ILineTypeSelectProps {
    lineType: LineType | null;
    setLineType: (protocol: LineType | null) => void;
}

export default function LineTypeSelect(props: ILineTypeSelectProps) {
    return (
        <Select
            data={[
                { value: "central", label: "Central" },
                { value: "peripheral", label: "Peripheral" },
            ]}
            label="Infusion Site"
            value={props.lineType}
            onChange={(value: string | null) => { props.setLineType(value as LineType); }}
            placeholder="Select type"
            radius="md"
            size="xs"
            styles={{ input: { height: 22, fontSize: 11, padding: '0 6px' }, label: { marginBottom: 2 } }}
        />
    );
}