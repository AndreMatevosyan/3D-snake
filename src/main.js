/**
 * Main Entry Point
 * Initializes and starts the game
 */

import Game from './Game.js';

// Initialize the game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

function initGame() {
    const game = new Game();
    game.start();
}
