/**
 * Snake Entity
 * Represents the player-controlled snake
 */

import * as THREE from 'three';
import CONFIG from '../config.js';
import { createSnakeTexture } from '../utils/Textures.js';

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

        // Shared texture for segments (created in initialize)
        this.snakeTexture = null;
    }
    
    initialize() {
        const { segmentLength, initialRadius } = CONFIG.snake;

        // Initialize segment positions along the direction (head at front)
        for (let i = 0; i < this.length; i++) {
            const offset = this.direction.clone().multiplyScalar(-i * segmentLength);
            this.segmentPositions.push(this.position.clone().add(offset));
        }

        this.snakeTexture = createSnakeTexture();
        const headMaterial = new THREE.MeshStandardMaterial({
            map: this.snakeTexture,
            color: 0x44dd44,
            metalness: 0.2,
            roughness: 0.6,
        });
        const bodyMaterial = new THREE.MeshStandardMaterial({
            map: this.snakeTexture,
            color: 0x22aa22,
            metalness: 0.2,
            roughness: 0.6,
        });
        const tongueMaterial = new THREE.MeshStandardMaterial({
            color: 0xdd4444,
            metalness: 0.1,
            roughness: 0.8,
        });
        const eyeMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            metalness: 0.2,
            roughness: 0.4,
        });

        // Create meshes for each segment
        for (let i = 0; i < this.length; i++) {
            const isHead = i === 0;

            if (isHead) {
                const headGroup = new THREE.Group();
                headGroup.position.copy(this.segmentPositions[i]);

                // Head body (elongated sphere - more snake-like)
                const headGeom = new THREE.SphereGeometry(this.radius * 1.15, 16, 12);
                const headMesh = new THREE.Mesh(headGeom, headMaterial);
                headMesh.scale.set(1, 1, 1.15);
                headMesh.castShadow = true;
                headMesh.receiveShadow = true;
                headGroup.add(headMesh);

                // Eyes (2 black spheres, on front -Z)
                const eyeGeom = new THREE.SphereGeometry(this.radius * 0.28, 10, 8);
                const leftEye = new THREE.Mesh(eyeGeom, eyeMaterial);
                leftEye.position.set(-this.radius * 0.45, this.radius * 0.4, -this.radius * 0.95);
                headGroup.add(leftEye);
                const rightEye = new THREE.Mesh(eyeGeom.clone(), eyeMaterial);
                rightEye.position.set(this.radius * 0.45, this.radius * 0.4, -this.radius * 0.95);
                headGroup.add(rightEye);

                // Tongue (thin cylinder, points -Z / forward)
                const tongueGeom = new THREE.CylinderGeometry(this.radius * 0.06, this.radius * 0.08, this.radius * 0.8, 6);
                const tongue = new THREE.Mesh(tongueGeom, tongueMaterial);
                tongue.rotation.x = Math.PI / 2;
                tongue.position.z = -this.radius * 1.1;
                headGroup.add(tongue);

                this.segments.push(headGroup);
                this.group.add(headGroup);
            } else {
                const segmentRadius = this.radius;
                const geometry = new THREE.SphereGeometry(segmentRadius, 16, 12);
                const mesh = new THREE.Mesh(geometry, bodyMaterial);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                mesh.position.copy(this.segmentPositions[i]);
                this.segments.push(mesh);
                this.group.add(mesh);
            }
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

        // Rotate head so -Z (eyes, tongue) points in movement direction
        if (this.head) {
            const dir = this.direction.clone().normalize();
            if (dir.lengthSq() > 0.001) {
                this.head.quaternion.setFromUnitVectors(
                    new THREE.Vector3(0, 0, -1),
                    dir
                );
            }
        }
    }

    addSegment() {
        const { segmentLength } = CONFIG.snake;
        const tail = this.segmentPositions[this.segmentPositions.length - 1];
        const prev = this.segmentPositions[this.segmentPositions.length - 2];
        const dir = new THREE.Vector3().subVectors(tail, prev).normalize();
        const newPos = tail.clone().addScaledVector(dir, -segmentLength);

        this.segmentPositions.push(newPos);

        const geometry = new THREE.SphereGeometry(this.radius, 16, 12);
        const material = new THREE.MeshStandardMaterial({
            map: this.snakeTexture,
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
            if (segment.isGroup) {
                segment.traverse((child) => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) child.material.dispose();
                });
            } else {
                segment.geometry?.dispose();
                segment.material?.dispose();
            }
        }
        this.segments = [];
        this.segmentPositions = [];
        this.head = null;
    }
}

export default Snake;
