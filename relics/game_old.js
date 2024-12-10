import { initializeWebSocket, sendMoveData, getPlayerId, sendProjectile } from '../client/websocket.js';

const gameContainer = document.getElementById('game-container');
const playButton = document.getElementById('play-button');  // Assuming a button with this ID exists
const optionsButton = document.getElementById('options-button');  // Assuming a button with this ID exists
const creditsButton = document.getElementById('credits-button');  // Assuming a button with this ID exists
const players = {}; // Tracks all players
const projectiles = {};

let gameStarted = false; // Prevent multiple game starts

// Attach game object to window for WebSocket communication
window.game = {
    initializePlayer,
    updatePlayerPosition,
    removePlayer,
    spawnProjectile,
    updateHealth,
    handlePlayerHit
};

// Event listener to start the game when the play button is clicked
playButton.addEventListener('click', () => {
    if (!gameStarted) {
        startGame();
    }
});


// Start the game and initialize WebSocket
function startGame() {
    console.log('Starting game...');
    gameStarted = true;
    hideMenuButtons();
    initializeWebSocket();
    console.log('Waiting for server to initialize the player...');
}

// Hide main menu buttons when the game starts
function hideMenuButtons() {
    document.getElementById('menu').style.display = 'none';
}

// Initialize player on joining the game
function initializePlayer(id, x, y, health = 3) {
    console.log(`Player initial position: ${x};${y}`)
    if (players[id]) return; // Avoid reinitializing an existing player

    const playerDiv = document.createElement('div');
    playerDiv.id = id;
    playerDiv.className = 'player';
    playerDiv.style.position = 'absolute';
    playerDiv.style.left = `${x}px`;
    playerDiv.style.top = `${y}px`;
    playerDiv.style.width = '30px'; // Example size
    playerDiv.style.height = '30px'; // Example size
    playerDiv.style.backgroundColor = id === getPlayerId() ? '#ff0000' : '#00ff00';

    const healthBar = createHealthBar();
    playerDiv.appendChild(healthBar);
    gameContainer.appendChild(playerDiv);

    players[id] = {
        element: playerDiv, healthBar, health, isJumping: false, x: x, y: y // Add jumping state };
    }
};

// Create a health bar for players
function createHealthBar() {
    const healthBar = document.createElement('div');
    healthBar.className = 'health-bar';
    healthBar.style.position = 'absolute';
    healthBar.style.bottom = '25px';
    healthBar.style.left = '0';
    healthBar.style.width = '20px';
    healthBar.style.height = '5px';
    healthBar.style.backgroundColor = 'green';
    return healthBar;
}

// Update player's position
function updatePlayerPosition(id, x, y) {
    const player = players[id];
    if (!player || !player.element) return;

    player.element.style.left = `${player.x}px`;
    player.element.style.top = `${player.y}px`;
}

// Remove a player from the DOM and tracking
function removePlayer(id) {
    const player = players[id];
    if (player) {
        gameContainer.removeChild(player.element);
        delete players[id];
    }
};

// Function to spawn and animate the projectile (called when receiving data from the server)
function spawnProjectile(shooterId, x, y, dx, dy) {
    const projectile = document.createElement('div');
    projectile.className = 'projectile';
    projectile.style.position = 'absolute';
    projectile.style.left = `${x}px`;
    projectile.style.top = `${y}px`;
    projectile.style.width = '10px';
    projectile.style.height = '10px';
    projectile.style.backgroundColor = 'yellow';
    gameContainer.appendChild(projectile);

    const projectileInterval = setInterval(() => {
        const currentX = parseInt(projectile.style.left, 10);
        const currentY = parseInt(projectile.style.top, 10);
        const newX = currentX + dx;
        const newY = currentY + dy;

        // Remove projectile if it goes out of bounds
        if (newX < 0 || newX > gameContainer.clientWidth || newY < 0 || newY > gameContainer.clientHeight) {
            gameContainer.removeChild(projectile);
            clearInterval(projectileInterval);
            return;
        }

        // Update projectile position
        projectile.style.left = `${newX}px`;
        projectile.style.top = `${newY}px`;

        // Check for collision with other players
        for (const [id, player] of Object.entries(players)) {
            if (id !== shooterId && isColliding(projectile, player.element)) {
                console.log(`Projectile hit player: ${id}`);
                gameContainer.removeChild(projectile);
                clearInterval(projectileInterval);

                // Notify server about the hit
                sendProjectile(shooterId, newX, newY, { dx: 0, dy: 0 }); // Notify server
                return;
            }
        }
    }, 50);
}

function handlePlayerHit(targetId, x, y) {
    const targetPlayer = players[targetId];
    if (!targetPlayer || !targetPlayer.element) return;

    // Flash the player to indicate a hit
    targetPlayer.element.style.backgroundColor = 'orange';
    setTimeout(() => {
        targetPlayer.element.style.backgroundColor =
            targetId === getPlayerId() ? '#ff0000' : '#00ff00';
    }, 300);

    showHitEffect(x, y); // Optionally, show a hit effect at the location
}

