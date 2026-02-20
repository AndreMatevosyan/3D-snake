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
import Snake from './entities/Snake.js';
import Apple from './entities/Apple.js';
import Cube from './entities/Cube.js';
import { randomPointInBounds, updateHUD, showOverlay, distanceToBoxBounds } from './utils/helpers.js';

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
        this.collisionSystem = new CollisionSystem();
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

        // Create cube (container walls) and add to scene
        this.cube = new Cube();
        this.cube.initialize();
        this.scene.addObject(this.cube.getGroup(), false); // false = not dynamic (persists)

        // Create snake and add to scene
        this.snake = new Snake(new THREE.Vector3(0, 0, 0));
        this.snake.initialize();
        this.scene.addObject(this.snake.getGroup());
        this.cameraController.setTarget(
            this.snake.getHeadPosition(),
            this.snake.getDirection()
        );

        // Create apple and spawn first one
        this.apple = new Apple();
        this.apple.initialize();
        this.spawnApple();
    }

    spawnApple() {
        const { min, max } = this.cube.getBounds();
        const margin = 4;
        const spawnMin = min.clone().addScalar(margin);
        const spawnMax = max.clone().subScalar(margin);
        const position = randomPointInBounds(spawnMin, spawnMax);

        if (this.apple.getMesh()) {
            this.scene.removeObject(this.apple.getMesh());
        }
        this.apple.spawn(position);
        this.scene.addObject(this.apple.getMesh());
    }
    
    start() {
        this.isRunning = true;
        this.requestAnimationFrame = window.requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    gameLoop(currentTime) {
        // Calculate delta time
        if (this.lastTime === 0) this.lastTime = currentTime;
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.frameCount++;
        
        // Update snake
        if (this.snake && this.inputController) {
            this.snake.update(this.deltaTime, this.inputController.getRotation());
        }

        // Update apple
        if (this.apple) {
            this.apple.update(this.deltaTime);
        }

        // Collision: snake eats apple, or snake hits itself
        if (this.collisionSystem && this.snake) {
            const collision = this.collisionSystem.update(
                this.snake,
                this.apple,
                this.cube
            );
            if (collision.appleCollision) {
                this.snake.addSegment();
                this.score++;
                this.spawnApple();
            }
            if (collision.selfCollision || collision.wallCollision) {
                this.gameOver();
                return;
            }
        }

        // Update camera to follow snake (behind head)
        if (this.cameraController && this.snake) {
            this.cameraController.setTarget(
                this.snake.getHeadPosition(),
                this.snake.getDirection()
            );
            this.cameraController.update();
        }
        
        // Update HUD
        updateHUD(this.currentLevel, this.score, this.snake?.length ?? 0);

        // Update wall distance dial
        if (this.snake && this.cube) {
            const headPos = this.snake.getHeadPosition();
            const { min, max } = this.cube.getBounds();
            const dist = distanceToBoxBounds(headPos, min, max);
            const el = document.getElementById('wall-distance-value');
            if (el) el.textContent = Math.max(0, dist).toFixed(1);
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
        
        if (this.isRunning) {
            window.requestAnimationFrame(this.gameLoop.bind(this));
        }
    }
    
    nextLevel() {
        // TODO: Transition to next level
        // - Increment level
        // - Update level settings
        // - Reset entities
        // - Show level complete screen
    }
    
    gameOver() {
        this.isRunning = false;
        document.exitPointerLock?.();
        const message = `Score: ${this.score}`;
        showOverlay('Game Over', message, 'Restart', () => this.restart());
    }

    restart() {
        this.scene.clear();

        this.score = 0;
        this.currentLevel = 1;
        this.lastTime = 0;
        this.frameCount = 0;

        this.snake = new Snake(new THREE.Vector3(0, 0, 0));
        this.snake.initialize();
        this.scene.addObject(this.snake.getGroup());

        this.apple.initialize();
        this.spawnApple();

        this.cameraController.setTarget(
            this.snake.getHeadPosition(),
            this.snake.getDirection()
        );

        updateHUD(this.currentLevel, this.score, this.snake.length);
        this.isRunning = true;
        window.requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    pause() {
        this.isPaused = true;
    }
    
    resume() {
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
