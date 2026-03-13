/**
 * Powerup Entity
 * Yellow = immunity to hawks. Blue = L key activates slow mode.
 */

import * as THREE from 'three';
import CONFIG from '../config.js';
import { createPowerupTexture } from '../utils/Textures.js';

export const POWERUP_TYPES = {
    IMMUNITY: 'immunity',
    SLOW: 'slow',
};

class Powerup {
    constructor(type, position) {
        this.type = type;
        this.position = position.clone();
        this.mesh = null;
        this.time = 0;
        this.floatOffset = Math.random() * Math.PI * 2;

        this.createMesh();
    }

    createMesh() {
        const cfg = CONFIG.powerup;
        const radius = cfg.radius;
        const geometry = new THREE.SphereGeometry(radius, 16, 12);

        const color = this.type === POWERUP_TYPES.IMMUNITY ? 0xffdd00 : 0x4488ff;
        const material = new THREE.MeshStandardMaterial({
            map: createPowerupTexture(this.type),
            color,
            metalness: 0.4,
            roughness: 0.3,
            emissive: color,
            emissiveIntensity: 0.3,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.copy(this.position);
    }

    update(deltaTime) {
        if (!this.mesh) return;
        this.time += deltaTime;
        const floatY = Math.sin(this.time * 3 + this.floatOffset) * 0.3;
        this.mesh.position.copy(this.position);
        this.mesh.position.y += floatY;
        this.mesh.rotation.y += deltaTime * 2;
    }

    getPosition() {
        return this.position.clone();
    }

    getRadius() {
        return CONFIG.powerup.radius;
    }

    getMesh() {
        return this.mesh;
    }

    dispose() {
        if (this.mesh) {
            this.mesh.geometry?.dispose();
            this.mesh.material?.dispose();
        }
        this.mesh = null;
    }
}

export default Powerup;
