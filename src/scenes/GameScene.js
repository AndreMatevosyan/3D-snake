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
        this.setupFog();
        this.setupLighting();
        this.setupDevFloor();
    }

    /** Temporary floor for development - shows snake movement. Remove when cube/level is ready. */
    setupDevFloor() {
        const size = 80;
        const geometry = new THREE.PlaneGeometry(size, size);
        const material = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.1,
            roughness: 0.9,
        });
        const floor = new THREE.Mesh(geometry, material);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        const gridHelper = new THREE.GridHelper(size, 20, 0x333333, 0x222222);
        gridHelper.position.y = -1.99;
        this.scene.add(gridHelper);
    }

    setupBackground() {
        const { backgroundColor } = CONFIG.scene;
        this.scene.background = new THREE.Color(backgroundColor);
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
        this.lights = {};
        this.scene = null;
    }
}

export default GameScene;
