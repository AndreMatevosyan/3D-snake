/**
 * Helper Utilities
 * Common utility functions
 */

import * as THREE from 'three';

//Clamp a value between min and max

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Lerp between two values

export function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Lerp between two Vector3s

export function lerpVector3(a, b, t) {
    const result = a.clone();
    result.lerp(b, t);
    return result;
}

// Get a random point within given bounds
export function randomPointInBounds(min, max) {
    const x = Math.random() * (max.x - min.x) + min.x;
    const y = Math.random() * (max.y - min.y) + min.y;
    const z = Math.random() * (max.z - min.z) + min.z;
    return new THREE.Vector3(x, y, z);
}

// Distance between two Vector3s

export function distance(a, b) {
    return a.distanceTo(b);
}

// Create a cylinder geometry for snake segments

export function createCylinderGeometry(radius, height, segments = 8) {
    return new THREE.CylinderGeometry(radius, radius, height, segments);
}

// Create a sphere geometry for apples

export function createSphereGeometry(radius, segments = 32) {
    return new THREE.SphereGeometry(radius, segments, segments);
}

// Create a box geometry for cube walls

export function createBoxGeometry(width, height, depth) {
    return new THREE.BoxGeometry(width, height, depth);
}

// Wrap angle to -PI to PI range

export function normalizeAngle(angle) {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
}

// Convert degrees to radians

export function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Convert radians to degrees

export function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

// Distance from a point to the nearest face of an axis-aligned box

export function distanceToBoxBounds(position, min, max) {
    const dx = Math.min(position.x - min.x, max.x - position.x);
    const dy = Math.min(position.y - min.y, max.y - position.y);
    const dz = Math.min(position.z - min.z, max.z - position.z);
    return Math.min(dx, dy, dz);
}

// Update UI elements

export function updateHUD(level, score, length) {
    const levelElement = document.getElementById('level');
    const scoreElement = document.getElementById('score');
    const lengthElement = document.getElementById('length');
    
    if (levelElement) levelElement.textContent = level;
    if (scoreElement) scoreElement.textContent = score;
    if (lengthElement) lengthElement.textContent = length;
}

// Show overlay screen (game over, level complete, etc.)

export function showOverlay(title, message, buttonText, callback) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay active';
    overlay.innerHTML = `
        <div class="overlay-content">
            <h1>${title}</h1>
            <p>${message}</p>
            <button class="button">${buttonText}</button>
        </div>
    `;
    
    const button = overlay.querySelector('.button');
    button.addEventListener('click', () => {
        overlay.remove();
        document.body.classList.remove('game-over');
        if (callback) callback();
    });

    document.body.classList.add('game-over');
    document.body.appendChild(overlay);
}

export default {
    clamp,
    lerp,
    lerpVector3,
    randomPointInBounds,
    distance,
    createCylinderGeometry,
    createSphereGeometry,
    createBoxGeometry,
    normalizeAngle,
    toRadians,
    toDegrees,
    updateHUD,
    showOverlay,
};
