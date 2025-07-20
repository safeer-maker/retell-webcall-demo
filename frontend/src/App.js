import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Alert,
  Snackbar,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import AgentSelector from './components/AgentSelector';
import CallButton from './components/CallButton';
import CallStatus from './components/CallStatus';
import AudioControls from './components/AudioControls';

// Hooks
import { useAgents } from './hooks/useAgents';
import { useRetellCall } from './hooks/useRetellCall';

// Services
import { apiService } from './services/api';

function App() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [backendHealth, setBackendHealth] = useState(null);

  // Custom hooks
  const { agents, loading: agentsLoading, error: agentsError, refetch: refetchAgents } = useAgents();
  const {
    callStatus,
    callId,
    duration,
    error: callError,
    isLoading: callLoading,
    isMuted,
    isTalking,
    startCall,
    endCall,
    toggleMute,
    setVolume,
    clearError,
  } = useRetellCall();

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await apiService.healthCheck();
        setBackendHealth(health);
      } catch (err) {
        setBackendHealth({ status: 'unhealthy', error: err.message });
      }
    };
    checkHealth();
  }, []);

  // Auto-select first agent when agents are loaded
  useEffect(() => {
    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
  }, [agents, selectedAgent]);

  // Handle call errors
  useEffect(() => {
    if (callError) {
      setNotification({
        open: true,
        message: callError,
        severity: 'error',
      });
    }
  }, [callError]);

  // Handle agents errors
  useEffect(() => {
    if (agentsError) {
      setNotification({
        open: true,
        message: `Failed to load agents: ${agentsError}`,
        severity: 'error',
      });
    }
  }, [agentsError]);

  const handleStartCall = async () => {
    if (!selectedAgent) {
      setNotification({
        open: true,
        message: 'Please select an agent first',
        severity: 'warning',
      });
      return;
    }

    try {
      await startCall(selectedAgent.agent_id, {
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
      
      setNotification({
        open: true,
        message: 'Call started successfully!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to start call:', error);
      // Error handling is done in the hook
    }
  };

  const handleEndCall = async () => {
    try {
      await endCall();
      setNotification({
        open: true,
        message: 'Call ended',
        severity: 'info',
      });
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  const handleMuteToggle = async () => {
    try {
      const newMutedState = await toggleMute();
      setNotification({
        open: true,
        message: newMutedState ? 'Microphone muted' : 'Microphone unmuted',
        severity: 'info',
      });
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
    if (callError) {
      clearError();
    }
  };

  const handleAgentChange = (agent) => {
    if (callStatus !== 'idle') {
      setNotification({
        open: true,
        message: 'Cannot change agent during an active call',
        severity: 'warning',
      });
      return;
    }
    setSelectedAgent(agent);
  };

  return (
    <ErrorBoundary>
      <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: 'background.default' }}>
        {/* App Bar */}
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Retell Voice Call Demo
            </Typography>
            
            <Tooltip title="View source code">
              <IconButton 
                color="inherit" 
                href="https://github.com" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Settings">
              <IconButton color="inherit">
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="About">
              <IconButton color="inherit">
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {/* Backend Health Status */}
          {backendHealth && backendHealth.status === 'unhealthy' && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Backend service is not available. Please check that the backend is running on port 8000.
            </Alert>
          )}

          {/* API Key Warning */}
          {backendHealth && !backendHealth.api_key_configured && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Retell API key is not configured. Please set the RETELL_API_KEY environment variable.
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Left Column - Call Interface */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, minHeight: 600 }}>
                <Typography variant="h4" component="h1" gutterBottom textAlign="center">
                  AI Voice Assistant
                </Typography>
                
                <Typography variant="body1" color="text.secondary" paragraph textAlign="center">
                  Select an AI agent and start a voice conversation directly from your browser
                </Typography>

                <Box sx={{ mt: 4, mb: 4 }}>
                  <AgentSelector
                    agents={agents}
                    selectedAgent={selectedAgent}
                    onAgentChange={handleAgentChange}
                    loading={agentsLoading}
                    error={agentsError}
                    disabled={callStatus !== 'idle'}
                  />
                </Box>

                <Box display="flex" justifyContent="center" my={4}>
                  <CallButton
                    onStartCall={handleStartCall}
                    onEndCall={handleEndCall}
                    callStatus={callStatus}
                    isLoading={callLoading}
                    selectedAgent={selectedAgent}
                  />
                </Box>

                <CallStatus
                  status={callStatus}
                  duration={duration}
                  error={callError}
                  isTalking={isTalking}
                  callId={callId}
                />
              </Paper>
            </Grid>

            {/* Right Column - Audio Controls & Info */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <AudioControls
                  onMuteToggle={handleMuteToggle}
                  onVolumeChange={setVolume}
                  isMuted={isMuted}
                  callStatus={callStatus}
                />

                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Instructions
                  </Typography>
                  <Typography variant="body2" component="div">
                    <ol style={{ paddingLeft: 20, margin: 0 }}>
                      <li>Select an AI agent from the dropdown</li>
                      <li>Click the phone button to start the call</li>
                      <li>Allow microphone access when prompted</li>
                      <li>Start speaking with your AI assistant!</li>
                      <li>Click the red button to end the call</li>
                    </ol>
                  </Typography>
                </Paper>

                {selectedAgent && (
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Selected Agent
                    </Typography>
                    <Typography variant="body2">
                      <strong>Name:</strong> {selectedAgent.agent_name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Language:</strong> {selectedAgent.language || 'en-US'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>ID:</strong> {selectedAgent.agent_id}
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity} 
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </ErrorBoundary>
  );
}

export default App;
