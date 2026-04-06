// --- Imports ---

import { DIFFICULTIES } from './config.js';
import { ranking } from './ranking.js';
import { ui } from './ui.js';

// --- Class Snake ---

class Snake {
  // --- State ---

  segments;
  direction;
  pendingDirection;
  #cellSet;

  constructor({ startX, startY, direction = 'RIGHT' }) {
    this.direction = direction;
    this.pendingDirection = direction;
    this.segments = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
    ];
    this.#cellSet = new Set(this.segments.map(({ x, y }) => `${x},${y}`));
  }

  get head() {
    return this.segments[0];
  }

  // --- Movement ---

  move() {
    const next = this.#calcNextHead();
    this.segments.unshift(next);
    const tail = this.segments.pop();
    this.#cellSet.delete(`${tail.x},${tail.y}`);
    this.#cellSet.add(`${next.x},${next.y}`);
    this.direction = this.pendingDirection;
  }

  grow() {
    const next = this.#calcNextHead();
    this.segments.unshift(next);
    this.#cellSet.add(`${next.x},${next.y}`);
    this.direction = this.pendingDirection;
  }

  #calcNextHead() {
    const { x, y } = this.head;
    const deltas = { UP: { x: 0, y: -1 }, DOWN: { x: 0, y: 1 }, LEFT: { x: -1, y: 0 }, RIGHT: { x: 1, y: 0 } };
    const d = deltas[this.pendingDirection];
    return { x: x + d.x, y: y + d.y };
  }

  // --- Direction ---

  setDirection(dir) {
    const opposites = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
    if (opposites[dir] === this.direction) return;
    this.pendingDirection = dir;
  }

  occupiesCell(x, y) {
    return this.#cellSet.has(`${x},${y}`);
  }
}

// --- Class Arena ---

class Arena {
  obstacles = [];
  obstacleSet = new Set();
  food = { x: 0, y: 0 };

  #difficulty;
  #cols;
  #rows;

  constructor(difficulty, cols, rows) {
    this.#difficulty = difficulty;
    this.#cols = cols;
    this.#rows = rows;
  }

  // --- Empty Cells ---

  getEmptyCells(snakeSegments) {
    const occupied = new Set(snakeSegments.map(({ x, y }) => `${x},${y}`));
    this.obstacleSet.forEach((k) => occupied.add(k));
    const cells = [];
    for (let x = 0; x < this.#cols; x++) {
      for (let y = 0; y < this.#rows; y++) {
        if (!occupied.has(`${x},${y}`)) cells.push({ x, y });
      }
    }
    return cells;
  }

  // --- Obstacles ---

  generateObstacles(snakeSegments) {
    const empty = this.getEmptyCells(snakeSegments);
    const count = Math.min(this.#difficulty.obstacleCount, empty.length);
    this.obstacles = [];
    this.obstacleSet = new Set();
    const shuffled = empty.sort(() => Math.random() - 0.5).slice(0, count);
    shuffled.forEach(({ x, y }) => {
      this.obstacles.push({ x, y });
      this.obstacleSet.add(`${x},${y}`);
    });
  }

  // --- Food ---

  spawnFood(snakeSegments) {
    const empty = this.getEmptyCells(snakeSegments);
    if (empty.length === 0) return;
    const cell = empty[Math.floor(Math.random() * empty.length)];
    this.food = { x: cell.x, y: cell.y };
  }

  // --- Init ---

  init(snakeSegments) {
    this.generateObstacles(snakeSegments);
    this.spawnFood(snakeSegments);
  }
}

// --- Class GameSession ---

class GameSession {
  score = 0;
  elapsedMs = 0;
  status = 'idle';
  bestScoreAtStart = null;

  #difficulty;

  constructor(difficulty) {
    this.#difficulty = difficulty;
  }

  get difficulty() {
    return this.#difficulty;
  }

  addScore() {
    this.score += this.#difficulty.scoreMultiplier;
  }

  setStatus(s) {
    this.status = s;
  }
}

// --- Class Game ---

export class Game {
  // --- Private State ---

  #snake = null;
  #arena = null;
  #session = null;
  #rafId = null;
  #lastTime = 0;
  #accumulated = 0;
  #stepInterval = 0;
  #cols = 20;
  #rows = 20;
  #mapSize = null;
  #ui;
  #ranking;

  constructor(uiInstance, rankingInstance) {
    this.#ui = uiInstance;
    this.#ranking = rankingInstance;
  }

  // --- Getters ---

  getSnake() {
    return this.#snake;
  }

