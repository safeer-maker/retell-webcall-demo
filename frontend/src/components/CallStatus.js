import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Stack,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  PhoneDisabled as PhoneDisabledIcon,
  AccessTime as TimeIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const getStatusConfig = (status) => {
  switch (status) {
    case 'idle':
      return {
        color: 'default',
        icon: PhoneDisabledIcon,
        label: 'Ready to Call',
        description: 'Select an agent and click the phone button to start',
      };
    case 'connecting':
      return {
        color: 'warning',
        icon: PhoneIcon,
        label: 'Connecting...',
        description: 'Establishing connection with the AI agent',
      };
    case 'connected':
      return {
        color: 'success',
        icon: CheckIcon,
        label: 'Connected',
        description: 'Voice call is active',
      };
    case 'ending':
      return {
        color: 'warning',
        icon: PhoneDisabledIcon,
        label: 'Ending Call...',
        description: 'Disconnecting from the call',
      };
    case 'ended':
      return {
        color: 'info',
        icon: PhoneDisabledIcon,
        label: 'Call Ended',
        description: 'Call completed successfully',
      };
    case 'error':
      return {
        color: 'error',
        icon: ErrorIcon,
        label: 'Error',
        description: 'Something went wrong with the call',
      };
    default:
      return {
        color: 'default',
        icon: PhoneDisabledIcon,
        label: 'Unknown',
        description: 'Unknown status',
      };
  }
};

const CallStatus = ({ 
  status, 
  duration, 
  error, 
  isTalking = { user: false, agent: false },
  callId 
}) => {
  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;
  const showProgress = status === 'connecting' || status === 'ending';

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Stack spacing={2}>
          {/* Status Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <StatusIcon color={statusConfig.color} />
              <Typography variant="h6" component="h2">
                Call Status
              </Typography>
            </Box>
            <Chip 
              label={statusConfig.label} 
              color={statusConfig.color}
              variant={status === 'connected' ? 'filled' : 'outlined'}
            />
          </Box>

          {/* Progress bar for connecting/ending states */}
          {showProgress && (
            <LinearProgress color={statusConfig.color} />
          )}

          {/* Status description */}
          <Typography variant="body2" color="text.secondary">
            {error || statusConfig.description}
          </Typography>

          {/* Call duration */}
          {status === 'connected' && (
            <Box display="flex" alignItems="center" gap={1}>
              <TimeIcon fontSize="small" color="action" />
              <Typography variant="body2">
                Duration: {formatDuration(duration)}
              </Typography>
            </Box>
          )}

          {/* Talking indicators */}
          {status === 'connected' && (
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip
                size="small"
                label="You"
                color={isTalking.user ? 'primary' : 'default'}
                variant={isTalking.user ? 'filled' : 'outlined'}
                sx={{ 
                  transition: 'all 0.2s',
                  ...(isTalking.user && { animation: 'pulse 1s infinite' })
                }}
              />
              <Chip
                size="small"
                label="AI Agent"
                color={isTalking.agent ? 'secondary' : 'default'}
                variant={isTalking.agent ? 'filled' : 'outlined'}
                sx={{ 
                  transition: 'all 0.2s',
                  ...(isTalking.agent && { animation: 'pulse 1s infinite' })
                }}
              />
            </Box>
          )}

          {/* Call ID */}
          {callId && (
            <Typography variant="caption" color="text.secondary">
              Call ID: {callId}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CallStatus;
