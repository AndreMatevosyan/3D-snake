/**
 * Cube Entity
 * Represents the containment cube that the snake is trapped in
 * Transparent walls with dissolve/shatter breaking effects
 */

import * as THREE from 'three';
import CONFIG from '../config.js';
import { createBoxGeometry } from '../utils/helpers.js';

class Cube {
    constructor(size = CONFIG.cube.initialSize) {
        this.size = size;
        this.position = new THREE.Vector3(0, 0, 0);
        
        // Meshes for cube walls
        this.walls = [];
        this.geometries = [];
        this.materials = [];
        this.group = new THREE.Group();
        
        // State
        this.isBreaking = false;
        this.breakProgress = 0;
        this.breakingEffect = 'dissolve';
        this.breakDuration = 800; // ms
    }
    
    initialize() {
        const { wallThickness, wallOpacity } = CONFIG.cube;
        const halfSize = this.size / 2;
        
        // Shared material for walls (high opacity for debug visibility)
        const material = new THREE.MeshPhongMaterial({
            color: 0x44dd88,
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide,
            depthWrite: true,
            shininess: 80,
            specular: 0x88ffaa,
        });
        this.materials.push(material);
        
        // Wall definitions: [name, position offset, dimensions (width, height, depth)]
        const wallDefs = [
            ['top', [0, halfSize + wallThickness / 2, 0], [this.size, wallThickness, this.size]],
            ['bottom', [0, -halfSize - wallThickness / 2, 0], [this.size, wallThickness, this.size]],
            ['left', [-halfSize - wallThickness / 2, 0, 0], [wallThickness, this.size, this.size]],
            ['right', [halfSize + wallThickness / 2, 0, 0], [wallThickness, this.size, this.size]],
            ['front', [0, 0, halfSize + wallThickness / 2], [this.size, this.size, wallThickness]],
            ['back', [0, 0, -halfSize - wallThickness / 2], [this.size, this.size, wallThickness]],
        ];
        
        for (const [name, pos, dims] of wallDefs) {
            const geometry = createBoxGeometry(dims[0], dims[1], dims[2]);
            this.geometries.push(geometry);
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(pos[0], pos[1], pos[2]);
            mesh.userData.wallName = name;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            this.walls.push(mesh);
            this.group.add(mesh);
        }
        
        this.group.position.copy(this.position);
    }
    
    getBounds() {
        const halfSize = this.size / 2;
        return {
            min: this.position.clone().subScalar(halfSize),
            max: this.position.clone().addScalar(halfSize),
        };
    }
    
    isPointInside(position) {
        return this.containsPosition(position);
    }
    
    containsPosition(position) {
        const { min, max } = this.getBounds();
        return (
            position.x >= min.x && position.x <= max.x &&
            position.y >= min.y && position.y <= max.y &&
            position.z >= min.z && position.z <= max.z
        );
    }
    
    breakCube(effect = CONFIG.cube.breakingEffect) {
        this.isBreaking = true;
        this.breakProgress = 0;
        this.breakingEffect = effect;
        
        // For shatter: add random stagger per wall
        if (effect === 'shatter') {
            this.walls.forEach((wall, i) => {
                wall.userData.shatterDelay = (i / this.walls.length) * 0.3;
                wall.userData.originalScale = 1;
            });
        }
    }
    
    update(deltaTime) {
        if (!this.isBreaking) return;
        
        this.breakProgress += deltaTime * 1000;
        const t = Math.min(1, this.breakProgress / this.breakDuration);
        
        if (this.breakingEffect === 'dissolve') {
            const opacity = Math.max(0, CONFIG.cube.wallOpacity * (1 - t));
            this.materials.forEach(m => { m.opacity = opacity; });
        } else if (this.breakingEffect === 'shatter') {
            this.walls.forEach((wall) => {
                const delay = wall.userData.shatterDelay ?? 0;
                const localT = Math.max(0, (t - delay) / (1 - delay));
                const scale = Math.max(0, 1 - localT);
                wall.scale.setScalar(scale);
            });
        }
    }
    
    resize(newSize) {
        const clampedSize = Math.max(CONFIG.cube.minSize, newSize);
        
        // Remove old walls from group and dispose
        this.walls.forEach(wall => this.group.remove(wall));
        this.walls = [];
        this.geometries.forEach(g => g.dispose());
        this.geometries = [];
        this.materials.forEach(m => m.dispose());
        this.materials = [];
        
        this.size = clampedSize;
        this.initialize();
    }
    
    getGroup() {
        return this.group;
    }
    
    getWalls() {
        return this.walls;
    }
    
    dispose() {
        this.geometries.forEach(g => g.dispose());
        this.materials.forEach(m => m.dispose());
        this.walls = [];
        this.geometries = [];
        this.materials = [];
    }
}

export default Cube;
