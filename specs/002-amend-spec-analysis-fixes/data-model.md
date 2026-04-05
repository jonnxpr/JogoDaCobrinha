# Data Model: Emendas da Análise — Jogo da Cobrinha

**Feature**: `002-amend-spec-analysis-fixes`  
**Date**: 2026-04-05  
**Source**: spec.md (Key Entities, FR-026 a FR-029) + research.md (R-008 a R-011)

> Este documento descreve as **alterações** ao data model de `001-snake-game-core`.
> O modelo completo de referência está em `specs/001-snake-game-core/data-model.md`.
> Entidades não mencionadas abaixo permanecem inalteradas.

---

## Entidades Alteradas

### 1. `GameSession` (em `js/game.js`) — Delta

#### Campos adicionados

| Campo | Tipo | Valor padrão | Descrição |
|-------|------|-------------|-----------|
| `bestScoreAtStart` | `number \| null` | `null` | Score do 1º lugar do ranking lido **uma vez** em `game.start()`; `null` quando ranking vazio; imutável durante a partida; descartado junto com a sessão ao encerrar |

#### Valores adicionados ao campo `status`

| Valor | Significado | Equivalência de lógica |
|-------|-------------|----------------------|
| `'complete'` | Campo 100% preenchido — cobra ocupa todas as células | Equivale a `'game_over'` para finalização do loop e qualificação de ranking; mensagem de UI diferenciada |

**Tabela completa de `status` (pós-emenda)**:

| Valor | Significado |
|-------|-------------|
| `'idle'` | Aguardando início (estado inicial) |
| `'playing'` | Partida em andamento |
| `'paused'` | Pausado voluntariamente (tecla P / botão / blur) |
| `'game_over'` | Encerrado por colisão |
| **`'complete'`** | **Encerrado por campo completamente preenchido** ← *novo* |

**Diagrama de transições de estado (atualizado)**:

```
      [tela inicial]
           │ iniciar
           ▼
         idle ──────────── reiniciar ──────────▶ playing
           │                                       │   │
           └──────────────────────────────────────┘   │ pausar (tecla P, botão, visibilitychange)
                                                        ▼
                                                      paused ◀── abrir ajuda durante 'playing' ──┐
                                                        │ retomar                                 │
                                                        ▼                                fechar ajuda (se 'playing' antes)
                                                     playing ──────────────────────────────────────┘
                                                        │ colisão
                                                        ▼
                                                    game_over
                                                        │
                                                   (alternativo: campo cheio)
                                                        ▼
                                                    complete
                                                        │
                                             ambos ─────┴──── reiniciar
                                                              ▼
                                                           playing (nova partida)
```

#### Interface JavaScript resultante

```js
class GameSession {
  score = 0;
  elapsedMs = 0;
  status = 'idle';          // 'idle' | 'playing' | 'paused' | 'game_over' | 'complete'
  difficulty = 'easy';      // 'easy' | 'medium' | 'hard'
  bestScoreAtStart = null;  // number | null  ← NOVO (FR-026)
}
```

---

### 2. `UIManager` (em `js/ui.js`) — Delta

#### Campo de instância adicionado

| Campo | Tipo | Valor inicial | Descrição |
|-------|------|--------------|-----------|
| `#activeStatusBeforeHelp` | `string \| null` | `null` | Status da sessão no momento em que o modal de ajuda foi **aberto**; `null` se aberto da tela inicial ou sem partida ativa; resetado para `null` após fechar o modal (FR-027) |

#### Lógica condicional adicionada em `showGameOver(session)`

```js
// Pós-emenda (FR-029):
if (session.status === 'complete') {
  titleEl.textContent = 'Campo Completo! 🏆';
  titleEl.style.color = 'var(--clr-accent)';
  // NÃO adiciona classe animate-shake
} else {
  titleEl.textContent = 'GAME OVER';
  titleEl.classList.add('animate-shake');
}
```

---

### 3. `Arena` (em `js/game.js`) — Delta

#### Comportamento alterado em `spawnFood()`

| Condição | Comportamento anterior | Comportamento pós-emenda |
|----------|----------------------|------------------------|
| `getEmptyCells().length === 0` | Indefinido (bug latente) | Retorna `null`; `GameSession.status` → `'complete'` |

```js
// Pós-emenda (FR-029):
spawnFood() {
  const empty = this.getEmptyCells();
  if (empty.length === 0) return null; // dispara encerramento 'complete' no GameSession
  const cell = empty[Math.floor(Math.random() * empty.length)];
  this.food = cell;
  return cell;
}
```

---

## Entidades da UI Adicionadas (HTML/CSS) — Novos Elementos

### `#hud-best` — Campo de Melhor Score no HUD (FR-026)

Elemento filho do HUD de `screen-game`. Não é uma entidade de domínio JS — é um elemento DOM gerenciado por `UIManager`.

| Propriedade | Valor |
|------------|-------|
| ID do elemento | `#hud-best` |
| Texto exibido | `"—"` (null) ou valor numérico (ex: `"15"`) |
| Atualizado em | Chamada a `showGame(session)` → lê `session.bestScoreAtStart` |
| Nunca exibe | `"0"` como sentinela de vazio (usa `"—"` para null) |

---

### `#controls-hint` — Resumo de Controles na Tela Inicial (FR-028)

Elemento filho de `screen-home`. Puramente informativo, não-interativo.

| Elemento | Classe | Visível em | Conteúdo |
|----------|--------|-----------|---------|
| `<div id="controls-hint">` | — | sempre (pai) | Container semântico; posicionamento CSS |
| `<div class="controls-desktop">` | `controls-desktop` | viewport `≥ 768px` | `⌨ Mover: ↑↓←→ ou WASD · P: Pausar · H: Ajuda` |
| `<div class="controls-mobile">` | `controls-mobile` | viewport `480–767px` | `👆 Swipe para mover · Botões: ⏸ Pausar · ? Ajuda` |
| `<div class="controls-compact">` | `controls-compact` | viewport `< 480px` | `← ↑ ↓ → ⏸ ?` |

**CSS padrão**:
```css
.controls-desktop { display: block; }
.controls-mobile  { display: none; }
.controls-compact { display: none; }

@media (max-width: 767px) {
  .controls-desktop { display: none; }
  .controls-mobile  { display: block; }
}

@media (max-width: 479px) {
  .controls-mobile  { display: none; }
  .controls-compact { display: block; }
}
```

---

## Invariantes Adicionais (pós-emenda)

1. `session.bestScoreAtStart` é somente-leitura após `game.start()` — nenhum método o altera durante a partida.
2. `#activeStatusBeforeHelp` only changes at `openHelp()` and `closeHelp()` — nunca por outros eventos.
3. `Arena.spawnFood()` retornando `null` é o único gatilho para `session.status = 'complete'`.
4. A tela `screen-gameover` é exibida tanto para `'game_over'` quanto para `'complete'` — apenas o texto do título e o comportamento do shake diferem.
