import { clampPosition } from '../utils/helpers.js';
import eventEmitter from '../client/GameEventEmitter.js';
import Projectile from './Projectile.js'; // Import the new Projectile class
import { GAME_SETTINGS } from '../utils/settings.js';


// Event constants
const EVENTS = {
    PLAYER_STARTED_MOVING: 'playerStartedMoving',
    PLAYER_STOPPED: 'playerStopped',
    PLAYER_JUMPING: 'playerJumping',
    PLAYER_LANDED: 'playerLanded',
    HEALTH_UPDATE: 'healthUpdate',
    PLAYER_REMOVED: 'playerRemoved',
    PROJECTILE_FIRED: 'projectileFired',
    COLLISION: 'collision',
};

class Player {
    constructor(id, x, y, health = GAME_SETTINGS.PLAYER.DEFAULT_HEALTH, containerHeight, containerWidth) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.dx = 0; // Horizontal velocity
        this.dy = 0; // Vertical velocity
        this.width = GAME_SETTINGS.PLAYER.DEFAULT_WIDTH;
        this.height = GAME_SETTINGS.PLAYER.DEFAULT_HEIGHT;
        this.containerWidth = containerWidth || GAME_SETTINGS.CONTAINER_WIDTH;
        this.containerHeight = containerHeight || GAME_SETTINGS.CONTAINER_HEIGHT;
        this.health = health;
        this.isJumping = false;
        this.isOnGround = false;
        this.platformController = null;  // We will set the platform controller later
    }

    setPlatformController(platformController) {
        this.platformController = platformController;
    }

    move(dx, dy) {
        this.dx = dx; // Update horizontal velocity
        this.dy = dy; // Update vertical velocity

        this.x = clampPosition(this.x + dx, 0, this.containerWidth - this.width);
        this.y = clampPosition(this.y + dy, 0, this.containerHeight - this.height);

        eventEmitter.emit(EVENTS.PLAYER_STARTED_MOVING, { playerId: this.id, x: this.x, y: this.y, dx: this.dx, dy: this.dy, });
    }

    stop() {
        const wasMoving = this.dx !== 0 || this.dy !== 0;
        this.dx = 0; // Reset horizontal velocity
        this.dy = 0; // Optionally reset vertical velocity (if falling, leave `dy` unchanged)

        if (wasMoving) {
            eventEmitter.emit(EVENTS.PLAYER_STOPPED, { playerId: this.id, x: this.x, y: this.y, dx: this.dx, dy: this.dy, });
        }
    }

    jump(initialDy = -20) {
        if (this.isJumping) return;
    
        this.isJumping = true;
        // Initialize vertical velocity
        this.dy = initialDy;
        const gravity = 0.5; // Reduced gravity to slow down falling
        const groundLevel = GAME_SETTINGS.CONTAINER_HEIGHT - this.height - 2; // Subtract player height
        const topBoundary = GAME_SETTINGS.BORDER_THICKNESS - 30; // Top boundary
    
        const jumpStep = () => {
            // Update position based on current velocity
            this.x = clampPosition(this.x + this.dx, 0, this.containerWidth - this.width);
            this.y += this.dy;
    
            // Apply gravity
            this.dy += gravity;
    
            // Log the player's position and velocity for debugging
            console.log(`Player position: x: ${this.x}, y: ${this.y}, dy: ${this.dy}`);
        
            // Check platform collision
            if (this.platformController) {
                const landedOnPlatform = this.platformController.checkPlatformCollision(this);
                if (landedOnPlatform) {
                    console.log("Player landed on a platform.");
                    return; // Exit the jump loop if landed on a platform
                }
            }
    
            // Emit position update
            eventEmitter.emit(EVENTS.PLAYER_JUMPING, { 
                playerId: this.id, 
                x: this.x, 
                y: this.y, 
                dx: this.dx, 
                dy: this.dy 
            });
    
            // Check if player has landed on the ground
            if (this.y >= groundLevel) {
                this.y = groundLevel;
                this.dy = 0;
                this.isJumping = false;
                this.isOnGround = true;
    
                // Emit ground landing event
                eventEmitter.emit(EVENTS.PLAYER_LANDED, { 
                    playerId: this.id, 
                    x: this.x, 
                    y: this.y, 
                    dx: this.dx, 
                    dy: this.dy 
                });
                console.log("Player has hit the ground.");
            } else {
                // Continue the jump
                requestAnimationFrame(jumpStep);
            }
        };
    
        // Update position every 50ms
        requestAnimationFrame(jumpStep);
    }
    
    
    takeDamage(amount) {
        this.health -= amount;
        eventEmitter.emit(EVENTS.HEALTH_UPDATE, { playerId: this.id, health: this.health, dx: this.dx, dy: this.dy, });

        if (this.health <= 0) {
            eventEmitter.emit(EVENTS.PLAYER_REMOVED, { playerId: this.id });
        }
    }

    checkCollision({ id, ownerId, x, y }) {
        if (
            ownerId !== this.id && // Ignore projectiles fired by this player
            x >= this.x &&
            x <= this.x + this.width &&
            y >= this.y &&
            y <= this.y + this.height
        ) {
            // Emit a collision event
            eventEmitter.emit(EVENTS.COLLISION, { targetId: this.id, projectileId: id, dx: this.dx, dy: this.dy, });
            // Update health locally
            this.takeDamage(1);
        }
    }

    shoot(dx, dy) {
        const projectileX = this.x + this.width / 2; // Center projectile on the player
        const projectileY = this.y; // Start just above the player

        const projectile = new Projectile(this.id, projectileX, projectileY, dx, dy);

        // Emit an event for the newly created projectile
        eventEmitter.emit(EVENTS.PROJECTILE_FIRED, {
            id: projectile.id,
            ownerId: this.id,
            x: projectile.x,
            y: projectile.y,
            dx: projectile.dx,
            dy: projectile.dy,
        });

        return projectile;
    }
}



Player.EVENTS = EVENTS;

export default Player