const express = require('express');
const axios = require('axios');
const router = express.Router();

// POST /api/title

router.post('/', async (req, res) => {
  const { keyword } = req.body;
  try {
    const response = await axios.post('http://localhost:7001/generate', {
      type: 'titles',
      text: keyword
    });
    // response.data is expected to be an array of title strings
    res.json({ titles: response.data });
  } catch (err) {
    console.error('Error fetching titles:', err);
    if (err.response) {
      console.error('Error response data:', err.response.data);
      console.error('Error response status:', err.response.status);
      console.error('Error response headers:', err.response.headers);
    } else if (err.request) {
      console.error('No response received:', err.request);
    } else {
      console.error('Error setting up request:', err.message);
    }
    res.status(500).json({ error: 'Failed to fetch titles' });
  }
});

module.exports = router; 