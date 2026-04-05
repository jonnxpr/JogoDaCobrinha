---
description: "Task list for 001-snake-game-core implementation"
---

# Tasks: Jogo da Cobrinha — Núcleo Completo

**Input**: Design documents from `/specs/001-snake-game-core/`
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅ · quickstart.md ✅
**Architecture**: OOP — classes ES6+ individuais: `Snake`, `Arena`, `GameSession`, `Ranking`, `UIManager`, `Game` (orquestrador). Composição pura, zero herança entre domínio. (FR-023)
**Dev Server**: Vite `^6.x` · `npm run dev` → `http://localhost:8000` (R-007)

## Format: `[ID] [P?] [Story?] Descrição com caminho do arquivo`

- **[P]**: Pode executar em paralelo (arquivos diferentes, sem dependências incompletas)
- **[Story]**: User Story correspondente ([US1]–[US6])

---

## Phase 1: Setup (Estrutura, Infraestrutura e Ferramental)

**Purpose**: Criar estrutura de diretórios, `package.json` com Vite, `.gitignore`, esqueleto HTML5 com footer e favicon, tema CSS base e pipeline CI/CD. Todos os artefatos são pré-requisitos bloqueantes para todas as fases seguintes.

- [X] T001 Criar estrutura de diretórios do projeto (`css/`, `js/`, `.github/workflows/`) na raiz; criar `.gitignore` incluindo `node_modules/`; criar `package.json` com `"private": true`, `"type": "module"`, script `"dev": "vite --port 8000"` e devDependency `"vite": "^6.0.0"` (R-007)
- [X] T002 [P] Criar `index.html` com boilerplate HTML5: `<!DOCTYPE html>`, `lang="pt-BR"`, `<meta charset="UTF-8">`, `<meta name="viewport">`, `<meta name="description" content="Jogo da Cobrinha">`, `<meta name="theme-color" content="#0d0d1a">`; favicon `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><text y='1em' font-size='1em'>🐍</text></svg>">` (FR-024); `<link rel="stylesheet" href="css/style.css">`; módulos JS via `<script type="module">` para cada arquivo em `js/`; `<canvas id="game-canvas">`; estrutura semântica `<header>`, `<main>`, `<footer id="site-footer">` com `<p>Criado por Jonathan Douglas Diego Tavares</p>` e `<p>© <span id="footer-year"></span> Jonathan Douglas Diego Tavares</p>` (FR-025)
- [X] T003 [P] Criar `css/style.css` com CSS Custom Properties do tema neon: `--clr-bg: #0d0d1a`, `--clr-snake: #39ff14`, `--clr-snake-head: #7fff00`, `--clr-food: #ff2d55`, `--clr-obstacle: #4a4a6a`, `--clr-grid: #1a1a2e`, `--clr-ui-bg: #12122a`, `--clr-text: #e0e0ff`, `--clr-accent: #39ff14`, `--clr-text-muted: #555580`, `--glow-snake: 0 0 8px #39ff14, 0 0 20px #39ff1466`, `--glow-food: 0 0 8px #ff2d55, 0 0 20px #ff2d5566`, `--font-game: 'Courier New', 'Consolas', monospace`; reset base: `*, box-sizing: border-box; body: margin 0; background: var(--clr-bg); color: var(--clr-text); font-family: var(--font-game)`
- [X] T004 [P] Criar `.github/workflows/deploy.yml` com pipeline GitHub Actions: trigger `push` na `main`; permissões `contents: read`, `pages: write`, `id-token: write`; concurrency `group: pages, cancel-in-progress: true`; steps `actions/checkout@v4`, `actions/configure-pages@v4`, `actions/upload-pages-artifact@v3` com `path: '.'`, `actions/deploy-pages@v4`; environment `github-pages`; **sem** step `npm install` ou build (CI serve raiz diretamente)
- [X] T005 [P] Criar `js/config.js` com todas as constantes globais exportadas: `GRID_COLS = 20`, `GRID_ROWS = 20`, `INITIAL_SNAKE_LENGTH = 3`, `RANKING_MAX_ENTRIES = 5`, `RANKING_STORAGE_KEY = 'snakeRanking'`, `PLAYER_NAME_REGEX = /^[a-zA-Z0-9 \-]{1,20}$/`; objeto `DIFFICULTIES` com `easy` (speed:6, obstacleCount:0, scoreMultiplier:1, label:'Fácil'), `medium` (speed:10, obstacleCount:5, scoreMultiplier:2, label:'Médio'), `hard` (speed:15, obstacleCount:12, scoreMultiplier:3, label:'Difícil'); arrays `ADJECTIVES` (10 adjetivos: Swift, Neon, Shadow, Turbo, Pixel, Cyber, Blaze, Storm, Venom, Hyper) e `NOUNS` (10 substantivos: Cobra, Viper, Python, Mamba, Hydra, Drake, Fang, Coil, Asp, Bolt)

---

## Phase 2: Foundational (Pré-requisitos Bloqueantes)

**Purpose**: HTML semântico completo de todas as telas + `class UIManager` com gerenciamento de telas, canvas responsivo e footer com copyright dinâmico. Deve estar 100% completo antes de qualquer User Story.

**⚠️ CRITICAL**: Nenhuma US pode começar antes desta fase estar concluída.

