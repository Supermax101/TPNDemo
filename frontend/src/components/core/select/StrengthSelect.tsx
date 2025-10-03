import { Select } from "@mantine/core";
import { StrengthProduct } from "@/types/StrengthProduct";

export interface IStrengthSelectProps {
    my?: number;
    strength: StrengthProduct | null;
    setStrength: (protocol: StrengthProduct | null) => void;
}

export default function StrengthSelect(props: IStrengthSelectProps) {
    return (
        <Select
            data={[
                { value: "Breast Milk / MBM", label: "Breast Milk / MBM" },
                { value: "Ele Care 20", label: "Ele Care 20" },
                { value: "Ele Care 22", label: "Ele Care 22" },
                { value: "Ele Care 24", label: "Ele Care 24" },
                { value: "Enfacare 22", label: "Enfacare 22" },
                { value: "Enfamil 20", label: "Enfamil 20" },
                { value: "Enfamil 22", label: "Enfamil 22" },
                { value: "Enfamil 24", label: "Enfamil 24" },
                { value: "Enfaport 20", label: "Enfaport 20" },
            ]}
            searchable
            label="Product"
            value={props.strength}
            onChange={(value: string | null) => { props.setStrength(value as StrengthProduct); }}
            placeholder="Select strength"
            radius="md"
            my={props.my}
        />
    );
}