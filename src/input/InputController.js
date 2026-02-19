/**
 * Input Controller
 * Handles mouse input for snake steering
 */

import CONFIG from '../config.js';

class InputController {
    constructor() {
        // Mouse tracking
        this.mouseX = 0;
        this.mouseY = 0;
        this.previousMouseX = 0;
        this.previousMouseY = 0;
        
        // Rotation values
        this.yaw = 0;
        this.pitch = 0;
        
        // Controls
        this.keys = {};
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // TODO: Add mouse move event listener
        // TODO: Add mouse down/up event listeners for clicking
        // TODO: Add keyboard event listeners for pause, etc.
    }
    
    onMouseMove(event) {
        // TODO: Update mouse position
        // TODO: Calculate yaw and pitch delta
    }
    
    onMouseDown(event) {
        // TODO: Handle mouse down events
    }
    
    onMouseUp(event) {
        // TODO: Handle mouse up events
    }
    
    onKeyDown(event) {
        // TODO: Track key down state
        // Handle pause, restart, etc.
    }
    
    onKeyUp(event) {
        // TODO: Track key up state
    }
    
    getRotation() {
        // TODO: Return current yaw and pitch
        return { yaw: this.yaw, pitch: this.pitch };
    }
    
    isKeyPressed(key) {
        // TODO: Return if a key is currently pressed
        return this.keys[key] || false;
    }
    
    resetMouse() {
        // TODO: Reset mouse position tracking
    }
    
    dispose() {
        // TODO: Remove all event listeners
    }
}

export default InputController;
