# Research: Jogo da Cobrinha — Núcleo Completo

**Feature**: `001-snake-game-core`  
**Date**: 2026-04-05  
**Status**: Complete — todos os NEEDS CLARIFICATION resolvidos

---

## R-001: Game Loop Pattern

**Decision**: `requestAnimationFrame` com acumulador de tempo de passo fixo (fixed-timestep accumulator)

**Rationale**:
- A constituição proíbe explicitamente `setInterval` para game loop.
- `requestAnimationFrame` sincroniza com o display refresh (60fps+), eliminando jitter.
- O acumulador desacopla a velocidade lógica da cobra (cells/second em `DifficultyConfig.speed`)
  da taxa de quadros do dispositivo: a cobra avança uma célula a cada `1000 / speed` ms,
  independente de ser 30fps ou 120fps.
- Pausa é implementada zerando o timestamp acumulado ao retomar (sem "time debt").

**Implementação**:
```js
// pseudo-código
let lastTime = 0, accumulated = 0;
function loop(timestamp) {
  const delta = timestamp - lastTime;
  lastTime = timestamp;
  if (!paused) {
    accumulated += delta;
    if (accumulated >= stepInterval) {
      accumulated -= stepInterval;
      tick(); // avança a cobra 1 célula
    }
    render();
  }
  requestAnimationFrame(loop);
}
```

**Alternatives considered**:
- `setInterval`: REJEITADO — proibido pela constituição; jitter em tabs em background; não sincronizado com display.
- Passo variável sem acumulador: REJEITADO — leva a velocidade da cobra dependente do FPS do device.

---

## R-002: Canvas Responsivo

**Decision**: Canvas redimensionado dinamicamente via JS em `resize` event; tamanho lógico da grade fixo (20×20 células); tamanho de célula calculado em pixels a partir do menor entre largura e altura disponíveis.

**Rationale**:
- Manter a grade 20×20 preserva a jogabilidade consistente em todos os devices.
- Calcular `cellSize = Math.floor(Math.min(availableW, availableH) / GRID_SIZE)` garante que
  a grade seja sempre quadrada e caiba no viewport sem overflow.
- O canvas CSS é dimensionado via `max-width: 100%; aspect-ratio: 1` para layout fluido;
  os atributos `canvas.width` e `canvas.height` são reajustados em JS para manter nitidez
  (evita upscaling borrado).
- `ResizeObserver` no container do canvas dispara o recálculo sem polling.

**Fórmula**:
```
availableW = container.clientWidth
availableH = window.innerHeight - headerHeight - controlsHeight
cellSize  = Math.floor(Math.min(availableW, availableH) / GRID_SIZE)
canvas.width = canvas.height = cellSize * GRID_SIZE
```

**Alternatives considered**:
- Canvas de tamanho fixo (ex: 400×400px): REJEITADO — quebra em viewports <400px (viola Princípio I).
- CSS transform scale: REJEITADO — borra pixel art em scaling up; eventos de toque ficam descalibrados.

---

## R-003: GitHub Pages + GitHub Actions

**Decision**: Deploy usando actions oficiais do GitHub: `actions/configure-pages@v4`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`. Trigger: `push` na `main`. Fonte: raiz do repositório.

**Rationale**:
- Actions oficiais usam OIDC (sem PAT armazenado em secrets), mais seguro e sem rotação de token.
- Serve a raiz do repositório diretamente — sem pasta `/docs`, sem branch `gh-pages`, sem etapa de build.
- `cancel-in-progress: true` no `concurrency` garante que deploys antigos sejam cancelados se um novo push chegar durante o deploy.
- Tempo de deploy esperado: 15–40 segundos por push.

**Workflow resumido** (`.github/workflows/deploy.yml`):
```yaml
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

**Configuração necessária** (única, feita uma vez pelo admin do repositório):
1. Settings → Pages → Source → selecionar **"GitHub Actions"**
2. Nenhum secret adicional necessário.

**Alternatives considered**:
- `peaceiris/actions-gh-pages`: REJEITADO — terceiro partido; requer Personal Access Token ou deploy key; adiciona dependência externa.
- Deploy manual via `git push` para branch `gh-pages`: REJEITADO — não atende ao requisito de pipeline automático por push.

