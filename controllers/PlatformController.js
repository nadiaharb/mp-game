import Platform from '../models/Platform.js';
import PlatformView from '../views/PlatformView.js';
import eventEmitter from '../client/GameEventEmitter.js';
import EVENTS from '../models/Player.js'

class PlatformController {
    constructor(gameContainer, containerWidth, containerHeight) {
        this.gameContainer = gameContainer;
        this.containerWidth = containerWidth;
        this.containerHeight = containerHeight;
        this.platforms = {}; // Store platforms by their ID
    }

    // Create a new platform
    createPlatform(x, y, width, height, color) {
        const platformId = `platform-${Date.now()}`;
        const platform = new Platform(x, y, width, height, color);
        const platformView = new PlatformView(platform, this.gameContainer);

        this.platforms[platformId] = { model: platform, view: platformView };
    }

    // Remove a platform by its ID
    removePlatform(id) {
        const platform = this.platforms[id];
        if (platform) {
            platform.view.remove(); // Remove the view from the DOM
            delete this.platforms[id]; // Remove platform from the controller's state
        }
    }

    // Optional: Generate random platforms for testing
    generateRandomPlatforms() {
        const numPlatforms = 5; // Number of platforms to generate
        const minPlatformWidth = 50;
        const maxPlatformWidth = 150;
        const platformHeight = 20; // Fixed height for simplicity
        const minGap = 50; // Minimum horizontal/vertical gap between platforms
        const maxVerticalGap = 200; // Maximum vertical gap for accessibility
        const platforms = [];
    
        for (let i = 0; i < numPlatforms; i++) {
            let x, y, width;
            let validPosition = false;
    
            // Attempt to find a valid position for the new platform
            while (!validPosition) {
                width = Math.random() * (maxPlatformWidth - minPlatformWidth) + minPlatformWidth;
                x = Math.random() * (this.containerWidth - width);
                y = Math.random() * this.containerHeight;
    
                validPosition = true; // Assume position is valid
    
                // Check for overlap with existing platforms
                for (const platform of platforms) {
                    const horizontalOverlap = 
                        x < platform.x + platform.width + minGap &&
                        x + width + minGap > platform.x;
    
                    const verticalOverlap = 
                        y < platform.y + platformHeight + maxVerticalGap &&
                        y + platformHeight + minGap > platform.y;
    
                    if (horizontalOverlap && verticalOverlap) {
                        validPosition = false; // Overlap detected; position invalid
                        break;
                    }
                }
            }
    
            // Assign a random color
            const color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
    
            // Create and store the platform
            this.createPlatform(x, y, width, platformHeight, color);
            platforms.push({ x, y, width, height: platformHeight }); // Store for overlap checks
        }
    }
    
    // Optional: Generate a series of platforms across the screen (platforms will be static)
    generateSeriesOfPlatforms() {
        const platformWidth = 100;
        const platformHeight = 20;
        const platformGap = 150;

        let y = 100; // Start platforms at a fixed vertical position
        let x = 0;

        while (y < this.containerHeight) {
            this.createPlatform(x, y, platformWidth, platformHeight);
            x += platformGap;
            if (x + platformWidth > this.containerWidth) {
                break; // Avoid generating platforms beyond the right edge
            }
            y += 150; // Move the platforms down by a fixed amount
        }
    }
   
     // Check for platform collisions
     checkPlatformCollision(player) {
        let landedOnPlatform = false;
    
        console.log(`[DEBUG] Checking platform collisions for Player ID: ${player.id}`);
        console.log(`[DEBUG] Player position: x=${player.x}, y=${player.y}, dy=${player.dy}`);
    
        for (const platformId in this.platforms) {
            const platform = this.platforms[platformId].model;
    
            console.log(`[DEBUG] Checking platform: ${platformId} at x=${platform.x}, y=${platform.y}, width=${platform.width}, height=${platform.height}`);
    
            // Check if the player is within the horizontal bounds of the platform
            const horizontallyAligned =
                player.x + player.width > platform.x &&
                player.x < platform.x + platform.width;
    
            // Check if the player intersects with the platform vertically
            const verticallyAligned =
                player.y + player.height >= platform.y && // Player is at or below the platform
                player.y < platform.y + platform.height; // Player is not far below the platform
    
            if (horizontallyAligned && verticallyAligned) {
                console.log(`[DEBUG] Player intersects with platform: ${platformId}`);
    
                // Allow landing only when falling or when `dy >= 0`
                if (player.dy >= 0 && player.y + player.height <= platform.y + player.dy) {
                    console.log(`[DEBUG] Collision detected with platform: ${platformId}. Landing.`);
                    player.y = platform.y - player.height; // Snap to platform
                    player.dy = 0; // Reset vertical velocity
                    player.isJumping = false;
                    player.isOnGround = true;
    
                    // Emit landing event
                    eventEmitter.emit(EVENTS.PLAYER_LANDED, { 
                        playerId: player.id, 
                        x: player.x, 
                        y: player.y, 
                        dx: player.dx, 
                        dy: player.dy 
                    });
    
                    landedOnPlatform = true;
                    break; // Stop further checks once a platform collision is resolved
                }
            } else {
                console.log(`[DEBUG] No collision with platform: ${platformId}`);
            }
        }
    
        // If no platform collision is detected, player is still falling
        if (!landedOnPlatform) {
            console.log(`[DEBUG] Player is not on any platform.`);
            player.isOnGround = false;
        }
    
        return landedOnPlatform;
    }
    
    
    
    
}


export default PlatformController