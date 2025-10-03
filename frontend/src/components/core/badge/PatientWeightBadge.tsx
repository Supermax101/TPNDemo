import * as r4 from "fhir/r4";
import { IconScaleOutline } from "@tabler/icons-react";
import WhiteBadge from "./WhiteBadge";

export interface IPatientWeightBadgeProps {
    weight: string;
    compact?: boolean;
}

export default function PatientSexBadge(props: IPatientWeightBadgeProps) {
    return (
        <WhiteBadge compact={props.compact} text={props.weight} leftSection={<IconScaleOutline color="#5b5d69" size={props.compact ? 14 : 18} />} />
    );
}