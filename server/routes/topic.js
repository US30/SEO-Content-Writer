const express = require('express');
const axios = require('axios');
const router = express.Router();

// POST /api/topic
// Expects { title: string } in request body
router.post('/', async (req, res) => {
  const { title } = req.body;
  try {
    const response = await axios.post('http://localhost:7002/generate', {
      type: 'topics',
      text: title
    });
    // response.data is expected to be an array of topic strings
    res.json({ topics: response.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

module.exports = router;