import { Loader, Text, Stack, Card } from '@mantine/core';

export interface TPNLoadingStateProps {
    message?: string;
    subtitle?: string;
}

export default function TPNLoadingState({ 
    message = "Getting TPN Predictions...", 
    subtitle = "Please wait while we analyze patient data and generate recommendations" 
}: TPNLoadingStateProps) {
    return (
        <Card shadow="sm" padding="lg" style={{ textAlign: 'center' }}>
            <Stack align="center" gap="md">
                <Loader size="lg" color="blue" />
                <div>
                    <Text size="lg" fw={500}>{message}</Text>
                    {subtitle && (
                        <Text size="sm" c="dimmed" mt="xs">
                            {subtitle}
                        </Text>
                    )}
                </div>
            </Stack>
        </Card>
    );
}