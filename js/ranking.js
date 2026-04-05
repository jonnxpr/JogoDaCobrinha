// --- Imports ---

import {
  RANKING_STORAGE_KEY,
  RANKING_MAX_ENTRIES,
  PLAYER_NAME_REGEX,
  ADJECTIVES,
  NOUNS,
} from './config.js';

// --- Class Ranking ---

export class Ranking {
  // --- Load ---

  load() {
    try {
      const raw = localStorage.getItem(RANKING_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const valid = parsed.filter(
        (e) =>
          e &&
          typeof e.playerName === 'string' &&
          typeof e.score === 'number' &&
          typeof e.difficulty === 'string' &&
          typeof e.savedAt === 'string'
      );
      return valid
        .sort((a, b) => b.score - a.score || a.savedAt.localeCompare(b.savedAt))
        .slice(0, RANKING_MAX_ENTRIES);
    } catch {
      localStorage.removeItem(RANKING_STORAGE_KEY);
      return [];
    }
  }

  // --- Save ---

  save(playerName, score, difficulty) {
    const entries = this.load();
    const entry = {
      playerName,
      score,
      difficulty: difficulty.name,
      savedAt: new Date().toISOString(),
    };
    entries.push(entry);
    entries.sort((a, b) => b.score - a.score || a.savedAt.localeCompare(b.savedAt));
    const trimmed = entries.slice(0, RANKING_MAX_ENTRIES);
    localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(trimmed));
  }

  // --- Qualifies ---

  qualifies(score) {
    const entries = this.load();
    return entries.length < RANKING_MAX_ENTRIES || score > entries[entries.length - 1].score;
  }

  // --- Validate Name ---

  validateName(name) {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'Por favor, insira um nome' };
    }
    if (!PLAYER_NAME_REGEX.test(name)) {
      return {
        valid: false,
        error: 'Use apenas letras, números, espaços e hífens (máx 20 caracteres)',
      };
    }
    const lower = name.toLowerCase();
    const entries = this.load();
    if (entries.some((e) => e.playerName.toLowerCase() === lower)) {
      return {
        valid: false,
        error: 'Este nome já está no ranking! Escolha um nome diferente',
      };
    }
    return { valid: true, error: null };
  }

  // --- Generate Random Name ---

  generateRandomName() {
    const entries = this.load();
    const existing = new Set(entries.map((e) => e.playerName.toLowerCase()));
    for (let i = 0; i < 10; i++) {
      const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
      const name = adj + noun;
      if (!existing.has(name.toLowerCase())) return name;
    }
    for (let n = 2; n < 100; n++) {
      const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
      const name = `${adj}${noun}_${n}`;
      if (!existing.has(name.toLowerCase())) return name;
    }
    return 'Jogador' + Date.now();
  }
}

export const ranking = new Ranking();
