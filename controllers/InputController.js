
class InputController {
    /**
     * @param {PlayerController} playerController - The PlayerController instance for player-related actions.
     * @param {ProjectileController} projectileController - The ProjectileController instance for projectile-related actions.
     */
    constructor(playerController, projectileController) {
        if (!playerController || !projectileController) {
            throw new Error('InputController requires valid PlayerController and ProjectileController instances.');
        }
        this.playerController = playerController;
        this.projectileController = projectileController;
    }

    /**
     * Sets up event listeners for handling keyboard input.
     */
    setupInputListeners() {
        document.addEventListener('keydown', this.handleKeyInput.bind(this));
        document.addEventListener('keyup', this.handleKeyRelease.bind(this));
    }

    /**
     * Handles key press events for player actions like movement and firing projectiles.
     * @param {KeyboardEvent} event - The keydown event object.
     */
    handleKeyInput(event) {
        const playerId = this.playerController.getLocalPlayerId(); // Get the local player's ID
        const player = this.playerController.getPlayer(playerId); // Get the player instance

        if (!player) return; // Exit if the player doesn't exist

        switch (event.key) {
            case 'ArrowUp': // Jump
                player.model.jump();
                break;
            case 'ArrowDown': // Move down
                player.model.move(0, 10);
                break;
            case 'ArrowLeft': // Move left
                player.model.move(-10, 0);
                break;
            case 'ArrowRight': // Move right
                player.model.move(10, 0);
                break;
            case ' ': // Fire projectile
                this.projectileController.fireProjectile(
                    playerId,
                    player.model.x,
                    player.model.y,
                    10, // Example horizontal velocity
                    0   // Example vertical velocity
                );
                break;
            default:
                break; // Ignore unrecognized keys
        }
    }

    /**
     * Handles key release events to stop player movement.
     * @param {KeyboardEvent} event - The keyup event object.
     */
    handleKeyRelease(event) {
        const playerId = this.playerController.getLocalPlayerId(); // Get the local player's ID
        const player = this.playerController.getPlayer(playerId); // Get the player instance

        if (!player) return; // Exit if the player doesn't exist

        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            player.model.stop(); // Stop horizontal movement
        }
    }
}

export default InputController;