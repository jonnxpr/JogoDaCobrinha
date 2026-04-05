# Quickstart: Emendas da Análise — Jogo da Cobrinha

**Feature**: `002-amend-spec-analysis-fixes`  
**Date**: 2026-04-05  
**Amends**: `specs/001-snake-game-core/quickstart.md`

---

> **Setup e fluxo de desenvolvimento são idênticos à feature 001.**  
> Consulte [specs/001-snake-game-core/quickstart.md](../001-snake-game-core/quickstart.md) para:
> - Clonar o repositório
> - Rodar o servidor local (`npm run dev` → `http://localhost:8000`)
> - Estrutura de arquivos
> - Deploy para GitHub Pages

---

## Diferença Específica desta Feature

Não há novos arquivos, novas dependências ou novas etapas de setup. As emendas são localizadas em:

| Arquivo | O que verificar ao testar |
|---------|--------------------------|
| `index.html` | `#hud-best` presente no HUD; `#controls-hint` com 3 sub-divs em `screen-home` |
| `css/style.css` | `@media (max-width: 767px)` e `@media (max-width: 479px)` para `.controls-*` |
| `js/game.js` | `session.bestScoreAtStart` em `GameSession`; retorno `null` em `Arena.spawnFood()` quando campo cheio |
| `js/ui.js` | `showGameOver` condicionaliza por `session.status === 'complete'`; `#activeStatusBeforeHelp` rastreia estado ao abrir ajuda |
| `js/controls.js` | `closeHelp()` lida com 3 casos: `'playing'` → resume; `'paused'` → não faz nada; `null` → não faz nada |

## Cenários de Teste Manual

### HUD Melhor Score (FR-026)
1. Abrir o jogo sem dados no localStorage → iniciar partida → HUD deve exibir `"Recorde: —"`
2. Salvar um score qualquer no ranking → iniciar nova partida → HUD deve exibir `"Recorde: <valor>"`
3. Bater o recorde durante a partida → confirmar que o HUD **não** atualiza o valor durante a partida atual

### Modal Ajuda — Retomada (FR-027)
1. Iniciar partida → pressionar `H` → fechar modal → cobra deve retomar automaticamente (sem pressionar `P`)
2. Iniciar partida → pressionar `P` (pausar) → pressionar `H` → fechar modal → jogo deve **permanecer pausado**
3. Na tela inicial → abrir ajuda → fechar → deve retornar à tela inicial sem nenhuma ação de jogo

### Controls Hint (FR-028)
1. Abrir DevTools → Device Toolbar → 1024px → verificar `.controls-desktop` visível; `.controls-mobile` e `.controls-compact` ocultos
2. Redimensionar para 600px → `.controls-mobile` visível; `.controls-desktop` e `.controls-compact` ocultos
3. Redimensionar para 375px → `.controls-compact` visível com `← ↑ ↓ → ⏸ ?`; outros ocultos

### Campo Completo (FR-029)
1. Em DevTools, forçar `arena.getEmptyCells = () => []` após carregar → jogar → ao comer alimento → título deve exibir `"Campo Completo! 🏆"` sem shake
2. Verificar que a tela de resultado exibe score, tempo e botões normalmente
3. Confirmar que cor do título é `var(--clr-accent)` e não uma nova cor
