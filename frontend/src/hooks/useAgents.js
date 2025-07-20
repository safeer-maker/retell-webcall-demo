import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export const useAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getAgents();
      setAgents(response.agents || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch agents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return {
    agents,
    loading,
    error,
    refetch: fetchAgents,
  };
};