---

## R-004: Visual Design — Tema Neon / Cyber-Glow

**Decision**: Dark-theme com estética neon ("cyber-glow") — fundo escuro `#0d0d1a`, cobra verde-neon `#39ff14`, alimento vermelho-neon `#ff2d55`, obstáculos cinza-metálico `#4a4a6a`, UI com glow effects via CSS `filter: drop-shadow` e `box-shadow`.

**Paleta**:
| Elemento         | Cor               | Uso |
|------------------|-------------------|-----|
| Fundo arena      | `#0d0d1a`         | Canvas background |
| Cobra (corpo)    | `#39ff14`         | Neon green |
| Cobra (cabeça)   | `#7fff00`         | Chartreuse (destaque) |
| Alimento         | `#ff2d55`         | Neon red/pink |
| Obstáculo        | `#4a4a6a`         | Slate metallic |
| Grade (opcional) | `#1a1a2e`         | Linha sutil |
| UI background    | `#12122a`         | Telas/modais |
| Texto primário   | `#e0e0ff`         | Alto contraste sobre fundo escuro |
| Texto acento     | `#39ff14`         | Score, títulos |
| Botões           | `#1e1e4a` + borda `#39ff14` | Neon outline style |

**CSS Custom Properties** (Princípio V):
```css
:root {
  --clr-bg:        #0d0d1a;
  --clr-snake:     #39ff14;
  --clr-snake-head:#7fff00;
  --clr-food:      #ff2d55;
  --clr-obstacle:  #4a4a6a;
  --clr-ui-bg:     #12122a;
  --clr-text:      #e0e0ff;
  --clr-accent:    #39ff14;
  --glow-snake:    0 0 8px #39ff14, 0 0 20px #39ff1466;
  --glow-food:     0 0 8px #ff2d55, 0 0 20px #ff2d5566;
  --font-game:     'Courier New', 'Consolas', monospace;
}
```

**Animações CSS** (sem JS para animações de UI):
- Tela inicial: fade-in do título + pulse animation no botão "Jogar"
- Game Over: shake animation no texto "GAME OVER" + fade-in do painel
- Novo recorde: glow pulse no score
- Transições entre telas: fade suave de 200ms

**Rationale**:
- Temática neon é universalmente associada a jogos retro-modernos e cobra específicamente.
- Dark background reduz fadiga ocular e faz os elementos neon se destacarem maximamente.
- Alto contraste natural satisfaz WCAG AA sem esforço adicional.
- Totalmente implementável em CSS puro (sem imagens, SVGs ou canvas para UI).
- Extremamente atraente e "viciante" visualmente — reforça a experiência arcade.

**Alternatives considered**:
- Design flat minimalista pastéis: REJEITADO — menos atraente para um jogo arcade.
- Pixel art retro (estilo Game Boy): REJEITADO — requereria spritesheet de assets; mais complexo; sem vantagem de engajamento sobre neon.

---

## R-005: Gerador de Nome Aleatório para Ranking

**Decision**: Combinação `Adjetivo + Substantivo` (animais/cobras/predadores) de arrays embutidos no código; se o nome gerado já existir no ranking, tenta até 10 combinações diferentes; se ainda colidir, adiciona sufixo `_N` (N = 2–99).

**Word lists**:
```js
const ADJECTIVES = ['Swift','Neon','Shadow','Turbo','Pixel','Cyber','Blaze','Storm','Venom','Hyper'];
const NOUNS      = ['Cobra','Viper','Python','Mamba','Hydra','Drake','Fang','Coil','Asp','Bolt'];
// → 100 combinações base possíveis → 9800 com sufixo _2.._99
// → cobre amplamente o limite de 5 entradas no ranking
```

**Validação de unicidade**: comparação case-insensitive contra `ranking.map(e => e.playerName.toLowerCase())`.

**Rationale**:
- Zero dependência externa; ~20 strings embutidas no código.
- Nomes são temáticos e memoráveis (ex: "NeonCobra", "SwiftViper").
- Fallback com sufixo garante unicidade matemática para qualquer tamanho de ranking.
- Atende FR-013 completamente.

