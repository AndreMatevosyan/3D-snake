/**
 * Level System
 * Manages level progression and difficulty scaling
 */

import CONFIG from '../config.js';

class LevelSystem {
    constructor() {
        this.currentLevel = 1;
        this.applesEaten = 0;
    }
    
    initialize(level = 1) {
        // TODO: Set up initial level settings
        this.currentLevel = level;
        this.applesEaten = 0;
    }
    
    update() {
        // TODO: Check if level should progress
        // Called when checking if apple requirement is met
    }
    
    getAppleRequirement() {
        // TODO: Return number of apples needed to complete current level
        // Based on CONFIG.levels.appleRequirement
        return CONFIG.levels.appleRequirement[this.currentLevel] || 20;
    }
    
    getSpeedMultiplier() {
        // TODO: Return speed multiplier for current level
        // Based on CONFIG.levels.speedMultiplier
        return CONFIG.levels.speedMultiplier[this.currentLevel] || 1.0;
    }
    
    getRadiusMultiplier() {
        // TODO: Return radius multiplier based on level
        // Increases as levels progress
        return 1.0 + (this.currentLevel - 1) * 0.2;
    }
    
    shouldLevelUp(applesEaten) {
        // TODO: Check if apple requirement is met
        return applesEaten >= this.getAppleRequirement();
    }
    
    nextLevel() {
        // TODO: Advance to next level
        // - Increment level
        // - Reset apple counter
        // - Return new level data
    }
    
    getLevelData() {
        // TODO: Return complete level configuration data
        return {
            level: this.currentLevel,
            appleRequirement: this.getAppleRequirement(),
            speedMultiplier: this.getSpeedMultiplier(),
            radiusMultiplier: this.getRadiusMultiplier(),
            cubeSize: CONFIG.cube.initialSize - (this.currentLevel - 1) * CONFIG.cube.sizeDecrement,
        };
    }
    
    reset() {
        // TODO: Reset level system to level 1
        this.currentLevel = 1;
        this.applesEaten = 0;
    }
}

export default LevelSystem;
