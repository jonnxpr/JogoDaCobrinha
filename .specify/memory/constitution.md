<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.0
Type: MINOR — material expansion of Principle III (ranking system), Principle V (OOP architecture),
              and Technology Stack section; no principles removed or redefined incompatibly.

Modified Principles:
  - III. Sistema de Pontuação Completo → III. Sistema de Pontuação e Ranking Completo
    Expanded from single high-score to Top-5 ranking: named entries, score multipliers,
    player name validation, unique name constraint, random name generator, null best-score
    for empty ranking, and "Campo Completo" special ending.
  - V. Simplicidade e Manutenibilidade
    Added: OOP architecture constraint (ES6 classes, composition, no domain inheritance).

Added detail (Technology Stack):
  - ES modules (type="module", native browser import/export)
  - OOP class inventory: Snake, Arena, GameSession, Game, Ranking, UIManager
  - localStorage schema: key snakeRanking → RankingEntry[] max 5
    {playerName: string, score: number, difficulty: string, savedAt: ISO-string}
  - Difficulty table: easy/medium/hard (speed, obstacles, multiplier)
  - Map sizes: small 15×15, medium 20×20, large 30×30
  - ResizeObserver for canvas proportional resizing
  - Page Visibility API for auto-pause on tab switch

Removed Sections: None

Templates requiring updates:
  - .specify/templates/plan-template.md  ✅ aligned (Constitution Check gate reads from this file)
  - .specify/templates/spec-template.md  ✅ aligned (user-story structure compatible)
  - .specify/templates/tasks-template.md ✅ aligned (task phases compatible with principles)

Deferred TODOs: None
-->

# Jogo da Cobrinha Constitution

## Core Principles

### I. Responsividade Total (NÃO-NEGOCIÁVEL)

O jogo DEVE funcionar corretamente em todos os tipos de dispositivos: desktop, tablet e mobile.

- O layout MUST se adaptar via CSS3 (media queries, flexbox ou grid) a qualquer resolução de viewport.
- Controles por toque (touch/swipe) MUST ser implementados para dispositivos móveis.
- Controles por teclado (setas direcionais, WASD) MUST ser suportados em desktop/laptop.
- O canvas de jogo MUST redimensionar proporcionalmente ao viewport disponível sem distorção.
- Nenhum elemento de UI MUST transbordar (overflow hidden) ou ficar inacessível em telas de 320px+.

**Rationale**: O requisito primário do projeto exige suporte universal de dispositivos. Qualquer
funcionalidade que quebre em mobile ou que exija resolução mínima específica viola este princípio.

### II. Tecnologia Pura — Vanilla Stack

O projeto MUST ser implementado exclusivamente com HTML5, CSS3 e JavaScript vanilla (ES6+).

- Nenhuma biblioteca externa, framework (React, Vue, jQuery) ou runtime adicional é permitido.
- O jogo MUST executar diretamente no navegador abrindo `index.html` sem servidor local.
- Canvas API (HTML5) MUST ser o motor de renderização do jogo.
- Build tools (Webpack, Vite, npm) SHOULD ser evitados; se usados MUST ser opcionais e documentados.
- `requestAnimationFrame` MUST ser usado para o game loop; `setInterval` para game loop é PROIBIDO.

**Rationale**: Mantém o projeto acessível sem setup de ambiente complexo e focado nas tecnologias-alvo
(HTML5, CSS3, JavaScript puro).

### III. Sistema de Pontuação e Ranking Completo

O controle de pontuação e o ranking MUST estar implementados e visíveis durante e após cada partida.

- Pontuação atual MUST ser exibida em destaque na tela de jogo, atualizada em tempo real.
- O recorde do ranking (melhor score entre as 5 entradas) MUST ser lido uma vez no início da partida
  (`bestScoreAtStart`) e exibido no HUD junto ao score atual; se o ranking estiver vazio, exibir
  `"—"` (valor `null` internamente — não `0`).
