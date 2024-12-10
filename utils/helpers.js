/**
 * Generates a unique player ID.
 * @returns {string} The generated player ID.
 */
export function generatePlayerId() {
    return `player-${Math.floor(Math.random() * 10000)}`;
}

/**
 * Clamps a position value within a given range.
 * @param {number} value - The value to clamp.
 * @param {number} min - The minimum allowed value.
 * @param {number} max - The maximum allowed value.
 * @returns {number} The clamped value.
 */
export function clampPosition(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Generates a random starting position within a container.
 * @param {number} containerWidth - The width of the container.
 * @param {number} containerHeight - The height of the container.
 * @param {number} playerWidth - The width of the player.
 * @param {number} playerHeight - The height of the player.
 * @returns {Object} An object containing the x and y coordinates of the starting position.
 */
export function generateStartingPosition(containerWidth, containerHeight, playerWidth, playerHeight) {
    const x = clampPosition(
        Math.floor(Math.random() * containerWidth),
        0,
        containerWidth - playerWidth
    );
    const y = clampPosition(
        Math.floor(Math.random() * containerHeight),
        0,
        containerHeight - playerHeight
    );
    return { x, y };
}

/**
 * Broadcasts a message to all connected WebSocket clients, optionally excluding one client.
 * @param {WebSocket.Server} wss - The WebSocket server instance.
 * @param {Object} message - The message to broadcast.
 * @param {WebSocket} [excludeId] - The client to exclude from the broadcast.
 */
export function broadcast(wss, message, excludeId) {
    const messageString = JSON.stringify(message);
    wss.clients.forEach((client) => {
        if (client.readyState === 1 && (!excludeId || client !== excludeId)) {
            client.send(messageString);
        }
    });
}