// Show a visual effect when a player is hit
function showHitEffect(x, y) {
    const hitEffect = document.createElement('div');
    hitEffect.className = 'hit-effect';
    hitEffect.style.position = 'absolute';
    hitEffect.style.left = `${x}px`;
    hitEffect.style.top = `${y}px`;
    hitEffect.style.width = '20px';
    hitEffect.style.height = '20px';
    hitEffect.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
    hitEffect.style.borderRadius = '50%';

    gameContainer.appendChild(hitEffect);

    setTimeout(() => {
        gameContainer.removeChild(hitEffect);
    }, 500);
}

// Helper function to parse position and ensure it's an integer
function parsePosition(value) {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed; // Default to 0 if invalid
}

// Helper function to clamp position within bounds
function clampPosition(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
// Handle keyboard input for player movement
document.addEventListener('keydown', (event) => {
    const playerId = getPlayerId();
    const player = players[playerId];

    if (!player || !player.element) {
        console.warn('Player not initialized or missing element.');
        return;
    }

    let dx = 0,
        dy = 0;

    switch (event.key) {
        case 'ArrowUp': dy = -10; break;
        case 'ArrowDown': dy = 10; break;
        case 'ArrowLeft': dx = -10; break;
        case 'ArrowRight': dx = 10; break;
        case 'V':
            console.log('Player firing projectile...');
            fireProjectile(playerId);
            return; // Skip position updates
        case ' ':
            if (!player.isJumping) {
                console.log('Player jumping...');
                player.isJumping = true;
                jump(playerId);
            }
            return;

        default: return;
    }
    // Debugging movement input
    console.log(`Player movement input: dx=${dx}, dy=${dy}`);

    // Parse and clamp positions to prevent "sliding" out of bounds
    // Update player's position in the state
    // Update player's position in the state
    const newX = clampPosition(player.x + dx, 0, gameContainer.clientWidth - 30);
    const newY = clampPosition(player.y + dy, 0, gameContainer.clientHeight - 30);

    player.x = newX; // Update state
    player.y = newY;

    // Reflect updated position in the DOM
    updatePlayerPosition(playerId, newX, newY);
    sendMoveData({ x: newX, y: newY });

    console.log(`Player moved to: (${newX}, ${newY})`);
});

// Gravity-based jump logic
function jump(playerId) {
    const player = players[playerId];
    if (!player || !player.element) return;

    let velocity = -20; // Initial upward velocity
    const gravity = 1; // Acceleration due to gravity
    const groundLevel = gameContainer.clientHeight - 30; // Assuming player size is 30px

    const jumpInterval = setInterval(() => {
        const currentY = player.element.offsetTop;
        const newY = currentY + velocity;
        velocity += gravity; // Gravity reduces upward velocity over time

        if (newY >= groundLevel) {
            // Player lands back on the ground
            player.element.style.top = `${groundLevel}px`;
            player.isJumping = false; // Allow jumping again
            clearInterval(jumpInterval);
        } else {
            // Update position mid-air
            player.element.style.top = `${Math.max(0, newY)}px`; // Prevent going above the game area
        }
    }, 50); // Smooth animation interval (50ms)
}

// Collision detection helper
function isColliding(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    return (
        rect1.left < rect2.right &&
        rect1.right > rect2.left &&
        rect1.top < rect2.bottom &&
        rect1.bottom > rect2.top
    );
}


function removeProjectile(projectileId) {
    const projectile = projectiles[projectileId];
    if (projectile) {
        gameContainer.removeChild(projectile.element);
        delete projectiles[projectileId];
    }
}

// Update health bar
function updateHealth(playerId) {
    const player = players[playerId];
    if (player && player.healthBar) {
        player.healthBar.style.width = `${(player.health / 3) * 100}%`;
        if (player.health <= 0) {
            // Display "Game Over" for the defeated player
            if (playerId === getPlayerId()) {
                alert('GAME OVER');
                window.location.reload(); // Reload the page for a "Play Again" option
            }
        }
    }
}

// Projectile logic
function fireProjectile(playerId) {
    const player = players[playerId];
    if (!player) return;

    const x = player.x + 15; // Start at player's center
    const y = player.y + 7.5;

    console.log(`Firing projectile from: (${x}, ${y})`);

    // Send projectile data to the server
    sendProjectile(playerId, x, y, { dx: 10, dy: 0 });

    // Spawn projectile locally for instant feedback
    spawnProjectile(playerId, x, y, 10, 0);
}

/*
// Handle incoming WebSocket messages
socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);

    switch (message.type) {
        case 'fireProjectile':
            // Server broadcasts projectile firing
            spawnProjectile(
                message.shooterId,
                message.x,
                message.y,
                message.dx,
                message.dy
            );
            break;

        case 'playerHit':
            // Reduce health and update health bar
            const hitPlayer = players[message.targetId];
            handlePlayerHit(data.targetId, data.x, data.y); // Fix later
            if (hitPlayer) {
                hitPlayer.health -= 1;
                updateHealth(message.targetId);

                if (hitPlayer.health <= 0) {
                    removePlayer(message.targetId);
                    if (message.targetId === getPlayerId()) {
                        alert('GAME OVER');
                        window.location.reload(); // Reload for "Play Again"
                    }
                }
            }
            break;

        default:
            console.warn('Unknown message type:', message.type);
    }
});
*/