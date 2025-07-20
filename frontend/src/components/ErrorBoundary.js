import React from 'react';
import { Alert, Button, Typography, Box } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('Error caught by boundary:', error, errorInfo);
    
    // You can also log the error to an error reporting service here
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRefresh = () => {
    // Reset error state and try to recover
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Optionally refresh the page as a last resort
    // window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          minHeight="400px"
          p={3}
        >
          <Alert 
            severity="error" 
            sx={{ mb: 3, maxWidth: 600 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={this.handleRefresh}
                startIcon={<RefreshIcon />}
              >
                Retry
              </Button>
            }
          >
            <Typography variant="h6" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2">
              The application encountered an unexpected error. This could be due to:
            </Typography>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>Network connectivity issues</li>
              <li>Browser compatibility problems</li>
              <li>Microphone permission issues</li>
              <li>Retell API service errors</li>
            </ul>
          </Alert>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Box 
              component="pre" 
              sx={{ 
                backgroundColor: '#f5f5f5',
                padding: 2,
                borderRadius: 1,
                overflow: 'auto',
                fontSize: '0.75rem',
                maxWidth: '100%',
                maxHeight: 200,
              }}
            >
              <strong>Error:</strong> {this.state.error.toString()}
              {this.state.errorInfo && (
                <>
                  <br />
                  <strong>Stack trace:</strong>
                  {this.state.errorInfo.componentStack}
                </>
              )}
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" mt={2} textAlign="center">
            If the problem persists, please refresh the page or check your browser console for more details.
          </Typography>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
