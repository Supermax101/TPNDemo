import { Select } from "@mantine/core";
import { ActiveProtocol } from "@/types/ActiveProtocol";

export interface IActiveProtocolSelectProps {
    activeProtocol: ActiveProtocol | null;
    setActiveProtocol: (activeProtocol: ActiveProtocol | null) => void;
}

export default function ActiveProtocolSelect(props: IActiveProtocolSelectProps) {
    return (
        <Select
            data={[
                { value: "full", label: "Full" },
                { value: "3/4", label: "3/4" },
                { value: "2/3", label: "2/3" }
            ]}
            label="Active Protocol"
            value={props.activeProtocol}
            onChange={(value: string | null) => { props.setActiveProtocol(value as ActiveProtocol); }}
            placeholder="Select type"
            radius="md"
        />
    );
}