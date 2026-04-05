// --- Constants ---

export const GRID_COLS = 20;
export const GRID_ROWS = 20;
export const INITIAL_SNAKE_LENGTH = 3;
export const RANKING_MAX_ENTRIES = 5;
export const RANKING_STORAGE_KEY = 'snakeRanking';
export const PLAYER_NAME_REGEX = /^[a-zA-Z0-9 \-]{1,20}$/;

// --- Difficulties ---

export const DIFFICULTIES = {
  easy: {
    name: 'easy',
    label: 'Fácil',
    speed: 6,
    obstacleCount: 0,
    scoreMultiplier: 1,
  },
  medium: {
    name: 'medium',
    label: 'Médio',
    speed: 10,
    obstacleCount: 5,
    scoreMultiplier: 2,
  },
  hard: {
    name: 'hard',
    label: 'Difícil',
    speed: 15,
    obstacleCount: 12,
    scoreMultiplier: 3,
  },
};

// --- Random Name Wordlists ---

export const ADJECTIVES = [
  'Swift', 'Neon', 'Shadow', 'Turbo', 'Pixel',
  'Cyber', 'Blaze', 'Storm', 'Venom', 'Hyper',
];

export const NOUNS = [
  'Cobra', 'Viper', 'Python', 'Mamba', 'Hydra',
  'Drake', 'Fang', 'Coil', 'Asp', 'Bolt',
];