- [X] T006 Adicionar estrutura HTML completa das 4 telas + overlay de pausa + 2 modais em `index.html`: `<section id="screen-home" class="screen screen--hidden">`, `<section id="screen-game" class="screen screen--hidden">` (contém `<canvas id="game-canvas">` **e** `<div id="pause-overlay" class="pause-overlay pause-overlay--hidden">`), `<section id="screen-gameover" class="screen screen--hidden">`, `<section id="screen-ranking" class="screen screen--hidden">`; **não há** `<section id="screen-paused">` — a pausa é um overlay absoluto dentro de `screen-game` (resolução I3); `<div id="modal-help" class="modal modal--hidden">` e `<div id="modal-save-name" class="modal modal--hidden">`; todos os IDs referenciados nas fases seguintes: `#hud-score`, `#hud-best` (markup obrigatório: `<div id="hud-best"><span class="hud-label">Recorde:</span> <span id="hud-best-value">—</span></div>` — o span filho `#hud-best-value` é necessário; T017 escreve nele diretamente para não destruir o label — J1), `#hud-best-value`, `#hud-timer`, `#hud-level`, `#hud-multiplier`, `#pause-overlay`, `#gameover-score`, `#gameover-time`, `#gameover-level`, `#gameover-no-qualify`, `#gameover-status-msg`, `#name-input`, `#name-error`, `#ranking-table`, `#footer-year`; `aria-label` em botões sem texto visível; botões on-screen `#btn-up`, `#btn-down`, `#btn-left`, `#btn-right` em `screen-game`; `#btn-pause` em `screen-game` (usado por T022 para listener de pausa — J3); `#btn-restart-gameover` em `screen-gameover` (coberto pelo wildcard `#btn-restart-*` de T022 — J3)
- [X] T007 [P] Implementar `class UIManager` em `js/ui.js`: construtor recebe `canvasEl` e mapa de elementos de tela; propriedades: `currentScreen` (string), `previousScreen` (string), `#activeStatusBeforeHelp = null` (estado salvo antes de abrir ajuda); método `showScreen(screenId)` — opera apenas sobre `section.screen` (`screen-home`, `screen-game`, `screen-gameover`, `screen-ranking`); remove `screen--active` e adiciona `screen--hidden` em todas, faz o inverso para `screenId`, salva `previousScreen`, transição CSS `opacity` 200ms; métodos `openModal(modalId)` e `closeModal(modalId)` (toggle class `modal--hidden` / `modal--visible`); método `openHelpModal(statusBeforeHelp)` — define `this.#activeStatusBeforeHelp = statusBeforeHelp`, então chama `this.openModal('modal-help')` (status enviado como parâmetro pelo chamador em `controls.js` antes de pausar — UIManager desacoplado de Game, FR-027); método `closeHelpModal(game)` — chama `this.closeModal('modal-help')`, recupera `const s = this.#activeStatusBeforeHelp`, zera `this.#activeStatusBeforeHelp = null`, executa: se `s === 'playing'` → `game.resume()`; se `s === 'paused'` → nada; se `null` → nada (game passado como parâmetro para evitar dependência circular construtora — FR-027); métodos de overlay de pausa: `showPauseOverlay()` — remove `pause-overlay--hidden` de `#pause-overlay`; `hidePauseOverlay()` — adiciona `pause-overlay--hidden` em `#pause-overlay` (resolução I3 — canvas de `screen-game` permanece visível durante pausa); exportar `export const ui = new UIManager(canvas, elementsMap)` instanciado no `DOMContentLoaded`
- [X] T008 [P] Adicionar `initCanvas()` e `resizeCanvas()` à `class UIManager` em `js/ui.js`: `initCanvas()` — instancia `ResizeObserver` no container do canvas, chama `resizeCanvas()` na primeira execução; `resizeCanvas()` — `cellSize = Math.floor(Math.min(container.clientWidth, container.clientHeight) / GRID_COLS)`, atualiza `canvas.width = canvas.height = cellSize * GRID_COLS`; getter público `get cellSize()`; CSS em `css/style.css`: `#game-canvas { display: block; max-width: 100%; aspect-ratio: 1; }`
- [X] T009 [P] Implementar footer com copyright dinâmico em `js/ui.js` (no construtor de `UIManager` ou no `DOMContentLoaded`): `document.getElementById('footer-year').textContent = new Date().getFullYear()` — nenhum ano hardcoded (FR-025, SC-011); estilizar `#site-footer` em `css/style.css`: `font-size: 0.7rem; color: var(--clr-text-muted); text-align: center; padding: 0.5rem 1rem; width: 100%;` — sem `position: fixed` para não sobrepor canvas em mobile

**Checkpoint**: Foundation completa — implementação das User Stories pode começar.

---

## Phase 3: US1 — Jogar a Cobrinha e Marcar Pontos (Priority: P1) 🎯 MVP

**Story Goal**: O jogador abre o jogo, inicia partida, direciona a cobra com teclado/setas, come alimentos (score incrementa pelo `scoreMultiplier` da dificuldade), e ao colidir o Game Over exibe o score final.

**Independent Test**: Abrir `index.html` (ou `http://localhost:8000`) → clicar "Jogar" → cobra de 3 segmentos no centro, orientada à direita → pressionar ← → cobra vira; cobra alcança alimento → cresce + score sobe → cobra colide com borda → tela Game Over com score correto.

