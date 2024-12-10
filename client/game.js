import GameController from '../controllers/GameController.js';
import { initializeWebSocket } from './websocket.js';
import { GAME_SETTINGS, reloadSettings } from '../utils/settings.js';

document.addEventListener('DOMContentLoaded', () => {
    // Reload settings based on the current state of the DOM
    reloadSettings();

    const gameContainer = document.getElementById('game-container');
    const playButton = document.getElementById('play-button');

    // Initialize WebSocket and create the WebSocket manager
    const websocketManager = initializeWebSocket();

    // Create the GameController and pass the websocketManager
    const gameController = new GameController(gameContainer, GAME_SETTINGS.CONTAINER_WIDTH, GAME_SETTINGS.CONTAINER_HEIGHT, websocketManager);

    // Set up the Play button click listener
    playButton.addEventListener('click', () => {
        startGame(gameController);
    });
});

/**
 * Starts the game and initializes the player's instance in the game room.
 * @param {GameController} gameController - The GameController instance to manage the game.
 */
function startGame(gameController) {
    // Hide the menu and initialize the player
    hideMenu();

    // Initialize the player's instance
    const localPlayerId = gameController.playerController.initializePlayer(true);

    // Emit an event to notify other clients about this new player (via WebSocket)
    gameController.websocketManager.emitEvent('newPlayer', { playerId: localPlayerId });
}

function hideMenu() {
    const menu = document.getElementById('menu');
    if (menu) {
        menu.style.display = 'none';
    } else {
        console.warn('[Game] Menu element not found. Cannot hide menu.');
    }
}