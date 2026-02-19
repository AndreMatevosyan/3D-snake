/**
 * Apple Entity
 * Represents an apple that the snake can eat to grow longer
 */

import * as THREE from 'three';
import CONFIG from '../config.js';

class Apple {
    constructor(position = new THREE.Vector3(0, 0, 0)) {
        this.position = position.clone();
        this.mesh = null;

        this.rotation = 0;
        this.floatOffset = 0;
        this.time = 0;
    }

    initialize() {
        this.createMesh();
    }

    createMesh() {
        const { radius } = CONFIG.apple;
        const geometry = new THREE.SphereGeometry(radius, 24, 18);

        const material = new THREE.MeshStandardMaterial({
            color: 0xdd2222,
            metalness: 0.2,
            roughness: 0.5,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.copy(this.position);
    }

    spawn(position) {
        this.position.copy(position);

        if (this.mesh) {
            this.mesh.geometry?.dispose();
            this.mesh.material?.dispose();
        }
        this.createMesh();
        this.mesh.position.copy(this.position);

        this.rotation = 0;
        this.floatOffset = Math.random() * Math.PI * 2;
        this.time = 0;
    }

    update(deltaTime) {
        if (!this.mesh) return;

        this.time += deltaTime;
        this.rotation += CONFIG.apple.spinSpeed * deltaTime;
        const floatY = Math.sin(this.time * CONFIG.apple.floatSpeed + this.floatOffset) * CONFIG.apple.floatAmplitude;

        this.mesh.rotation.y = this.rotation;
        this.mesh.position.copy(this.position);
        this.mesh.position.y += floatY;
    }

    getMesh() {
        return this.mesh;
    }

    getPosition() {
        return this.position.clone();
    }

    setPosition(position) {
        this.position.copy(position);
    }

    dispose() {
        if (this.mesh) {
            this.mesh.geometry?.dispose();
            this.mesh.material?.dispose();
        }
        this.mesh = null;
    }
}

export default Apple;
