/**
 * Hawk Entity
 * Flying obstacle that moves around the cube. Collision with snake head = game over.
 */

import * as THREE from 'three';
import CONFIG from '../config.js';
import { createHawkTexture } from '../utils/Textures.js';

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
        const r = this.radius;
        const hawkTexture = createHawkTexture();
        const bodyMaterial = new THREE.MeshStandardMaterial({
            map: hawkTexture,
            color: 0xc4a574,
            metalness: 0.4,
            roughness: 0.5,
        });
        const cockpitMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a90d9,
            metalness: 0.6,
            roughness: 0.2,
        });
        const accentMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b7355,
            metalness: 0.5,
            roughness: 0.5,
        });

        // Fuselage (cylinder body - no cone)
        const fuselageGeom = new THREE.CylinderGeometry(r * 0.25, r * 0.3, r * 1.2, 8);
        const fuselage = new THREE.Mesh(fuselageGeom, bodyMaterial);
        fuselage.rotation.x = -Math.PI / 2;
        fuselage.position.z = 0;
        this.group.add(fuselage);

        // Pointed nose (small cone at front)
        const noseGeom = new THREE.ConeGeometry(r * 0.2, r * 0.4, 6);
        const nose = new THREE.Mesh(noseGeom, bodyMaterial);
        nose.rotation.x = -Math.PI / 2;
        nose.position.z = r * 0.8;
        this.group.add(nose);

        // Cockpit / hawk head (sphere at front)
        const cockpitGeom = new THREE.SphereGeometry(r * 0.28, 8, 6);
        const cockpit = new THREE.Mesh(cockpitGeom, cockpitMaterial);
        cockpit.position.set(r * 0.15, r * 0.1, r * 0.9);
        this.group.add(cockpit);

        // Wings (wide, swept - dominant horizontal silhouette)
        const wingGeom = new THREE.BoxGeometry(r * 1.4, r * 0.04, r * 0.6);
        const leftWing = new THREE.Mesh(wingGeom, bodyMaterial);
        leftWing.position.set(-r * 0.75, 0, r * 0.1);
        leftWing.rotation.z = Math.PI / 8;
        this.group.add(leftWing);
        const rightWing = new THREE.Mesh(wingGeom.clone(), bodyMaterial);
        rightWing.position.set(r * 0.75, 0, r * 0.1);
        rightWing.rotation.z = -Math.PI / 8;
        this.group.add(rightWing);

        // Tail fins (vertical, prominent)
        const finGeom = new THREE.BoxGeometry(r * 0.06, r * 0.55, r * 0.4);
        const leftFin = new THREE.Mesh(finGeom, accentMaterial);
        leftFin.position.set(-r * 0.4, 0, -r * 0.65);
        leftFin.rotation.z = -Math.PI / 10;
        this.group.add(leftFin);
        const rightFin = new THREE.Mesh(finGeom.clone(), accentMaterial);
        rightFin.position.set(r * 0.4, 0, -r * 0.65);
        rightFin.rotation.z = Math.PI / 10;
        this.group.add(rightFin);

        // Engine / thruster (cylinder at rear)
        const engineGeom = new THREE.CylinderGeometry(r * 0.15, r * 0.2, r * 0.5, 6);
        const engine = new THREE.Mesh(engineGeom, accentMaterial);
        engine.rotation.x = -Math.PI / 2;
        engine.position.z = -r * 0.95;
        this.group.add(engine);

        this.group.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
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
