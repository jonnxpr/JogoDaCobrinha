# Research: Emendas da Análise — Jogo da Cobrinha

**Feature**: `002-amend-spec-analysis-fixes`  
**Date**: 2026-04-05  
**Status**: Complete — todos os NEEDS CLARIFICATION resolvidos via sessão de clarificação (`speckit.clarify`)

> Esta feature é um conjunto de emendas à `001-snake-game-core`. As decisões técnicas nucleares
> (game loop, canvas responsivo, tema neon, etc.) são herdadas de `specs/001-snake-game-core/research.md`
> sem alteração. Este documento cobre apenas as **novas decisões de design** exigidas pelas emendas.

---

## R-008: Atributo `bestScoreAtStart` em `GameSession` (FR-026)

**Decision**: `bestScoreAtStart: number | null` — lido uma vez de `this.#ranking.load()[0]?.score ?? null` no início da partida; mantido fixo até o fim.

**Rationale**:
- Leitura única em `game.start()` evita chamada a `localStorage` por frame (custo O(n) de parse JSON).
- `null` preserva a distinção semântica entre "ranking vazio" e "recorde real de zero pontos".
- Valor `null` → HUD exibe `"—"` (em-dash); value numérico → HUD exibe o número diretamente.
- Não há necessidade de atualizar em tempo real durante a partida: o recorde de referência é o que existia **antes** de a partida começar.

**Alternatives considered**:
- `0` como sentinela para ranking vazio: REJEITADO — ambíguo; um score real de 0 seria exibido da mesma forma que "sem recorde".
- Leitura de localStorage por frame: REJEITADO — desnecessário e lento; viola Princípio V (Simplicidade).
- Atualizar `bestScoreAtStart` se o próprio jogador bater o recorde durante a partida: REJEITADO — compra complexidade extra (US1 S3 confirma que o valor não atualiza em tempo real).

---

## R-009: Lógica de Fechamento do Modal de Ajuda — 3 Casos (FR-027, emenda FR-018)

**Decision**: Armazenar `#activeStatusBeforeHelp = null` em `UIManager`; populado com `session.status` ao **abrir** o modal; consumido ao **fechar**; três casos exhaustivos:
- `'playing'` → chamar `game.resume()` após fechar
- `'paused'` → não fazer nada (permanecer pausado)
- `null` (sem sessão) → não fazer nada (retornar ao estado passivo)

**Rationale**:
- A clarificação Q1 (2026-04-05) resolveu a ambiguidade: somente o estado `'playing'` no momento de abertura aciona auto-resume. Pausa deliberada via `P` não é desfeita pelo modal de ajuda.
- Armazenar o estado em `UIManager` como campo de instância é consistente com a abordagem atual de `UIManager` como repositório de estado de UI.
- Reset de `#activeStatusBeforeHelp = null` após fechar garante que nenhum estado "fantasma" persista entre sessões de ajuda.

**Alternatives considered**:
- Sempre retomar ao fechar (comportamento anterior em US6-S3 de 001): REJEITADO — contradiz a pausa deliberada do jogador; perderia o estado de pausa sem intenção.
- Sempre permanecer pausado ao fechar: REJEITADO — contradiz US2-S2 (expectativa de auto-resume ao abrir durante jogo ativo).
- Verificar `session.status` no momento de **fechar** (em vez de no momento de **abrir**): REJEITADO — o status pode ter mudado por outros eventos entre abertura e fechamento; o estado de abertura é mais confiável.

---

## R-010: Resumo de Controles na Tela Inicial — 3 Níveis CSS (FR-028, emenda FR-017)

**Decision**: Três `<div>` aninhados dentro de `#controls-hint` no `screen-home`: `.controls-desktop` (visível ≥768px), `.controls-mobile` (visível 480-767px), `.controls-compact` (visível <480px com caracteres Unicode `←↑↓→ ⏸ ?`). A alternância é feita via `@media` CSS puro — zero JS.

**Breakpoints escolhidos**:
| Intervalo | Elemento visível | Conteúdo |
|-----------|-----------------|---------|
| `≥ 768px` | `.controls-desktop` | `⌨ Mover: ↑↓←→ ou WASD · P: Pausar · H: Ajuda` |
| `480–767px` | `.controls-mobile` | `👆 Swipe para mover · Botões: ⏸ Pausar · ? Ajuda` |
| `< 480px` | `.controls-compact` | `← ↑ ↓ → ⏸ ?` |

**Rationale**:
- 768px é o breakpoint desktop/tablet universal; abaixo disso, controles touch são mais relevantes.
- 480px é o breakpoint onde espaço horizontal torna texto completo inconfortável (ex: iPhone SE 375px, Galaxy S20 360px).
- Caracteres Unicode (`←↑↓→ ⏸ ?`) são suportados universalmente em navegadores modernos; sem risco de fallback; sem assets externos.
- CSS-only atende ao Princípio V (Simplicidade) e ao Princípio II (Vanilla Stack).

**Clarificação Q3 (2026-04-05)**: Unicode confirmado sobre emoji e sobre ocultar completamente — os dois extremos foram rejeitados.

**Alternatives considered**:
- Usar emojis (🎮, 👆): REJEITADO — renderização inconsistente em sistemas operacionais diferentes; pode variar de tamanho.
- Ocultar em viewports <480px: REJEITADO — deixaria usuários nesses devices sem nenhuma orientação; viola Princípio IV (Tela de Ajuda / Orientação de Controles).
- Dois níveis (desktop / mobile): REJEITADO — viewports <480px precisam de tratamento especial que dois níveis não cobrem sem truncar texto.

---

## R-011: Status `'complete'` em `GameSession` — Campo Cheio (FR-029)

**Decision**: `'complete'` como novo valor de string no enum de `GameSession.status`. Detectado em `Arena.spawnFood()`: se `getEmptyCells()` retornar array vazio após crescimento da cobra, retornar `null` e o `GameSession` encerra com `status = 'complete'`. Tela de resultado reutiliza `screen-gameover` com condicional no título.

**Rationale**:
- Adicionar `'complete'` ao enum existente é a menor mudança possível — nenhum novo objeto, nenhuma nova tela, nenhum novo flow.
- Detecção em `spawnFood()` é natural: é o único ponto onde "falta de espaço" é observável.
- Renderização idêntica à `screen-gameover` com `title = 'Campo Completo! 🏆'` em `var(--clr-accent)` (já definida) sem `animate-shake` — zero nova cor, zero novo CSS, zero novo asset (clarificação Q5, 2026-04-05).
- Regras de qualificação para ranking são idênticas: YAGNI — não há privilégio especial de ranking por campo completo.

**Alternatives considered**:
- Nova tela `screen-complete` dedicada: REJEITADO — YAGNI; criaria uma sétima tela para um edge case raramente alcançável (400 células cheias).
- Usar `'game_over'` com flag adicional: REJEITADO — polui o tipo de `GameSession` sem ganho real; `'complete'` como valor de enum é mais explícito e type-safe.
- Cor diferente (gold `#ffd700`) para o título de campo completo: REJEITADO (Q5) — introduziria nova cor não prevista na paleta; `var(--clr-accent)` já está na paleta e tem significado de destaque positivo.
