/**
 * Texture Preview - View all game textures without playing
 * Apple uses dynamic import with cache-busting to always show latest texture.
 * Run: npm run dev, then open http://localhost:3000/texture-preview.html
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Snake from './entities/Snake.js';
import Powerup, { POWERUP_TYPES } from './entities/Powerup.js';
import Hawk from './entities/Hawk.js';

const container = document.getElementById('preview-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 0, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 0, 0);

// Lights
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);
const fillLight = new THREE.DirectionalLight(0x6688ff, 0.3);
fillLight.position.set(-5, -3, -5);
scene.add(fillLight);

const spacing = 3.5;
const objects = [];

// Snake
const snake = new Snake(new THREE.Vector3(-spacing * 1.5, 0, 0));
snake.initialize();
const snakeHead = snake.segments[0];
snakeHead.position.set(-spacing * 1.5, 0, 0);
scene.add(snakeHead);
objects.push(snakeHead);

// Apple - dynamic import forces fresh texture load (bypasses cache)
const Textures = await import('./utils/Textures.js?t=' + Date.now());
const appleTex = Textures.createAppleTexture();
const appleMat = new THREE.MeshStandardMaterial({
    map: appleTex,
    color: 0xffffff,
    metalness: 0.2,
    roughness: 0.5,
});
const appleGeo = new THREE.SphereGeometry(1.5, 24, 18);
const appleMesh = new THREE.Mesh(appleGeo, appleMat);
appleMesh.position.set(-spacing * 0.5, 0, 0);
appleMesh.castShadow = true;
appleMesh.receiveShadow = true;
scene.add(appleMesh);
objects.push(appleMesh);

// 2D flat preview of apple texture (shows raw texture - if 3D looks wrong, check this)
if (Textures.createAppleTextureCanvas) {
    const flatCanvas = Textures.createAppleTextureCanvas();
    const flatPreview = document.getElementById('apple-flat-preview');
    if (flatPreview) {
        flatPreview.innerHTML = '';
        flatPreview.appendChild(flatCanvas);
        flatCanvas.style.border = '2px solid #444';
        flatCanvas.style.borderRadius = '8px';
    }
}

// Powerup Immunity
const immunityPowerup = new Powerup(POWERUP_TYPES.IMMUNITY, new THREE.Vector3(spacing * 0.5, 0, 0));
const immunityMesh = immunityPowerup.getMesh();
immunityMesh.position.set(spacing * 0.5, 0, 0);
scene.add(immunityMesh);
objects.push(immunityMesh);

// Powerup Slow
const slowPowerup = new Powerup(POWERUP_TYPES.SLOW, new THREE.Vector3(spacing * 1.5, 0, 0));
const slowMesh = slowPowerup.getMesh();
slowMesh.position.set(spacing * 1.5, 0, 0);
scene.add(slowMesh);
objects.push(slowMesh);

// Hawk - needs bounds for constructor, use dummy bounds
const dummyBounds = { min: new THREE.Vector3(-20, -20, -20), max: new THREE.Vector3(20, 20, 20) };
const hawk = new Hawk(new THREE.Vector3(0, -2.5, 0), dummyBounds);
hawk.group.position.set(0, -2.5, 0);
scene.add(hawk.getGroup());
objects.push(hawk.getGroup());

// Resize
window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
});

// Animate
function animate() {
    requestAnimationFrame(animate);
    const t = performance.now() * 0.001;
    objects.forEach((obj) => {
        if (obj.isGroup) {
            obj.rotation.y = t * 0.5;
        } else if (obj.rotation) {
            obj.rotation.y = t * 0.5;
        }
    });
    controls.update();
    renderer.render(scene, camera);
}
animate();