- [X] T010 [US1] Implementar `class Snake` em `js/game.js`: construtor recebe `{ startX, startY, direction }`; propriedades: `segments` (3 `{x, y}` centradas em `Math.floor(GRID_COLS/2)`, orientadas à direita), `direction = 'RIGHT'`, `pendingDirection = 'RIGHT'`, `#cellSet = new Set()` interno (strings `"x,y"`); getter `get head()` retorna `segments[0]`; métodos: `move()` — calcula nova cabeça conforme `pendingDirection`, prepend + pop, atualiza `direction = pendingDirection`, atualiza `#cellSet`; `grow()` — igual `move()` mas sem pop; `setDirection(dir)` — descarta silenciosamente se direção oposta (ex: `'LEFT'` enquanto vai `'RIGHT'`); `occupiesCell(x, y)` — retorna `this.#cellSet.has(\`\${x},\${y}\`)`
- [X] T011 [US1] Implementar `class Arena` em `js/game.js`: construtor recebe `difficulty`; propriedades: `obstacles = []`, `obstacleSet = new Set()`, `food = { x: 0, y: 0 }`; métodos: `getEmptyCells(snakeSegments)` — itera grade 20×20, exclui posições de `snakeSegments` e `obstacles`; `generateObstacles(snakeSegments)` — sorteia `difficulty.obstacleCount` células de `getEmptyCells()` sem repetição, defensivo: `Math.min(count, emptyCells.length)`; popula `obstacles` e reconstrói `obstacleSet`; `spawnFood(snakeSegments)` — sorteia célula livre excluindo obstáculos, atualiza `this.food`; `init(snakeSegments)` — chama `generateObstacles()` então `spawnFood()`
- [X] T012 [US1] Implementar `class GameSession` em `js/game.js`: construtor recebe `difficulty`; propriedades: `score = 0`, `elapsedMs = 0`, `status = 'idle'` (valores válidos: `'idle'`, `'playing'`, `'paused'`, `'game_over'`, `'complete'`), `difficulty`, `bestScoreAtStart = null` (`null` = ranking vazio no início da partida; number = melhor score registrado — FR-026); método `addScore()` — `this.score += this.difficulty.scoreMultiplier`; método `setStatus(s)` — atualiza `this.status`
- [X] T013 [US1] Implementar `class Game` em `js/game.js` como orquestrador: construtor recebe instâncias `(ui, ranking)` por injeção; propriedades privadas `#snake`, `#arena`, `#session`, `#rafId = null`, `#lastTime = 0`, `#accumulated = 0`, `#stepInterval`; `start(difficulty)` — instancia `GameSession`, `Snake`, `Arena`; **define** `session.bestScoreAtStart = this.#ranking.load()[0]?.score ?? null` (`null` quando ranking vazio — FR-026; HUD exibirá `"—"` neste caso); chama `arena.init(snake.segments)`; define `#stepInterval = Math.floor(1000 / difficulty.speed)`; `session.setStatus('playing')`; dispara `requestAnimationFrame(this.#loop.bind(this))`; método privado `#loop(timestamp)` — `delta = timestamp - #lastTime`; atualiza `#lastTime`; se `status === 'playing'`: `session.elapsedMs += delta`; acumula `delta` em `#accumulated`; enquanto `#accumulated >= #stepInterval`: `#tick()` e subtrai; `ui.render(snake, arena, session)` a cada frame; agenda próximo frame; exportar `export const game = new Game(ui, ranking)`
- [X] T014 [US1] Implementar `#tick()` em `class Game` em `js/game.js` — **estratégia: grow XOR move por tick** (resolução I2 — nunca chamar ambos no mesmo tick): (1) calcular `nextHead` baseado em `snake.pendingDirection` sem mover: `const dir = snake.pendingDirection; const deltas = { UP:{x:0,y:-1}, DOWN:{x:0,y:1}, LEFT:{x:-1,y:0}, RIGHT:{x:1,y:0} }; const nextHead = { x: snake.head.x + deltas[dir].x, y: snake.head.y + deltas[dir].y }`; (2) verificar colisão em `nextHead` via `#checkCollision(nextHead)`: se retornar valor: `session.setStatus('game_over')`, `cancelAnimationFrame(#rafId)`, `ui.showGameOver(session)` e retornar; (3) se `nextHead.x === arena.food.x && nextHead.y === arena.food.y`: chamar **apenas** `snake.grow()` (avança cabeça **sem** remover cauda — cobra cresce); `session.addScore()`; verificar campo cheio: `if (arena.getEmptyCells(snake.segments).length === 0)` → `session.setStatus('complete')`, `cancelAnimationFrame(#rafId)`, `ui.showGameOver(session)` e retornar (FR-029); caso contrário: `arena.spawnFood(snake.segments)`; (4) se não é alimento: chamar **apenas** `snake.move()` (avança cabeça E remove cauda)
- [X] T015 [US1] Implementar `#checkCollision(nextHead)` em `class Game` em `js/game.js` — aceita posição `{x, y}` como parâmetro (resolução I2 — verifica próxima posição antes de mover): verificar borda: `nextHead.x < 0 || nextHead.x >= GRID_COLS || nextHead.y < 0 || nextHead.y >= GRID_ROWS` → retornar `'border'`; verificar obstáculo: `arena.obstacleSet.has(\`\${nextHead.x},\${nextHead.y}\`)` → retornar `'obstacle'`; verificar self: `snake.segments.some(s => s.x === nextHead.x && s.y === nextHead.y)` (inclui cabeça atual — colisão com qualquer segmento existente) → retornar `'self'`; retornar `null` se sem colisão
- [X] T016 [P] [US1] Implementar `render(snake, arena, session)` em `class UIManager` (`js/ui.js`): `ctx.clearRect(0, 0, canvas.width, canvas.height)`; fill fundo `--clr-bg`; grade sutil: linhas em `--clr-grid` com `globalAlpha = 0.3`; obstáculos: rect fill `--clr-obstacle` com 2px margem interna (sem glow); cobra body: rect fill `--clr-snake` com `shadowBlur=10, shadowColor=--clr-snake`; cabeça: rect fill `--clr-snake-head`, 90% do cell, centralizado; food: `arc()` fill `--clr-food` com `shadowBlur=12, shadowColor=--clr-food`; z-order: fundo → grade → obstáculos → food → cobra; chamar `this.#updateHUD(session)` ao final
- [X] T017 [P] [US1] Implementar `#updateHUD(session)` em `class UIManager` (`js/ui.js`): `#hud-score.textContent = session.score`; `document.getElementById('hud-best-value').textContent = session.bestScoreAtStart !== null ? session.bestScoreAtStart : '—'` (FR-026 — valor canônico: `'—'` quando ranking vazio, nunca `'0'` nem string vazia — escrever em `#hud-best-value`, **não** em `#hud-best`, para preservar o `<span class="hud-label">Recorde:</span>` filho); `#hud-level.textContent = session.difficulty.label`; `#hud-multiplier.textContent = \`×\${session.difficulty.scoreMultiplier}\``; `#hud-timer.textContent = this.#formatTime(session.elapsedMs)`; método privado `#formatTime(ms)`: `String(Math.floor(ms/60000)).padStart(2,'0') + ':' + String(Math.floor((ms%60000)/1000)).padStart(2,'0')`; CSS `font-variant-numeric: tabular-nums` em `#hud-timer` para evitar layout shift
- [X] T018 [P] [US1] Implementar listener de teclado em `js/controls.js` na função `initKeyboard(game)`: `document.addEventListener('keydown', e => { const dir = { ArrowUp:'UP', w:'UP', W:'UP', ArrowDown:'DOWN', s:'DOWN', S:'DOWN', ArrowLeft:'LEFT', a:'LEFT', A:'LEFT', ArrowRight:'RIGHT', d:'RIGHT', D:'RIGHT' }[e.key]; if (dir) { e.preventDefault(); game.getSnake()?.setDirection(dir); } })`; exportar `initKeyboard`; nota: expor getter `getSnake()` em `class Game` retornando `#snake` (guard: null quando não iniciado)
- [X] T019 [P] [US1] Implementar `showGameOver(session)` em `class UIManager` (`js/ui.js`): `this.showScreen('screen-gameover')`; preencher `#gameover-score`, `#gameover-time = this.#formatTime(session.elapsedMs)`, `#gameover-level`; condicional por `session.status`: se `'complete'` → `#gameover-status-msg.textContent = 'Campo Completo! 🏆'`, `#gameover-status-msg.style.color = 'var(--clr-accent)'`, **sem** classe `animate-shake`; caso contrário → `#gameover-status-msg.textContent = 'GAME OVER'`, adicionar classe `animate-shake` ao `#gameover-status-msg` (0.5s) — FR-029; mesmos elementos de score/ranking em ambos os casos, zero nova cor ou asset

