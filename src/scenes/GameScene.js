/**
 * Game Scene Setup
 * Manages the Three.js scene, lighting, and environment
 */

import * as THREE from 'three';
import CONFIG from '../config.js';

class GameScene {
    constructor() {
        this.scene = null;
        this.lights = {};
        this.dynamicObjects = new Set(); // Track non-light objects for clear()

        this.initialize();
    }

    initialize() {
        this.scene = new THREE.Scene();
        this.setupBackground();
        this.setupStars();
        this.setupFog();
        this.setupLighting();
    }

    setupBackground() {
        const { backgroundColor } = CONFIG.scene;
        this.scene.background = new THREE.Color(backgroundColor);
    }

    setupStars() {
        const count = 5000;
        const radius = 400;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            const t = Math.random();
            const r = t < 0.7 ? 1 : t < 0.85 ? 0.9 : 0.95;
            const g = t < 0.7 ? 1 : t < 0.85 ? 0.95 : 0.9;
            const b = t < 0.7 ? 1 : t < 0.85 ? 1 : 0.85;
            colors[i * 3] = r;
            colors[i * 3 + 1] = g;
            colors[i * 3 + 2] = b;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 1.8,
            vertexColors: true,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.9,
            fog: false,
        });

        this.starfield = new THREE.Points(geometry, material);
        this.scene.add(this.starfield);
    }

    setupFog() {
        const { fogColor, fogNear, fogFar } = CONFIG.scene;
        this.scene.fog = new THREE.Fog(
            new THREE.Color(fogColor),
            fogNear,
            fogFar
        );
    }

    setupLighting() {
        const { shadowMapResolution } = CONFIG.rendering;

        // Ambient light for general visibility
        this.lights.ambient = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(this.lights.ambient);

        // Directional light (main sun) for shadows and form
        this.lights.directional = new THREE.DirectionalLight(0xffffff, 0.8);
        this.lights.directional.position.set(25, 40, 25);
        this.lights.directional.castShadow = true;

        this.lights.directional.shadow.mapSize.width = shadowMapResolution;
        this.lights.directional.shadow.mapSize.height = shadowMapResolution;
        this.lights.directional.shadow.camera.near = 0.5;
        this.lights.directional.shadow.camera.far = 150;
        this.lights.directional.shadow.camera.left = -50;
        this.lights.directional.shadow.camera.right = 50;
        this.lights.directional.shadow.camera.top = 50;
        this.lights.directional.shadow.camera.bottom = -50;
        this.lights.directional.shadow.bias = -0.0001;

        this.scene.add(this.lights.directional);

        // Fill light from below-front for softer shadows
        this.lights.fill = new THREE.DirectionalLight(0x88aacc, 0.2);
        this.lights.fill.position.set(-15, -10, 20);
        this.scene.add(this.lights.fill);

        // Point light for subtle environment glow (centered above play area)
        this.lights.point = new THREE.PointLight(0x6699ff, 0.3, 100);
        this.lights.point.position.set(0, 30, 0);
        this.scene.add(this.lights.point);
    }

    getScene() {
        return this.scene;
    }

    addObject(object, isDynamic = true) {
        this.scene.add(object);
        if (isDynamic) {
            this.dynamicObjects.add(object);
        }
    }

    removeObject(object) {
        this.scene.remove(object);
        this.dynamicObjects.delete(object);
    }

    clear() {
        this.dynamicObjects.forEach((obj) => {
            this.scene.remove(obj);
            if (obj.dispose) obj.dispose();
        });
        this.dynamicObjects.clear();
    }

    dispose() {
        this.clear();
        if (this.starfield) {
            this.scene.remove(this.starfield);
            this.starfield.geometry.dispose();
            this.starfield.material.dispose();
            this.starfield = null;
        }
        this.lights = {};
        this.scene = null;
    }
}

export default GameScene;
