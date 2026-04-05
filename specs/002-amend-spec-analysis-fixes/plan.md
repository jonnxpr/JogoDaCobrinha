# Implementation Plan: Emendas da Análise — Jogo da Cobrinha

**Branch**: `002-amend-spec-analysis-fixes` | **Date**: 2026-04-05 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/002-amend-spec-analysis-fixes/spec.md`

## Summary

Emendas cirúrgicas à base de código de `001-snake-game-core` geradas pelo relatório de análise cruzada (`speckit.analyze`). Quatro novos requisitos funcionais (FR-026 a FR-029) corretos 4 gaps spec-level: (1) campo "Melhor Score" ausente no HUD durante a partida (violação CRÍTICA do Princípio III da Constituição); (2) comportamento ambíguo ao fechar o modal de ajuda entre status `'playing'` e `'paused'`; (3) resumo de controles inexistente na tela inicial; (4) comportamento indefinido para estado de campo completamente preenchido. Nenhum arquivo novo é criado; as alterações são localizadas em 5 arquivos existentes: `index.html`, `css/style.css`, `js/game.js`, `js/ui.js`, `js/controls.js`.

## Technical Context

**Language/Version**: HTML5 · CSS3 · JavaScript ES6+ (sem transpilação) — *herdado de 001-snake-game-core*  
**Primary Dependencies**: Canvas API (nativo), Page Visibility API (nativo), localStorage (nativo) — zero bibliotecas de produção — *herdado*  
**Dev Tooling**: Vite `^6.x` (devDependency) — `npm run dev` → `http://localhost:8000` — *herdado*  
**Storage**: `localStorage["snakeRanking"]` — `RankingEntry[]` JSON, máx 5 entradas — *schema inalterado*  
**Testing**: Manual via browser DevTools (Chrome/Firefox/Safari/Edge); Device Toolbar para breakpoints CSS  
**Target Platform**: Navegadores modernos ≥2 anos (Chrome 110+, Firefox 115+, Safari 16+, Edge 110+); GitHub Pages — *herdado*  
**Project Type**: Emenda de aplicação web estática (client-side game, zero backend) — sem novo build step  
**Performance Goals**: Idênticos à feature 001 (≥30 FPS; resposta a input ≤100ms) — nenhuma nova operação pesada introduzida  
**Constraints**: Zero dependências de produção; CSS-only para breakpoints do resumo de controles (sem JS adicional); nenhuma nova tela, nenhum novo asset, nenhuma nova cor além das já definidas em `--clr-accent`  
**Scale/Scope**: 5 arquivos alterados; 4 FRs adicionados; 2 campos novos em `GameSession`; ~60 linhas novas estimadas de HTML+CSS+JS combinadas

## Constitution Check

*GATE: Deve passar antes da Fase 0. Re-verificado após Fase 1.*

| Princípio | Gate | Status |
|-----------|------|--------|
| I. Responsividade Total | FR-028 usa três níveis CSS (≥768px / 480-767px / <480px) para controls-hint — sem media query nova que quebre layouts existentes; canvas e HUD inalterados | ✅ PASS |
| II. Vanilla Stack | Todas as alterações são HTML/CSS/JS puro; CSS breakpoints via `@media` nativo; nenhum novo pacote; Vite permanece opcional | ✅ PASS |
| III. Pontuação Completa | **Esta feature CORRIGE a violação CRÍTICA**: FR-026 adiciona campo `bestScoreAtStart` ao HUD — high score agora exibido junto ao score atual durante toda a partida | ✅ PASS (violação resolvida) |
| IV. Tela de Ajuda | FR-027 clarifica o comportamento de retomada; FR-028 adiciona resumo de controles na tela inicial — ambos melhoram a orientação ao jogador | ✅ PASS |
| V. Simplicidade | Nenhuma nova abstração; YAGNI aplicado (sem nova tela, cor, asset ou classe); `status === 'complete'` é apenas um novo valor de string no enum existente | ✅ PASS |

**Resultado: TODOS OS GATES PASSAM. Prosseguir para Fase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/002-amend-spec-analysis-fixes/
├── plan.md              # Este arquivo
├── research.md          # Fase 0 — decisões de emenda
├── data-model.md        # Fase 1 — delta ao model de 001
├── quickstart.md        # Fase 1 — referência ao quickstart de 001
├── contracts/
│   └── screens.md       # Fase 1 — emendas ao contrato de telas de 001
└── tasks.md             # Fase 2 — gerado por /speckit.tasks (já existente em 001)
```

### Source Code (arquivos alterados na raiz do repositório)

```text
/                              ← raiz do repositório (sem novos arquivos)
├── index.html                 ← ALTERADO: +#hud-best no HUD; +#controls-hint com 3 sub-divs
├── css/
│   └── style.css              ← ALTERADO: HUD best-score layout; controls-hint CSS 3-tier
├── js/
│   ├── game.js                ← ALTERADO: GameSession +bestScoreAtStart; Arena +status 'complete'
│   ├── ui.js                  ← ALTERADO: showGameOver condicional 'complete'; screen-paused overlay
│   └── controls.js            ← ALTERADO: closeHelp 3-case logic; #activeStatusBeforeHelp
└── (todos os demais arquivos inalterados)
```

**Structure Decision**: Emenda single-project sem novos arquivos. Todas as mudanças são localizadas nos 5 arquivos acima. A estrutura da feature 001 é preservada integralmente.
