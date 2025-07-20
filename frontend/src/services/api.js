import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (process.env.REACT_APP_DEBUG === 'true') {
      console.log('API Request:', config);
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (process.env.REACT_APP_DEBUG === 'true') {
      console.log('API Response:', response);
    }
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message);
    
    // Handle common errors
    if (error.response?.status === 401) {
      console.error('Unauthorized: Check your API key configuration');
    } else if (error.response?.status === 404) {
      console.error('Resource not found');
    } else if (error.response?.status >= 500) {
      console.error('Server error: Please try again later');
    }
    
    return Promise.reject(error);
  }
);

export const apiService = {
  // Health check
  async healthCheck() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('Backend service is not available');
    }
  },

  // Get all agents
  async getAgents() {
    try {
      const response = await api.get('/agents/');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || 'Failed to fetch agents'
      );
    }
  },

  // Get specific agent
  async getAgent(agentId) {
    try {
      const response = await api.get(`/agents/${agentId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || `Failed to fetch agent ${agentId}`
      );
    }
  },

  // Create web call
  async createWebCall(agentId, metadata = {}) {
    try {
      const response = await api.post('/calls/create-web-call', {
        agent_id: agentId,
        metadata,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || 'Failed to create web call'
      );
    }
  },

  // Get call details
  async getCallDetails(callId) {
    try {
      const response = await api.get(`/calls/${callId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || `Failed to fetch call ${callId}`
      );
    }
  },

  // End call
  async endCall(callId) {
    try {
      const response = await api.delete(`/calls/${callId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || `Failed to end call ${callId}`
      );
    }
  },
};

export default api;
