/**
 * Collision System
 * Handles collision detection between snake and other objects
 */

import CONFIG from '../config.js';

class CollisionSystem {
    constructor() {
        this.lastCollisionCheckTime = 0;
        this.checkInterval = CONFIG.physics.collisionCheckInterval;
    }

    update(snake, apple, cube) {
        const result = { appleCollision: false, selfCollision: false, wallCollision: false };
        if (!snake) return result;

        if (apple?.getMesh()) {
            result.appleCollision = this.checkSnakeAppleCollision(snake, apple);
        }
        result.selfCollision = this.checkSnakeSelfCollision(snake);
        if (cube) {
            result.wallCollision = this.checkSnakeCubeCollision(snake, cube);
        }
        return result;
    }

    checkSnakeAppleCollision(snake, apple) {
        const headPos = snake.getHeadPosition();
        const applePos = apple.getPosition();
        const headRadius = snake.radius * 1.2;
        const appleRadius = CONFIG.apple.radius;
        const dist = this.calculateDistance(headPos, applePos);
        return dist < headRadius + appleRadius;
    }
    
    checkSnakeSelfCollision(snake) {
        const threshold = CONFIG.physics.selfCollisionThreshold;
        if (snake.length <= threshold) return false;

        const headPos = snake.getHeadPosition();
        const headRadius = snake.radius * 1.2;
        const bodyRadius = snake.radius;

        for (let i = threshold; i < snake.segmentPositions.length; i++) {
            const segmentPos = snake.segmentPositions[i];
            const dist = this.calculateDistance(headPos, segmentPos);
            if (dist < headRadius + bodyRadius) {
                return true;
            }
        }
        return false;
    }
    
    checkSnakeCubeCollision(snake, cube) {
        const headPos = snake.getHeadPosition();
        const headRadius = snake.radius * 1.2;
        const { min, max } = cube.getBounds();

        if (headPos.x - headRadius < min.x ||
            headPos.x + headRadius > max.x ||
            headPos.y - headRadius < min.y ||
            headPos.y + headRadius > max.y ||
            headPos.z - headRadius < min.z ||
            headPos.z + headRadius > max.z) {
            return true;
        }
        return false;
    }
    
    calculateDistance(point1, point2) {
        return point1.distanceTo(point2);
    }
}

export default CollisionSystem;
