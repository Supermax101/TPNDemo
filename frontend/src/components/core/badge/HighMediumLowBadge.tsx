import { Badge } from "@mantine/core";
import { HighMediumLow } from "@/types/HighMediumLow";

export interface IHighMediumLowBadgeProps {
    level: HighMediumLow;
}

export default function HighMediumLowBadge(props: IHighMediumLowBadgeProps) {
    const color = props.level === "high" ? "red" : props.level === "medium" ? "yellow" : "blue";
    return <Badge color={color} variant="light" radius="sm" size="md" py={10} px={5}>{props.level}</Badge>;
}