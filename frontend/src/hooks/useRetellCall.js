import { useState, useCallback, useEffect } from 'react';
import retellService from '../services/retell';
import { apiService } from '../services/api';

export const useRetellCall = () => {
  const [callStatus, setCallStatus] = useState('idle'); // idle, connecting, connected, ending, ended, error
  const [callId, setCallId] = useState(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTalking, setIsTalking] = useState({ user: false, agent: false });

  // Timer for call duration
  useEffect(() => {
    let interval;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      setDuration(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [callStatus]);

  // Setup event listeners
  useEffect(() => {
    const handleCallStarted = (event) => {
      console.log('Call started event:', event);
      setCallStatus('connected');
      setCallId(event.call_id || event.callId);
      setError(null);
      setIsLoading(false);
    };

    const handleCallEnded = (event) => {
      console.log('Call ended event:', event);
      setCallStatus('ended');
      setCallId(null);
      setIsLoading(false);
      setIsTalking({ user: false, agent: false });
      
      // Reset to idle after a short delay
      setTimeout(() => {
        setCallStatus('idle');
      }, 2000);
    };

    const handleError = (event) => {
      console.error('Call error event:', event);
      setError(event.error || event.message || 'An error occurred');
      setCallStatus('error');
      setIsLoading(false);
    };

    const handleUserStartTalking = () => {
      setIsTalking(prev => ({ ...prev, user: true }));
    };

    const handleUserStopTalking = () => {
      setIsTalking(prev => ({ ...prev, user: false }));
    };

    const handleAgentStartTalking = () => {
      setIsTalking(prev => ({ ...prev, agent: true }));
    };

    const handleAgentStopTalking = () => {
      setIsTalking(prev => ({ ...prev, agent: false }));
    };

    // Register event listeners
    retellService.on('callStarted', handleCallStarted);
    retellService.on('callEnded', handleCallEnded);
    retellService.on('error', handleError);
    retellService.on('userStartTalking', handleUserStartTalking);
    retellService.on('userStopTalking', handleUserStopTalking);
    retellService.on('agentStartTalking', handleAgentStartTalking);
    retellService.on('agentStopTalking', handleAgentStopTalking);

    return () => {
      // Cleanup event listeners
      retellService.off('callStarted', handleCallStarted);
      retellService.off('callEnded', handleCallEnded);
      retellService.off('error', handleError);
      retellService.off('userStartTalking', handleUserStartTalking);
      retellService.off('userStopTalking', handleUserStopTalking);
      retellService.off('agentStartTalking', handleAgentStartTalking);
      retellService.off('agentStopTalking', handleAgentStopTalking);
    };
  }, []);

  const startCall = useCallback(async (agentId, metadata = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      setCallStatus('connecting');

      // Check microphone permission first
      const hasPermission = await retellService.checkMicrophonePermission();
      if (!hasPermission) {
        throw new Error('Microphone permission is required for voice calls');
      }

      // Create web call via backend API
      console.log('Creating web call for agent:', agentId);
      const callData = await apiService.createWebCall(agentId, metadata);
      
      console.log('Call data received:', callData);

      // Start the call with Retell client
      await retellService.startCall({
        accessToken: callData.access_token,
        sampleRate: callData.sample_rate || 24000,
      });

    } catch (err) {
      console.error('Failed to start call:', err);
      setError(err.message);
      setCallStatus('error');
      setIsLoading(false);
    }
  }, []);

  const endCall = useCallback(async () => {
    try {
      setCallStatus('ending');
      await retellService.stopCall();
    } catch (err) {
      console.error('Failed to end call:', err);
      setError(err.message);
      setCallStatus('error');
    }
  }, []);

  const toggleMute = useCallback(async () => {
    try {
      const newMutedState = await retellService.toggleMute();
      setIsMuted(newMutedState);
      return newMutedState;
    } catch (err) {
      console.error('Failed to toggle mute:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const setVolume = useCallback(async (volume) => {
    try {
      await retellService.setVolume(volume / 100); // Convert to 0-1 range
    } catch (err) {
      console.error('Failed to set volume:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    if (callStatus === 'error') {
      setCallStatus('idle');
    }
  }, [callStatus]);

  return {
    // State
    callStatus,
    callId,
    duration,
    error,
    isLoading,
    isMuted,
    isTalking,

    // Actions
    startCall,
    endCall,
    toggleMute,
    setVolume,
    clearError,

    // Helpers
    isConnected: callStatus === 'connected',
    isConnecting: callStatus === 'connecting',
    hasError: callStatus === 'error' || !!error,
  };
};
