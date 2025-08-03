import {
  Refresh as RefreshIcon,
  BugReport as BugReportIcon,
} from '@mui/icons-material';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  AlertTitle,
  Stack,
} from '@mui/material';
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught an Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In a real app, you might want to log this to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            bgcolor: 'background.default',
            p: 3,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              width: '100%',
              textAlign: 'center',
            }}
          >
            <Stack spacing={3}>
              <Box>
                <BugReportIcon
                  sx={{
                    fontSize: 64,
                    color: 'error.main',
                    mb: 2,
                  }}
                />
                <Typography variant="h4" gutterBottom color="error">
                  Oops! Something went wrong
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  The Network Diagram Editor encountered an unexpected error. 
                  This is likely a temporary issue.
                </Typography>
              </Box>

              <Alert severity="error">
                <AlertTitle>Error Details</AlertTitle>
                {this.state.error?.message || 'Unknown error occurred'}
              </Alert>

              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleReset}
                  color="primary"
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  onClick={this.handleReload}
                  color="secondary"
                >
                  Reload Page
                </Button>
              </Stack>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Development Details:
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: 'grey.100',
                      textAlign: 'left',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      maxHeight: 200,
                      overflow: 'auto',
                    }}
                  >
                    <pre>
                      {this.state.error?.stack}
                      {'\n\n'}
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </Paper>
                </Box>
              )}
            </Stack>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;