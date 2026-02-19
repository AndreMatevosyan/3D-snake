/**
 * Render System
 * Manages Three.js rendering and display
 */

import * as THREE from 'three';
import CONFIG from '../config.js';

class RenderSystem {
    constructor(container) {
        this.container = container;
        this.renderer = null;
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        
        this.initialize();
    }
    
    initialize() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: CONFIG.rendering.antialiasing,
            alpha: true,
            precision: 'highp'
        });

        this.renderer.setPixelRatio(CONFIG.rendering.pixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;

        this.container.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    render(scene, camera) {
        this.renderer.render(scene, camera);
    }
    
    setSize(width, height) {
        this.renderer.setSize(width, height);
    }
    
    onWindowResize() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.setSize(this.width, this.height);
    }
    
    getCanvas() {
        return this.renderer.domElement;
    }
    
    getRenderer() {
        return this.renderer;
    }
    
    getSize() {
        return { width: this.width, height: this.height };
    }
    
    dispose() {
        window.removeEventListener('resize', () => this.onWindowResize());
        this.renderer.dispose();
        this.container.removeChild(this.renderer.domElement);
    }
}

export default RenderSystem;