---

## Phase 4: US2 — Pausar e Reiniciar a Partida (Priority: P2)

**Story Goal**: Pausar (cobra para + overlay "PAUSADO" + cronômetro congela), retomar do ponto exato, reiniciar zerando tudo. Auto-pausa ao perder foco (Page Visibility API).

**Independent Test**: Iniciar → P → cobra para + overlay → P → cobra retoma mesmo estado → R → score 0 + cobra nova. Minimizar janela durante partida → jogo pausa automaticamente.

- [X] T020 [US2] Implementar `pause()`, `resume()` e `restart()` em `class Game` (`js/game.js`): `pause()` — se `#session.status !== 'playing'` retornar; `#session.setStatus('paused')`; `#lastTime = 0`; `#accumulated = 0` (evita time debt); `this.#ui.showPauseOverlay()` (resolução I3 — canvas de `screen-game` permanece visível); `resume()` — se `#session.status !== 'paused'` retornar; `#session.setStatus('playing')`; `this.#ui.hidePauseOverlay()`; `#lastTime = 0`; `this.#rafId = requestAnimationFrame(this.#loop.bind(this))`; `restart()` — `cancelAnimationFrame(#rafId)`; `this.#ui.hidePauseOverlay()` (garantia se restart chamado enquanto pausado); guardar `difficulty = #session.difficulty`; chamar `this.start(difficulty)` (reutiliza mesma escolha)
- [X] T021 [P] [US2] Implementar overlay de pausa em `js/ui.js` e markup em `index.html` via T006 (resolução I3): o overlay `<div id="pause-overlay" class="pause-overlay pause-overlay--hidden">` está **dentro** de `screen-game` (irmão do `<canvas>`) — tela de jogo **não** muda; conteúdo: `<h2 class="neon-pulse">PAUSADO</h2>`, `<p id="pause-score">Score: <span></span></p>`, `<p id="pause-timer"></p>`; botão "Retomar" (`#btn-resume`) → `game.resume()`; botão "Reiniciar" (`#btn-restart-paused`) → `game.restart()`; `showPauseOverlay()` configura `#pause-score` e `#pause-timer` antes de exibir; CSS em `css/style.css`: `.pause-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.75); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; z-index: 10; }` `.pause-overlay--hidden { display: none; }` (container de `screen-game` MUST ter `position: relative`)
- [X] T022 [P] [US2] Adicionar controles de pausa/reinício em `js/controls.js` em `initKeyboard(game)`: tecla `p/P` — se `status === 'playing'`: `game.pause()`; se `status === 'paused'`: `game.resume()`; tecla `r/R` — `game.restart()` em qualquer estado exceto `'idle'`; event listeners nos botões `#btn-pause` (screen-game), `#btn-resume` (pause-overlay), todos `#btn-restart-*` (screen-game, pause-overlay, screen-gameover)
- [X] T023 [P] [US2] Implementar auto-pausa por Page Visibility API em `js/controls.js` na função `initVisibility(game)`: `document.addEventListener('visibilitychange', () => { if (document.hidden && game.getSession()?.status === 'playing') game.pause(); })`; retomada NÃO automática — requer ação do jogador (FR-022); exportar `initVisibility`; expor getter `getSession()` em `class Game`

---