**Alternatives considered**:
- UUID aleatório hexadecimal: REJEITADO — não é memorável nem divertido.
- Nomes de personagens famosos: REJEITADO — risco de copyright; internacionalização difícil.

---

## R-006: Pausa Automática por Perda de Foco

**Decision**: `document.addEventListener('visibilitychange', handler)` — quando `document.hidden === true`, chama a mesma função `pauseGame()` usada pelo botão/tecla de pausa. Ao recuperar foco (`document.hidden === false`), o estado de pausa permanece; o jogador retoma explicitamente.

**Rationale**:
- Page Visibility API é suportada por 97%+ dos navegadores modernos (sem polyfill necessário).
- `visibilitychange` é mais preciso que `window.blur`: dispara ao mudar de aba e ao bloquear tela mobile, mas NÃO ao mover o focus para DevTools ou outro elemento da mesma aba.
- Reutilizar `pauseGame()` evita duplicação de lógica (Princípio V).
- Retomada explícita evita que a cobra comece a mover antes do jogador estar pronto.

**Alternatives considered**:
- `window.addEventListener('blur')`: REJEITADO — dispara ao abrir DevTools, pop-ups internos; causaria pausas falsas durante desenvolvimento.
- Sem auto-pausa: REJEITADO — a cobra pode morrer enquanto o jogador está ausente (experiência frustrante).

---

## R-007: Servidor de Desenvolvimento Local

**Decision**: **Vite `^6.x`** como `devDependency` em `package.json`; script `"dev": "vite --port 8000"`; zero config necessária para HTML/CSS/JS vanilla; jogo continua funcionando abrindo `index.html` diretamente (offline-capable — requisito mantido).

**Configuração** (`package.json`):
```json
{
  "name": "jogo-da-cobrinha",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 8000"
  },
  "devDependencies": {
    "vite": "^6.0.0"
  }
}
```

**Uso**:
```bash
npm install      # instala vite (apenas na primeira vez)
npm run dev      # inicia em http://localhost:8000
```

**Rationale**:
- Vite serve a raiz do projeto como servidor HTTP estático com suporte nativo a ES modules sem config adicional — perfeito para vanilla JS com `<script type="module">`.
- Porta 8000 evita conflitos com servidores comuns (3000, 5173, 8080).
- Zero config: Vite detecta `index.html` na raiz automaticamente.
- HMR (Hot Module Replacement) é ganho bônus sem configuração.
- `node_modules/` fica no `.gitignore`; o pipeline CI/CD não executa `npm install` e não precisa do Vite para deploy.
- Constituição II: "Build tools SHOULD ser evitados; se usados MUST ser opcionais e documentados" — ✅ Vite é puramente opcional e documentado no quickstart.

**Alternatives considered**:
- `npx serve` / `http-server`: REJEITADO — sem HMR; experiência de dev inferior; requer `npx` (não fica no `package.json`).
- Node.js nativo (`http.createServer`): REJEITADO — requer código custom; sem HMR; mais trabalho sem benefício extra.
- Python `http.server 8000`: REJEITADO — não é Node/npm; não é portável entre ambientes; mencionado apenas como fallback na documentação.
- Vite com config `vite.config.js`: REJEITADO — desnecessário para o projeto; zero config é suficiente.

---

## Resoluções de NEEDS CLARIFICATION (da spec)

Todos os 5 pontos clarificados em `/speckit.clarify` já estão documentados na spec.
Nenhum item pendente para planejamento.

| Item | Resolução | Impacto no Design |
|------|-----------|-------------------|
| Formato nome ranking | letras/números/espaços/hífens, máx 20 chars | FR-019; validação em `ranking.js` |
| Pontuação por dificuldade | Fácil×1, Médio×2, Difícil×3 | `DifficultyConfig.scoreMultiplier`; exibir durante partida |
| Controle touch | swipe + botões on-screen simultâneos | `controls.js` trata ambos; layout reserva espaço para botões |
| Ranking na tela inicial | botão dedicado na home | FR-021; US5 cenário 7; `ui.js` gerencia tela de ranking |
| Perda de foco | pausa automática; retomada explícita | FR-022; `visibilitychange` em `controls.js` |
| Servidor local de desenvolvimento | Vite devDependency, porta 8000, opcional | `package.json`; task T050 |
