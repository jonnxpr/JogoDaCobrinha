<!--
SYNC IMPACT REPORT
==================
Version change: 0.0.0 → 1.0.0
Type: MAJOR (baseline constitution established — initial ratification)

Modified Principles: N/A (all principles newly created)

Added Sections:
  - Core Principles (5 principles)
  - Technology Stack & Constraints
  - Development Workflow
  - Governance

Removed Sections: N/A

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

### III. Sistema de Pontuação Completo

O controle de pontuação MUST estar implementado e visível durante toda a partida.

- Pontuação atual MUST ser exibida em destaque na tela de jogo, atualizada em tempo real.
- Recorde (high score) MUST ser persistido via `localStorage` e exibido junto ao score atual.
- Cada item comido MUST incrementar a pontuação de forma visível e imediata.
- A tela de Game Over MUST exibir a pontuação final e o recorde (atualizado se superado).
- O score MUST ser resetado ao iniciar nova partida; o recorde MUST ser preservado entre sessões.

**Rationale**: Controle de pontos é requisito explícito do projeto e componente central da experiência
de retenção do jogador.

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

- JavaScript MUST ser organizado em seções claramente delimitadas por comentários descritivos
  (ex: `// --- Game Loop ---`, `// --- Score ---`, `// --- Controls ---`, `// --- Rendering ---`).
- CSS MUST usar custom properties (variáveis CSS) para cores, tamanhos e espaçamentos reutilizáveis.
- HTML MUST usar elementos semânticos (`<header>`, `<main>`, `<footer>`, `<section>`, `<canvas>`).
- YAGNI: funcionalidades além do escopo definido MUST NOT ser adicionadas sem aprovação explícita.
- Cada função MUST ter responsabilidade única e SHOULD NOT exceder 40 linhas.
- `console.log` de debug MUST NOT ser deixado em código de produção.

**Rationale**: Facilita manutenção, legibilidade e futuras extensões do projeto por qualquer
colaborador.

## Technology Stack & Constraints

**Stack obrigatória**: HTML5 · CSS3 · JavaScript ES6+
**Motor de renderização**: Canvas API (`<canvas>`)
**Persistência**: `localStorage` (high score)
**Plataformas alvo**: Navegadores modernos — Chrome, Firefox, Safari, Edge (versões ≥ 2 anos)
**Resolução mínima suportada**: 320px de largura (ex: iPhone SE)
**Performance**: Game loop MUST rodar a ≥ 30 FPS em smartphones mid-range
**Acessibilidade**: Cores de UI (score, menus, textos) MUST satisfazer contraste mínimo WCAG AA

## Development Workflow

- Todo recurso novo MUST estar associado a um User Story definido na spec antes de ser implementado.
- Código MUST ser verificado manualmente nas três formas: mobile portrait (320px+), tablet landscape
  (768px+) e desktop (1024px+) antes de ser considerado completo.
- Cada tela do jogo (início, em andamento, pausa, ajuda, game over) MUST ser implementada e
  verificada de forma independente.
- Commit messages MUST seguir Conventional Commits: `feat:`, `fix:`, `style:`, `refactor:`, `docs:`.
- Qualquer adição ao projeto MUST ser avaliada contra os Princípios I (Responsividade) e
  III (Pontuação) antes do merge, pois são requisitos explícitos do cliente.

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
Total) e Princípio III (Sistema de Pontuação). Violações MUST ser corrigidas antes do merge.

**Version**: 1.0.0 | **Ratified**: 2026-04-05 | **Last Amended**: 2026-04-05
