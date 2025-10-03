import { Badge, BadgeProps } from "@mantine/core";

export interface IBlueBadgeProps {
    text: string;
    size?: BadgeProps["size"];
    compact?: boolean;
}

export default function BlueBadge(props: IBlueBadgeProps) {
    return (
        <Badge style={{ color: "#102688", backgroundColor: "rgb(220, 228, 252)", border: "none" }}
            py={props.compact ? 4 : 10} px={props.compact ? 6 : 5}
            variant="transparent" radius="sm" size={props.compact ? "sm" : (props.size ?? "md")}
        >{props.text}</Badge>
    );
}