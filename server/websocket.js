const WebSocket = require('ws');

/**
 * Sets up the WebSocket server and integrates with the HTTP server.
 * @param {http.Server} server - The HTTP server instance.
 */
function setupWebSocket(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('[WebSocket] Client connected.');

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                console.log(`[WebSocket] Message received: ${data.type}`);
                // Handle received messages here.
                handleWebSocketMessage(data, ws, wss);
            } catch (error) {
                console.error('[WebSocket] Failed to parse message:', error);
            }
        });

        ws.on('close', () => console.log('[WebSocket] Client disconnected.'));
        ws.on('error', (error) => console.error('[WebSocket] WebSocket error:', error));
    });

    console.log('[WebSocket] Server initialized.');
}

/**
 * Handles messages from connected clients.
 * @param {Object} data - The parsed message data.
 * @param {WebSocket} ws - The WebSocket instance that sent the message.
 * @param {WebSocket.Server} wss - The WebSocket server instance.
 */
function handleWebSocketMessage(data, ws, wss) {
    switch (data.type) {
        case 'newPlayer':
            console.log('[WebSocket] New player joined:', data);
            broadcastMessage(wss, data, ws); // Broadcast to other clients
            break;

        // Add additional case handlers as needed.

        default:
            console.warn('[WebSocket] Unknown message type:', data.type);
    }
}

/**
 * Broadcasts a message to all connected clients except the sender.
 * @param {WebSocket.Server} wss - The WebSocket server instance.
 * @param {Object} message - The message to broadcast.
 * @param {WebSocket} excludeWs - The WebSocket instance to exclude (usually the sender).
 */
function broadcastMessage(wss, message, excludeWs) {
    wss.clients.forEach((client) => {
        if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

module.exports = setupWebSocket;
