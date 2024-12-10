let socket;
let playerId;
let players = {};

// Initialize WebSocket connection
export function initializeWebSocket() {
    socket = new WebSocket('ws://localhost:8080');

    // Attach WebSocket event listeners
    socket.onopen = () => {
        console.log('Connected to server');
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    socket.onclose = (event) => {
        console.warn('WebSocket connection closed:', event);
        reconnectWebSocket();
    };
}

// Handle incoming WebSocket messages
function handleWebSocketMessage(data) {
    switch (data.type) {
        case 'initialize':
            handleInitialize(data);
            break;

        case 'newPlayer':
            handleNewPlayer(data);
            break;

        case 'updatePlayerPosition':
            handlePlayerMovement(data);
            break;

        case 'playerDisconnected':
            handlePlayerDisconnection(data);
            break;

        case 'currentPlayers':
            handleCurrentPlayers(data);
            break;

        case 'fireProjectile':
            window.game.spawnProjectile(data.shooterId, data.x, data.y, data.dx, data.dy);
            break;

        case 'playerHit':
            window.game.handlePlayerHit(data.targetId, data.x, data.y);
            break;

        default:
            console.warn('Unknown message type:', data.type);
    }
}


// Attempt reconnection if WebSocket closes unexpectedly
function reconnectWebSocket() {
    console.log('Reconnecting to WebSocket...');
    setTimeout(() => {
        initializeWebSocket();
    }, 3000); // Reconnect after 3 seconds
}

// Handle server initializing this player
function handleInitialize(data) {
    playerId = data.id;
    window.game.initializePlayer(data.id, data.x, data.y); // Notify the game logic
    console.log(`Player initialized: ID = ${playerId}, X = ${data.x}, Y = ${data.y}`);
}

// Handle a new player joining
function handleNewPlayer(data) {
    window.game.initializePlayer(data.id, data.x, data.y); // Notify the game logic
    console.log(`New player joined: ID = ${data.id}, X = ${data.x}, Y = ${data.y}`);
}

// Handle another player's movement
function handlePlayerMovement(data) {
    window.game.updatePlayerPosition(data.id, data.x, data.y); // Notify the game logic
}

// Handle a player's disconnection
function handlePlayerDisconnection(data) {
    window.game.removePlayer(data.id); // Notify the game logic
    console.log(`Player disconnected: ID = ${data.id}`);
}

// Sync with currently connected players
function handleCurrentPlayers(data) {
    for (const [id, position] of Object.entries(data.players)) {
        if (!players[id]) {
            window.game.initializePlayer(id, position.x, position.y);
        }
    }
    console.log('Synced current players:', data.players);
}

// Send player movement to the server
export function sendMoveData({ x, y }) {
    console.log(`Move data being sent: ${x}:${y}`)
    if (!playerId) {
        console.warn('Player ID is not set. Cannot send move data.');
        return;
    }

    if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.warn('WebSocket is not open. Move data not sent.');
        return;
    }

    const moveData = { type: 'move', x, y };
    socket.send(JSON.stringify(moveData));
}

// Function to send projectile data to the server
// Send projectile
export function sendProjectile(playerId, x, y, velocity) {
    const player = players[playerId];
    if (!player) {
        console.warn(`Cannot fire: Player with ID ${playerId} does not exist.`);
        console.log('Current player IDs:', Object.keys(players));
        console.log('Player lookup failed for ID:', playerId);
        return;
    }

    window.socket?.send(
        JSON.stringify({
            type: 'fireProjectile',
            shooterId: playerId,
            x,
            y,
            dx: velocity.dx,
            dy: velocity.dy,
        })
    );
}

// Export player ID for use in game logic
export function getPlayerId() {
    return playerId;
}