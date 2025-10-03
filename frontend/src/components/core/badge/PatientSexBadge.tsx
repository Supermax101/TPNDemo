import * as r4 from "fhir/r4";
import { IconGenderFemale, IconGenderMale } from "@tabler/icons-react";
import WhiteBadge from "./WhiteBadge";

export interface IPatientSexBadgeProps {
    sex: r4.Patient["gender"];
    compact?: boolean;
}

export default function PatientSexBadge(props: IPatientSexBadgeProps) {
    // Capitalize first letter...
    const sex = props.sex ?? "unknown";

    // Determine the icon to use...
    let icon = null;
    if (sex === "male") { icon = <IconGenderMale color="#5b5d69" />; }
    else if (sex === "female") { icon = <IconGenderFemale color="#5b5d69" />; }

    return (
        <WhiteBadge compact={props.compact} text={sex} leftSection={icon} style={{ textDecoration: "capitalize" }} />
    );
}