---
description: "Task list for 002-amend-spec-analysis-fixes implementation"
---

# Tasks: Emendas da Análise — Jogo da Cobrinha

**Input**: Design documents from `/specs/002-amend-spec-analysis-fixes/`
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/screens.md ✅ · quickstart.md ✅
**Context**: Emendas cirúrgicas à feature `001-snake-game-core` — **zero arquivos novos**, 5 arquivos alterados.
**Files affected**: `index.html` · `css/style.css` · `js/game.js` · `js/ui.js` · `js/controls.js`

## Format: `[ID] [P?] [Story?] Descrição com caminho do arquivo`

- **[P]**: Pode executar em paralelo (arquivos/funções diferentes, sem dependências incompletas)
- **[Story]**: User Story correspondente ([US1]–[US4])

---

## Phase 1: Setup (Pré-condição de Implementação)

**Purpose**: Confirmar base correta, branch ativa e dev server funcional antes de qualquer emenda.

- [X] T001 Confirmar que `001-snake-game-core` está implementado como base; criar branch `002-amend-spec-analysis-fixes` a partir da main (com 001 mergeado) ou a partir de `001-snake-game-core`; rodar `npm run dev` em `http://localhost:8000` e verificar zero erros no console

---

## Phase 2: Foundational (GameSession Delta — Pré-requisito para US1 e US4)

**Purpose**: Atualizar `class GameSession` com campo `bestScoreAtStart` e status `'complete'`. Bloqueante para US1 (lê `bestScoreAtStart`) e US4 (define `status = 'complete'`).

**⚠️ CRITICAL**: T002 deve ser concluído antes de US1 e US4.

- [X] T002 Atualizar `class GameSession` em `js/game.js`: (1) confirmar que campo `bestScoreAtStart = null` (tipo `number | null`) já existe no body da classe — já declarado em T012 de feature 001; se ausente, adicionar agora; (2) atualizar comentário/JSDoc do campo `status` para listar todos os valores válidos: `'idle' | 'playing' | 'paused' | 'game_over' | 'complete'` — o valor `'complete'` é tratado como equivalente a `'game_over'` para encerramento do loop e qualificação de ranking (FR-026, FR-029)

---

## Phase 3: US1 — Visualizar Melhor Score no HUD (Priority: P1) 🎯 MVP das Emendas

**Story Goal**: Campo `#hud-best` visível no HUD durante toda a partida; exibe `"—"` quando ranking vazio, valor real do 1º lugar quando há entradas; valor fixo ao início da partida.

**Independent Test**: Abrir jogo sem dados no localStorage → iniciar → HUD exibe `"Recorde: —"`. Salvar score → iniciar nova partida → HUD exibe o valor correto. Bater recorde → HUD **não** atualiza durante a partida (SC-012).

- [X] T003 [US1] Confirmar/adicionar elemento `#hud-best` na seção HUD de `screen-game` em `index.html` **se ainda não existir** (T006 de feature 001 cria este elemento; esta tarefa é idempotente — não duplicar elemento já presente — K1): verificar se `<div id="hud-best">` já existe em `screen-game`; se sim, confirmar estrutura canônica: `<div id="hud-best"><span class="hud-label">Recorde:</span> <span id="hud-best-value">—</span></div>`; se não existir, criar agora — posicionar após `#hud-score` dentro do container HUD superior; preservar todos os IDs existentes intactos (FR-026)
- [X] T004 [P] [US1] Adicionar CSS para `#hud-best` e `#hud-best-value` em `css/style.css`: `.hud-label { color: var(--clr-text-muted); font-size: 0.7rem; }` para o label "Recorde:"; `#hud-best-value { font-variant-numeric: tabular-nums; color: var(--clr-accent); }` para o valor; verificar alinhamento responsivo em 320px, 768px e 1024px com DevTools — sem quebra de layout no HUD existente
- [X] T005 [US1] Confirmar/garantir em `game.start(difficulty)` em `js/game.js`: verificar que, imediatamente após instanciar `GameSession`, existe a linha `session.bestScoreAtStart = this.#ranking.load()[0]?.score ?? null` — já especificada em T013 de feature 001; se ausente, adicionar agora; leitura única no início da partida (evita chamada a localStorage por frame); `null` quando ranking vazio; preservar restante do método inalterado (FR-026, R-008)
- [X] T006 [P] [US1] Atualizar `#updateHUD(session)` em `js/ui.js`: **substituir** a linha `getElementById('hud-best').textContent = …` (se existir) por `document.getElementById('hud-best-value').textContent = session.bestScoreAtStart !== null ? session.bestScoreAtStart : '—'` — escrever no `<span id="hud-best-value">` filho, nunca no container `#hud-best` diretamente (sobrescreveria o `<span class="hud-label">Recorde:</span>`); nunca exibir `"0"` ou string vazia como indicador de ranking vazio; `"—"` (em-dash) é o único valor canônico para ausência de recorde (FR-026)

