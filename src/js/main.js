import { SceneManager } from './core/SceneManager.js';

let sceneManager = null;

function startGame() {
    // Remove old canvas if restarting
    const oldCanvas = document.querySelector('canvas');
    if (oldCanvas) oldCanvas.remove();

    sceneManager = new SceneManager();

    // Hide overlays
    document.getElementById('start-overlay').style.display = 'none';
    document.getElementById('gameover-overlay').style.display = 'none';

    // Listen for game over event
    window.onGameOver = () => {
        document.getElementById('gameover-overlay').style.display = 'flex';
    };
}

document.getElementById('start-btn').onclick = startGame;
document.getElementById('restart-btn').onclick = startGame;

// Optionally, start on Enter key
window.addEventListener('keydown', (e) => {
    if (document.getElementById('start-overlay').style.display !== 'none' && e.key === 'Enter') {
        startGame();
    }
});