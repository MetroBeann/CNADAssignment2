const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors());
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "font-src 'self' data: cdnjs.cloudflare.com; " +
        "style-src 'self' 'unsafe-inline' cdnjs.cloudflare.com; " +
        "script-src 'self' 'unsafe-inline' cdnjs.cloudflare.com *.jsdelivr.net; " + // Changed to *.jsdelivr.net
        "img-src 'self' data:; " +
        "connect-src 'self' https://cfzvlljfzqqqwghxemfq.supabase.co"
    );
    next();
});

app.use(express.json());

const SERVICE_NAME = 'api-gateway';
const PORT = 8000;

const frontendPath = '/usr/src/app/frontend';

// Add debugging
fs.readdir(frontendPath, (err, files) => {
    if (err) {
        console.error('Error reading frontend directory:', err);
    } else {
        console.log('Files in frontend directory:', files);
    }
});

// Serve static files with index.html disabled
app.use(express.static(frontendPath, {
    index: false
}));

// Root route handler
app.get('/', async (req, res) => {
    const filePath = path.join(frontendPath, 'index.html');
    console.log('Attempting to serve from:', filePath);
    
    try {
        await fs.promises.access(filePath);
        console.log('File exists, sending index.html');
        res.sendFile(filePath);
    } catch (err) {
        console.error('Error accessing file:', err);
        res.status(404).send('index.html not found');
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`${SERVICE_NAME} service running on port ${PORT}`);
    console.log(`Serving static files from: ${frontendPath}`);
});