## Phase 5: US3 — Selecionar Dificuldade e Enfrentar Obstáculos (Priority: P3)

**Story Goal**: Seletor de dificuldade na home (padrão Fácil). Cada nível define velocidade, obstáculos e multiplicador. Obstáculos gerados aleatorios, causam Game Over. Multiplicador visível no HUD.

**Independent Test**: Selecionar "Difícil" → iniciar → campo tem ~12 obstáculos + cobra rápida + `×3` no HUD. Colidir com obstáculo → Game Over imediato. Selecionar "Fácil" → sem obstáculos.

- [X] T024 [US3] Confirmar que `class Arena.generateObstacles()` (T011) usa `Math.min(count, emptyCells.length)` defensivo; confirmar que `class Arena.init()` garante que obstáculos são gerados antes do food e nunca sobrepõem cobra inicial; confirmar que `#checkCollision()` (T015) verifica `obstacleSet` com mesma prioridade que borda; confirmar que `game.restart()` (T020) instancia nova `Arena` gerando novos obstáculos aleatórios; adicionar comentário JSDoc em `js/game.js` explicando regra de geração defensiva
- [X] T025 [P] [US3] Implementar seletor de dificuldade na `screen-home` em `js/ui.js`: método `initDifficultySelector()` chamado no `DOMContentLoaded`; 3 botões `#btn-easy`, `#btn-medium`, `#btn-hard`; click handler: adiciona `difficulty-btn--active` ao clicado, remove dos outros; armazena `this.selectedDifficultyKey = key` (padrão `'easy'`); botão `#btn-play` → `game.start(DIFFICULTIES[ui.selectedDifficultyKey])`; CSS em `css/style.css`: `.difficulty-btn--active { background: var(--clr-accent); color: var(--clr-bg); box-shadow: var(--glow-snake); }`
- [X] T026 [P] [US3] Confirmar ordem de renderização em `render()` (T016): obstáculos são desenhados antes da food e da cobra (z-order correto); estilo: rect fill `--clr-obstacle` com 2px margem interna, `border-radius` visual opcional via `ctx.roundRect()` (estética metálica); **sem** `shadowBlur` em obstáculos (devem contrastar com objetos neon)
- [X] T027 [P] [US3] Confirmar que `#updateHUD()` (T017) exibe `#hud-multiplier` com `×{scoreMultiplier}` em `var(--clr-accent)` e `font-weight: bold` durante toda a partida; verificar alinhamento do HUD em viewports 320px, 768px e 1024px com DevTools

---

## Phase 6: US4 — Acompanhar o Cronômetro da Sessão (Priority: P4)

**Story Goal**: Cronômetro MM:SS visível no HUD. Conta apenas quando `status === 'playing'`. Congela ao pausar. Zera ao reiniciar. Tempo final exibido no Game Over.

**Independent Test**: Iniciar → timer avança → pausar → timer congela → retomar → timer continua → reiniciar → `00:00` → Game Over com tempo final correto.

- [X] T028 [US4] Confirmar que `session.elapsedMs += delta` em `class Game #loop()` (T013) acontece **somente quando** `session.status === 'playing'`; confirmar que `restart()` (T020) instancia nova `GameSession` com `elapsedMs = 0`; confirmar que delta NÃO é acumulado quando `status === 'paused'` nem `'game_over'`
- [X] T029 [P] [US4] Confirmar que `#updateHUD()` (T017) atualiza `#hud-timer` a cada frame com `#formatTime(session.elapsedMs)` retornando `"MM:SS"` correto; CSS `font-variant-numeric: tabular-nums; min-width: 3.5ch` em `#hud-timer` para evitar layout shift ao mudar de `09:59` para `10:00`
- [X] T030 [P] [US4] Confirmar que `showGameOver(session)` (T019) preenche `#gameover-time` com `#formatTime(session.elapsedMs)` com label "Tempo:" visível; confirmar que o elemento aparece mesmo quando `elapsedMs === 0`

---

## Phase 7: US5 — Salvar Score no Ranking dos 5 Melhores (Priority: P5)

**Story Goal**: Ao Game Over qualificado (top 5) modal de nome aparece. Nome único (1–20 chars, letras/números/espaços/hífens). Duplicado rejeitado com erro específico. Botão gera nome único aleatório. Ranking persiste no localStorage. Consulta disponível na home e no Game Over.

**Independent Test**: Jogar até Game Over → modal aparece → inserir nome duplicado → mensagem de erro → clicar "Nome Aleatório" → nome único gerado → confirmar → recarregar página → ranking exibe entrada correta.

