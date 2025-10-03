import { Select } from "@mantine/core";
import { Protocol } from "@/types/Protocol";

export interface IProtocolSelectProps {
    protocol: Protocol | null;
    setProtocol: (protocol: Protocol | null) => void;
}

export default function ProtocolSelect(props: IProtocolSelectProps) {
    return (
        <Select
            data={[
                { value: "neonatal", label: "Neonatal" },
                { value: "pediatric", label: "Pediatric" },
            ]}
            label="Protocol"
            value={props.protocol}
            onChange={(value: string | null) => { props.setProtocol(value as Protocol); }}
            placeholder="Select protocol"
            radius="md"
            size="xs"
            styles={{ input: { height: 22, fontSize: 11, padding: '0 6px' }, label: { marginBottom: 2 } }}
        />
    );
}