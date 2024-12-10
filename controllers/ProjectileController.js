import Projectile from '../models/Projectile.js';
import ProjectileView from '../views/ProjectileView.js';
import eventEmitter from '../client/GameEventEmitter.js';
import { GAME_SETTINGS } from '../utils/settings.js';

class ProjectileController {
    constructor(gameContainer, containerWidth, containerHeight, markNeedsUpdate, getPlayerId) {
        if (!gameContainer || !markNeedsUpdate || !getPlayerId) {
            throw new Error('ProjectileController requires valid gameContainer, markNeedsUpdate, and getPlayerId function.');
        }
        this.gameContainer = gameContainer;
        this.containerWidth = containerWidth || GAME_SETTINGS.CONTAINER_WIDTH;
        this.containerHeight = containerHeight || GAME_SETTINGS.CONTAINER_HEIGHT;
        this.projectiles = {}; // Store projectiles with their model and view

        this.markNeedsUpdate = markNeedsUpdate; // Pass the batching mechanism from GameController
        this.getPlayerId = getPlayerId; // Function to get the current player's ID

        this.setupEventListeners();
    }
    startProjectileMovement() {
        const moveProjectiles = () => {
            Object.entries(this.projectiles).forEach(([id, { model, view }]) => {
                const stillActive = model.move(); // Move the projectile
                if (!stillActive) {
                    console.log(`Removing inactive projectile ${id}`);
                    view.remove(); // Remove visual representation
                    delete this.projectiles[id]; // Clean up memory
                } else {
                    console.log(`Projectile ${id} position: (${model.x}, ${model.y})`); // Debug log
                    view.updatePosition(); // Update the visual position
                }
            });
    
            // Schedule the next movement update
            requestAnimationFrame(moveProjectiles);
        };
    
        requestAnimationFrame(moveProjectiles);
    }
    

    fireProjectile(playerId, x, y, dx, dy) {
        const projectileId = `${playerId}-${Date.now()}`;
        const projectile = new Projectile(
            projectileId,
            playerId,
            x,
            y,
            dx,
            dy,
            this.containerWidth,
            this.containerHeight
        );
        // Instantiate
        const projectileView = new ProjectileView(projectile, this.gameContainer);
        // Store
        this.projectiles[projectileId] = { model: projectile, view: projectileView };

        // Emit an event for the newly created projectile
        eventEmitter.emit(Projectile.EVENTS.PROJECTILE_FIRED, {
            id: projectileId,
            ownerId: playerId,
            x,
            y,
            dx,
            dy,
        });
        // Mark for batch update
        this.markNeedsUpdate(projectileView);
    }

    handleProjectileMoved({ id }) {
        const { view } = this.projectiles[id] || {};
        if (view) {
            console.log(`Projectile ${id} moved.`);
            this.markNeedsUpdate(view); // Batch update the view
        } else {
            console.warn(`Projectile ${id} not found during movement.`);
        }
    }

    handleProjectileOutOfBounds({ id }) {
        const { view } = this.projectiles[id] || {};
        if (view) {
            console.log(`Projectile ${id} went out of bounds.`);
            view.remove(); // Remove from the DOM
        } else {
            console.warn(`Projectile ${id} not found when handling out-of-bounds.`);
        }
        delete this.projectiles[id]; // Clean up state
    }

    handleProjectileCollision({ id }) {
        const { view } = this.projectiles[id] || {};
        if (view) {
            console.log(`Projectile ${id} collided.`);
            view.remove(); // Remove from the DOM
        } else {
            console.warn(`Projectile ${id} not found during collision handling.`);
        }
        delete this.projectiles[id]; // Clean up state
    }

    setupEventListeners() {
        eventEmitter.on(Projectile.EVENTS.PROJECTILE_MOVED, this.handleProjectileMoved.bind(this));
        eventEmitter.on(Projectile.EVENTS.PROJECTILE_OUT_OF_BOUNDS, this.handleProjectileOutOfBounds.bind(this));
        eventEmitter.on(Projectile.EVENTS.PROJECTILE_COLLISION, this.handleProjectileCollision.bind(this));
    }
}

export default ProjectileController;