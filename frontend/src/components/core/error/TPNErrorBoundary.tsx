import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Text, Stack } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export default class TPNErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ error, errorInfo });
        
        // Call optional error handler
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // Log error for debugging
        console.error('TPN Error Boundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <Alert 
                    icon={<IconAlertCircle size="1rem" />} 
                    title="TPN Prediction Error" 
                    color="red"
                    variant="light"
                >
                    <Stack gap="sm">
                        <Text size="sm">
                            There was an error getting TPN predictions. This might be due to:
                        </Text>
                        <ul style={{ marginLeft: '1rem', fontSize: '0.875rem' }}>
                            <li>Network connectivity issues</li>
                            <li>TPN model service unavailable</li>
                            <li>Invalid patient data or lab values</li>
                            <li>Backend API configuration problems</li>
                        </ul>
                        <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={this.handleRetry}
                        >
                            Try Again
                        </Button>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details style={{ marginTop: '1rem' }}>
                                <summary style={{ cursor: 'pointer', fontSize: '0.75rem' }}>
                                    Technical Details (Development Only)
                                </summary>
                                <pre style={{ 
                                    fontSize: '0.75rem', 
                                    background: '#f5f5f5', 
                                    padding: '0.5rem', 
                                    borderRadius: '4px',
                                    overflow: 'auto',
                                    maxHeight: '200px'
                                }}>
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                    </Stack>
                </Alert>
            );
        }

        return this.props.children;
    }
}