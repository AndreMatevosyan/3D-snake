/**
 * Procedural texture generation for game entities
 * Creates tileable textures using Canvas API
 */

import * as THREE from 'three';

const SIZE = 256;

function createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    return canvas;
}

function toTexture(canvas, repeat = true) {
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    if (repeat) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
    } else {
        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.repeat.set(1, 1);
    }
    texture.needsUpdate = true;
    return texture;
}

/**
 * Snake texture - green scaly pattern
 */
export function createSnakeTexture() {
    const canvas = createCanvas();
    const ctx = canvas.getContext('2d');

    const baseGreen = '#2a8a2a';
    const darkGreen = '#1a5a1a';
    const highlight = '#4acc4a';

    ctx.fillStyle = baseGreen;
    ctx.fillRect(0, 0, SIZE, SIZE);

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const x = (i / 8) * SIZE + (Math.random() - 0.5) * 8;
            const y = (j / 8) * SIZE + (Math.random() - 0.5) * 8;
            const r = 12 + Math.random() * 8;

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
            gradient.addColorStop(0, highlight);
            gradient.addColorStop(0.4, baseGreen);
            gradient.addColorStop(1, darkGreen);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    return toTexture(canvas);
}

/**
 * Apple texture - realistic red apple with stem, leaves, mottling, and lenticels
 */
export function createAppleTexture() {
    const canvas = createCanvas();
    const ctx = canvas.getContext('2d');

    // Base: vertical gradient (darker at stem, lighter at blossom end)
    const baseGrad = ctx.createLinearGradient(0, 0, 0, SIZE);
    baseGrad.addColorStop(0, '#6b1a1a');
    baseGrad.addColorStop(0.15, '#8b2222');
    baseGrad.addColorStop(0.5, '#c62828');
    baseGrad.addColorStop(0.85, '#a02020');
    baseGrad.addColorStop(1, '#e57373');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Organic mottling - irregular red patches
    for (let i = 0; i < 35; i++) {
        const x = Math.random() * SIZE;
        const y = Math.random() * SIZE;
        const r = 18 + Math.random() * 25;
        const shade = Math.random();
        ctx.fillStyle = shade < 0.4 ? 'rgba(100, 20, 20, 0.5)' :
            shade < 0.7 ? 'rgba(160, 35, 35, 0.4)' :
            'rgba(220, 80, 80, 0.3)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    // Yellow/cream undertones near stem (calyx area)
    const calyxGrad = ctx.createRadialGradient(SIZE * 0.5, SIZE * 0.05, 0, SIZE * 0.5, SIZE * 0.2, SIZE * 0.4);
    calyxGrad.addColorStop(0, 'rgba(180, 150, 80, 0.6)');
    calyxGrad.addColorStop(0.6, 'rgba(140, 100, 50, 0.3)');
    calyxGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = calyxGrad;
    ctx.fillRect(0, 0, SIZE, SIZE * 0.4);

    // Stem depression (dark cavity)
    ctx.fillStyle = '#3d2817';
    ctx.beginPath();
    ctx.ellipse(SIZE * 0.5, SIZE * 0.06, SIZE * 0.18, SIZE * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a1a0a';
    ctx.beginPath();
    ctx.ellipse(SIZE * 0.5, SIZE * 0.06, SIZE * 0.1, SIZE * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Brown stem
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(SIZE * 0.43, 0, SIZE * 0.14, SIZE * 0.14);
    ctx.fillStyle = '#4a3728';
    ctx.fillRect(SIZE * 0.445, SIZE * 0.01, SIZE * 0.11, SIZE * 0.11);

    // Leaf 1 (left, curved)
    ctx.fillStyle = '#66bb6a';
    ctx.beginPath();
    ctx.ellipse(SIZE * 0.26, SIZE * 0.05, SIZE * 0.14, SIZE * 0.07, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#43a047';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(SIZE * 0.32, SIZE * 0.05);
    ctx.lineTo(SIZE * 0.2, SIZE * 0.05);
    ctx.stroke();

    // Leaf 2 (right)
    ctx.fillStyle = '#66bb6a';
    ctx.beginPath();
    ctx.ellipse(SIZE * 0.74, SIZE * 0.05, SIZE * 0.14, SIZE * 0.07, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#43a047';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(SIZE * 0.68, SIZE * 0.05);
    ctx.lineTo(SIZE * 0.8, SIZE * 0.05);
    ctx.stroke();

    // Lenticels (skin pores)
    for (let i = 0; i < 70; i++) {
        const x = Math.random() * SIZE;
        const y = Math.random() * SIZE;
        if (y < SIZE * 0.2) continue;
        const r = 1.5 + Math.random() * 1.5;
        ctx.fillStyle = `rgba(255, 250, 235, ${0.6 + Math.random() * 0.35})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    return toTexture(canvas, false);
}

/**
 * Powerup texture - glowing orb (yellow for immunity, blue for slow)
 */
export function createPowerupTexture(type) {
    const canvas = createCanvas();
    const ctx = canvas.getContext('2d');

    const isImmunity = type === 'immunity';
    const darkColor = isImmunity ? '#886600' : '#224466';
    const midColor = isImmunity ? '#ffcc00' : '#4488ff';
    const brightColor = isImmunity ? '#ffee88' : '#aaddff';

    const gradient = ctx.createLinearGradient(0, 0, 0, SIZE);
    gradient.addColorStop(0, brightColor);
    gradient.addColorStop(0.5, midColor);
    gradient.addColorStop(1, darkColor);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, SIZE, SIZE);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(SIZE * 0.2, SIZE * 0.1, SIZE * 0.25, SIZE * 0.15);

    return toTexture(canvas);
}

/**
 * Hawk texture - brown/tan feather-like pattern
 */
export function createHawkTexture() {
    const canvas = createCanvas();
    const ctx = canvas.getContext('2d');

    const baseTan = '#c4a574';
    const darkBrown = '#8b7355';
    const highlight = '#e8d4a8';

    ctx.fillStyle = baseTan;
    ctx.fillRect(0, 0, SIZE, SIZE);

    for (let i = 0; i < 12; i++) {
        for (let j = 0; j < 12; j++) {
            const x = (i / 12) * SIZE + (Math.random() - 0.5) * 12;
            const y = (j / 12) * SIZE + (Math.random() - 0.5) * 12;

            ctx.strokeStyle = darkBrown;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3 + Math.random() * 0.4;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 15, y + 8);
            ctx.stroke();

            ctx.fillStyle = highlight;
            ctx.globalAlpha = 0.2;
            ctx.fillRect(x, y, 3, 6);
        }
    }
    ctx.globalAlpha = 1;

    return toTexture(canvas);
}
