# JogoDaCobrinha Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-05

## Active Technologies
- HTML5 · CSS3 · JavaScript ES6+ (sem transpilação) + Canvas API (nativo), Page Visibility API (nativo), cookies do navegador (nativo) — zero bibliotecas de produção (001-snake-game-core)
- Cookie `snakeRanking` — array JSON, máx 5 entradas (001-snake-game-core)
- Servidor local de desenvolvimento: Vite `^6.x` (devDependency opcional) — `npm run dev` → `http://localhost:8000`; sem build step de produção (001-snake-game-core)
- Arquitetura OOP: classes ES6+ `Snake`, `Arena`, `GameSession`, `Ranking`, `UIManager`, `Game` — composição pura, sem herança entre domínio (001-snake-game-core)
- HTML5 · CSS3 · JavaScript ES6+ (sem transpilação) — *herdado de 001-snake-game-core* + Canvas API (nativo), Page Visibility API (nativo), cookies do navegador (nativo) — zero bibliotecas de produção — *herdado* (002-amend-spec-analysis-fixes)
- `cookie["snakeRanking"]` — `RankingEntry[]` JSON, máx 5 entradas — *schema inalterado* (002-amend-spec-analysis-fixes)

- HTML5 · CSS3 · JavaScript ES6+ (sem transpilação) + Canvas API (nativo), Page Visibility API (nativo), cookies do navegador (nativo) — zero bibliotecas externas (001-snake-game-core)

## Project Structure

```text
/                    ← raiz do repositório (GitHub Pages serve daqui)
├── index.html
├── package.json     ← devDependency: vite; script: npm run dev (porta 8000)
├── .gitignore       ← inclui node_modules/
├── css/style.css
├── js/
│   ├── config.js    ← constantes globais, DIFFICULTIES, ADJECTIVES, NOUNS
│   ├── game.js      ← classes Game, GameSession, Snake, Arena
│   ├── controls.js  ← teclado, swipe, botões on-screen, visibilitychange
│   ├── ranking.js   ← classe Ranking (cookies)
│   └── ui.js        ← classe UIManager (telas, canvas, renderização)
└── .github/workflows/deploy.yml  ← GitHub Actions → GitHub Pages
```

## Commands

npm run dev          # inicia servidor local em http://localhost:8000 (Vite)

## Code Style

HTML5 · CSS3 · JavaScript ES6+: classes individuais por entidade de domínio; composição pura (sem herança); métodos ≤40 linhas; CSS custom properties; HTML semântico

## Recent Changes
- 002-amend-spec-analysis-fixes: Added HTML5 · CSS3 · JavaScript ES6+ (sem transpilação) — *herdado de 001-snake-game-core* + Canvas API (nativo), Page Visibility API (nativo), cookies do navegador (nativo) — zero bibliotecas de produção — *herdado*
- 001-snake-game-core: Added HTML5 · CSS3 · JavaScript ES6+ (sem transpilação) + Canvas API (nativo), Page Visibility API (nativo), cookies do navegador (nativo) — zero bibliotecas de produção
- 001-snake-game-core: Added HTML5 · CSS3 · JavaScript ES6+ (sem transpilação) + Canvas API (nativo), Page Visibility API (nativo), cookies do navegador (nativo) — zero bibliotecas de produção


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