- Cada item comido MUST incrementar a pontuação conforme o multiplicador da dificuldade:
  Fácil ×1, Médio ×2, Difícil ×3.
- A tela de Game Over MUST exibir a pontuação final e o recorde registrado no ranking.
- O score MUST ser resetado ao iniciar nova partida; o ranking MUST ser preservado entre sessões.
- O ranking MUST persistir os 5 maiores scores em `localStorage['snakeRanking']` como array JSON
  de `RankingEntry` `{playerName: string, score: number, difficulty: string, savedAt: ISO-string}`,
  ordenado por score decrescente; entradas em excesso MUST ser descartadas.
- Ao qualificar para o ranking, o jogador MUST informar um nome (letras, números, espaços, hífens;
  máx 20 caracteres). Nomes duplicados (case-insensitive) MUST ser rejeitados com mensagem de erro
  e o jogador MUST poder gerar um nome aleatório único (ADJECTIVES + NOUNS) como alternativa.
- O encerramento por campo completo (nenhuma célula vazia para spawnar alimento) MUST ser tratado
  como condição especial: exibir `"Campo Completo! 🏆"` em `var(--clr-accent)` na tela de resultado,
  sem animação extra; as mesmas regras de qualificação para o ranking se aplicam normalmente.

**Rationale**: Controle de pontos e ranking Top-5 nomeado são requisitos explícitos do projeto e
componentes centrais da experiência de retenção do jogador. O multiplicador por dificuldade
incentiva os jogadores a escalarem o desafio para maximizar scores.

### IV. Tela de Ajuda e Orientação de Controles

O jogo MUST fornecer tela de ajuda clara listando todos os comandos disponíveis por plataforma.

- Uma tela/modal de ajuda MUST ser acessível na tela inicial e durante o jogo (tecla `H` ou `?` no
  desktop; botão de ajuda visível no mobile).
- A tela de ajuda MUST descrever: controles de desktop (↑↓←→, WASD), controles móveis
  (swipe ou botões direcionais on-screen), pausar (`P` / botão), reiniciar e abrir ajuda.
- A tela inicial MUST exibir um resumo dos controles antes da primeira partida.
- Feedback visual MUST ser fornecido para eventos de jogo: início, pausa, retomada e game over.

**Rationale**: Usuários de diferentes plataformas precisam de orientação imediata. Tela de ajuda é
requisito explícito do projeto.

### V. Simplicidade e Manutenibilidade

O código MUST seguir princípios de simplicidade; complexidade MUST ser justificada explicitamente.

- A arquitetura MUST ser OOP com classes ES6+: `Snake`, `Arena`, `GameSession`, `Game`,
  `Ranking`, `UIManager` — composição pura, sem herança entre entidades de domínio.
- Os arquivos JS MUST usar ES modules nativos (`type="module"`); dependências MUST ser declaradas
  via `import`/`export` explícitos — nenhum global implícito entre módulos.
- JavaScript MUST ser organizado em seções claramente delimitadas por comentários descritivos
  (ex: `// --- Game Loop ---`, `// --- Score ---`, `// --- Controls ---`, `// --- Rendering ---`).
- CSS MUST usar custom properties (variáveis CSS) para cores, tamanhos e espaçamentos reutilizáveis.
- HTML MUST usar elementos semânticos (`<header>`, `<main>`, `<footer>`, `<section>`, `<canvas>`).
- YAGNI: funcionalidades além do escopo definido MUST NOT ser adicionadas sem aprovação explícita.
- Cada método de classe MUST ter responsabilidade única e SHOULD NOT exceder 40 linhas.
- `console.log` de debug MUST NOT ser deixado em código de produção.

**Rationale**: Facilita manutenção, legibilidade e futuras extensões do projeto por qualquer
colaborador. A arquitetura OOP com classes ES6+ reflete as decisões de design ratificadas na
especificação e garante separação de responsabilidades verificável.

## Technology Stack & Constraints

