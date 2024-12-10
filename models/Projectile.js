import eventEmitter from '../client/GameEventEmitter.js';
import { GAME_SETTINGS } from '../utils/settings.js';


// Event constants
const EVENTS = {
    PROJECTILE_MOVED: 'projectileMoved',
    PROJECTILE_OUT_OF_BOUNDS: 'projectileOutOfBounds',
    PROJECTILE_COLLISION: 'projectileCollision'
}


class Projectile {
    constructor(id, ownerId, x, y, dx = GAME_SETTINGS.PROJECTILE.DEFAULT_X_VELOCITY, dy = GAME_SETTINGS.PROJECTILE.DEFAULT_Y_VELOCITY,  containerWidth, containerHeight) {
        this.id = `${ownerId}-${Date.now()}`;
        this.ownerId = ownerId;
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.width = GAME_SETTINGS.PROJECTILE.DEFAULT_WIDTH;
        this.height = GAME_SETTINGS.PROJECTILE.DEFAULT_HEIGHT;
        this.containerWidth = containerWidth || GAME_SETTINGS.CONTAINER_WIDTH;
        this.containerHeight = containerHeight || GAME_SETTINGS.CONTAINER_HEIGHT;
    }

    move() {
        this.x += this.dx;
        this.y += this.dy;
        console.log(`Projectile ${this.id} moved to (${this.x}, ${this.y})`); 
        eventEmitter.emit(EVENTS.PROJECTILE_MOVED, { id: this.id, x: this.x, y: this.y });

        if (this.isOutOfBounds()) {
            eventEmitter.emit(EVENTS.PROJECTILE_OUT_OF_BOUNDS, { id: this.id });
            return false;
        }

        return true;
    }
    // consider optimizations 
    isOutOfBounds() {
       
        return (
            this.x < 0 ||
            this.y < 0 ||
            this.x > this.containerWidth || // Max resolution support
            this.y > this.containerHeight
        );
    }
    onCollision(targetPlayerId) {
        eventEmitter.emit(EVENTS.PROJECTILE_COLLISION, { id: this.id, targetPlayerId });

        // Consider stopping the projectile to prevent further movement (if needed)
        this.dx = 0;
        this.dy = 0;
    }
}

Projectile.EVENTS = EVENTS;
export default Projectile
// Export event constants for use in other modules