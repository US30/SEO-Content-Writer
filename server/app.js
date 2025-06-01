const express = require('express');
const cors = require('cors');
const app = express();

// Configure CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

app.use(express.json());

// Routes for each step
app.use('/api/keyword', require('./routes/keyword'));
app.use('/api/title', require('./routes/title'));
app.use('/api/topic', require('./routes/topic'));
app.use('/api/content', require('./routes/content'));

// Start the server
const PORT = process.env.PORT || 7001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;