---

## Phase 4: US2 — Retomada Automática ao Fechar Modal de Ajuda (Priority: P2)

**Story Goal**: Fechar modal de ajuda quando foi aberto durante `'playing'` retoma automaticamente; fechar durante `'paused'` mantém jogo pausado; fechar da tela inicial não faz nada.

**Independent Test**: (1) partida ativa → H → fechar → cobra retoma sem pressionar P; (2) pausar com P → H → fechar → jogo permanece pausado; (3) tela inicial → ajuda → fechar → sem ação de jogo (SC-013).

- [X] T007 [US2] Confirmar/adicionar métodos `openHelpModal(statusBeforeHelp)` e `closeHelpModal(game)` à `class UIManager` em `js/ui.js` (conforme T007/T040 de tasks 001): `openHelpModal` define `this.#activeStatusBeforeHelp = statusBeforeHelp` e chama `openModal('modal-help')`; o status é fornecido pelo chamador em `js/controls.js` capturado ANTES de `game.pause()` — UIManager permanece desacoplado de Game no construtor; confirmar que campo `#activeStatusBeforeHelp = null` existe na classe (FR-027, R-009)
- [X] T008 [P] [US2] Confirmar/implementar `closeHelpModal(game)` em `class UIManager` (`js/ui.js`) conforme T040 de tasks 001: lógica 3 casos usando snapshot `const s = this.#activeStatusBeforeHelp` (capturado e zerado internamente): (a) `s === 'playing'` → `game.resume()` (retomada automática); (b) `s === 'paused'` → nada (permanece pausado); (c) `s === null` → nada; botão "Fechar" e tecla `Escape` em `js/controls.js` invocam `ui.closeHelpModal(game)` — não `ui.closeModal()` diretamente (FR-027, R-009)

---

## Phase 5: US3 — Resumo de Controles na Tela Inicial (Priority: P3)

**Story Goal**: `#controls-hint` com 3 sub-divs responsivos; ≥768px mostra atalhos de teclado; 480-767px mostra indicações touch; <480px mostra apenas `← ↑ ↓ → ⏸ ?`; alternância CSS puro.

**Independent Test**: DevTools → três breakpoints (1024px, 600px, 375px) → confirmar exatamente um sub-div visível por breakpoint (SC-014).

- [X] T009 [US3] Confirmar/adicionar `<div id="controls-hint">` ao final de `screen-home` em `index.html` **se ainda não existir** (T048 de feature 001 cria este elemento; esta tarefa é idempotente — não duplicar elemento já presente — J2): verificar se `#controls-hint` com 3 filhos já existe em `screen-home`; se sim, confirmar estrutura canônica: (1) `<div class="controls-hint--desktop">⌨ Mover: ↑↓←→ ou WASD &nbsp;·&nbsp; P: Pausar &nbsp;·&nbsp; H: Ajuda</div>`; (2) `<div class="controls-hint--mobile">👆 Swipe para mover &nbsp;·&nbsp; ⏸ Pausar &nbsp;·&nbsp; ? Ajuda</div>`; (3) `<div class="controls-hint--compact">← ↑ ↓ → &nbsp;⏸&nbsp; ?</div>`; se não existir, criar agora — elemento puramente informativo, não-interativo (FR-028)
- [X] T010 [P] [US3] Confirmar/adicionar CSS para `#controls-hint` e sub-elementos em `css/style.css` **se ainda não existir** (T048 de feature 001 já define estas regras; esta tarefa é idempotente — não duplicar regras já presentes — J2): verificar se seletor `#controls-hint` existe em `css/style.css`; se sim, confirmar que inclui: `font-size: 0.75rem; color: var(--clr-text-muted); text-align: center; padding: 0.25rem 0; margin-top: 1rem;` e os 3 media queries (≤767px, ≤479px); se não existir, adicionar agora: `#controls-hint { font-size: 0.75rem; color: var(--clr-text-muted); text-align: center; padding: 0.25rem 0; margin-top: 1rem; }`; `.controls-hint--compact, .controls-hint--mobile { display: none; }` `.controls-hint--desktop { display: block; }`; `@media (max-width: 767px) { .controls-hint--desktop { display: none; } .controls-hint--mobile { display: block; } }`; `@media (max-width: 479px) { .controls-hint--mobile { display: none; } .controls-hint--compact { display: block; } }` — zero JavaScript adicional (FR-028, SC-014)

---

