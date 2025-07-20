import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Slider,
  Typography,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VolumeUp as VolumeUpIcon,
  VolumeDown as VolumeDownIcon,
  VolumeMute as VolumeMuteIcon,
} from '@mui/icons-material';

const AudioControls = ({ 
  onMuteToggle, 
  onVolumeChange, 
  isMuted = false, 
  initialVolume = 80,
  disabled = false,
  callStatus 
}) => {
  const [volume, setVolume] = useState(initialVolume);
  const [previousVolume, setPreviousVolume] = useState(initialVolume);

  const isCallActive = callStatus === 'connected';
  const controlsDisabled = disabled || !isCallActive;

  // Update volume when it changes externally
  useEffect(() => {
    if (onVolumeChange) {
      onVolumeChange(volume);
    }
  }, [volume, onVolumeChange]);

  const handleMuteToggle = () => {
    if (!controlsDisabled && onMuteToggle) {
      onMuteToggle();
    }
  };

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
  };

  const handleVolumeIconClick = () => {
    if (volume === 0) {
      // If volume is 0, restore to previous volume
      setVolume(previousVolume > 0 ? previousVolume : 50);
    } else {
      // If volume > 0, mute (set to 0)
      setPreviousVolume(volume);
      setVolume(0);
    }
  };

  const getVolumeIcon = () => {
    if (volume === 0) return VolumeMuteIcon;
    if (volume < 50) return VolumeDownIcon;
    return VolumeUpIcon;
  };

  const VolumeIcon = getVolumeIcon();

  if (!isCallActive) {
    return (
      <Card variant="outlined" sx={{ opacity: 0.5 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Audio Controls
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Controls will be available during an active call
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Audio Controls
        </Typography>
        
        <Stack spacing={3}>
          {/* Microphone Control */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Microphone
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Tooltip title={isMuted ? 'Unmute microphone' : 'Mute microphone'}>
                <span>
                  <IconButton
                    onClick={handleMuteToggle}
                    disabled={controlsDisabled}
                    color={isMuted ? 'error' : 'primary'}
                    size="large"
                  >
                    {isMuted ? <MicOffIcon /> : <MicIcon />}
                  </IconButton>
                </span>
              </Tooltip>
              <Typography variant="body2" color={isMuted ? 'error' : 'text.primary'}>
                {isMuted ? 'Muted' : 'Active'}
              </Typography>
            </Box>
          </Box>

          {/* Volume Control */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Speaker Volume
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Tooltip title={volume === 0 ? 'Unmute speaker' : 'Mute speaker'}>
                <span>
                  <IconButton
                    onClick={handleVolumeIconClick}
                    disabled={controlsDisabled}
                    color={volume === 0 ? 'error' : 'primary'}
                  >
                    <VolumeIcon />
                  </IconButton>
                </span>
              </Tooltip>
              
              <Slider
                value={volume}
                onChange={handleVolumeChange}
                disabled={controlsDisabled}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
                sx={{ 
                  flexGrow: 1,
                  mx: 2,
                  '& .MuiSlider-thumb': {
                    transition: 'all 0.2s',
                  },
                  '&:hover .MuiSlider-thumb': {
                    boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.16)',
                  },
                }}
              />
              
              <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'right' }}>
                {volume}%
              </Typography>
            </Box>
          </Box>

          {/* Audio Quality Indicators */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Audio Status
            </Typography>
            <Stack direction="row" spacing={1}>
              <Typography 
                variant="caption" 
                sx={{ 
                  px: 1, 
                  py: 0.5, 
                  borderRadius: 1, 
                  bgcolor: isCallActive ? 'success.light' : 'grey.300',
                  color: isCallActive ? 'success.contrastText' : 'text.secondary',
                }}
              >
                {isCallActive ? 'Connected' : 'Disconnected'}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AudioControls;
