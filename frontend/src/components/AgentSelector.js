import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

const AgentSelector = ({ 
  agents, 
  selectedAgent, 
  onAgentChange, 
  loading, 
  error,
  disabled = false 
}) => {
  if (error) {
    return (
      <Box mb={2}>
        <Alert severity="error">
          Failed to load agents: {error}
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" p={2}>
        <CircularProgress size={24} />
        <Typography variant="body2" ml={1}>
          Loading agents...
        </Typography>
      </Box>
    );
  }

  if (agents.length === 0) {
    return (
      <Box mb={2}>
        <Alert severity="warning">
          No agents available. Please check your Retell AI configuration.
        </Alert>
      </Box>
    );
  }

  return (
    <FormControl fullWidth variant="outlined" disabled={disabled}>
      <InputLabel id="agent-select-label">
        Select AI Agent
      </InputLabel>
      <Select
        labelId="agent-select-label"
        value={selectedAgent?.agent_id || ''}
        onChange={(e) => {
          const agent = agents.find(a => a.agent_id === e.target.value);
          onAgentChange(agent);
        }}
        label="Select AI Agent"
        startAdornment={<PersonIcon sx={{ mr: 1, color: 'action.active' }} />}
      >
        {agents.map((agent) => (
          <MenuItem key={agent.agent_id} value={agent.agent_id}>
            <Box display="flex" flexDirection="column" alignItems="flex-start">
              <Typography variant="body1" fontWeight="medium">
                {agent.agent_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ID: {agent.agent_id} | Language: {agent.language || 'en-US'}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
      
      {selectedAgent && (
        <Box mt={1}>
          <Typography variant="caption" color="text.secondary">
            Selected: {selectedAgent.agent_name}
          </Typography>
        </Box>
      )}
    </FormControl>
  );
};

export default AgentSelector;
