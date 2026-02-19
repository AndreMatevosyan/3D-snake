/**
 * Apple Entity
 * Represents an apple that the snake can eat
 */

import * as THREE from 'three';
import CONFIG from '../config.js';

class Apple {
    constructor(position = new THREE.Vector3(0, 0, 0)) {
        this.position = position.clone();
        this.mesh = null;
        
        // Animation
        this.rotation = 0;
        this.floatOffset = 0;
        this.time = 0;
    }
    
    initialize() {
        // TODO: Create apple mesh (red sphere)
        // TODO: Add to group or scene
    }
    
    spawn(position) {
        // TODO: Reset apple state and position
        // TODO: Make apple visible
    }
    
    update(deltaTime) {
        // TODO: Update apple rotation animation
        // TODO: Update floating animation
        // TODO: Update mesh position
    }
    
    getMesh() {
        // TODO: Return the apple mesh
        return this.mesh;
    }
    
    getPosition() {
        // TODO: Return apple world position
        return this.position.clone();
    }
    
    setPosition(position) {
        // TODO: Set apple position
    }
    
    dispose() {
        // TODO: Dispose of mesh geometry and material
    }
}

export default Apple;
