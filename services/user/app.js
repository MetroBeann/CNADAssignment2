const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors());
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self' https://cdn.jsdelivr.net https://*.youtube.com https://*.ytimg.com https://*.doubleclick.net; " +
        "font-src 'self' data: http://localhost:8002 cdnjs.cloudflare.com; " +
        "style-src 'self' 'unsafe-inline' cdnjs.cloudflare.com; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://*.youtube.com https://*.doubleclick.net; " +
        "frame-src 'self' https://www.youtube.com; " +
        "img-src 'self' data: blob: https://*.ytimg.com; " +
        "media-src 'self' blob: data:; " +
        "connect-src 'self' https: wss: blob:; " +
        "worker-src 'self' blob:; " +
        "child-src blob:; " +
        "object-src 'none';"
    );
    next();
});

app.use(express.json());

const SERVICE_NAME = 'user';
const PORT = 8002;

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
    const filePath = path.join(frontendPath, 'user.html');
    console.log('Attempting to serve from:', filePath);
    
    try {
        await fs.promises.access(filePath);
        console.log('File exists, sending user.html');
        res.sendFile(filePath);
    } catch (err) {
        console.error('Error accessing file:', err);
        res.status(404).send('user.html not found');
    }
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`${SERVICE_NAME} service running on port ${PORT}`);
    console.log(`Serving static files from: ${frontendPath}`);
});