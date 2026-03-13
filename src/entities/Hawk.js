/**
 * Hawk Entity
 * Flying obstacle that moves around the cube. Collision with snake head = game over.
 */

import * as THREE from 'three';
import CONFIG from '../config.js';

class Hawk {
    constructor(position, bounds) {
        this.position = position.clone();
        this.bounds = bounds;
        this.group = new THREE.Group();

        const cfg = CONFIG.hawk;
        this.radius = cfg.radius;
        this.speed = cfg.speed * (0.7 + Math.random() * 0.6);

        // Random initial direction
        this.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
        ).normalize().multiplyScalar(this.speed);

        this.createMesh();
    }

    createMesh() {
        const geometry = new THREE.ConeGeometry(this.radius * 1.2, this.radius * 2.5, 8);
        const material = new THREE.MeshStandardMaterial({
            color: 0xc4a574,
            metalness: 0.3,
            roughness: 0.6,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.rotation.x = -Math.PI / 2;
        this.group.add(mesh);
        this.group.position.copy(this.position);
    }

    update(deltaTime) {
        this.position.addScaledVector(this.velocity, deltaTime);

        const { min, max } = this.bounds;
        const margin = this.radius;

        if (this.position.x - margin < min.x) {
            this.position.x = min.x + margin;
            this.velocity.x = Math.abs(this.velocity.x);
        }
        if (this.position.x + margin > max.x) {
            this.position.x = max.x - margin;
            this.velocity.x = -Math.abs(this.velocity.x);
        }
        if (this.position.y - margin < min.y) {
            this.position.y = min.y + margin;
            this.velocity.y = Math.abs(this.velocity.y);
        }
        if (this.position.y + margin > max.y) {
            this.position.y = max.y - margin;
            this.velocity.y = -Math.abs(this.velocity.y);
        }
        if (this.position.z - margin < min.z) {
            this.position.z = min.z + margin;
            this.velocity.z = Math.abs(this.velocity.z);
        }
        if (this.position.z + margin > max.z) {
            this.position.z = max.z - margin;
            this.velocity.z = -Math.abs(this.velocity.z);
        }

        this.group.position.copy(this.position);
        this.group.lookAt(this.position.clone().add(this.velocity));
    }

    getPosition() {
        return this.position.clone();
    }

    getRadius() {
        return this.radius;
    }

    getGroup() {
        return this.group;
    }

    dispose() {
        this.group.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
}

export default Hawk;
