/**
 * Cube Entity
 * Represents the containment cube that the snake is trapped in
 * Transparent walls with glass-shatter breaking effect
 */

import * as THREE from 'three';
import CONFIG from '../config.js';
import { createBoxGeometry } from '../utils/helpers.js';

const SHARD_ROWS = 4;
const SHARD_COLS = 4;
const SHATTER_DURATION = 1.4;
const SHARD_SPREAD_SPEED = 35;
const SHARD_SPIN_SPEED = 6;

class Cube {
    constructor(size = CONFIG.cube.initialSize) {
        this.size = size;
        this.position = new THREE.Vector3(0, 0, 0);

        this.walls = [];
        this.edgeLines = [];
        this.geometries = [];
        this.materials = [];
        this.group = new THREE.Group();

        // Shatter state
        this.isBreaking = false;
        this.breakProgress = 0;
        this.shards = [];
        this.shardGroup = new THREE.Group();
        this.group.add(this.shardGroup);
        this.onShatterComplete = null;
    }

    initialize() {
        const { wallThickness } = CONFIG.cube;
        const halfSize = this.size / 2;

        const material = new THREE.MeshPhysicalMaterial({
            color: 0xe8f4fc,
            transparent: true,
            opacity: 0.12,
            roughness: 0.02,
            metalness: 0.02,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
        this.materials.push(material);

        const edgeMaterial = new THREE.LineBasicMaterial({
            color: 0x88ccff,
            linewidth: 2,
        });
        this.materials.push(edgeMaterial);

        const wallDefs = [
            ['top',    [0,  halfSize + wallThickness / 2, 0], [this.size, wallThickness, this.size]],
            ['bottom', [0, -halfSize - wallThickness / 2, 0], [this.size, wallThickness, this.size]],
            ['left',   [-halfSize - wallThickness / 2, 0, 0], [wallThickness, this.size, this.size]],
            ['right',  [ halfSize + wallThickness / 2, 0, 0], [wallThickness, this.size, this.size]],
            ['front',  [0, 0,  halfSize + wallThickness / 2], [this.size, this.size, wallThickness]],
            ['back',   [0, 0, -halfSize - wallThickness / 2], [this.size, this.size, wallThickness]],
        ];

        for (const [name, pos, dims] of wallDefs) {
            const geometry = createBoxGeometry(dims[0], dims[1], dims[2]);
            this.geometries.push(geometry);

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(pos[0], pos[1], pos[2]);
            mesh.userData.wallName = name;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const edges = new THREE.EdgesGeometry(geometry);
            const edgeLine = new THREE.LineSegments(edges, edgeMaterial);
            edgeLine.position.set(pos[0], pos[1], pos[2]);

            this.walls.push(mesh);
            this.edgeLines.push(edgeLine);
            this.geometries.push(edges);
            this.group.add(mesh);
            this.group.add(edgeLine);
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

    /**
     * Kick off the shatter animation. Walls are split into triangle shards
     * that fly outward and fade. Calls onComplete when finished.
     */
    shatter(onComplete) {
        if (this.isBreaking) return;
        this.isBreaking = true;
        this.breakProgress = 0;
        this.onShatterComplete = onComplete ?? null;

        const shardMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xccedff,
            transparent: true,
            opacity: 0.35,
            roughness: 0.05,
            metalness: 0.1,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
        this.materials.push(shardMaterial);

        const halfSize = this.size / 2;

        const faceDefs = [
            { normal: new THREE.Vector3( 0,  1,  0), center: new THREE.Vector3(0,  halfSize, 0), u: new THREE.Vector3(1,0,0), v: new THREE.Vector3(0,0,1) },
            { normal: new THREE.Vector3( 0, -1,  0), center: new THREE.Vector3(0, -halfSize, 0), u: new THREE.Vector3(1,0,0), v: new THREE.Vector3(0,0,-1) },
            { normal: new THREE.Vector3(-1,  0,  0), center: new THREE.Vector3(-halfSize, 0, 0), u: new THREE.Vector3(0,0,-1), v: new THREE.Vector3(0,1,0) },
            { normal: new THREE.Vector3( 1,  0,  0), center: new THREE.Vector3( halfSize, 0, 0), u: new THREE.Vector3(0,0,1), v: new THREE.Vector3(0,1,0) },
            { normal: new THREE.Vector3( 0,  0,  1), center: new THREE.Vector3(0, 0,  halfSize), u: new THREE.Vector3(1,0,0), v: new THREE.Vector3(0,1,0) },
            { normal: new THREE.Vector3( 0,  0, -1), center: new THREE.Vector3(0, 0, -halfSize), u: new THREE.Vector3(-1,0,0), v: new THREE.Vector3(0,1,0) },
        ];

        for (const face of faceDefs) {
            this._createFaceShards(face, shardMaterial);
        }

        // Hide the solid walls immediately
        for (const wall of this.walls) wall.visible = false;
        for (const edge of this.edgeLines) edge.visible = false;
    }

    _createFaceShards(face, material) {
        const { normal, center, u, v } = face;
        const halfSize = this.size / 2;

        for (let row = 0; row < SHARD_ROWS; row++) {
            for (let col = 0; col < SHARD_COLS; col++) {
                const uMin = -halfSize + (col / SHARD_COLS) * this.size;
                const uMax = -halfSize + ((col + 1) / SHARD_COLS) * this.size;
                const vMin = -halfSize + (row / SHARD_ROWS) * this.size;
                const vMax = -halfSize + ((row + 1) / SHARD_ROWS) * this.size;

                // Each grid cell produces 2 triangles with slight random variation
                const jitter = () => (Math.random() - 0.5) * (this.size / SHARD_COLS) * 0.3;

                const midU = (uMin + uMax) / 2 + jitter();
                const midV = (vMin + vMax) / 2 + jitter();

                const corners = [
                    [uMin, vMin], [uMax, vMin], [uMax, vMax], [uMin, vMax]
                ];
                const mid = [midU, midV];

                for (let t = 0; t < 4; t++) {
                    const c1 = corners[t];
                    const c2 = corners[(t + 1) % 4];

                    const positions = new Float32Array(9);
                    const pts = [c1, c2, mid];
                    const worldPts = [];

                    for (let i = 0; i < 3; i++) {
                        const p = center.clone()
                            .addScaledVector(u, pts[i][0])
                            .addScaledVector(v, pts[i][1]);
                        positions[i * 3]     = p.x;
                        positions[i * 3 + 1] = p.y;
                        positions[i * 3 + 2] = p.z;
                        worldPts.push(p);
                    }

                    const geom = new THREE.BufferGeometry();
                    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                    geom.computeVertexNormals();

                    const mesh = new THREE.Mesh(geom, material);

                    // Shard center for outward velocity
                    const shardCenter = new THREE.Vector3(
                        (worldPts[0].x + worldPts[1].x + worldPts[2].x) / 3,
                        (worldPts[0].y + worldPts[1].y + worldPts[2].y) / 3,
                        (worldPts[0].z + worldPts[1].z + worldPts[2].z) / 3,
                    );

                    const velocity = normal.clone()
                        .multiplyScalar(SHARD_SPREAD_SPEED * (0.6 + Math.random() * 0.8))
                        .add(new THREE.Vector3(
                            (Math.random() - 0.5) * SHARD_SPREAD_SPEED * 0.3,
                            (Math.random() - 0.5) * SHARD_SPREAD_SPEED * 0.3,
                            (Math.random() - 0.5) * SHARD_SPREAD_SPEED * 0.3,
                        ));

                    const spinAxis = new THREE.Vector3(
                        Math.random() - 0.5,
                        Math.random() - 0.5,
                        Math.random() - 0.5,
                    ).normalize();

                    const delay = Math.random() * 0.15;

                    this.shards.push({
                        mesh,
                        velocity,
                        spinAxis,
                        spinSpeed: SHARD_SPIN_SPEED * (0.5 + Math.random()),
                        delay,
                        startCenter: shardCenter.clone(),
                    });

                    this.shardGroup.add(mesh);
                }
            }
        }
    }

    update(deltaTime) {
        if (!this.isBreaking) return false;

        this.breakProgress += deltaTime;
        const t = this.breakProgress;

        let allDone = true;

        for (const shard of this.shards) {
            const localT = t - shard.delay;
            if (localT < 0) { allDone = false; continue; }

            const frac = Math.min(localT / SHATTER_DURATION, 1);

            // Move outward
            const offset = shard.velocity.clone().multiplyScalar(localT);
            shard.mesh.position.copy(shard.startCenter).add(offset);

            // Add slight gravity
            shard.mesh.position.y -= 4.9 * localT * localT;

            // Spin
            shard.mesh.setRotationFromAxisAngle(shard.spinAxis, shard.spinSpeed * localT);

            // Fade out
            shard.mesh.material.opacity = 0.35 * (1 - frac);

            if (frac < 1) allDone = false;
        }

        if (allDone && this.shards.length > 0) {
            this._cleanupShatter();
            return true;
        }

        return false;
    }

    _cleanupShatter() {
        for (const shard of this.shards) {
            this.shardGroup.remove(shard.mesh);
            shard.mesh.geometry.dispose();
        }
        this.shards = [];
        this.isBreaking = false;
        this.breakProgress = 0;

        const cb = this.onShatterComplete;
        this.onShatterComplete = null;
        if (cb) cb();
    }

    resize(newSize) {
        this.walls.forEach(wall => this.group.remove(wall));
        this.edgeLines.forEach(line => this.group.remove(line));
        this.walls = [];
        this.edgeLines = [];
        this.geometries.forEach(g => g.dispose());
        this.geometries = [];
        this.materials.forEach(m => m.dispose());
        this.materials = [];

        this.size = newSize;
        this.initialize();
    }

    getGroup() {
        return this.group;
    }

    getWalls() {
        return this.walls;
    }

    dispose() {
        this.onShatterComplete = null;
        for (const shard of this.shards) {
            this.shardGroup.remove(shard.mesh);
            shard.mesh.geometry.dispose();
        }
        this.shards = [];
        this.isBreaking = false;

        this.geometries.forEach(g => g.dispose());
        this.materials.forEach(m => m.dispose());
        this.walls = [];
        this.edgeLines = [];
        this.geometries = [];
        this.materials = [];
    }
}

export default Cube;
