/**
 * Camera Controller
 * Manages third-person camera following the snake
 */

import * as THREE from 'three';
import CONFIG from '../config.js';

class CameraController {
    constructor(camera, target) {
        this.camera = camera;
        this.target = target; // The snake's head position
        
        // Camera state
        this.position = new THREE.Vector3();
        this.lookAtPoint = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        
        // Control parameters
        this.followDistance = CONFIG.camera.followDistance;
        this.followHeight = CONFIG.camera.followHeight;
        this.lookAheadDistance = CONFIG.camera.lookAheadDistance;
        this.lerpFactor = 0.1; // Smoothing factor
        
        // Shake effect
        this.shakeIntensity = 0;
        this.shakeDecay = 0.95;
    }
    
    update(deltaTime) {
        // TODO: Update camera position to follow snake
        // TODO: Apply lerp smoothing to position
        // TODO: Update camera target (look-at point)
        // TODO: Handle camera shake effect
    }
    
    applyShake(intensity) {
        // TODO: Apply camera shake effect with given intensity
        // Used when cube breaks or major events occur
    }
    
    setTarget(targetPosition) {
        // TODO: Set the target position for camera to follow
    }
    
    getWorldDirection() {
        // TODO: Return the direction the camera is looking
    }
    
    dispose() {
        // TODO: Clean up camera controller
    }
}

export default CameraController;
