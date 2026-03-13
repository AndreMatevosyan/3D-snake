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
import Hawk from './entities/Hawk.js';
import Powerup, { POWERUP_TYPES } from './entities/Powerup.js';
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
        this.levelSystem = new LevelSystem();
        this.renderSystem = null;
        
        // Game entities
        this.snake = null;
        this.apple = null;
        this.cube = null;
        this.shatteringCube = null;
        this.hawks = [];
        this.powerup = null;

        // Powerup state
        this.immunityRemaining = 0;
        this.slowCharges = 0;
        this.slowActiveRemaining = 0;
        this.baseSpeed = CONFIG.snake.initialSpeed;
        
        // Time
        this.lastTime = 0;
        this.deltaTime = 0;
        this.frameCount = 0;
        this.pauseOverlay = null;
        this.showingIntro = true;
        this.wallCollisionGraceFrames = 0;
        this.vKeyWasPressedLastFrame = false;

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
        this.spawnHawks();
        this.schedulePowerupSpawn();

        this.levelSystem.initialize(1);
        this.currentLevel = this.levelSystem.currentLevel;
        this.applyLevelSettings();

        this._boundKeyDown = this.onPauseKeyDown.bind(this);
        document.addEventListener('keydown', this._boundKeyDown);

        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }

        this.showIntroScreen();
    }

    applyLevelSettings({ animate = false } = {}) {
        const levelData = this.levelSystem.getLevelData();
        if (this.snake) {
            const baseSpeed = CONFIG.snake.initialSpeed * levelData.speedMultiplier;
            this.baseSpeed = baseSpeed;
            this.applySpeedModifier();
        }
        this.spawnHawks();
        if (this.cube) {
            const oldSize = this.cube.size;
            const newSize = levelData.cubeSize;

            if (animate && newSize !== oldSize) {
                // Build the new larger cube behind the old one
                const newCube = new Cube(newSize);
                newCube.initialize();
                this.scene.addObject(newCube.getGroup(), false);

                // Shatter the old cube; once done, remove its group from the scene
                const oldCube = this.cube;
                this.shatteringCube = oldCube;
                oldCube.shatter(() => {
                    this.scene.getScene().remove(oldCube.getGroup());
                    oldCube.dispose();
                    this.shatteringCube = null;
                });

                // Immediately swap the active cube so bounds use the new size
                this.cube = newCube;
            } else {
                this.cube.resize(newSize);
            }
        }
    }

    showIntroScreen() {
        this.introOverlay = showOverlay(
            '3D Snake',
            'Press P to start',
            'Play',
            () => this.hideIntroAndStart(),
            'intro'
        );
        this.introLoop();
    }

    introLoop() {
        if (!this.showingIntro) return;
        if (this.apple) this.apple.update(1 / 60);
        if (this.scene && this.camera && this.renderSystem) {
            this.renderSystem.render(this.scene.getScene(), this.camera);
        }
        requestAnimationFrame(() => this.introLoop());
    }

    hideIntroAndStart() {
        this.showingIntro = false;
        if (this.introOverlay?.parentNode) {
            this.introOverlay.remove();
        }
        this.introOverlay = null;
        document.body.classList.remove('intro');
        this.start();
    }

    onPauseKeyDown(event) {
        if ((event.code || event.key) !== 'KeyP' || event.repeat) return;
        event.preventDefault();

        if (this.showingIntro) {
            this.hideIntroAndStart();
        } else if (this.isRunning) {
            this.togglePause();
        }
    }

    togglePause() {
        if (!this.isRunning) return;
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
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

    getHawkCount() {
        const cfg = CONFIG.hawk;
        if (this.levelSystem.currentLevel < cfg.minLevel) return 0;
        const extra = this.levelSystem.currentLevel - cfg.minLevel;
        return Math.min(extra + 1, cfg.maxCount);
    }

    spawnHawks() {
        for (const hawk of this.hawks) {
            this.scene.removeObject(hawk.getGroup());
            hawk.dispose();
        }
        this.hawks = [];

        const count = this.getHawkCount();
        if (count === 0 || !this.cube) return;

        const { min, max } = this.cube.getBounds();
        const margin = 5;
        const spawnMin = min.clone().addScalar(margin);
        const spawnMax = max.clone().subScalar(margin);
        const bounds = { min: spawnMin, max: spawnMax };

        for (let i = 0; i < count; i++) {
            const position = randomPointInBounds(spawnMin, spawnMax);
            const hawk = new Hawk(position, bounds);
            this.hawks.push(hawk);
            this.scene.addObject(hawk.getGroup());
        }
    }

    schedulePowerupSpawn() {
        this.powerupSpawnTimer = CONFIG.powerup.spawnInterval * 0.5;
    }

    trySpawnPowerup(deltaTime) {
        if (this.powerup) return;
        this.powerupSpawnTimer -= deltaTime;
        if (this.powerupSpawnTimer > 0) return;

        const { min, max } = this.cube.getBounds();
        const margin = 4;
        const spawnMin = min.clone().addScalar(margin);
        const spawnMax = max.clone().subScalar(margin);
        const position = randomPointInBounds(spawnMin, spawnMax);

        const type = Math.random() < 0.5 ? POWERUP_TYPES.IMMUNITY : POWERUP_TYPES.SLOW;
        this.powerup = new Powerup(type, position);
        this.scene.addObject(this.powerup.getMesh());
        this.schedulePowerupSpawn();
    }

    removePowerup() {
        if (this.powerup) {
            this.scene.removeObject(this.powerup.getMesh());
            this.powerup.dispose();
            this.powerup = null;
        }
    }

    applySpeedModifier() {
        if (!this.snake) return;
        const mult = this.slowActiveRemaining > 0 ? CONFIG.powerup.slowMultiplier : 1;
        this.snake.setVelocity(this.baseSpeed * mult);
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

        if (this.isPaused) {
            if (this.scene && this.camera && this.renderSystem) {
                this.renderSystem.render(this.scene.getScene(), this.camera);
            }
            if (this.isRunning) {
                window.requestAnimationFrame(this.gameLoop.bind(this));
            }
            return;
        }
        
        // DEBUG: R key adds a segment (simulates eating an apple)
        if (this.inputController?.isKeyPressed('KeyR') && !this._rHeld) {
            this._rHeld = true;
            this.snake.addSegment();
            this.score++;
            this.levelSystem.recordAppleEaten();
            if (this.levelSystem.shouldLevelUp()) {
                const prevLevel = this.levelSystem.currentLevel;
                this.levelSystem.nextLevel();
                this.currentLevel = this.levelSystem.currentLevel;
                console.log(`LEVEL UP: ${prevLevel} → ${this.currentLevel} | Speed multiplier: ${this.levelSystem.getSpeedMultiplier()}`);
                this.applyLevelSettings({ animate: true });
                this.wallCollisionGraceFrames = 60;
            }
        }
        if (!this.inputController?.isKeyPressed('KeyR')) {
            this._rHeld = false;
        }

        // L key: activate slow powerup
        if (this.inputController?.isKeyPressed('KeyL') && !this._lHeld && this.slowCharges > 0 && this.slowActiveRemaining <= 0) {
            this._lHeld = true;
            this.slowCharges--;
            this.slowActiveRemaining = CONFIG.powerup.slowDuration;
            this.applySpeedModifier();
        }
        if (!this.inputController?.isKeyPressed('KeyL')) {
            this._lHeld = false;
        }

        // Tick powerup timers
        if (this.immunityRemaining > 0) {
            this.immunityRemaining -= this.deltaTime;
        }
        if (this.slowActiveRemaining > 0) {
            this.slowActiveRemaining -= this.deltaTime;
            if (this.slowActiveRemaining <= 0) this.applySpeedModifier();
        }

        // Update snake
        if (this.snake && this.inputController) {
            this.snake.update(this.deltaTime, this.inputController.getRotation());
        }

        // Update apple
        if (this.apple) {
            this.apple.update(this.deltaTime);
        }

        // Update hawks
        const bounds = this.cube?.getBounds();
        if (bounds) {
            for (const hawk of this.hawks) {
                hawk.update(this.deltaTime);
            }
        }

        // Update powerup and try spawn
        if (this.powerup) this.powerup.update(this.deltaTime);
        this.trySpawnPowerup(this.deltaTime);

        // Tick the shattering cube animation
        if (this.shatteringCube) {
            this.shatteringCube.update(this.deltaTime);
        }

        // Collision: snake eats apple, powerup, or hits hawk/self/wall
        if (this.collisionSystem && this.snake) {
            const collision = this.collisionSystem.update(
                this.snake,
                this.apple,
                this.cube,
                this.hawks,
                this.powerup
            );
            if (collision.powerupCollision) {
                if (collision.powerupCollision === POWERUP_TYPES.IMMUNITY) {
                    this.immunityRemaining = CONFIG.powerup.immunityDuration;
                } else if (collision.powerupCollision === POWERUP_TYPES.SLOW) {
                    this.slowCharges++;
                }
                this.removePowerup();
            }
            if (collision.appleCollision) {
                this.snake.addSegment();
                this.score++;
                this.levelSystem.recordAppleEaten();
                if (this.levelSystem.shouldLevelUp()) {
                    const prevLevel = this.levelSystem.currentLevel;
                    this.levelSystem.nextLevel();
                    this.currentLevel = this.levelSystem.currentLevel;
                    console.log(`LEVEL UP: ${prevLevel} → ${this.currentLevel} | Speed multiplier: ${this.levelSystem.getSpeedMultiplier()}`);
                    this.applyLevelSettings({ animate: true });
                    this.wallCollisionGraceFrames = 60;
                }
                this.spawnApple();
            }
            if (this.wallCollisionGraceFrames > 0) {
                this.wallCollisionGraceFrames--;
            }
            const wallDeath = collision.wallCollision && this.wallCollisionGraceFrames <= 0;
            const hawkDeath = collision.hawkCollision && this.immunityRemaining <= 0;
            if (collision.selfCollision || wallDeath || hawkDeath) {
                this.gameOver(hawkDeath ? 3 : undefined);
                return;
            }
        }

        // V key: toggle camera between behind and front of snake
        if (this.inputController?.isKeyPressed('KeyV') && !this.vKeyWasPressedLastFrame) {
            this.cameraController?.setFrontViewMode(!this.cameraController.getFrontViewMode());
            this.vKeyWasPressedLastFrame = true;
        } else if (!this.inputController?.isKeyPressed('KeyV')) {
            this.vKeyWasPressedLastFrame = false;
        }

        // Update camera to follow snake
        if (this.cameraController && this.snake) {
            this.cameraController.setTarget(
                this.snake.getHeadPosition(),
                this.snake.getDirection()
            );
            this.cameraController.update();
        }

        // Fade walls between camera and snake head so they don't block the view
        if (this.cube && this.camera && this.snake) {
            this.cube.updateWallTransparency(
                this.camera.position,
                this.snake.getHeadPosition()
            );
        }

        // Keep HUD in sync with level system and update display
        this.currentLevel = this.levelSystem.currentLevel;
        updateHUD(
            this.currentLevel,
            this.score,
            this.snake?.length ?? 0,
            this.levelSystem.applesEaten,
            this.levelSystem.getAppleRequirement(),
            this.immunityRemaining,
            this.slowCharges,
            this.slowActiveRemaining
        );

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
    
    gameOver(restartLevel = undefined) {
        this.isRunning = false;
        document.exitPointerLock?.();
        const message = `Score: ${this.score}`;
        showOverlay('Game Over', message, 'Restart', () => this.restart(restartLevel));
    }

    restart(startLevel = 1) {
        this.isPaused = false;
        if (this.pauseOverlay?.parentNode) {
            this.pauseOverlay.remove();
        }
        this.pauseOverlay = null;
        document.body.classList.remove('paused', 'game-over', 'intro');

        if (this.shatteringCube) {
            this.scene.getScene().remove(this.shatteringCube.getGroup());
            this.shatteringCube.dispose();
            this.shatteringCube = null;
        }
        for (const hawk of this.hawks) {
            this.scene.removeObject(hawk.getGroup());
            hawk.dispose();
        }
        this.hawks = [];
        this.removePowerup();
        this.scene.clear();

        this.score = 0;
        this.lastTime = 0;
        this.frameCount = 0;
        this.wallCollisionGraceFrames = 0;
        this.immunityRemaining = 0;
        this.slowCharges = 0;
        this.slowActiveRemaining = 0;
        this.levelSystem.reset();
        this.levelSystem.initialize(startLevel);
        this.currentLevel = startLevel;

        this.snake = new Snake(new THREE.Vector3(0, 0, 0));
        this.snake.initialize();
        this.scene.addObject(this.snake.getGroup());
        this.applyLevelSettings();

        this.apple.initialize();
        this.spawnApple();
        this.spawnHawks();
        this.schedulePowerupSpawn();

        this.cameraController.setTarget(
            this.snake.getHeadPosition(),
            this.snake.getDirection()
        );

        updateHUD(
            this.currentLevel,
            this.score,
            this.snake.length,
            this.levelSystem.applesEaten,
            this.levelSystem.getAppleRequirement(),
            this.immunityRemaining,
            this.slowCharges,
            this.slowActiveRemaining
        );
        this.isRunning = true;
        this.inputController?.requestPointerLock();
        window.requestAnimationFrame(this.gameLoop.bind(this));
    }

    pause() {
        this.isPaused = true;
        document.exitPointerLock?.();
        this.pauseOverlay = showOverlay(
            'Paused',
            'Press P to resume',
            'Resume',
            () => this.resume(),
            'paused'
        );
    }

    resume() {
        this.isPaused = false;
        if (this.pauseOverlay?.parentNode) {
            this.pauseOverlay.remove();
        }
        this.pauseOverlay = null;
        document.body.classList.remove('paused');
    }
    
    dispose() {
        // TODO: Clean up resources
        // - Remove event listeners
        // - Dispose THREE.js objects
        // - Cancel animation frame
    }
}

export default Game;
