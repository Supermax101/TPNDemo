import { useState } from "react";
import { Card, Container, Text, Group, Avatar, Stack, SegmentedControl, Space, Flex, Box } from "@mantine/core";
import InputParametersTable from "./InputParametersTable";
import ParametersEntryForm from "./ParametersEntryForm";
import { ILabResult, INonNutritionalLinesPreviewData } from "@/lib/app-data/IAppData";
import { IconLogin, IconLogout } from "@tabler/icons-react";

export interface IStep1CardProps {
    todaysLabs?: ILabResult[];
    historicalLabs?: ILabResult[];
    nonNutritionalLinesData: INonNutritionalLinesPreviewData[];
    nonNutritionalLinesMessage: string;
}

export default function Step1Card(props: IStep1CardProps) {
    const [todayHistoryOption, setTodayHistoryOption] = useState<"today" | "history">("today");

    // Debug: Log what lab data Step 1 is receiving
    
    if (props.historicalLabs && props.historicalLabs.length > 0) {
        if (props.historicalLabs[0].values && props.historicalLabs[0].values.length > 0) {
        }
    }

    return (
        <Card shadow="xl" withBorder flex={3} p="sm" radius="md" style={{ paddingTop: 8, paddingBottom: 10, height: '100%', overflow: 'hidden' }}>
            {/* Top Header Bar with aligned toggle - Hide header when History is selected */}
            <Flex align="center" justify={todayHistoryOption === "today" ? "space-between" : "flex-end"} mb={6}>
                {/* Left: Description - Only show in Today view */}
                {todayHistoryOption === "today" && (
                    <Group>
                        <Avatar>1</Avatar>
                        <Stack justify="center" gap={0}>
                            <Text fw="bold" size="sm">Define Parameters</Text>
                            <Text size="xs">Step 1</Text>
                        </Stack>
                    </Group>
                )}

                {/* Right: Today/History Toggle */}
                <SegmentedControl 
                    size="xs"
                    value={todayHistoryOption}
                    onChange={(val: string) => setTodayHistoryOption(val as "today" | "history")}
                    data={[{ value: "today", label: "Today" }, { value: "history", label: "History" }]}
                />
            </Flex>

            {/* Table / Manual Parameters */}
            <Flex align="stretch" gap="md" style={{ height: 'calc(100% - 6px)' }}>
                <Box style={{ 
                    flex: todayHistoryOption === "today" ? 1 : 2, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    minHeight: 0
                }}>
                    {todayHistoryOption === "today"
                        ? <InputParametersTable labData={props.todaysLabs ?? []} />
                        : <InputParametersTable labData={props.historicalLabs ?? []} />
                    }
                </Box>
                {todayHistoryOption === "today" && (
                    <Box style={{ flex: 1, height: '100%' }}>
                        <ParametersEntryForm 
                            nonNutritionalLinesData={props.nonNutritionalLinesData} 
                            nonNutritionalLinesMessage={props.nonNutritionalLinesMessage}
                        />
                    </Box>
                )}
            </Flex>
        </Card >
    );
}