// WebSocket Message Types Enum
export const WEBSOCKET_EVENTS = {
    INITIALIZE: 'initialize',
    NEW_PLAYER: 'newPlayer',
    PLAYER_POSITION_UPDATE: 'updatePlayerPosition',
    PLAYER_DISCONNECTED: 'playerDisconnected',
    CURRENT_PLAYERS: 'currentPlayers',
    PROJECTILE_FIRED: 'projectileFired',
    PLAYER_HIT: 'playerHit',
};

/**
 * Initializes the WebSocket connection and links it to the game controller.
 * @param {GameController} gameController - The main game controller instance.
 * @returns {Object} WebSocket manager with methods for interacting with the connection.
 */

// Initialize WebSocket connection
export function initializeWebSocket() {
    let socket = null;
    let gameController = null;
    let playerId = null;

    // WebSocket event handlers
    function connect() {
        socket = new WebSocket('ws://localhost:8080');

        socket.onopen = () => console.log('[WebSocket] Connected to server');

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleWebSocketMessage(data, gameController);
            } catch (error) {
                console.error('[WebSocket] Failed to parse message:', error);
            }
        };

        socket.onerror = (error) => console.error('[WebSocket] Error:', error);

        socket.onclose = (event) => {
            console.warn('[WebSocket] Connection closed:', event);
            reconnect();
        };
    }

    function reconnect() {
        console.log('[WebSocket] Attempting to reconnect...');
        setTimeout(() => {
            connect();
        }, 3000); // Retry every 3 seconds
    }

    /**
     * Sends a message through the WebSocket connection.
     * @param {string} type - The type of the event.
     * @param {Object} payload - The payload to send with the event.
     */
    function emitEvent(type, payload = {}) {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type, ...payload }));
        } else {
            console.warn('[WebSocket] Cannot send event: WebSocket is not open');
        }
    }

    /**
     * Returns the local player's ID.
     * @returns {string|null} The current player's ID, or null if not set.
     */
    function getPlayerId() {
        return playerId;
    }

    connect(); // Establish initial connection

    // Return the WebSocket manager object
    return {
        emitEvent,
        getPlayerId,
    };
}


/**
 * Handles incoming WebSocket messages and delegates them to the appropriate game controller methods.
 * @param {Object} data - The parsed WebSocket message data.
 * @param {GameController} gameController - The main game controller instance.
 */
function handleWebSocketMessage(data, gameController) {
    const { type, ...payload } = data;

    switch (type) {
        // Player events
        case WEBSOCKET_EVENTS.INITIALIZE:
            console.log('[WebSocket] Game initialized:', payload);
            gameController.initializeGame(payload); // Extend GameController if needed
            break;

        case WEBSOCKET_EVENTS.NEW_PLAYER:
            console.log('[WebSocket] New player connected:', payload);
            gameController.playerController.initializePlayer(payload.id, payload.x, payload.y);
            break;

        case WEBSOCKET_EVENTS.PLAYER_POSITION_UPDATE:
            console.log('[WebSocket] Player position updated:', payload);
            gameController.movePlayer(payload.id, payload.x, payload.y);
            break;

        case WEBSOCKET_EVENTS.PLAYER_DISCONNECTED:
            console.log('[WebSocket] Player disconnected:', payload);
            gameController.removePlayer(payload.id);
            break;

        case WEBSOCKET_EVENTS.CURRENT_PLAYERS:
            console.log('[WebSocket] Syncing current players:', payload);
            for (const [id, position] of Object.entries(payload.players)) {
                gameController.playerController.syncPlayers({ id, ...position });
            }
            break;
        // Projectile events
        case WEBSOCKET_EVENTS.PROJECTILE_FIRED:
            console.log('[WebSocket] Projectile fired:', payload);
            gameController.fireProjectile(payload.ownerId, payload.dx, payload.dy);
            break;

        case WEBSOCKET_EVENTS.PLAYER_HIT:
            console.log('[WebSocket] Player hit:', payload);
            gameController.handlePlayerHit(payload.targetId, payload.x, payload.y);
            break;

        default:
            console.warn('[WebSocket] Unknown message type:', type);
    }
}