/**
 * Snake Entity
 * Represents the player-controlled snake
 */

import * as THREE from 'three';
import CONFIG from '../config.js';

class Snake {
    constructor(startPosition = new THREE.Vector3(0, 0, 0)) {
        this.position = startPosition.clone();
        this.direction = new THREE.Vector3(0, 0, 1); // Forward direction
        this.velocity = CONFIG.snake.initialSpeed;
        
        // Snake segments
        this.segments = []; // Array of segment meshes
        this.segmentPositions = []; // Array of Vector3 positions
        this.length = CONFIG.snake.initialLength;
        this.radius = CONFIG.snake.initialRadius;
        
        // Rotation
        this.yaw = 0;
        this.pitch = 0;
        
        // Group for all snake meshes
        this.group = new THREE.Group();
        
        // Head reference
        this.head = null;
    }
    
    initialize() {
        // TODO: Create snake segments
        // TODO: Initialize segment positions
        // TODO: Create meshes for each segment
    }
    
    update(deltaTime, inputRotation) {
        // TODO: Update snake rotation based on input
        // TODO: Update snake position based on velocity
        // TODO: Update segment positions to follow head
        // TODO: Update segment meshes
    }
    
    move(direction, deltaTime) {
        // TODO: Move snake in given direction
        // TODO: Update all segment positions
    }
    
    addSegment() {
        // TODO: Add a new body segment
        // TODO: Update length
        // TODO: Increase radius slightly
    }
    
    setVelocity(speed) {
        // TODO: Update snake speed
    }
    
    getSegments() {
        // TODO: Return all segment meshes
        return this.segments;
    }
    
    getHeadPosition() {
        // TODO: Return head position
        return this.position.clone();
    }
    
    getHeadMesh() {
        // TODO: Return head mesh
        return this.head;
    }
    
    getGroup() {
        return this.group;
    }
    
    dispose() {
        // TODO: Dispose of all segment geometries and materials
        // TODO: Remove group from scene
    }
}

export default Snake;