- [X] T031 [US5] Implementar `class Ranking` em `js/ranking.js` (contrato `contracts/localStorage.md`): construtor sem parâmetros; `load()` — `try { JSON.parse(localStorage.getItem(RANKING_STORAGE_KEY)) } catch { localStorage.removeItem(key); return [] }`; filtrar entradas com schema inválido (campo ausente ou tipo incorreto); ordenar score DESC + savedAt ASC; retornar array (máx 5); `save(playerName, score, difficulty)` — cria `{ playerName, score, difficulty, savedAt: new Date().toISOString() }`, carrega, insere, reordena, trunca para 5, persiste com `JSON.stringify`; `qualifies(score)` — `const entries = this.load(); return entries.length < 5 || score > entries[4].score` (resolução A3 — única chamada a `load()` por invoção); exportar `export const ranking = new Ranking()`
- [X] T032 [US5] Adicionar `validateName(name)` e `generateRandomName()` à `class Ranking` (`js/ranking.js`): `validateName(name)` retorna `{ valid: boolean, error: string | null }` — 3 verificações sequenciais com erro específico: (1) comprimento 0: "Por favor, insira um nome"; (2) regex falha: "Use apenas letras, números, espaços e hífens (máx 20 caracteres)"; (3) duplicado case-insensitive no `load()`: "Este nome já está no ranking! Escolha um nome diferente"; `generateRandomName()` — combina `ADJECTIVES[random] + NOUNS[random]`; tenta até 10 combinações; se esgotar, adiciona sufixo `_N` (N=2..99); retorna nome único garantido
- [X] T033 [US5] Implementar markup completo do `modal-save-name` em `index.html` (via T006): `<h2>Novo recorde!</h2>`; `<p>Score: <span id="modal-score"></span> · <span id="modal-level"></span></p>`; `<label for="name-input">Seu nome:</label>`; `<input id="name-input" type="text" maxlength="20" placeholder="Ex: NeonCobra" autocomplete="off">`; `<p id="name-error" class="error-msg" aria-live="polite"></p>`; `<button id="btn-random-name">Nome Aleatório</button>`; `<button id="btn-save-name" disabled>Salvar</button>`; `<button id="btn-skip-save">Não salvar</button>`
- [X] T034 [US5] Implementar lógica do `modal-save-name` em `class UIManager` (`js/ui.js`): método `showSaveModal(session)` — preenche `#modal-score` e `#modal-level`, limpa `#name-input` e `#name-error`, `openModal('modal-save-name')`; `#btn-random-name`: `#name-input.value = ranking.generateRandomName(); #name-error.textContent = ''`; `#name-input oninput`: `#btn-save-name.disabled = !#name-input.value.trim(); #name-error.textContent = ''`; `#btn-save-name onclick`: `const r = ranking.validateName(#name-input.value); if (!r.valid) { #name-error.textContent = r.error; return; } ranking.save(#name-input.value, session.score, session.difficulty.name); closeModal('modal-save-name'); showRanking('screen-gameover')`; `#btn-skip-save`: `closeModal('modal-save-name'); showScreen('screen-home')`
- [X] T035 [P] [US5] Implementar `showRanking(origin)` e `#renderRanking()` em `class UIManager` (`js/ui.js`): `#renderRanking()` — chama `ranking.load()`; gera `<table id="ranking-table">` com colunas `#`, Nome, Score, Dificuldade, Data; 1ª posição com `color: var(--clr-accent); font-weight: bold`; se vazio: `<p class="empty-msg">Nenhum score registrado. Jogue e entre para o Top 5!</p>`; `showRanking(origin)` — `#renderRanking()` + `showScreen('screen-ranking')`; `previousScreen` para botão "Voltar"
- [X] T036 [P] [US5] Adicionar botões de acesso ao ranking em `js/ui.js`: `#btn-ranking-home onclick` → `ui.showRanking('screen-home')`; `#btn-ranking-gameover onclick` → `ui.showRanking('screen-gameover')`; botão "Voltar" em `screen-ranking` → `ui.showScreen(ui.previousScreen)`; botão "Jogar" em `screen-ranking` → `game.start(DIFFICULTIES[ui.selectedDifficultyKey])`
- [X] T037 [US5] Integrar qualificação no fluxo de Game Over em `js/ui.js` em `showGameOver(session)`: após exibir tela, checar `ranking.qualifies(session.score)`; se `true`: chamar `ui.showSaveModal(session)` imediatamente; se `false`: exibir `#gameover-no-qualify` com texto "Não entrou no Top 5" + `Mínimo necessário: ${(ranking.load()[4]?.score ?? 0) + 1} pontos`

---

## Phase 8: US6 — Tela de Ajuda com Comandos (Priority: P6)

**Story Goal**: Modal de ajuda acessível da home (botão `[?]`) e in-game (tecla H/?). Seções separadas Desktop e Mobile. Comportamento de fechamento depende do estado *no momento da abertura*: `'playing'` → retoma automaticamente; `'paused'` → permanece pausado; `null` (home/ranking) → retorna sem alterar estado (FR-027).

**Independent Test**: Clicar `[?]` na home → modal abre; fechar → sem ação de jogo. Pressionar H in-game (`playing`) → pausa + modal → fechar → cobra retoma **sem** pressionar P. Pausar com P → pressionar H → modal → fechar → jogo **permanece pausado**.

- [X] T038 [US6] Implementar markup do `modal-help` em `index.html` (via T006) e renderização em `js/ui.js`: `renderHelpModal()` cria: `<section class="help-desktop">` — tabela setas/WASD (mover), P (pausar/retomar), R (reiniciar), H/? (ajuda); `<section class="help-mobile">` — swipe direcional sobre o canvas, botões ▲▼◀▶, botão Pausar, botão Reiniciar; `<section class="help-scoring">` — tabela multiplicadores: Fácil ×1, Médio ×2, Difícil ×3; botão "Fechar [×]" com `aria-label="Fechar ajuda"`; chamar `renderHelpModal()` no `DOMContentLoaded`
- [X] T039 [P] [US6] Wire botão `#btn-help-home` e teclas H/? em `js/controls.js` e `js/ui.js`: `#btn-help-home onclick` → `ui.openHelpModal(null)` (null = sem sessão ativa na home — não pausa); keydown handler (já em `initKeyboard`): adicionar `if (e.key === 'h' || e.key === 'H' || e.key === '?') { const statusBeforeHelp = game.getSession()?.status ?? null; if (statusBeforeHelp === 'playing') game.pause(); ui.openHelpModal(statusBeforeHelp); }` — status capturado **antes** de `game.pause()` para que `#activeStatusBeforeHelp` reflita `'playing'`, não `'paused'` (FR-027 "no momento da abertura")
- [X] T040 [P] [US6] Implementar fechamento do `modal-help` em `js/ui.js` e `js/controls.js` (resoluções I4 + A1 — FR-027): botão "Fechar" e tecla `Escape` em `js/controls.js` executam `ui.closeHelpModal(game)` — método em `UIManager` que: (1) chama `this.closeModal('modal-help')`; (2) captura e zera `#activeStatusBeforeHelp` internamente (`const s = this.#activeStatusBeforeHelp; this.#activeStatusBeforeHelp = null`); (3) executa lógica 3 casos: se `s === 'playing'` → `game.resume()` (retomada automática — jogo estava `playing` ao abrir a ajuda); se `s === 'paused'` → nada (permanece pausado); se `s === null` → nada; `#activeStatusBeforeHelp` foi definido em `openHelpModal(statusBeforeHelp)` (T039) via parâmetro capturado **antes** de `game.pause()` — garante snapshot do estado pré-pausa (FR-027)

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Responsividade completa, swipe + botões on-screen touch, animações neon, CSS botões, `.gitignore` verificado e validação final do HTML. Todas as tarefas [P] são independentes.