## Phase 6: US4 — Encerramento por Campo Completo (Priority: P4)

**Story Goal**: Quando `getEmptyCells()` retorna vazio após crescimento → status `'complete'` → tela exibe `"Campo Completo! 🏆"` em `var(--clr-accent)` sem shake; qualificação de ranking idêntica a Game Over.

**Independent Test**: DevTools → forçar `arena.getEmptyCells = () => []` → comer alimento → título correto, sem shake, cor accent, score/tempo preservados (SC-015).

- [X] T011 [US4] Atualizar `Game.#tick()` em `js/game.js` na branch que lida com crescimento pós-alimento (já previsto em T014 de 001 — confirmar e avançar se já presente): após `snake.grow()` e `session.addScore()`, verificar campo cheio: `if (arena.getEmptyCells(snake.segments).length === 0) { session.setStatus('complete'); cancelAnimationFrame(this.#rafId); this.#ui.showGameOver(session); return; }` — posicionar **antes** de `arena.spawnFood()` para nunca tentar spawnar em campo cheio (FR-029, R-011)
- [X] T012 [P] [US4] Atualizar `showGameOver(session)` em `js/ui.js` (já previsto em T019 de 001 — confirmar e avançar se já presente): adicionar condicional sobre `session.status`: `if (session.status === 'complete') { statusMsgEl.textContent = 'Campo Completo! 🏆'; statusMsgEl.style.color = 'var(--clr-accent)'; /* não adicionar animate-shake */ } else { statusMsgEl.textContent = 'GAME OVER'; statusMsgEl.classList.add('animate-shake'); }` — todos os demais elementos (`#gameover-score`, `#gameover-time`, `#gameover-level`, lógica de qualificação) permanecem inalterados; zero nova cor, zero novo asset (FR-029)

---

## Phase 7: Polish & Verificação Final

**Purpose**: Confirmar integração completa das 4 emendas; todos os 4 Success Criteria passam.

- [X] T013 [P] Executar os 4 cenários de teste manual do `quickstart.md`: HUD bestScore com/sem localStorage; modal de ajuda nos 3 estados (playing/paused/home); controls-hint nos 3 breakpoints; campo completo forçado via DevTools — verificar SC-012 (HUD), SC-013 (modal), SC-014 (controls), SC-015 (complete)
- [X] T014 [P] Confirmar que `ranking.qualifies(session.score)` e `ranking.save()` chamados em `showGameOver()` tratam `status === 'complete'` **identicamente** a `'game_over'` — nenhuma condição especial de qualificação para campo completo; confirmar que `var(--clr-accent)` usado em T012 é a mesma custom property já definida em `css/style.css` (zero nova cor introduzida — FR-029)

---

## Dependencies (Ordem de Conclusão por User Story)

```
Phase 1 (Setup — T001)
    └──▶ Phase 2 (Foundational GameSession — T002)
              ├──▶ Phase 3: US1 (bestScoreAtStart + #hud-best — T003–T006)   [MVP das emendas]
              ├──▶ Phase 4: US2 (modal close 3-case — T007–T008)             [independente de US1]
              ├──▶ Phase 5: US3 (controls hint — T009–T010)                  [independente de US1/US2]
              └──▶ Phase 6: US4 (complete status — T011–T012)                [independente de US1–US3]
                        └──▶ Phase 7 (Verificação — T013–T014)               [após todas as phases]
```

**US1, US2, US3 e US4 podem ser desenvolvidos em paralelo** após T002 concluído.  
Dentro de cada US, tarefas marcadas `[P]` são independentes entre si (HTML/CSS/JS em funções distintas).

---

## Parallel Execution Examples

### Após T001 + T002 (quatro frentes independentes)
- **Dev A**: T003 → T005 → T006 (+ T004 em paralelo) — US1 HUD bestScore
- **Dev B**: T007 → T008 — US2 modal close
- **Dev C**: T009 → T010 — US3 controls hint
- **Dev D**: T011 → T012 — US4 complete status

### Dentro de US1 (após T005 concluído)
T003, T004 e T006 em paralelo — HTML, CSS e UIManager `#updateHUD` são funções/arquivos independentes.

---

## Implementation Strategy

**MVP das Emendas** (~45min — T001–T006): Violação CRÍTICA do Princípio III da Constituição resolvida — high score exibido junto ao score atual durante a partida.

**Incremento 1** (+~30min — T007–T010): Comportamento correto de retomada do modal de ajuda + Controls hint na tela inicial.

**Produto Final** (+~30min — T011–T014): Encerramento por campo completo definido + verificação completa dos 4 SCs.

**Tempo total estimado**: ~2h para um desenvolvedor solo, com familiaridade com o codebase de feature 001.
