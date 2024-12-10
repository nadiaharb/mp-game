import Player from '../models/Player.js';
import PlayerView from '../views/PlayerView.js';
import { generatePlayerId, generateStartingPosition } from '../utils/helpers.js';
import eventEmitter from '../client/GameEventEmitter.js';
import { GAME_SETTINGS } from '../utils/settings.js';

class PlayerController {
    /**
     * @param {HTMLElement} gameContainer - The DOM element representing the game container.
     * @param {number} containerWidth - The width of the game container.
     * @param {number} containerHeight - The height of the game container.
     * @param {Function} markNeedsUpdate - A function to signal view updates.
     * @param {Function} getPlayerId - Function to retrieve the local player's ID.
     */
    constructor(gameContainer, containerWidth, containerHeight, markNeedsUpdate, getPlayerId) {
        if (!gameContainer || !markNeedsUpdate) {
            throw new Error('PlayerController requires a valid gameContainer and markNeedsUpdate function.');
        }

        this.gameContainer = gameContainer;
        this.containerWidth = containerWidth || GAME_SETTINGS.CONTAINER_WIDTH;
        this.containerHeight = containerHeight || GAME_SETTINGS.CONTAINER_HEIGHT;
        this.players = {};
        this.markNeedsUpdate = markNeedsUpdate; // Pass the batching mechanism from GameController
        this.getPlayerId = getPlayerId; // Function to retrieve the local player's ID
        this.localPlayerId = null; // Track the local player's ID

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Handle player movement event
        eventEmitter.on(Player.EVENTS.PLAYER_INITIALIZED, ({ playerId, x, y }) => {
            const { view } = this.players[playerId] || {};
            if (view) {
                console.log(`Player ${playerId} initialized: x=${x}, y=${y}`);
                this.markNeedsUpdate(view); // Batch the update
            }
        });

        eventEmitter.on(Player.EVENTS.PLAYER_STARTED_MOVING, ({ playerId, dx, dy }) => {
            const { view } = this.players[playerId] || {};
            if (view) {
                console.log(`Player ${playerId} started moving: dx=${dx}, dy=${dy}`);
                this.markNeedsUpdate(view); // Batch the update
            }
        });

        eventEmitter.on(Player.EVENTS.PLAYER_STOPPED, ({ playerId, x, y }) => {
            const { view } = this.players[playerId] || {};
            if (view) {
                console.log(`Player ${playerId} stopped at: (${x}, ${y})`);
                this.markNeedsUpdate(view); // Batch the update
            }
        });

        // Handle jumping-related events
        eventEmitter.on(Player.EVENTS.PLAYER_JUMPING, ({ playerId, x, y, dx, dy }) => {
            const { view } = this.players[playerId] || {};
            if (view) {
                console.log(`Player ${playerId} jumped at (${x}, ${y}) with velocity (${dx}, ${dy})`);
                this.markNeedsUpdate(view); // Batch the update
            }
        });

        eventEmitter.on(Player.EVENTS.PLAYER_LANDED, ({ playerId, x, y }) => {
            const { view } = this.players[playerId] || {};
            if (view) {
                console.log(`Player ${playerId} landed at (${x}, ${y})`);
                this.markNeedsUpdate(view); // Batch the update
            }
        });

        // Handle health updates
        eventEmitter.on(Player.EVENTS.HEALTH_UPDATE, ({ playerId, health }) => {
            const { view } = this.players[playerId];
            if (view) {
                console.log(`Player ${playerId} health updated to ${health}`);
                view.updateHealth(); // Immediate update for health bar
            }
        });

        // Handle player removal
        eventEmitter.on(Player.EVENTS.PLAYER_REMOVED, ({ playerId }) => {
            console.log(`Player ${playerId} removed`);
            this.removePlayer(playerId); // Remove player and clean up
        });
    }

    initializePlayer(isLocal = false) {
        // Generate a unique ID for the player
        const playerId = generatePlayerId();
        const { x, y } = generateStartingPosition(
            this.containerWidth,
            this.containerHeight,
            GAME_SETTINGS.PLAYER.DEFAULT_WIDTH,
            GAME_SETTINGS.PLAYER.DEFAULT_HEIGHT
        );
    
        // Create the player model and view
        const player = new Player(playerId, x, y, GAME_SETTINGS.PLAYER.DEFAULT_HEALTH, this.containerHeight, this.containerWidth);
    
        // Assign the platformController if available
        if (this.platformController) {
            player.setPlatformController(this.platformController);
        }
    
        const playerView = new PlayerView(player, this.gameContainer, this.getPlayerId);
    
        // Store player in the state
        this.players[playerId] = { model: player, view: playerView };
        
        // Mark as the local player if specified
        if (isLocal) {
            this.localPlayerId = playerId;
        }
    
        // Emit initialization event
        eventEmitter.emit(Player.EVENTS.PLAYER_INITIALIZED, { playerId, x, y });
    
        return playerId; // Return the new player's ID
    }
    

    removePlayer(playerId) {
        const { model, view } = this.players[playerId] || {};
        if (!model || !view) {
            console.warn(`Player with ID ${playerId} not found. Skipping removal.`);
            return;
        }

        // Remove view from DOM
        view.remove();

        // Remove player from state
        delete this.players[playerId];

        // Emit removal event
        eventEmitter.emit(Player.EVENTS.PLAYER_REMOVED, { playerId });
    }
    /* Old method used in GameController
    removePlayer(id) {
        const { model } = this.players[id];
        if (model) {
            eventEmitter.emit('playerRemoved', { playerId: id });
        }
    }*/

    /**
     * Retrieves the ID of the local player.
     * @returns {string|null} The local player's ID, or null if not set.
     */
    getLocalPlayerId() {
        return this.localPlayerId;
    }


    getPlayer(playerId) {
        return this.players[playerId] || null; // Safely retrieve a player
    }
    setPlatformController(platformController) {
        this.platformController = platformController;
    }
}

export default PlayerController;
