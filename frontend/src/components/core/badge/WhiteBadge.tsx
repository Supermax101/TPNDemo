import { Badge } from "@mantine/core";
import { ReactNode } from "react";

export interface IWhiteBadgeProps {
    text: string;
    leftSection?: ReactNode;
    style?: React.CSSProperties;
    compact?: boolean;
}

export default function WhiteBadge(props: IWhiteBadgeProps) {
    return (
        <Badge style={{ color: "black", backgroundColor: "white", borderColor: "#d6d9dd", ...(props.style || {}) }}
            py={props.compact ? 4 : 10} px={props.compact ? 6 : 5}
            leftSection={props.leftSection}
            variant="outline" color="gray" radius="sm" size={props.compact ? "sm" : "md"}
        >{props.text}</Badge>
    );
}