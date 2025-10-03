import { Badge, BadgeProps } from "@mantine/core";

export interface IGrayBadgeProps {
    text: string;
    size?: BadgeProps["size"];
    compact?: boolean;
}

export default function GrayBadge(props: IGrayBadgeProps) {
    return (
        <Badge color="gray"
            py={props.compact ? 4 : 10} px={props.compact ? 6 : 5}
            variant="transparent" radius="sm" size={props.compact ? "sm" : (props.size ?? "md")}
        >{props.text}</Badge>
    );
}