const express = require('express');
const axios = require('axios');
const PDFDocument = require('pdfkit');
const router = express.Router();

// POST /api/content
router.post('/', async (req, res) => {
  console.log('Received request with body:', req.body);
  const { topic, keyword, content, title, generatePdf } = req.body;

  // Handle PDF generation request
  if (generatePdf) {
    console.log('Handling PDF generation request...');
    if (!content) {
      console.log('No content provided for PDF generation');
      return res.status(400).json({ error: 'Content is required' });
    }

    try {
      console.log('Creating PDF document...');
      // Create a new PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: title || 'Generated Content',
          Author: 'SEO Content Generator',
          Subject: topic || 'Content',
          Keywords: keyword || ''
        }
      });

      // Handle PDF generation errors
      doc.on('error', (err) => {
        console.error('PDF generation error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to generate PDF: ' + err.message });
        }
      });

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${keyword || 'content'}-content.pdf"`);

      console.log('Piping PDF to response...');
      // Pipe the PDF to the response
      doc.pipe(res);

      console.log('Adding content to PDF...');
      // Add content to the PDF
      doc.fontSize(24).text(title || 'Generated Content', { align: 'center' });
      doc.moveDown();
      
      if (keyword) {
        doc.fontSize(14).text(`Keyword: ${keyword}`);
      }
      if (topic) {
        doc.fontSize(14).text(`Topic: ${topic}`);
      }
      doc.moveDown();

      // Add the main content
      doc.fontSize(12).text(content, {
        align: 'justify',
        lineGap: 5
      });

      console.log('Finalizing PDF...');
      // Finalize the PDF
      doc.end();
      return;
    } catch (err) {
      console.error('Error in PDF generation:', err);
      console.error('Error stack:', err.stack);
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Failed to generate PDF',
          details: err.message
        });
      }
      return;
    }
  }

  // Handle content generation request
  if (!topic || !keyword) {
    console.log('Missing required fields');
    return res.status(400).json({ error: 'Topic and keyword are required' });
  }

  try {
    console.log('Making request to LLM service with topic:', topic, 'and keyword:', keyword);
    const requestData = {
      type: 'content',
      text: `${topic} ${keyword}`
    };
    console.log('Request data:', requestData);
    
    const response = await axios.post('http://localhost:7002/generate', requestData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });
    
    console.log('Received response from LLM service:', response.data);
    if (!response.data) {
      console.error('Unexpected response format:', response.data);
      return res.status(500).json({ error: 'Invalid response format from LLM service' });
    }
    
    res.json({ content: response.data });
  } catch (err) {
    console.error('Error in content generation:', err.message);
    if (err.response) {
      console.error('Error response data:', err.response.data);
      console.error('Error response status:', err.response.status);
      console.error('Error response headers:', err.response.headers);
      return res.status(err.response.status).json({ 
        error: err.response.data.error || 'Failed to generate content',
        details: err.response.data
      });
    } else if (err.request) {
      console.error('No response received:', err.request);
      return res.status(503).json({ error: 'LLM service is not responding' });
    } else {
      console.error('Error setting up request:', err.message);
      return res.status(500).json({ error: 'Failed to process request' });
    }
  }
});

module.exports = router;