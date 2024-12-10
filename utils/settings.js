const gameContainer = document.getElementById('game-container');
// TO-DO: Fix this so all settings are updated once DOM is fully loaded. 
export const GAME_SETTINGS = {
    CONTAINER_WIDTH: gameContainer.clientWidth,
    CONTAINER_HEIGHT: gameContainer.clientHeight,
    BORDER_THICKNESS: 30, // Match the CSS border size
    PLAYER: {
        DEFAULT_WIDTH: 30,
        DEFAULT_HEIGHT: 30,
        DEFAULT_HEALTH: 3,
        // Velocities yet to be implemented
        DEFAULT_X_VELOCITY: 5,  // Default horizontal velocity
        DEFAULT_Y_VELOCITY: 0,  // Default vertical velocity
        COLORS: {
            LOCAL: '#00ff00', // Green for local player
            REMOTE: '#ff0000', // Red for others
        },
    },
    PROJECTILE: {
        DEFAULT_WIDTH: 10,
        DEFAULT_HEIGHT: 10,
        DEFAULT_SPEED: 5,
        // Velocities yet to be implemented
        DEFAULT_X_VELOCITY: 5,  // Default horizontal velocity
        DEFAULT_Y_VELOCITY: 0,  // Default vertical velocity
    },
    // Add other global settings here as needed
};

export function reloadSettings() {
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) {
        console.error('[Settings] Game container not found in DOM.');
        return;
    }

    GAME_SETTINGS.CONTAINER_WIDTH = gameContainer.clientWidth;
    GAME_SETTINGS.CONTAINER_HEIGHT = gameContainer.clientHeight;
    const borderThickness = 30;
    GAME_SETTINGS.BORDER_THICKNESS = borderThickness;

    console.log('[Settings] Reloaded game settings:', GAME_SETTINGS);
}
