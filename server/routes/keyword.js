const express = require('express');
const axios = require('axios');
const router = express.Router();

// POST /api/keyword
// Expects { keyword: string } in request body
router.post('/', async (req, res) => {
  console.log('Received keyword request with body:', req.body);
  const { keyword } = req.body;
  
  if (!keyword) {
    console.log('No keyword provided');
    return res.status(400).json({ error: 'Keyword is required' });
  }

  try {
    console.log('Making request to LLM service with keyword:', keyword);
    const response = await axios.post('http://localhost:7002/generate', {
      type: 'keywords',
      text: keyword
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });
    
    console.log('Received response from LLM service:', response.data);
    if (!Array.isArray(response.data)) {
      console.error('Unexpected response format:', response.data);
      return res.status(500).json({ error: 'Invalid response format from LLM service' });
    }
    
    res.json({ keywords: response.data });
  } catch (err) {
    console.error('Error in keyword generation:', err.message);
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', err.response.data);
      console.error('Error response status:', err.response.status);
      console.error('Error response headers:', err.response.headers);
      return res.status(err.response.status).json({ 
        error: err.response.data.error || 'Failed to fetch keywords',
        details: err.response.data
      });
    } else if (err.request) {
      // The request was made but no response was received
      console.error('No response received:', err.request);
      return res.status(503).json({ error: 'LLM service is not responding' });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', err.message);
      return res.status(500).json({ error: 'Failed to process request' });
    }
  }
});

module.exports = router;