- [X] T041 Implementar swipe no canvas em `js/controls.js` em `initTouch(game)`: `canvas.addEventListener('touchstart', e => { touch = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true })`; `canvas.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - touch.x; const dy = e.changedTouches[0].clientY - touch.y; if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return; const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'RIGHT' : 'LEFT') : (dy > 0 ? 'DOWN' : 'UP'); game.getSnake()?.setDirection(dir); }, { passive: true })`; exportar `initTouch`; chamar no `DOMContentLoaded`
- [X] T042 [P] Implementar botões on-screen em `js/controls.js` em `initOnScreenControls(game)`: `['up','down','left','right'].forEach(dir => { document.getElementById(\`btn-\${dir}\`).addEventListener('touchstart', e => { e.preventDefault(); game.getSnake()?.setDirection(dir.toUpperCase()); }, { passive: false }); })` — `touchstart` sem delay 300ms; adicionar `mousedown` fallback para desktop; `touch-action: none` e `user-select: none` nos botões via CSS; exportar `initOnScreenControls`
- [X] T043 [P] Implementar CSS responsivo em `css/style.css`: `@media (max-width: 767px)` — canvas `width: 100%; aspect-ratio: 1`; botões on-screen `display: grid; grid-template-areas: ". up ." "left . right" ". down ."` com gap 4px; HUD `flex-wrap: wrap; gap: 0.5rem`; `@media (min-width: 768px) and (max-width: 1023px)` — canvas `max-height: 60vh`; botões on-screen visíveis; `@media (min-width: 1024px)` — botões on-screen `display: none`; canvas centralizado `max-width: min(60vh, 600px)`; usar `display: flex` em todos os containers de tela
- [X] T044 [P] Implementar CSS dos botões on-screen em `css/style.css`: `min-width: 48px; min-height: 48px` (touch target WCAG); `border: 2px solid var(--clr-accent); background: var(--clr-ui-bg); color: var(--clr-accent); border-radius: 8px; font-size: 1.4rem; cursor: pointer; touch-action: none; user-select: none; -webkit-user-select: none;`; `:active, :focus-visible { background: var(--clr-accent); color: var(--clr-bg); box-shadow: var(--glow-snake); outline: none; }`
- [X] T045 [P] Implementar animações CSS neon em `css/style.css`: `@keyframes neon-pulse { 0%,100% { box-shadow: var(--glow-snake); } 50% { box-shadow: none; } }` — botão "Jogar" e novo recorde; `@keyframes shake { 0%,100% { transform: translateX(0); } 20%,60% { transform: translateX(-5px); } 40%,80% { transform: translateX(5px); } }` — texto "GAME OVER"; `@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }` — transições de tela (200ms `ease`); `@keyframes blink { 50% { opacity: 0; } }` — indicador "PAUSADO"; classes: `.animate-shake { animation: shake 0.5s ease; }`, `.neon-pulse { animation: neon-pulse 1.5s infinite; }`, `.screen--active { animation: fade-in 200ms ease; }`
- [X] T048 [P] Implementar resumo visual de controles na `screen-home` em `index.html` e `css/style.css` (resolução G1 — FR-028): adicionar wrapper `<div id="controls-hint">` no final de `screen-home` contendo três filhos: (1) `<div class="controls-hint--desktop">⌨ Mover: ↑↓←→ ou WASD &nbsp;·&nbsp; P: Pausar &nbsp;·&nbsp; H: Ajuda</div>`; (2) `<div class="controls-hint--mobile">👆 Swipe para mover &nbsp;·&nbsp; ⏸ Pausar &nbsp;·&nbsp; ? Ajuda</div>`; (3) `<div class="controls-hint--compact">← ↑ ↓ → &nbsp;⏸&nbsp; ?</div>` — estrutura com wrapper `#controls-hint` é canônica (mesmo padrão que T009 de 002 — sem conflito ao aplicar as duas features): CSS em `css/style.css`: `#controls-hint { font-size: 0.75rem; color: var(--clr-text-muted); text-align: center; padding: 0.25rem 0; margin-top: 1rem; }` `.controls-hint--compact, .controls-hint--mobile { display: none; }` `.controls-hint--desktop { display: block; }` `@media (max-width: 767px) { .controls-hint--desktop { display: none; } .controls-hint--mobile { display: block; } }` `@media (max-width: 479px) { .controls-hint--mobile { display: none; } .controls-hint--compact { display: block; } }` — zero JavaScript adicional (FR-028, SC-014)
- [X] T046 [P] Verificar integração final de `index.html` — **escopo: validações possíveis somente após T006–T045 completos** (resolução D1 — T002 cria a estrutura, T046 verifica a integração): (1) ordem dos `<script type="module">`: `config.js` → `ranking.js` → `ui.js` → `game.js` → `controls.js`; (2) todos os IDs referenciados por `getElementById` em todos os 5 arquivos JS existem em `index.html` — lista completa: `#game-canvas`, `#hud-score`, `#hud-best`, `#hud-best-value`, `#hud-timer`, `#hud-level`, `#hud-multiplier`, `#pause-overlay`, `#gameover-score`, `#gameover-time`, `#gameover-level`, `#gameover-status-msg`, `#gameover-no-qualify`, `#name-input`, `#name-error`, `#modal-score`, `#modal-level`, `#ranking-table`, `#footer-year`, `#btn-up`, `#btn-down`, `#btn-left`, `#btn-right`, `#btn-play`, `#btn-easy`, `#btn-medium`, `#btn-hard`, `#btn-ranking-home`, `#btn-ranking-gameover`, `#btn-save-name`, `#btn-random-name`, `#btn-skip-save`, `#btn-help-home`, `#btn-resume`, `#btn-restart-paused`, `#btn-pause`, `#btn-restart-gameover`; (3) `aria-label` preenchido em todos os botões sem texto visível; (4) `#footer-year` preenchido via `new Date().getFullYear()` (nenhum ano hardcoded — SC-011)
- [X] T047 [P] Verificar configuração de desenvolvimento: `package.json` existe na raiz com `"dev": "vite --port 8000"` e `devDependencies: { "vite": "^6.0.0" }`; `.gitignore` inclui `node_modules/`; `npm install && npm run dev` → `http://localhost:8000` sem erros; abrir `index.html` diretamente no navegador (sem npm) também funciona (offline-capable — Princípio II da Constituição); verificar SC-002 e SC-003 como best-effort manual: abrir DevTools > Performance, jogar 30s em nível Difícil e confirmar ≥30fps; registrar `performance.now()` no handler de keydown e na próxima iteração do loop para confirmar latência de input ≤100ms; verificação Princípio V da Constituição (todos os itens são MUST — J4): (1) grep por `console.log` em todos os 5 arquivos JS (`js/config.js`, `js/game.js`, `js/ui.js`, `js/ranking.js`, `js/controls.js`) — confirmar zero ocorrências em código de produção; (2) revisar as 3 funções/métodos mais longos de cada arquivo JS e confirmar que nenhum ultrapassa 40 linhas; (3) confirmar que cada arquivo JS possui seções claramente delimitadas por comentários descritivos (ex: `// --- Game Loop ---`, `// --- Score ---`, `// --- Controls ---`, `// --- Rendering ---`)

