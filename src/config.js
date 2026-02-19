/**
 * Game Configuration
 * Contains all game constants and settings
 */

export const CONFIG = {
    // Scene
    scene: {
        backgroundColor: 0x0a0a0a,
        fogColor: 0x0a0a0a,
        fogNear: 10,
        fogFar: 200,
    },

    // Camera
    camera: {
        fov: 60,
        near: 0.1,
        far: 1000,
        followDistance: 15,
        followHeight: 8,
        lookAheadDistance: 5,
    },

    // Snake
    snake: {
        initialLength: 3,
        initialSpeed: 40,
        initialRadius: 1,
        segmentLength: 2,
        maxSpeed: 150,
        speedIncrement: 10,
        radiusIncrement: 0.15,
        maxRadius: 2.5,
    },

    // Apple
    apple: {
        radius: 1.5,
        spinSpeed: 3,
        floatAmplitude: 0.5,
        floatSpeed: 2,
    },

    // Cube (Container)
    cube: {
        initialSize: 60,
        minSize: 40,
        sizeDecrement: 5,
        wallThickness: 0.5,
        wallOpacity: 0.2,
        breakingEffect: 'shatter', // 'shatter' or 'dissolve'
    },

    // Levels
    levels: {
        appleRequirement: {
            1: 5,
            2: 8,
            3: 12,
            4: 16,
            5: 20,
        },
        speedMultiplier: {
            1: 1.0,
            2: 1.15,
            3: 1.3,
            4: 1.5,
            5: 1.7,
        },
    },

    // Input
    input: {
        mouseSensitivity: 0.005,
        maxPitch: Math.PI / 3,
        minPitch: -Math.PI / 3,
    },

    // Physics/Collision
    physics: {
        collisionCheckInterval: 10, // milliseconds
        selfCollisionThreshold: 5, // minimum segments before self collision check
    },

    // Rendering
    rendering: {
        antialiasing: true,
        shadowMapResolution: 1024,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
    },
};

export default CONFIG;
