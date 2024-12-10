const http = require('http');  // Missing http module import
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
//const { handleWebSocketConnection } = require('./controllers/GameController');


const PORT = 8080;

// Serve the client-side files
// Create an HTTP server to serve static files
const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './client/index.html';

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.jpg': 'image/jpeg',
        '.png': 'image/png',
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404);
                res.end('404: File Not Found');
            } else {
                res.writeHead(500);
                res.end('500: Internal Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const wss = new WebSocket.Server({ server });
let projectiles = []; // Store active projectiles
let players = {}; // Store player data


// WebSocket connection logic
wss.on('connection', (ws) => {
    let playerInitialized = false; // Track if this WebSocket already initialized a player
    const playerId = generatePlayerId();
    const initialPosition = { x: Math.round(Math.random() * 400), y: Math.round(Math.random() * 400) };

    players[playerId] = { ws, position: initialPosition };

    // Send initialization data to the new player (corrected variable name)
    ws.send(JSON.stringify({ type: 'initialize', id: playerId, ...initialPosition }));

    // Send current players to the new player
    const currentPlayers = {};
    Object.keys(players).forEach((id) => {
        if (id !== playerId) {
            currentPlayers[id] = players[id].position;
        }
    });
    ws.send(JSON.stringify({ type: 'currentPlayers', players: currentPlayers }));

    // Notify all other players about the new player
    broadcast({ type: 'newPlayer', id: playerId, ...initialPosition }, playerId);

    // Handle incoming messages
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        // Handle projectile creation
        if (data.type === 'projectile') {
            projectiles.push({
                id: `${data.id}-${Date.now()}`,
                ownerId: data.id,
                x: data.x,
                y: data.y,
                dx: data.dx,
                dy: data.dy
            });
        }

        // Handle collisions
        projectiles = projectiles.filter((projectile) => {
            projectile.x += projectile.dx;
            projectile.y += projectile.dy;

            // Check collision with players
            for (const [playerId, { position }] of Object.entries(players)) {
                if (
                    playerId !== projectile.ownerId &&
                    projectile.x >= position.x &&
                    projectile.x <= position.x + 20 &&
                    projectile.y >= position.y &&
                    projectile.y <= position.y + 20
                ) {
                    players[playerId].health -= 1;
                    broadcast({ type: 'updateHealth', id: playerId, health: players[playerId].health });

                    // Notify all clients about the hit
                    broadcast({
                        type: 'playerHit',
                        targetId: playerId,
                        projectileId: projectile.id,
                        x: projectile.x,
                        y: projectile.y,
                    });

                    return false; // Remove the projectile
                }
            }

            // Remove projectiles that are out of bounds
            return projectile.x > 0 && projectile.x < 800 && projectile.y > 0 && projectile.y < 600;
        });

        if (data.type === 'startGame' && !playerInitialized) { // player not init
            playerInitialized = true; // Mark as initialized to prevent duplicates
            const playerId = generatePlayerId();
            const initialPosition = { x: Math.random() * 400, y: Math.random() * 400 };

            // Add the player to the collection
            players[playerId] = { ws, position: initialPosition };

            // Send initialization data to the new player
            ws.send(JSON.stringify({ type: 'initialize', id: playerId, ...initialPosition }));

            // Notify all other players about the new player
            broadcast({ type: 'newPlayer', id: playerId, ...initialPosition }, playerId);

            // Send current players to the new player
            const currentPlayers = {};
            Object.keys(players).forEach((id) => {
                if (id !== playerId) {
                    currentPlayers[id] = players[id].position;
                }
            });
            ws.send(JSON.stringify({ type: 'currentPlayers', players: currentPlayers }));
        } else if (data.type === 'startGame' && playerInitialized) {
            // If this WebSocket attempts to start another game, ignore or send a warning
            ws.send(JSON.stringify({ type: 'error', message: 'Player already initialized.' }));
        }

        if (data.type === 'move') {
            players[playerId].position.x += data.x;
            players[playerId].position.y += data.y;

            // Bound the player within the game container (e.g., max x = 760, max y = 560)
            players[playerId].position.x = Math.max(0, Math.min(760, players[playerId].position.x));
            players[playerId].position.y = Math.max(0, Math.min(560, players[playerId].position.y));

            // Broadcast the player's new position to all clients
            broadcast({
                type: 'updatePlayerPosition',
                id: playerId,
                x: players[playerId].position.x,
                y: players[playerId].position.y,
            });
        }
    });

    // Handle player disconnection
    ws.on('close', () => {
        delete players[playerId];
        broadcast({ type: 'playerDisconnected', id: playerId });
    });
});

// Start the HTTP and WebSocket server

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});