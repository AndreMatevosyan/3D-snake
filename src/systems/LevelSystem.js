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
        this.currentLevel = level;
        this.applesEaten = 0;
    }
    
    update() {
        // TODO: Check if level should progress
        // Called when checking if apple requirement is met
    }
    
    getAppleRequirement() {
        return CONFIG.levels.appleRequirement[this.currentLevel] || 20;
    }
    
    getSpeedMultiplier() {
        return CONFIG.levels.speedMultiplier[this.currentLevel] || 1.0;
    }
    
    getRadiusMultiplier() {
        return 1.0 + (this.currentLevel - 1) * 0.2;
    }
    
    shouldLevelUp(applesEaten) {
        return applesEaten >= this.getAppleRequirement();
    }
    
    nextLevel() {
        // TODO: Advance to next level
        // - Increment level
        // - Reset apple counter
        // - Return new level data
    }
    
    getLevelData() {
        return {
            level: this.currentLevel,
            appleRequirement: this.getAppleRequirement(),
            speedMultiplier: this.getSpeedMultiplier(),
            radiusMultiplier: this.getRadiusMultiplier(),
            cubeSize: CONFIG.cube.initialSize - (this.currentLevel - 1) * CONFIG.cube.sizeDecrement,
        };
    }
    
    reset() {
        this.currentLevel = 1;
        this.applesEaten = 0;
    }
}

export default LevelSystem;
