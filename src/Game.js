/**
 * Main Game Controller
 * Manages game state, main loop, and system coordination
 */

import * as THREE from 'three';
import CONFIG from './config.js';
import GameScene from './scenes/GameScene.js';
import CameraController from './camera/CameraController.js';
import InputController from './input/InputController.js';
import CollisionSystem from './systems/CollisionSystem.js';
import LevelSystem from './systems/LevelSystem.js';
import RenderSystem from './systems/RenderSystem.js';

class Game {
    constructor() {
        this.gameContainer = document.getElementById('game-container');
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.currentLevel = 1;
        this.score = 0;
        
        // Systems
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.cameraController = null;
        this.inputController = null;
        this.collisionSystem = null;
        this.levelSystem = null;
        this.renderSystem = null;
        
        // Game entities
        this.snake = null;
        this.apple = null;
        this.cube = null;
        
        // Time
        this.lastTime = 0;
        this.deltaTime = 0;
        this.frameCount = 0;
        
        this.initialize();
    }
    
    initialize() {
        // TODO: Initialize all systems
        // - Create THREE.js scene, camera, renderer
        // - Initialize GameScene
        // - Setup CameraController
        // - Setup InputController
        // - Initialize game entities (Snake, Apple, Cube)
        // - Setup systems (CollisionSystem, LevelSystem, RenderSystem)
        
        const container = document.getElementById('game-container');
        this.renderSystem = new RenderSystem(container);

        console.log('RenderSystem initialized');
        console.log('Canvas created:', this.renderSystem.getCanvas());
        console.log('Size:', this.renderSystem.getSize());
        
        // Initialize GameScene
        this.scene = new GameScene();
        console.log('GameScene initialized');
        
        // Initialize InputController with canvas
        this.inputController = new InputController(this.renderSystem.getCanvas());
        console.log('InputController initialized');
        
        // Create Three.js camera
        const { width, height } = this.renderSystem.getSize();
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.camera.fov,
            width / height,
            CONFIG.camera.near,
            CONFIG.camera.far
        );
        console.log('Camera initialized');
        
        // Initialize CameraController
        this.cameraController = new CameraController(this.camera, this.inputController);
        console.log('CameraController initialized');
    }
    
    start() {
        // TODO: Start the game loop and set game state to running
        this.isRunning = true;
        this.requestAnimationFrame = window.requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    gameLoop(currentTime) {
        // TODO: Calculate delta time and update all systems
        // Call update methods for all entities and systems
        // Handle collisions
        // Render the scene
        // Continue animation loop
        
        // Calculate delta time
        if (this.lastTime === 0) this.lastTime = currentTime;
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.frameCount++;
        
        // Update camera controller
        if (this.cameraController) {
            this.cameraController.update(this.deltaTime);
        }
        
        // Render the scene
        if (this.scene && this.camera && this.renderSystem) {
            this.renderSystem.render(this.scene.getScene(), this.camera);
        }
        
        // DEBUG: Log input controller state every 240 frames (~4 seconds at 60fps)
        if (this.frameCount % 240 === 0 && this.inputController) {
            const rotation = this.inputController.getRotation();
            const pressedKeys = Object.entries(this.inputController.keys)
                .filter(([key, pressed]) => pressed)
                .map(([key]) => key);
            
            console.log(
                `[Frame ${this.frameCount}] Rotation - Yaw: ${rotation.yaw.toFixed(2)}, Pitch: ${rotation.pitch.toFixed(2)} | ` +
                `Pointer Locked: ${this.inputController.isPointerLocked} | ` +
                `Keys: ${pressedKeys.length > 0 ? pressedKeys.join(', ') : 'none'}`
            );
        }
        
        // Continue the game loop
        window.requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    update(deltaTime) {
        // TODO: Update game logic
        // - Update input
        // - Update snake
        // - Update camera
        // - Check collisions
        // - Update HUD
    }
    
    render() {
        // TODO: Render the scene
    }
    
    nextLevel() {
        // TODO: Transition to next level
        // - Increment level
        // - Update level settings
        // - Reset entities
        // - Show level complete screen
    }
    
    gameOver() {
        // TODO: Handle game over state
        // - Stop game loop
        // - Show game over screen
        // - Offer restart option
    }
    
    restart() {
        // TODO: Reset game state and restart
    }
    
    pause() {
        // TODO: Pause the game
        this.isPaused = true;
    }
    
    resume() {
        // TODO: Resume the game
        this.isPaused = false;
    }
    
    dispose() {
        // TODO: Clean up resources
        // - Remove event listeners
        // - Dispose THREE.js objects
        // - Cancel animation frame
    }
}

export default Game;
