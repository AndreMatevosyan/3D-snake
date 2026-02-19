/**
 * Input Controller
 * Handles mouse input for snake steering with pointer lock for immediate control
 */

import CONFIG from '../config.js';

class InputController {
    constructor(canvas = document.body) {
        this.canvas = canvas;
        
        // Mouse tracking
        this.mouseX = 0;
        this.mouseY = 0;
        this.previousMouseX = 0;
        this.previousMouseY = 0;
        
        // Rotation values (yaw: horizontal, pitch: vertical)
        this.yaw = 0;
        this.pitch = 0;
        
        // Controls
        this.keys = {};
        
        // Pointer lock state
        this.isPointerLocked = false;
        
        // Bound handlers for proper removal
        this._boundMouseMove = this.onMouseMove.bind(this);
        this._boundMouseDown = this.onMouseDown.bind(this);
        this._boundMouseUp = this.onMouseUp.bind(this);
        this._boundKeyDown = this.onKeyDown.bind(this);
        this._boundKeyUp = this.onKeyUp.bind(this);
        this._boundPointerLockChange = this.onPointerLockChange.bind(this);
        this._boundRequestPointerLock = () => this.requestPointerLock();
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Pointer lock: click canvas to capture mouse for immediate control
        this.canvas.addEventListener('click', this._boundRequestPointerLock);
        document.addEventListener('pointerlockchange', this._boundPointerLockChange);
        
        // Mouse movement (works with pointer lock - movementX/Y) or fallback (clientX/Y delta)
        document.addEventListener('mousemove', this._boundMouseMove);
        document.addEventListener('mousedown', this._boundMouseDown);
        document.addEventListener('mouseup', this._boundMouseUp);
        
        // Keyboard
        document.addEventListener('keydown', this._boundKeyDown);
        document.addEventListener('keyup', this._boundKeyUp);
    }
    
    requestPointerLock() {
        if (!this.isPointerLocked && this.canvas.requestPointerLock) {
            this.canvas.requestPointerLock();
        }
    }
    
    exitPointerLock() {
        if (document.exitPointerLock) {
            document.exitPointerLock();
        }
    }
    
    onPointerLockChange() {
        this.isPointerLocked = document.pointerLockElement === this.canvas;
        if (!this.isPointerLocked) {
            this.resetMouse();
        }
    }
    
    onMouseMove(event) {
        const sensitivity = CONFIG.input.mouseSensitivity;
        const { maxPitch, minPitch } = CONFIG.input;
        
        let deltaX, deltaY;
        
        if (this.isPointerLocked) {
            // Pointer lock: use movementX/Y directly (delta in pixels)
            deltaX = event.movementX ?? 0;
            deltaY = event.movementY ?? 0;
        } else {
            // Fallback: compute delta from client position
            deltaX = event.clientX - this.previousMouseX;
            deltaY = event.clientY - this.previousMouseY;
        }
        
        this.previousMouseX = event.clientX;
        this.previousMouseY = event.clientY;
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
        
        // Apply rotation (Y axis up: deltaX = yaw, deltaY = pitch)
        this.yaw -= deltaX * sensitivity;
        this.pitch -= deltaY * sensitivity;
        
        // Clamp pitch to avoid flipping
        this.pitch = Math.max(minPitch, Math.min(maxPitch, this.pitch));
    }
    
    onMouseDown(event) {
        this.keys[`mouse${event.button}`] = true;
    }
    
    onMouseUp(event) {
        this.keys[`mouse${event.button}`] = false;
    }
    
    onKeyDown(event) {
        const key = event.code || event.key;
        this.keys[key] = true;
        
        // Prevent default for game keys
        if (['Space', 'KeyP', 'KeyR', 'Escape'].includes(key)) {
            event.preventDefault();
        }
        
        if (key === 'Escape' && this.isPointerLocked) {
            this.exitPointerLock();
        }
    }
    
    onKeyUp(event) {
        const key = event.code || event.key;
        this.keys[key] = false;
    }
    
    getRotation() {
        return { yaw: this.yaw, pitch: this.pitch };
    }
    
    isKeyPressed(key) {
        return this.keys[key] ?? false;
    }
    
    isMouseButtonPressed(button) {
        return this.keys[`mouse${button}`] ?? false;
    }
    
    resetMouse() {
        this.previousMouseX = this.mouseX;
        this.previousMouseY = this.mouseY;
    }
    
    dispose() {
        document.removeEventListener('mousemove', this._boundMouseMove);
        document.removeEventListener('mousedown', this._boundMouseDown);
        document.removeEventListener('mouseup', this._boundMouseUp);
        document.removeEventListener('keydown', this._boundKeyDown);
        document.removeEventListener('keyup', this._boundKeyUp);
        document.removeEventListener('pointerlockchange', this._boundPointerLockChange);
        this.canvas.removeEventListener('click', this._boundRequestPointerLock);
        
        if (this.isPointerLocked) {
            this.exitPointerLock();
        }
    }
}

export default InputController;