  getSession() {
    return this.#session;
  }

  // --- Start ---

  start(difficulty, mapSize) {
    const cols = mapSize?.cols ?? 20;
    const rows = mapSize?.rows ?? 20;
    this.#cols = cols;
    this.#rows = rows;
    this.#mapSize = mapSize ?? null;

    if (this.#rafId !== null) cancelAnimationFrame(this.#rafId);

    this.#session = new GameSession(difficulty);
    this.#snake = new Snake({
      startX: Math.floor(cols / 2),
      startY: Math.floor(rows / 2),
      direction: 'RIGHT',
    });
    this.#arena = new Arena(difficulty, cols, rows);
    this.#arena.init(this.#snake.segments);

    this.#session.bestScoreAtStart = this.#ranking.load()[0]?.score ?? null;
    this.#stepInterval = Math.floor(1000 / difficulty.speed);
    this.#lastTime = 0;
    this.#accumulated = 0;

    this.#ui.updateActiveCols(cols);
    this.#ui.showScreen('screen-game');

    if (difficulty.name === 'hard') {
      this.#session.setStatus('paused');
      this.#ui.render(this.#snake, this.#arena, this.#session);
      this.#ui.showPauseOverlay(this.#session);
    } else {
      this.#session.setStatus('playing');
      this.#rafId = requestAnimationFrame(this.#loop.bind(this));
    }
  }

  // --- Game Loop ---

  #loop(timestamp) {
    const delta = this.#lastTime === 0 ? 0 : timestamp - this.#lastTime;
    this.#lastTime = timestamp;

    if (this.#session.status === 'playing') {
      this.#session.elapsedMs += delta;
      this.#accumulated += delta;
      while (this.#accumulated >= this.#stepInterval) {
        this.#tick();
        this.#accumulated -= this.#stepInterval;
        if (this.#session.status !== 'playing') {
          this.#rafId = null;
          return;
        }
      }
    }

    this.#ui.render(this.#snake, this.#arena, this.#session);
    this.#rafId = requestAnimationFrame(this.#loop.bind(this));
  }

  // --- Tick ---

  #tick() {
    const dir = this.#snake.pendingDirection;
    const deltas = {
      UP: { x: 0, y: -1 }, DOWN: { x: 0, y: 1 },
      LEFT: { x: -1, y: 0 }, RIGHT: { x: 1, y: 0 },
    };
    const d = deltas[dir];
    const nextHead = { x: this.#snake.head.x + d.x, y: this.#snake.head.y + d.y };

    const collision = this.#checkCollision(nextHead);
    if (collision) {
      this.#session.setStatus('game_over');
      this.#ui.showGameOver(this.#session);
      return;
    }

    if (nextHead.x === this.#arena.food.x && nextHead.y === this.#arena.food.y) {
      this.#snake.grow();
      this.#session.addScore();

      if (this.#arena.getEmptyCells(this.#snake.segments).length === 0) {
        this.#session.setStatus('complete');
        this.#ui.showGameOver(this.#session);
        return;
      }

      this.#arena.spawnFood(this.#snake.segments);
    } else {
      this.#snake.move();
    }
  }

  // --- Collision Check ---

  #checkCollision(nextHead) {
    const { x, y } = nextHead;
    if (x < 0 || x >= this.#cols || y < 0 || y >= this.#rows) return 'border';
    if (this.#arena.obstacleSet.has(`${x},${y}`)) return 'obstacle';
    if (this.#snake.segments.some((s) => s.x === x && s.y === y)) return 'self';
    return null;
  }

  // --- Pause / Resume / Restart ---

  pause() {
    if (this.#session?.status !== 'playing') return;
    this.#session.setStatus('paused');
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
    this.#lastTime = 0;
    this.#accumulated = 0;
    this.#ui.showPauseOverlay(this.#session);
  }

  resume() {
    if (this.#session?.status !== 'paused') return;
    this.#session.setStatus('playing');
    this.#ui.hidePauseOverlay();
    this.#lastTime = 0;
    this.#rafId = requestAnimationFrame(this.#loop.bind(this));
  }

  restart() {
    if (!this.#session) return;
    const difficulty = this.#session.difficulty;
    if (this.#rafId !== null) cancelAnimationFrame(this.#rafId);
    this.#rafId = null;
    this.#ui.hidePauseOverlay();
    this.start(difficulty, this.#mapSize);
  }

  quit() {
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
    this.#session = null;
    this.#ui.hidePauseOverlay();
  }
}

export const game = new Game(ui, ranking);