---

## Dependencies (Ordem de Conclusão por User Story)

```
Phase 1 (Setup — T001–T005)
    └──▶ Phase 2 (Foundational — T006–T009)
              └──▶ US1 (Game Loop + Mecânica Core — T010–T019)   [MVP ENTREGÁVEL]
                       ├──▶ US2 (Pausa/Reinício — T020–T023)     [paralelo com US3, US4, US6]
                       ├──▶ US3 (Dificuldade + Obstáculos — T024–T027) [paralelo]
                       ├──▶ US4 (Cronômetro — T028–T030)         [paralelo]
                       ├──▶ US5 (Ranking — T031–T037)            [depende de US1 game over]
                       └──▶ US6 (Tela de Ajuda — T038–T040)      [paralelo]
                                     └──▶ Phase 9 (Polish — T041–T048) [após todas as telas]
```

**US2, US3, US4 e US6 podem ser desenvolvidos em paralelo** após US1 estar completo.  
**US5 depende de US1** (precisa de `session.score` e da tela Game Over) mas é independente de US2–US4.

---

## Parallel Execution Examples

### Sprint Phase 1 (em paralelo após T001)
T001 first (cria estrutura) → depois em paralelo: **T002, T003, T004, T005** (arquivos independentes).

### Sprint US1 (MVP sequencial)
T010 → T011 → T012 → T013 → T014 → T015 em sequência (dependências em cadeia);  
depois em paralelo: **T016, T017, T018, T019** (render, HUD, teclado, gameover screen).

### Sprint US2 + US3 + US4 + US6 em paralelo após US1
- **Dev A**: T020 → T021 → T022 → T023 (pause / restart / visibilitychange)
- **Dev B**: T024 → T025 → T026 → T027 (difficulty + obstacles + HUD multiplier)
- **Dev C**: T028 → T029 → T030 (timer acumulação + HUD + gameover)
- **Dev D**: T038 → T039 → T040 (help modal + keys + close)

### Sprint US5 (após US1, sequencial)
T031 → T032 (class Ranking + validação) → T033 (markup modal) → T034 → T035 → T036 → T037.

### Sprint Polish (todas em paralelo após todas as telas existirem)
**T041, T042, T043, T044, T045, T048** em paralelo; depois **T046, T047** como verificações finais.

---

## Implementation Strategy

**MVP Scope** (~8h — T001–T019): Jogo funcional — cobra se move, come alimentos, pontua com multiplicador (padrão Fácil ×1), Game Over exibe score. Demonstrável e testável imediatamente.

**Incremento 1** (+~2h — T020–T023): Pausa/retomada/reinício + auto-pausa por visibilitychange.

**Incremento 2** (+~3h — T024–T030): Dificuldades, obstáculos, cronômetro — jogo com rejogabilidade real.

**Incremento 3** (+~4h — T031–T040): Ranking persistido, salvar nome único, tela de ajuda — produto completo conforme spec.md.

**Produto Final** (+~3h — T041–T048): Responsividade total touch, animações neon, resumo de controles na home, CI/CD, validação HTML → pronto para GitHub Pages.

