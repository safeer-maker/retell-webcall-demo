// server.js
const express = require('express');
const cors = require('cors');
const { Retell } = require('retell-sdk');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Retell client - add your API key here
const retellClient = new Retell({
  apiKey: 'key_a33923dece07f7dfae3e20c6149f', // Replace with your actual API key
});

// Endpoint to create web call
app.post('/create-web-call', async (req, res) => {
  try {
    const { agent_id } = req.body;
    
    const webCallResponse = await retellClient.call.createWebCall({
      agent_id: agent_id,
    });
    
    res.json(webCallResponse);
  } catch (error) {
    console.error('Error creating web call:', error);
    res.status(500).json({ error: 'Failed to create web call' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});