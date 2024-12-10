class Platform {
    constructor(x, y, width, height, color = '#654321') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color; // Default brown color for platforms
    }

    // Check if a player is colliding with the platform
    isColliding(player) {
        return (
            player.x < this.x + this.width &&
            player.x + player.width > this.x &&
            player.y + player.height <= this.y && // Player is above the platform
            player.y + player.height + player.dy >= this.y // Player is falling onto the platform
        );
    }
}



export default Platform