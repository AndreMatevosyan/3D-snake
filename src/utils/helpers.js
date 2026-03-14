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

export function updateHUD(level, score, length, applesEaten, appleRequirement, immunityRemaining = 0, slowCharges = 0, slowActiveRemaining = 0) {
    const levelElement = document.getElementById('hud-level');
    const scoreElement = document.getElementById('score');
    const lengthElement = document.getElementById('length');
    const applesElement = document.getElementById('apples-progress');
    const immunityElement = document.getElementById('immunity-time');
    const slowElement = document.getElementById('slow-charges');
    const immunityStat = document.getElementById('immunity-stat');
    const slowStat = document.getElementById('slow-stat');

    if (levelElement) levelElement.textContent = level;
    if (scoreElement) scoreElement.textContent = score;
    if (lengthElement) lengthElement.textContent = length;
    if (applesElement) applesElement.textContent = `${applesEaten}/${appleRequirement}`;
    if (immunityElement) immunityElement.textContent = immunityRemaining > 0 ? `${Math.ceil(immunityRemaining)}s` : '--';
    if (immunityStat) immunityStat.style.display = immunityRemaining > 0 ? '' : 'none';
    if (slowElement) slowElement.textContent = slowActiveRemaining > 0 ? `${Math.ceil(slowActiveRemaining)}s` : slowCharges;
    if (slowStat) slowStat.style.display = slowCharges > 0 || slowActiveRemaining > 0 ? '' : 'none';
}

/**
 * Show overlay screen (game over, level complete, etc.)
 * @param {string} [bodyClass='game-over'] - Class to add to body (e.g. 'paused')
 */
export function showOverlay(title, message, buttonText, callback, bodyClass = 'game-over') {
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
        document.body.classList.remove(bodyClass);
        if (callback) callback();
    });

    document.body.classList.add(bodyClass);
    document.body.appendChild(overlay);
    return overlay;
}
