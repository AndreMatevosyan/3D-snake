/**
 * Helper Utilities
 * Common utility functions
 */

import * as THREE from 'three';

// Get a random point within given bounds
export function randomPointInBounds(min, max) {
    const x = Math.random() * (max.x - min.x) + min.x;
    const y = Math.random() * (max.y - min.y) + min.y;
    const z = Math.random() * (max.z - min.z) + min.z;
    return new THREE.Vector3(x, y, z);
}

// Create a box geometry for cube walls
export function createBoxGeometry(width, height, depth) {
    return new THREE.BoxGeometry(width, height, depth);
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
    randomPointInBounds,
    createBoxGeometry,
    distanceToBoxBounds,
    updateHUD,
    showOverlay,
};
