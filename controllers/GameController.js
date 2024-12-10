import InputController from './InputController.js';
import PlayerController from './PlayerController.js';
import ProjectileController from './ProjectileController.js';
import { GAME_SETTINGS } from '../utils/settings.js';
import PlatformController from './PlatformController.js'

class GameController {
    constructor(gameContainer, containerWidth, containerHeight, websocketManager) {
        if (!gameContainer || typeof containerWidth !== 'number' || typeof containerHeight !== 'number' || !websocketManager) {
            throw new Error('Invalid parameters passed to GameController');
        }
        this.gameContainer = gameContainer;
        this.containerWidth = containerWidth || GAME_SETTINGS.CONTAINER_WIDTH;
        this.containerHeight = containerHeight || GAME_SETTINGS.CONTAINER_HEIGHT;
        console.log(`Setting container dimensions: width=${containerWidth}, height=${containerHeight}`);

        this.websocketManager = websocketManager;

        this.needsUpdate = false;

        // Instantiate controllers
        this.playerController = new PlayerController(gameContainer, containerWidth, containerHeight, this.markNeedsUpdate.bind(this), websocketManager.getPlayerId);
        this.projectileController = new ProjectileController(gameContainer, this.containerWidth, this.containerHeight, this.markNeedsUpdate.bind(this), websocketManager.getPlayerId);
        this.inputController = new InputController(this.playerController, this.projectileController);

        // Instantiate PlatformController for platform management
        this.platformController = new PlatformController(gameContainer, containerWidth, containerHeight);

        // Set platform controller for player collisions
        this.playerController.setPlatformController(this.platformController);

        // Generate random platforms in the game world
        this.platformController.generateRandomPlatforms();  // <-- Use this method to generate platforms

        // Delegate input handling and event listeners
        this.inputController.setupInputListeners();
        this.projectileController.setupEventListeners();
        this.playerController.setupEventListeners();

        this.startRenderLoop();
    }

    markNeedsUpdate(view) {
        if (view) {
            this.needsUpdate = true; // Mark the global update flag
            console.log("[GameController] Marking view for update:", view);
        }
    }

    startRenderLoop() {
        const renderLoop = () => {
            if (this.needsUpdate) {
                Object.entries(this.playerController.players).forEach(([playerId, { model, view }]) => {
                    view.update(); // Update player views
                });

                // Only update the projectiles if needed
                Object.entries(this.projectileController.projectiles).forEach(([id, { view }]) => {
                    view.update(); // Ensure views are updated in the render loop
                });

                this.needsUpdate = false;
            }

            requestAnimationFrame(renderLoop); // Call the render loop again
        };

        this.projectileController.startProjectileMovement(); // Start projectile movement logic
        requestAnimationFrame(renderLoop);
    }
}


export default GameController; // Use default export


/*
setupEventListeners() {
        // View is accessed!
        const markNeedsUpdate = (view) => {
            if (view) {
                this.needsUpdate = true; // Mark the global update flag
            }
        };

        eventEmitter.on(Projectile.EVENTS.PROJECTILE_MOVED, ({ id }) => {
            const { view } = this.projectiles[id] || {};
            markNeedsUpdate(view);
        });

        eventEmitter.on(Projectile.EVENTS.PROJECTILE_OUT_OF_BOUNDS, ({ id }) => {
            const { view } = this.projectiles[id] || {};
            if (view) {
                view.remove();
            }
            delete this.projectiles[id];
        });

        eventEmitter.on(Projectile.EVENTS.PROJECTILE_COLLISION, ({ id, targetPlayerId }) => {
            const { view } = this.projectiles[id] || {};
            if (view) {
                view.remove();
            }
            delete this.projectiles[id];

            // Apply damage to the target player
            const { model } = this.players[targetPlayerId] || {};
            if (model) {
                model.takeDamage(1);
            }
        });

        // Player-related events
        eventEmitter.on(Player.EVENTS.PLAYER_STARTED_MOVING, ({ playerId, dx, dy }) => {
            console.log(`Player ${playerId} started moving: (${dx}, ${dy})`);
            const { view } = this.players[playerId] || {};
            markNeedsUpdate(view);
        });

        eventEmitter.on(Player.EVENTS.PLAYER_STOPPED, ({ playerId, x, y }) => {
            console.log(`Player ${playerId} stopped at (${x}, ${y})`);
            const { view } = this.players[playerId] || {};
            markNeedsUpdate(view);
        });

        eventEmitter.on(Player.EVENTS.PLAYER_JUMPING, ({ playerId, x, y, dx, dy }) => {
            console.log(`Player ${playerId} jumped at (${x}, ${y}) with velocity (${dx}, ${dy})`);
            const { view } = this.players[playerId] || {};
            markNeedsUpdate(view);
        });

        eventEmitter.on(Player.EVENTS.PLAYER_LANDED, ({ playerId, x, y }) => {
            console.log(`Player ${playerId} landed at (${x}, ${y})`);
            const { view } = this.players[playerId] || {};
            markNeedsUpdate(view);
        });

        // Health updates are updated individually due to lack of need to do this in batches
        eventEmitter.on(Player.EVENTS.HEALTH_UPDATE, ({ playerId, health }) => {
            console.log(`Player ${playerId} health updated to ${health}`);
            const { view } = this.players[playerId];
            if (view) {
                view.updateHealth();
            }
        });

        eventEmitter.on(Player.EVENTS.PLAYER_REMOVED, ({ playerId }) => {
            console.log(`Player ${playerId} removed.`);
            const { view } = this.players[playerId];
            if (view) {
                view.remove(); // Immediate removal
            }
            delete this.players[playerId];
        });

    }*/