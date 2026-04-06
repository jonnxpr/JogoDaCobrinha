// --- Imports ---

import { DIFFICULTIES, MAP_SIZES } from './config.js';
import { game } from './game.js';
import { ranking } from './ranking.js';
import { ui } from './ui.js';

// --- Keyboard ---

document.addEventListener('keydown', (e) => {
  const modal = !document.getElementById('modal-help').classList.contains('modal--hidden')
    || !document.getElementById('modal-save-name').classList.contains('modal--hidden');

  if (modal) {
    // ESC closes open modal (but not save-name if unsaved)
    if (e.key === 'Escape') {
      if (!document.getElementById('modal-help').classList.contains('modal--hidden')) {
        ui.closeHelpModal(game);
      }
    }
    return;
  }

  const screen = ui.currentScreen;

  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      game.getSnake()?.setDirection('UP');
      break;
    case 'ArrowDown':
      e.preventDefault();
      game.getSnake()?.setDirection('DOWN');
      break;
    case 'ArrowLeft':
      e.preventDefault();
      game.getSnake()?.setDirection('LEFT');
      break;
    case 'ArrowRight':
      e.preventDefault();
      game.getSnake()?.setDirection('RIGHT');
      break;
    case 'w': case 'W': game.getSnake()?.setDirection('UP'); break;
    case 's': case 'S': game.getSnake()?.setDirection('DOWN'); break;
    case 'a': case 'A': game.getSnake()?.setDirection('LEFT'); break;
    case 'd': case 'D': game.getSnake()?.setDirection('RIGHT'); break;
    case 'p': case 'P': {
      if (screen !== 'screen-game') break;
      const status = game.getSession()?.status;
      if (status === 'playing') game.pause();
      else if (status === 'paused') game.resume();
      break;
    }
    case 'Escape': {
      if (screen === 'screen-game') {
        game.quit();
        ui.showScreen('screen-home');
      }
      break;
    }
    case 'r': case 'R': {
      if (screen === 'screen-game') game.restart();
      break;
    }
    case 'h': case 'H': case '?': {
      const status = game.getSession()?.status;
      if (status === 'playing') game.pause();
      ui.openHelpModal(status ?? null);
      break;
    }
    default: break;
  }
});

// --- Swipe (Touch) ---

let touchStartX = 0;
let touchStartY = 0;
const SWIPE_THRESHOLD = 24;

const canvasEl = document.getElementById('game-canvas');
if (canvasEl) {
  canvasEl.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, { passive: true });

  canvasEl.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (Math.max(absDx, absDy) < SWIPE_THRESHOLD) return;
    if (absDx >= absDy) {
      game.getSnake()?.setDirection(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      game.getSnake()?.setDirection(dy > 0 ? 'DOWN' : 'UP');
    }
  }, { passive: true });
}

// --- On-screen D-Pad ---

[
  ['btn-up',    'UP'],
  ['btn-down',  'DOWN'],
  ['btn-left',  'LEFT'],
  ['btn-right', 'RIGHT'],
].forEach(([id, dir]) => {
  const btn = document.getElementById(id);
  if (!btn) return;
  const fire = () => game.getSnake()?.setDirection(dir);
  btn.addEventListener('click', fire);
  btn.addEventListener('touchstart', (e) => { e.preventDefault(); fire(); }, { passive: false });
});

// --- Pause/Resume/Restart Buttons ---

document.getElementById('btn-pause')?.addEventListener('click', () => {
  const status = game.getSession()?.status;
  if (status === 'playing') game.pause();
  else if (status === 'paused') game.resume();
});

document.getElementById('btn-resume')?.addEventListener('click', () => game.resume());
document.getElementById('btn-restart-paused')?.addEventListener('click', () => game.restart());
document.getElementById('btn-home-pause')?.addEventListener('click', () => {
  game.quit();
  ui.showScreen('screen-home');
});
document.getElementById('btn-restart-game')?.addEventListener('click', () => {
  if (ui.currentScreen === 'screen-game') game.restart();
});

// --- Home screen buttons ---

document.getElementById('btn-play')?.addEventListener('click', () => {
  const diff = DIFFICULTIES[ui.selectedDifficultyKey] ?? DIFFICULTIES.easy;
  const mapSize = MAP_SIZES[ui.selectedMapSizeKey] ?? MAP_SIZES.medium;
  game.start(diff, mapSize);
});

document.getElementById('btn-ranking-home')?.addEventListener('click', () => {
  ui.showRanking('home');
});

document.getElementById('btn-help-home')?.addEventListener('click', () => {
  ui.openHelpModal(null);
});

// --- Game Over Screen Buttons ---

document.getElementById('btn-restart-gameover')?.addEventListener('click', () => {
  game.restart();
});

document.getElementById('btn-ranking-gameover')?.addEventListener('click', () => {
  ui.showRanking('gameover');
});

document.getElementById('btn-home-gameover')?.addEventListener('click', () => {
  ui.showScreen('screen-home');
});

// --- Ranking Back / Play ---

document.getElementById('btn-back-ranking')?.addEventListener('click', () => {
  ui.showScreen(ui.previousScreen === 'screen-gameover' ? 'screen-gameover' : 'screen-home');
});

document.getElementById('btn-play-ranking')?.addEventListener('click', () => {
  const diff = DIFFICULTIES[ui.selectedDifficultyKey] ?? DIFFICULTIES.easy;
  const mapSize = MAP_SIZES[ui.selectedMapSizeKey] ?? MAP_SIZES.medium;
  ui.showScreen('screen-home');
  setTimeout(() => game.start(diff, mapSize), 0);
});

// --- Help Modal Close ---

document.getElementById('btn-close-help')?.addEventListener('click', () => {
  ui.closeHelpModal(game);
});

// --- Save Name Modal ---

const nameInput = document.getElementById('name-input');
const nameError = document.getElementById('name-error');
const saveBtn = document.getElementById('btn-save-name');

nameInput?.addEventListener('input', () => {
  const v = nameInput.value;
  if (!v.trim()) {
    nameError.textContent = '';
    saveBtn.disabled = true;
    return;
  }
  const result = ranking.validateName(v);
  nameError.textContent = result.valid ? '' : result.error;
  saveBtn.disabled = !result.valid;
});

document.getElementById('btn-save-name')?.addEventListener('click', () => {
  const session = ui.getActiveSaveSession();
  if (!session) return;
  const result = ranking.validateName(nameInput.value);
  if (!result.valid) {
    nameError.textContent = result.error;
    return;
  }
  ranking.save(nameInput.value.trim(), session.score, session.difficulty);
  ui.clearActiveSaveSession();
  ui.closeModal('modal-save-name');
  ui.showRanking('gameover');
});

document.getElementById('btn-random-name')?.addEventListener('click', () => {
  const name = ranking.generateRandomName();
  if (nameInput) {
    nameInput.value = name;
    nameInput.dispatchEvent(new Event('input'));
  }
});

document.getElementById('btn-skip-save')?.addEventListener('click', () => {
  ui.clearActiveSaveSession();
  ui.closeModal('modal-save-name');
  ui.showScreen('screen-home');
});

// --- Visibility Change (pause on tab switch) ---

document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.getSession()?.status === 'playing') {
    game.pause();
  }
});
