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
        const { segmentLength, initialRadius } = CONFIG.snake;

        // Initialize segment positions along the direction (head at front)
        for (let i = 0; i < this.length; i++) {
            const offset = this.direction.clone().multiplyScalar(-i * segmentLength);
            this.segmentPositions.push(this.position.clone().add(offset));
        }

        // Create meshes for each segment
        for (let i = 0; i < this.length; i++) {
            const isHead = i === 0;
            const segmentRadius = isHead ? this.radius * 1.2 : this.radius;

            const geometry = new THREE.SphereGeometry(segmentRadius, 16, 12);
            const material = new THREE.MeshStandardMaterial({
                color: isHead ? 0x44dd44 : 0x22aa22,
                metalness: 0.2,
                roughness: 0.6,
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.position.copy(this.segmentPositions[i]);

            this.segments.push(mesh);
            this.group.add(mesh);
        }

        this.head = this.segments[0];
    }
    
    update(deltaTime, inputRotation) {
        if (!inputRotation) return;

        this.yaw = inputRotation.yaw;
        this.pitch = inputRotation.pitch;
        this.updateDirection();
        this.move(this.direction, deltaTime);
    }

    updateDirection() {
        this.direction.x = Math.sin(this.yaw) * Math.cos(this.pitch);
        this.direction.y = Math.sin(this.pitch);
        this.direction.z = Math.cos(this.yaw) * Math.cos(this.pitch);
        this.direction.normalize();
    }

    move(direction, deltaTime) {
        const distance = this.velocity * deltaTime;
        this.position.addScaledVector(direction, distance);

        this.segmentPositions[0].copy(this.position);

        const { segmentLength } = CONFIG.snake;
        for (let i = 1; i < this.segmentPositions.length; i++) {
            const prev = this.segmentPositions[i - 1];
            const curr = this.segmentPositions[i];
            const toPrev = new THREE.Vector3().subVectors(prev, curr);
            const dist = toPrev.length();
            if (dist > 0.001) {
                toPrev.normalize();
                curr.copy(prev).addScaledVector(toPrev, -segmentLength);
            }
        }

        for (let i = 0; i < this.segments.length; i++) {
            this.segments[i].position.copy(this.segmentPositions[i]);
        }
    }

    addSegment() {
        const { segmentLength, radiusIncrement, maxRadius } = CONFIG.snake;
        const tail = this.segmentPositions[this.segmentPositions.length - 1];
        const prev = this.segmentPositions[this.segmentPositions.length - 2];
        const dir = new THREE.Vector3().subVectors(tail, prev).normalize();
        const newPos = tail.clone().addScaledVector(dir, -segmentLength);

        this.segmentPositions.push(newPos);
        this.radius = Math.min(this.radius + radiusIncrement, maxRadius);

        const geometry = new THREE.SphereGeometry(this.radius, 16, 12);
        const material = new THREE.MeshStandardMaterial({
            color: 0x22aa22,
            metalness: 0.2,
            roughness: 0.6,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.copy(newPos);

        this.segments.push(mesh);
        this.group.add(mesh);
        this.length++;
    }

    setVelocity(speed) {
        this.velocity = Math.min(speed, CONFIG.snake.maxSpeed);
    }

    getSegments() {
        return this.segments;
    }

    getHeadPosition() {
        return this.position.clone();
    }

    getDirection() {
        return this.direction.clone();
    }

    getHeadMesh() {
        return this.head;
    }

    getGroup() {
        return this.group;
    }

    dispose() {
        for (const segment of this.segments) {
            segment.geometry?.dispose();
            segment.material?.dispose();
        }
        this.segments = [];
        this.segmentPositions = [];
        this.head = null;
    }
}

export default Snake;
