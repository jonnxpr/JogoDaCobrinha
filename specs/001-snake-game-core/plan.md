# Implementation Plan: Jogo da Cobrinha — Núcleo Completo

**Branch**: `001-snake-game-core` | **Date**: 2026-04-05 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-snake-game-core/spec.md`

## Summary

Jogo da Cobrinha completo em HTML5/CSS3/JavaScript vanilla, totalmente responsivo (320px+), com
3 níveis de dificuldade (velocidade + obstáculos + multiplicador de pontuação), cronômetro de sessão,
ranking persistido de top 5, pausa automática por perda de foco e controles dual (teclado + swipe/
botões on-screen). Publicado via GitHub Pages com pipeline GitHub Actions disparado por push na
`main`. Servidor de desenvolvimento local opcional via **Vite** (`npm run dev`) na porta 8000.
Architecture OOP: classes ES6+ individuais (`Snake`, `Arena`, `GameSession`, `Ranking`, `UIManager`,
`Game`), composição pura. Design neon/cyber-glow: dark background, neon green snake, animações CSS.
Footer global com créditos do autor "Jonathan Douglas Diego Tavares" e copyright dinâmico.

## Technical Context

**Language/Version**: HTML5 · CSS3 · JavaScript ES6+ (sem transpilação)  
**Primary Dependencies**: Canvas API (nativo), Page Visibility API (nativo), localStorage (nativo) — zero bibliotecas de produção  
**Dev Tooling (opcional)**: Vite `^6.x` (devDependency) — servidor local `localhost:8000`; `npm run dev` inicia; sem build step; `package.json` com `"type": "module"`; jogo ainda funciona abrindo `index.html` diretamente (offline-capable)  
**Storage**: `localStorage` — chave: `snakeRanking` (array JSON, máx 5 entradas)  
**Testing**: Manual via browser DevTools (Chrome/Firefox/Safari/Edge); responsividade via Device Toolbar  
**Target Platform**: Navegadores modernos ≥2 anos (Chrome 110+, Firefox 115+, Safari 16+, Edge 110+); hospedado em GitHub Pages  
**Project Type**: Static web-app (client-side game, zero backend)  
**Performance Goals**: ≥30 FPS em smartphones mid-range; resposta a input ≤100ms; Canvas redimensiona sem jank  
**Constraints**: Zero dependências de produção; offline-capable após carregamento; 320px largura mínima; WCAG AA contraste mínimo; servidor local é OPCIONAL (game funciona sem npm)  
**Scale/Scope**: Single-player; 7 telas; classes ES6+ (`Snake`, `Arena`, `GameSession`, `Ranking`, `UIManager`, `Game`); ~5 arquivos JS; repositório privado `JogoDaCobrinha` no GitHub

## Constitution Check

*GATE: Deve passar antes da Fase 0. Re-verificado após Fase 1.*

| Princípio | Gate | Status |
|-----------|------|--------|
| I. Responsividade Total | Canvas redimensiona via JS; media queries + flexbox; swipe + botões on-screen; 320px+ funcional | ✅ PASS |
| II. Vanilla Stack | HTML5/CSS3/JS puro; Canvas API; `requestAnimationFrame`; Vite como devDependency **opcional** (documentado, sem build step); jogo abre diretamente via `index.html` sem npm | ✅ PASS — Vite é opcional e documentado conforme permitido pela Constituição |
| III. Pontuação Completo | Score em tempo real com multiplicador por dificuldade; localStorage; Game Over exibe score + tempo | ✅ PASS |
| IV. Tela de Ajuda | Help modal acessível na tela inicial (botão) e in-game (tecla H/?); seções desktop/mobile | ✅ PASS |
| V. Simplicidade | Classes ES6+ com responsabilidade única (≤40 linhas/método); CSS custom properties; HTML semântico; YAGNI | ✅ PASS |

**Resultado: TODOS OS GATES PASSAM. Prosseguir para Fase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/001-snake-game-core/
├── plan.md              # Este arquivo
├── research.md          # Fase 0 — decisões técnicas
├── data-model.md        # Fase 1 — entidades e estado
├── quickstart.md        # Fase 1 — dev + deploy
├── contracts/
│   ├── localStorage.md  # Schema de persistência
│   └── screens.md       # Contrato de telas e transições
└── tasks.md             # Fase 2 — gerado por /speckit.tasks
```

### Source Code (repository root)

```text
/                             ← raiz do repositório (GitHub Pages serve daqui)
├── index.html                ← ponto de entrada único
├── package.json              ← devDependency: vite; scripts: dev (porta 8000)
├── css/
│   └── style.css             ← variáveis CSS, layout, animações, tema neon
├── js/
│   ├── config.js             ← DifficultyConfig, constantes globais
│   ├── game.js               ← classes Game, GameSession, Snake, Arena (game loop rAF)
│   ├── controls.js           ← teclado, swipe, botões on-screen, visibilitychange
│   ├── ranking.js            ← classe Ranking: CRUD, validação, localStorage
│   └── ui.js                 ← classe UIManager: telas, renderização, animações
├── .github/
│   └── workflows/
│       └── deploy.yml        ← GitHub Actions → GitHub Pages (push na main)
└── specs/                    ← documentação (não servida como página de jogo)
```

**Structure Decision**: Aplicação web estática single-project, sem build step de produção. Arquivos
JS carregados via `<script type="module">` em `index.html`. GitHub Pages serve a raiz do repositório.
`package.json` existe **apenas** para o servidor de desenvolvimento Vite (`npm run dev`); não há
bundling, transpilação ou output de build. A presença de `package.json` não altera o comportamento
de produção — o deploy via Actions/Pages ignora `node_modules` e usa apenas os arquivos estáticos.

## CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - uses: actions/deploy-pages@v4
        id: deployment
```

**Notas CI**: O pipeline NÃO roda `npm install` nem qualquer build step — serve a raiz
diretamente. O `package.json` / `node_modules` são irrelevantes para o deploy. O `.gitignore`
MUST incluir `node_modules/`.
