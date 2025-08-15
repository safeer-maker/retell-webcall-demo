import { RetellWebClient } from 'retell-client-js-sdk';

class RetellService {
  constructor() {
    this.client = new RetellWebClient();
    this.isConnected = false;
    this.callId = null;
    this.eventListeners = new Map();
  }

  // Initialize the client with event listeners
  initialize() {
    this.client.on('call_started', (event) => {
      console.log('Call started:', event);
      this.isConnected = true;
      this.callId = event.call_id;
      this.emit('callStarted', event);
    });

    this.client.on('call_ended', (event) => {
      console.log('Call ended:', event);
      this.isConnected = false;
      this.callId = null;
      this.emit('callEnded', event);
    });

    this.client.on('agent_start_talking', (event) => {
      console.log('Agent started talking');
      this.emit('agentStartTalking', event);
    });

    this.client.on('agent_stop_talking', (event) => {
      console.log('Agent stopped talking');
      this.emit('agentStopTalking', event);
    });

    this.client.on('user_start_talking', (event) => {
      console.log('User started talking');
      this.emit('userStartTalking', event);
    });

    this.client.on('user_stop_talking', (event) => {
      console.log('User stopped talking');
      this.emit('userStopTalking', event);
    });

    this.client.on('error', (event) => {
      console.error('Retell client error:', event);
      this.emit('error', event);
    });

    this.client.on('update', (event) => {
      console.log('Call update:', event);
      this.emit('update', event);
    });
  }

  // Start a call with the given parameters
  async startCall({ accessToken, sampleRate = 24000, captureDeviceId = null }) {
    try {
      if (this.isConnected) {
        throw new Error('Already connected to a call');
      }

      console.log('Starting call with access token:', accessToken);
      
      await this.client.startCall({
        accessToken,
        sampleRate,
        captureDeviceId,
      });

      return true;
    } catch (error) {
      console.error('Failed to start call:', error);
      throw error;
    }
  }

  // Stop the current call
  async stopCall() {
    try {
      if (!this.isConnected) {
        console.warn('No active call to stop');
        return;
      }

      await this.client.stopCall();
      this.isConnected = false;
      this.callId = null;
      
      console.log('Call stopped successfully');
    } catch (error) {
      console.error('Failed to stop call:', error);
      throw error;
    }
  }

  // Toggle mute/unmute
  async toggleMute() {
    try {
      if (!this.isConnected) {
        throw new Error('No active call');
      }

      const isMuted = await this.client.isMuted();
      await this.client.setMuted(!isMuted);
      
      return !isMuted;
    } catch (error) {
      console.error('Failed to toggle mute:', error);
      throw error;
    }
  }

  // Check if currently muted
  async isMuted() {
    try {
      return await this.client.isMuted();
    } catch (error) {
      console.error('Failed to get mute status:', error);
      return false;
    }
  }

  // Set volume (0.0 to 1.0)
  async setVolume(volume) {
    try {
      await this.client.setVolume(Math.max(0, Math.min(1, volume)));
    } catch (error) {
      console.error('Failed to set volume:', error);
      throw error;
    }
  }

  // Get available audio devices
  async getAudioDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return {
        microphones: devices.filter(device => device.kind === 'audioinput'),
        speakers: devices.filter(device => device.kind === 'audiooutput'),
      };
    } catch (error) {
      console.error('Failed to get audio devices:', error);
      throw error;
    }
  }

  // Check microphone permissions
  async checkMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately as we only needed to check permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => callback(data));
    }
  }

  // Cleanup
  destroy() {
    if (this.isConnected) {
      this.stopCall();
    }
    this.eventListeners.clear();
  }

  // Getters
  get connected() {
    return this.isConnected;
  }

  get activeCallId() {
    return this.callId;
  }
}

// Create and export a singleton instance
const retellService = new RetellService();
retellService.initialize();

export default retellService;
