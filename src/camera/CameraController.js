/**
 * Camera Controller
 * Manages third-person camera following the snake
 */

import * as THREE from 'three';
import CONFIG from '../config.js';

class CameraController {
    constructor(camera, inputController) {
        this.camera = camera;
        this.inputController = inputController;
        
        // Camera state
        this.position = new THREE.Vector3(0, 10, 20);
        this.lookAtPoint = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3();
        
        // Control parameters
        this.followDistance = CONFIG.camera.followDistance;
        this.followHeight = CONFIG.camera.followHeight;
        this.lookAheadDistance = CONFIG.camera.lookAheadDistance;
        this.lerpFactor = 0.1; // Smoothing factor
        
        // Shake effect
        this.shakeIntensity = 0;
        this.shakeDecay = 0.95;
        
        // Current target to follow
        this.targetPosition = new THREE.Vector3(0, 0, 0);
        
        this.updateCamera();
    }
    
    update(deltaTime) {
        // Get rotation from input controller
        const { yaw, pitch } = this.inputController.getRotation();
        
        // Calculate camera position based on yaw and pitch rotation
        const distance = this.followDistance;
        const height = this.followHeight;
        
        // Convert yaw and pitch to Cartesian coordinates
        const horizontalDistance = distance * Math.cos(pitch);
        const verticalOffset = distance * Math.sin(pitch) + height;
        
        const desiredX = this.targetPosition.x + horizontalDistance * Math.sin(yaw);
        const desiredY = this.targetPosition.y + verticalOffset;
        const desiredZ = this.targetPosition.z + horizontalDistance * Math.cos(yaw);
        
        // Lerp camera position for smooth movement
        this.position.x += (desiredX - this.position.x) * this.lerpFactor;
        this.position.y += (desiredY - this.position.y) * this.lerpFactor;
        this.position.z += (desiredZ - this.position.z) * this.lerpFactor;
        
        // Look ahead with offset
        const lookAheadX = this.targetPosition.x + this.lookAheadDistance * Math.sin(yaw);
        const lookAheadY = this.targetPosition.y;
        const lookAheadZ = this.targetPosition.z + this.lookAheadDistance * Math.cos(yaw);
        
        this.lookAtPoint.set(lookAheadX, lookAheadY, lookAheadZ);
        
        // Apply camera shake effect
        if (this.shakeIntensity > 0.001) {
            const shakeX = (Math.random() - 0.5) * 2 * this.shakeIntensity;
            const shakeY = (Math.random() - 0.5) * 2 * this.shakeIntensity;
            const shakeZ = (Math.random() - 0.5) * 2 * this.shakeIntensity;
            
            this.camera.position.set(
                this.position.x + shakeX,
                this.position.y + shakeY,
                this.position.z + shakeZ
            );
            
            this.shakeIntensity *= this.shakeDecay;
        } else {
            this.camera.position.copy(this.position);
        }
        
        this.camera.lookAt(this.lookAtPoint);
    }
    
    applyShake(intensity) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    }
    
    setTarget(targetPosition) {
        this.targetPosition.copy(targetPosition);
    }
    
    getWorldDirection() {
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        return direction;
    }
    
    updateCamera() {
        this.camera.position.copy(this.position);
        this.camera.lookAt(this.lookAtPoint);
    }
    
    dispose() {
        // Camera controller doesn't own any resources that need cleanup
    }
}

export default CameraController;
