class PlatformView {
    constructor(platform, gameContainer) {
        this.platform = platform; // The platform model
        this.element = document.createElement('div'); // The DOM element for the platform
        this.element.className = 'platform'; // Add CSS class for styling
        this.element.style.position = 'absolute'; // Absolute positioning

        // Initial platform positioning and dimensions
        this.updatePosition();

        gameContainer.appendChild(this.element); // Append to game container
    }

    updatePosition() {
        // Update position based on the platform model
        this.element.style.left = `${this.platform.x}px`;
        this.element.style.top = `${this.platform.y}px`;
        this.element.style.width = `${this.platform.width}px`;
        this.element.style.height = `${this.platform.height}px`;
        this.element.style.backgroundColor = this.platform.color; // Set the color
    }

    remove() {
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}


export default PlatformView