**Stack obrigatória**: HTML5 · CSS3 · JavaScript ES6+ (ES modules nativos, `type="module"`)
**Motor de renderização**: Canvas API (`<canvas>`); redimensionamento via `ResizeObserver`
**Persistência**: `localStorage['snakeRanking']` → `RankingEntry[]` max 5 entradas, JSON
  - Schema: `{playerName: string, score: number, difficulty: string, savedAt: ISO-string}`
**Plataformas alvo**: Navegadores modernos — Chrome, Firefox, Safari, Edge (versões ≥ 2 anos)
**Resolução mínima suportada**: 320px de largura (ex: iPhone SE)
**Performance**: Game loop MUST rodar a ≥ 30 FPS em smartphones mid-range
**Acessibilidade**: Cores de UI (score, menus, textos) MUST satisfazer contraste mínimo WCAG AA
**Módulos JS**: `js/config.js`, `js/game.js`, `js/controls.js`, `js/ranking.js`, `js/ui.js`
**Classes**: `Snake`, `Arena`, `GameSession`, `Game` em `game.js`; `Ranking` em `ranking.js`;
            `UIManager` em `ui.js`

**Dificuldades** (definidas em `DIFFICULTIES` de `config.js`):

| Nível  | Speed | Obstáculos | Multiplicador |
|--------|-------|------------|---------------|
| easy   | 6 fps | 0          | ×1            |
| medium | 10 fps| 5          | ×2            |
| hard   | 15 fps| 12         | ×3            |

**Tamanhos de mapa** (definidos em `MAP_SIZES` de `config.js`):

| Tamanho | Colunas | Linhas |
|---------|---------|--------|
| small   | 15      | 15     |
| medium  | 20      | 20     |
| large   | 30      | 30     |

**APIs nativas adicionais**: Page Visibility API (auto-pausa ao minimizar/trocar aba)
**Dev server** (opcional): Vite `^6.x` — `npm run dev` → `http://localhost:8000`; zero build step
em produção (serve diretamente do `index.html`)

## Development Workflow

- Todo recurso novo MUST estar associado a um User Story definido na spec antes de ser implementado.
- Código MUST ser verificado manualmente nas três formas: mobile portrait (320px+), tablet landscape
  (768px+) e desktop (1024px+) antes de ser considerado completo.
- Cada tela do jogo (início, em andamento, pausa, ajuda, game over, ranking, modal de nome) MUST ser
  implementada e verificada de forma independente.
- Commit messages MUST seguir Conventional Commits: `feat:`, `fix:`, `style:`, `refactor:`, `docs:`.
- Qualquer adição ao projeto MUST ser avaliada contra os Princípios I (Responsividade) e
  III (Pontuação e Ranking) antes do merge, pois são requisitos explícitos do cliente.
- Novos módulos JS MUST ser adicionados como ES modules com `export` explícito;
  imports circulares são PROIBIDOS.

## Governance

Esta constituição define os princípios não-negociáveis do projeto Jogo da Cobrinha e DEVE ser
consultada antes de iniciar qualquer feature ou tarefa de desenvolvimento.

**Processo de emenda**:
1. Identifique o princípio a ser alterado e documente a justificativa.
2. Proponha a alteração com análise de impacto nos templates dependentes.
3. Incremente a versão seguindo Semantic Versioning:
   - MAJOR: remoção ou redefinição incompatível de princípio existente.
   - MINOR: adição de novo princípio ou nova seção material.
   - PATCH: clarificações, correções de redação, refinamentos não-semânticos.
4. Atualize `LAST_AMENDED_DATE` e propague mudanças aos templates afetados listados no Sync Report.

**Compliance**: Toda revisão de código MUST verificar conformidade com Princípio I (Responsividade
Total) e Princípio III (Sistema de Pontuação e Ranking). Violações MUST ser corrigidas antes do merge.

**Version**: 1.1.0 | **Ratified**: 2026-04-05 | **Last Amended**: 2026-04-07
