// --- Imports ---

import { GRID_COLS, DIFFICULTIES, RANKING_MAX_ENTRIES } from './config.js';
import { ranking } from './ranking.js';

// --- Class UIManager ---

export class UIManager {
  // --- Private Fields ---

  #canvas;
  #ctx;
  #cellSize = 20;
  #activeStatusBeforeHelp = null;
  #currentScreen = 'screen-home';
  #previousScreen = 'screen-home';
  #selectedDifficultyKey = 'easy';
  #resizeObserver = null;

  // --- Constructor ---

  constructor(canvasEl) {
    this.#canvas = canvasEl;
    this.#ctx = canvasEl.getContext('2d');
    this.#initCanvas();
    this.#initFooterYear();
    this.#initDifficultySelector();
    this.#renderHelpModal();
  }

  // --- Getters ---

  get cellSize() {
    return this.#cellSize;
  }

  get selectedDifficultyKey() {
    return this.#selectedDifficultyKey;
  }

  get currentScreen() {
    return this.#currentScreen;
  }

  get previousScreen() {
    return this.#previousScreen;
  }

  // --- Canvas Init & Resize ---

  #initCanvas() {
    const container = this.#canvas.parentElement;
    this.#resizeObserver = new ResizeObserver(() => this.#resizeCanvas());
    this.#resizeObserver.observe(container);
    this.#resizeCanvas();
  }

  #resizeCanvas() {
    const container = this.#canvas.parentElement;
    const size = Math.floor(
      Math.min(container.clientWidth, container.clientHeight) / GRID_COLS
    ) * GRID_COLS;
    this.#canvas.width = size || 400;
    this.#canvas.height = size || 400;
    this.#cellSize = this.#canvas.width / GRID_COLS;
  }

  // --- Footer Year ---

  #initFooterYear() {
    const el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  // --- Difficulty Selector ---

  #initDifficultySelector() {
    ['easy', 'medium', 'hard'].forEach((key) => {
      const btnId = { easy: 'btn-easy', medium: 'btn-medium', hard: 'btn-hard' }[key];
      const btn = document.getElementById(btnId);
      if (!btn) return;
      btn.addEventListener('click', () => {
        this.#selectedDifficultyKey = key;
        document.querySelectorAll('.difficulty-btn').forEach((b) =>
          b.classList.remove('difficulty-btn--active')
        );
        btn.classList.add('difficulty-btn--active');
      });
    });
  }

  // --- Screen Management ---

  showScreen(screenId) {
    const screens = document.querySelectorAll('section.screen');
    screens.forEach((s) => {
      s.classList.remove('screen--active');
      s.classList.add('screen--hidden');
    });
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.remove('screen--hidden');
      target.classList.add('screen--active');
      this.#previousScreen = this.#currentScreen;
      this.#currentScreen = screenId;
    }
  }

  // --- Modal Management ---

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('modal--hidden');
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('modal--hidden');
    }
  }

  // --- Help Modal ---

  openHelpModal(statusBeforeHelp) {
    this.#activeStatusBeforeHelp = statusBeforeHelp;
    this.openModal('modal-help');
  }

  closeHelpModal(game) {
    this.closeModal('modal-help');
    const s = this.#activeStatusBeforeHelp;
    this.#activeStatusBeforeHelp = null;
    if (s === 'playing') {
      game.resume();
    }
    // s === 'paused' or null: do nothing
  }

  #renderHelpModal() {
    // Content already in HTML; nothing to dynamically generate
  }

  // --- Pause Overlay ---

  showPauseOverlay(session) {
    const overlay = document.getElementById('pause-overlay');
    if (!overlay) return;
    const scoreEl = overlay.querySelector('#pause-score span');
    const timerEl = document.getElementById('pause-timer');
    const titleEl = overlay.querySelector('h2');
    const resumeBtn = document.getElementById('btn-resume');
    const isInitial = session && session.elapsedMs === 0;
    if (scoreEl) scoreEl.textContent = session ? session.score : '';
    if (timerEl) timerEl.textContent = session ? `Tempo: ${this.#formatTime(session.elapsedMs)}` : '';
    if (titleEl) titleEl.textContent = isInitial ? 'PRONTO?' : 'PAUSADO';
    if (resumeBtn) resumeBtn.textContent = isInitial ? '▶ Iniciar' : '▶ Retomar';
    overlay.classList.remove('pause-overlay--hidden');
  }

  hidePauseOverlay() {
    const overlay = document.getElementById('pause-overlay');
    if (overlay) overlay.classList.add('pause-overlay--hidden');
  }

  // --- Render ---

  render(snake, arena, session) {
    const ctx = this.#ctx;
    const cs = this.#cellSize;
    const w = this.#canvas.width;
    const h = this.#canvas.height;
    const style = getComputedStyle(document.documentElement);
    const get = (v) => style.getPropertyValue(v).trim();

    // Background
    ctx.fillStyle = get('--clr-bg');
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = get('--clr-grid');
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= w; x += cs) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y <= h; y += cs) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Obstacles
    ctx.fillStyle = get('--clr-obstacle');
    ctx.shadowBlur = 0;
    arena.obstacles.forEach(({ x, y }) => {
      ctx.fillRect(x * cs + 2, y * cs + 2, cs - 4, cs - 4);
    });

    // Food
    ctx.shadowBlur = 12;
    ctx.shadowColor = get('--clr-food');
    ctx.fillStyle = get('--clr-food');
    const fx = arena.food.x * cs + cs / 2;
    const fy = arena.food.y * cs + cs / 2;
    ctx.beginPath();
    ctx.arc(fx, fy, cs / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Snake body
    ctx.shadowBlur = 10;
    ctx.shadowColor = get('--clr-snake');
    ctx.fillStyle = get('--clr-snake');
    snake.segments.slice(1).forEach(({ x, y }) => {
      ctx.fillRect(x * cs + 1, y * cs + 1, cs - 2, cs - 2);
    });

    // Snake head
    ctx.shadowBlur = 14;
    ctx.shadowColor = get('--clr-snake-head');
    ctx.fillStyle = get('--clr-snake-head');
    const head = snake.head;
    const margin = Math.floor(cs * 0.05);
    ctx.fillRect(head.x * cs + margin, head.y * cs + margin, cs - margin * 2, cs - margin * 2);
    ctx.shadowBlur = 0;

    // Wall border (drawn last — never obscured by game objects)
    ctx.shadowBlur = 14;
    ctx.shadowColor = get('--clr-wall');
    ctx.strokeStyle = get('--clr-wall');
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, w - 3, h - 3);
    ctx.shadowBlur = 0;
    ctx.lineWidth = 0.5;

    this.#updateHUD(session);
  }

  // --- HUD Update (private) ---

  #updateHUD(session) {
    const score = document.getElementById('hud-score');
    const bestValue = document.getElementById('hud-best-value');
    const timer = document.getElementById('hud-timer');
    const level = document.getElementById('hud-level');
    const multiplier = document.getElementById('hud-multiplier');

    if (score) score.textContent = session.score;
    if (bestValue) {
      bestValue.textContent =
        session.bestScoreAtStart !== null ? session.bestScoreAtStart : '—';
    }
    if (timer) timer.textContent = this.#formatTime(session.elapsedMs);
    if (level) level.textContent = session.difficulty.label;
    if (multiplier) multiplier.textContent = `×${session.difficulty.scoreMultiplier}`;
  }

  // --- Format Time ---

  #formatTime(ms) {
    const minutes = String(Math.floor(ms / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  // --- Game Over ---

  showGameOver(session) {
    this.showScreen('screen-gameover');

    const statusMsg = document.getElementById('gameover-status-msg');
    const scoreEl = document.getElementById('gameover-score');
    const timeEl = document.getElementById('gameover-time');
    const levelEl = document.getElementById('gameover-level');
    const noQualify = document.getElementById('gameover-no-qualify');

    if (scoreEl) scoreEl.textContent = session.score;
    if (timeEl) timeEl.textContent = this.#formatTime(session.elapsedMs);
    if (levelEl) levelEl.textContent = session.difficulty.label;

    if (session.status === 'complete') {
      if (statusMsg) {
        statusMsg.textContent = 'Campo Completo! 🏆';
        statusMsg.style.color = 'var(--clr-accent)';
        statusMsg.classList.remove('animate-shake');
      }
    } else {
      if (statusMsg) {
        statusMsg.textContent = 'GAME OVER';
        statusMsg.style.color = '';
        statusMsg.classList.remove('animate-shake');
        void statusMsg.offsetWidth; // reflow to restart animation
        statusMsg.classList.add('animate-shake');
      }
    }

    if (ranking.qualifies(session.score)) {
      if (noQualify) noQualify.hidden = true;
      this.showSaveModal(session);
    } else {
      const minScore = (ranking.load()[RANKING_MAX_ENTRIES - 1]?.score ?? 0) + 1;
      if (noQualify) {
        noQualify.hidden = false;
        noQualify.textContent = `Não entrou no Top 5. Mínimo necessário: ${minScore} pontos`;
      }
    }
  }

  // --- Ranking ---

  showRanking(origin) {
    this.#renderRanking();
    this.showScreen('screen-ranking');
  }

  #renderRanking() {
    const container = document.getElementById('ranking-table');
    if (!container) return;
    const entries = ranking.load();

    if (entries.length === 0) {
      container.innerHTML =
        '<p class="empty-msg">Nenhum score registrado. Jogue e entre para o Top 5!</p>';
      return;
    }

    const rows = entries
      .map(
        (e, i) =>
          `<tr>
             <td>${i + 1}º</td>
             <td>${this.#escapeHtml(e.playerName)}</td>
             <td>${e.score}</td>
             <td>${this.#difficultyLabel(e.difficulty)}</td>
             <td>${e.savedAt.slice(0, 10).split('-').reverse().join('/')}</td>
           </tr>`
      )
      .join('');

    container.innerHTML = `
      <table>
        <thead>
          <tr><th>#</th><th>Nome</th><th>Score</th><th>Dificuldade</th><th>Data</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  #difficultyLabel(key) {
    return DIFFICULTIES[key]?.label ?? key;
  }

  #escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // --- Save Name Modal ---

  showSaveModal(session) {
    const modalScore = document.getElementById('modal-score');
    const modalLevel = document.getElementById('modal-level');
    const nameInput = document.getElementById('name-input');
    const nameError = document.getElementById('name-error');
    const saveBtn = document.getElementById('btn-save-name');

    if (modalScore) modalScore.textContent = session.score;
    if (modalLevel) modalLevel.textContent = session.difficulty.label;
    if (nameInput) nameInput.value = '';
    if (nameError) nameError.textContent = '';
    if (saveBtn) saveBtn.disabled = true;

    this.#activeSaveSession = session;
    this.openModal('modal-save-name');
  }

  // Stored reference for save modal handlers (set by showSaveModal)
  #activeSaveSession = null;

  getActiveSaveSession() {
    return this.#activeSaveSession;
  }

  clearActiveSaveSession() {
    this.#activeSaveSession = null;
  }
}

// --- Singleton Init ---

const canvasEl = document.getElementById('game-canvas');
export const ui = new UIManager(canvasEl);
