import React, { useState } from 'react';
import {
  Fab,
  Tooltip,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  CallEnd as CallEndIcon,
} from '@mui/icons-material';

const CallButton = ({ 
  onStartCall, 
  onEndCall, 
  callStatus, 
  isLoading, 
  selectedAgent,
  disabled = false 
}) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const isConnected = callStatus === 'connected';
  const isConnecting = callStatus === 'connecting';
  const canCall = selectedAgent && callStatus === 'idle' && !disabled;
  const canEndCall = (isConnected || isConnecting) && !disabled;

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  const handleClick = () => {
    if (canEndCall) {
      onEndCall();
    } else if (canCall) {
      onStartCall();
    }
  };

  const getTooltipText = () => {
    if (!selectedAgent) return 'Select an agent first';
    if (disabled) return 'Call button disabled';
    if (isConnecting) return 'Connecting...';
    if (isConnected) return 'End call';
    if (canCall) return 'Start voice call';
    return 'Cannot start call';
  };

  const getButtonColor = () => {
    if (isConnected || isConnecting) return 'error';
    return 'primary';
  };

  const getButtonIcon = () => {
    if (isLoading || isConnecting) {
      return <CircularProgress size={24} color="inherit" />;
    }
    if (isConnected) {
      return <CallEndIcon />;
    }
    return <PhoneIcon />;
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <Tooltip title={getTooltipText()} arrow>
        <span> {/* Wrapper span needed for disabled tooltip */}
          <Fab
            color={getButtonColor()}
            size="large"
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            disabled={disabled || (!canCall && !canEndCall)}
            sx={{
              width: 80,
              height: 80,
              transform: isPressed ? 'scale(0.95)' : 'scale(1)',
              transition: 'all 0.2s ease-in-out',
              ...(callStatus === 'connecting' && {
                animation: 'ring 2s ease-in-out infinite',
              }),
              '&:hover': {
                transform: isPressed ? 'scale(0.95)' : 'scale(1.05)',
              },
              '&:disabled': {
                backgroundColor: 'action.disabledBackground',
                color: 'action.disabled',
              },
            }}
          >
            {getButtonIcon()}
          </Fab>
        </span>
      </Tooltip>

      {/* Status text below button */}
      <Typography 
        variant="caption" 
        color="text.secondary" 
        textAlign="center"
        sx={{ maxWidth: 200 }}
      >
        {isConnecting && 'Establishing connection...'}
        {isConnected && 'Tap to end call'}
        {callStatus === 'idle' && !selectedAgent && 'Select an agent above'}
        {callStatus === 'idle' && selectedAgent && 'Tap to start call'}
        {callStatus === 'ending' && 'Ending call...'}
        {callStatus === 'ended' && 'Call ended'}
        {callStatus === 'error' && 'Call failed'}
      </Typography>
    </Box>
  );
};

export default CallButton;
