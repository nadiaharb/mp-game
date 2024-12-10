import { GAME_SETTINGS } from '../utils/settings.js';

class PlayerView {
    /**
     * Creates a PlayerView instance.
     * @param {Object} player - The player model instance.
     * @param {HTMLElement} gameContainer - The DOM element representing the game container.
     * @param {Function} getPlayerId - A function to retrieve the local player's ID.
     */
    constructor(player, gameContainer, getPlayerId) {
        this.player = player; // Reference to the player model
        this.element = document.createElement('div');
        this.element.id = player.id;
        this.element.className = 'player';
        this.element.style.position = 'absolute';
        this.element.style.width = `${player.width}px` || `${GAME_SETTINGS.PLAYER.DEFAULT_WIDTH}px`;
        this.element.style.height = `${player.height}px` || `${GAME_SETTINGS.PLAYER.DEFAULT_HEIGHT}px`;
        this.element.style.backgroundColor =
            player.id === getPlayerId() ? GAME_SETTINGS.PLAYER.COLORS.LOCAL : GAME_SETTINGS.PLAYER.COLORS.REMOTE; // Green for local player, red for others
        gameContainer.appendChild(this.element);


        //this.update(); // Start the animation loop
        this.updateHealth(); // Initial health
    }

    animateJump() {
        // Placeholder for future animation logic
    }
    /**
     * Updates the player's position in the DOM. Necessity determined by controller, not view.
     */
    update() {
        //console.log(`[PlayerView] Updating player view for Player ID: ${this.player.id}`);
        console.log(`[PlayerView] Current position: X=${this.player.x}, Y=${this.player.y}`);

        const transform = `translate(${this.player.x}px, ${this.player.y}px)`;
        this.element.style.transform = transform;

        console.log(`[PlayerView] Transform applied: ${transform}`);
        this.needsUpdate = false;
        console.log(`[PlayerView] Update complete for Player ID: ${this.player.id}`);
    }
    /**
     * Updates the player's health representation in the DOM.
     */
    updateHealth() {
        this.element.style.opacity = this.player.health / 3; // Example: opacity decreases with health
    }
    /**
     * Removes the player view from the DOM.
     */
    remove() {
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

export default PlayerView;