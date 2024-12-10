const http = require('http');
const path = require('path');
const fs = require('fs');
const setupWebSocket = require('./websocket');

const PORT = 8080;

// Map static routes to directories
const STATIC_DIRS = {
    '/': '.',                  // Serve index.html and other loose files from root
    '/assets': './assets',     // Serve assets like images
    '/client': './client',     // Serve client-side JS
    '/controllers': './controllers',
    '/models': './models',     // Expose the models directory
    '/utils': './utils',       // Expose the utils directory
    '/views': './views',       // Expose the views directory
};

// Helper to get MIME type
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
};

/**
 * Resolve the requested URL to a file path and directory.
 * @param {string} urlPath - The requested URL path.
 * @returns {string | null} - Resolved file path or null if no match.
 */
const resolveFilePath = (urlPath) => {
    for (const [route, dir] of Object.entries(STATIC_DIRS)) {
        if (urlPath.startsWith(route)) {
            return path.join(dir, urlPath.replace(route, ''));
        }
    }
    return null; // No match
};

// Create HTTP server
const server = http.createServer((req, res) => {
    const urlPath = req.url === '/' ? '/index.html' : req.url; // Default to index.html
    const filePath = resolveFilePath(urlPath);

    if (!filePath) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404: File Not Found');
        return;
    }

    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        //console.log(`Serving file: ${filePath} with MIME type: ${contentType}`);
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404: File Not Found');
            } else {
                console.error(`Error reading file ${filePath}:`, error);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500: Internal Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Set up WebSocket server
setupWebSocket(server);

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
