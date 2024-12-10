import { GAME_SETTINGS } from '../utils/settings.js';

class ProjectileView {
    /**
     * @param {Projectile} projectile - The Projectile model.
     * @param {HTMLElement} gameContainer - The DOM container for the game.
     * @param {Function} getPlayerId - A function to retrieve the local player's ID.
     */
    constructor(projectile, gameContainer, getPlayerId) {
        this.projectile = projectile; // Reference to the Projectile model
        this.element = document.createElement('div');
        this.element.className = 'projectile';
        this.element.style.position = 'absolute';
        this.element.style.width = `${projectile.width}px` || `${GAME_SETTINGS.PROJECTILE.DEFAULT_WIDTH}px`;
        this.element.style.height = `${projectile.height}px` || `${GAME_SETTINGS.PROJECTILE.DEFAULT_HEIGHT}px`;
        // Color based on ownership
        const localPlayerId = getPlayerId;
        this.element.style.backgroundColor =
            projectile.ownerId === localPlayerId ? 'yellow' : 'orange'; // Yellow for local player, orange for others
        gameContainer.appendChild(this.element);

        this.needsUpdate = false; // Flag for batching updates
        this.update(); // Start the animation loop

        this.updatePosition(); // Initial position
    }

    /**
     * Signals that the projectile's view needs to update its position.
     */
    updatePosition() {
        this.needsUpdate = true; // Mark that an update is required
    }

    /**
     * Updates the projectile's position in the DOM.
     * Uses transform for efficient rendering.
     */
    update() {
        if (this.needsUpdate) {
            const transform = `translate(${this.projectile.x}px, ${this.projectile.y}px)`;
            this.element.style.transform = transform; // Use transform for efficient rendering
            this.needsUpdate = false;
        }

        // Schedule the next frame update
        requestAnimationFrame(this.update.bind(this));
    }


    /**
     * Removes the projectile view from the DOM.
     */
    remove() {
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }

    /**
     * Retrieves the ID of the associated projectile.
     * @returns {string} The projectile's ID.
     */
    getProjectileId() {
        return this.projectile.id;
    }
}

export default ProjectileView;