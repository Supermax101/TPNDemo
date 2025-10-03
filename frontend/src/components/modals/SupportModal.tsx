import { HighMediumLow } from "@/types/HighMediumLow";
import { Modal, Text, Table, Divider, Alert, Space } from "@mantine/core";
import HighMediumLowBadge from "../core/badge/HighMediumLowBadge";
import { IconInfoCircle } from "@tabler/icons-react";

interface ISupportModalProps {
    opened: boolean;
    onClose: () => void;
}

export default function SupportModal(props: ISupportModalProps) {
    return (
        <Modal title="Support" size="md" padding="md" radius="lg" opened={props.opened} onClose={props.onClose}>
            <Text c="gray" size="sm">General Guidelines for TPN Components</Text>
            <Space h={20} />
        </Modal>
    );
}