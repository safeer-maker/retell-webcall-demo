import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [callData, setCallData] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');

  // Check API health on component mount
  useEffect(() => {
    checkApiHealth();
    fetchAgents();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      setApiStatus(response.data.api_key_status === 'configured' ? 'healthy' : 'misconfigured');
    } catch (err) {
      console.error('API health check failed:', err);
      setApiStatus('unhealthy');
    }
  };

  const fetchAgents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/agents`);
      setAgents(response.data);
      
      if (response.data.length > 0) {
        setSelectedAgent(response.data[0]);
      }
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError(err.response?.data?.detail || 'Failed to fetch agents. Please check your API configuration.');
    } finally {
      setLoading(false);
    }
  };

  const createWebCall = async () => {
    if (!selectedAgent) {
      setError('Please select an agent first');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/web-call`, {
        agent_id: selectedAgent.agent_id
      });
      
      setCallData(response.data);
    } catch (err) {
      console.error('Error creating web call:', err);
      setError(err.response?.data?.detail || 'Failed to create web call. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const endCall = () => {
    setCallData(null);
  };

  const retryConnection = () => {
    setError(null);
    setApiStatus('checking');
    checkApiHealth();
    fetchAgents();
  };

  const getStatusIndicator = () => {
    switch (apiStatus) {
      case 'healthy':
        return <span className="status-indicator healthy">🟢 API Connected</span>;
      case 'misconfigured':
        return <span className="status-indicator warning">🟡 API Key Not Configured</span>;
      case 'unhealthy':
        return <span className="status-indicator error">🔴 API Unavailable</span>;
      default:
        return <span className="status-indicator">⚪ Checking API...</span>;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎙️ Retell Web Call Demo</h1>
        <div className="status-bar">
          {getStatusIndicator()}
          {apiStatus !== 'healthy' && (
            <button onClick={retryConnection} className="retry-btn">
              Retry Connection
            </button>
          )}
        </div>
      </header>

      <main className="App-main">
        {/* Error Display */}
        {error && (
          <div className="error-banner">
            <h3>⚠️ Error</h3>
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {/* Agent Selection */}
        {!callData && (
          <div className="agent-selection">
            <h2>Select an Agent</h2>
            
            {loading && <div className="loading">Loading agents...</div>}
            
            {agents.length > 0 && (
              <>
                <div className="agents-grid">
                  {agents.map((agent) => (
                    <div
                      key={agent.agent_id}
                      className={`agent-card ${selectedAgent?.agent_id === agent.agent_id ? 'selected' : ''}`}
                      onClick={() => setSelectedAgent(agent)}
                    >
                      <h3>{agent.agent_name}</h3>
                      <div className="agent-details">
                        <p><strong>ID:</strong> {agent.agent_id}</p>
                        <p><strong>Voice:</strong> {agent.voice_id}</p>
                        <p><strong>Language:</strong> {agent.language}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="call-controls">
                  <button
                    onClick={createWebCall}
                    disabled={loading || !selectedAgent || apiStatus !== 'healthy'}
                    className="start-call-btn"
                  >
                    {loading ? 'Creating Call...' : '📞 Start Web Call'}
                  </button>
                </div>
              </>
            )}

            {agents.length === 0 && !loading && !error && (
              <div className="no-agents">
                <h3>No Agents Found</h3>
                <p>Please ensure your Retell API key is configured and you have agents set up in your account.</p>
                <button onClick={fetchAgents} className="retry-btn">
                  Refresh Agents
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active Call Interface */}
        {callData && (
          <div className="call-interface">
            <div className="call-header">
              <h2>📞 Active Call</h2>
              <div className="call-info">
                <p><strong>Call ID:</strong> {callData.call_id}</p>
                <p><strong>Agent:</strong> {selectedAgent?.agent_name}</p>
              </div>
              <button onClick={endCall} className="end-call-btn">
                End Call
              </button>
            </div>
            
            <div className="call-container">
              <iframe
                src={`https://widget.retellai.com/embed/${callData.call_id}?access_token=${callData.access_token}`}
                width="100%"
                height="500"
                frameBorder="0"
                allow="microphone"
                title="Retell Web Call"
                className="call-iframe"
              ></iframe>
            </div>
            
            <div className="call-instructions">
              <h3>📋 Instructions</h3>
              <ul>
                <li>Allow microphone access when prompted</li>
                <li>Speak clearly into your microphone</li>
                <li>The AI agent will respond to your voice</li>
                <li>Click "End Call" when finished</li>
              </ul>
            </div>
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>
          Powered by <a href="https://retell.ai" target="_blank" rel="noopener noreferrer">Retell AI</a>
        </p>
        <p>
          <a href="https://github.com/safeer-maker/retell-webcall-demo" target="_blank" rel="noopener noreferrer">
            View Source Code
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;