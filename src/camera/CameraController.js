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
        this.targetDirection = new THREE.Vector3(0, 0, 1);

        this.updateCamera();
    }

    update() {
        const distance = this.followDistance;
        const height = this.followHeight;

        // Position camera behind the snake head (opposite to snake direction)
        const horizontalDir = new THREE.Vector3(
            this.targetDirection.x,
            0,
            this.targetDirection.z
        ).normalize();

        if (horizontalDir.lengthSq() < 0.01) {
            horizontalDir.set(0, 0, -1);
        }

        const desiredX = this.targetPosition.x - horizontalDir.x * distance;
        const desiredY = this.targetPosition.y + height;
        const desiredZ = this.targetPosition.z - horizontalDir.z * distance;

        // Lerp camera position for smooth movement
        this.position.x += (desiredX - this.position.x) * this.lerpFactor;
        this.position.y += (desiredY - this.position.y) * this.lerpFactor;
        this.position.z += (desiredZ - this.position.z) * this.lerpFactor;

        // Look at snake head, slightly ahead in its direction
        this.lookAtPoint.copy(this.targetPosition).addScaledVector(this.targetDirection, this.lookAheadDistance);
        
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
    
    setTarget(targetPosition, targetDirection) {
        this.targetPosition.copy(targetPosition);
        if (targetDirection) {
            this.targetDirection.copy(targetDirection);
        }
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
}

export default CameraController;
