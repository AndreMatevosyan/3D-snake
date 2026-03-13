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
    
    recordAppleEaten() {
        this.applesEaten++;
    }

    getAppleRequirement() {
        const req = CONFIG.levels.appleRequirement[this.currentLevel - 1];
        return req !== undefined ? req : 20;
    }

    getSpeedMultiplier() {
        const mult = CONFIG.levels.speedMultiplier[this.currentLevel - 1];
        return mult !== undefined ? mult : 1.0;
    }
    
    getRadiusMultiplier() {
        return 1.0 + (this.currentLevel - 1) * 0.2;
    }
    
    shouldLevelUp() {
        return this.applesEaten >= this.getAppleRequirement();
    }

    nextLevel() {
        this.currentLevel++;
        this.applesEaten = 0;
        return this.getLevelData();
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
