# Feature Specification: Emendas da Análise — Jogo da Cobrinha

**Feature Branch**: `002-amend-spec-analysis-fixes`  
**Created**: 2026-04-05  
**Status**: Draft  
**Input**: User description: "corrija todos os problemas encontrados com base na análise que foi feita"

> **Contexto**: Esta especificação documenta emendas à feature `001-snake-game-core` geradas a partir do relatório de análise cruzada (`speckit.analyze`). Todas as mudanças são retrocompatíveis com o escopo original. Os 9 problemas encontrados (I1–I3, I4, G1, D1, A1–A3) são tratados aqui em dois grupos:
> - **Grupo A** (spec-level): lacunas e conflitos que exigem novos ou atualizados requisitos funcionais → FR-026 a FR-029, emendas a FR-018 e FR-017.
> - **Grupo B** (task-level): erros de especificação técnica em tasks.md que são corrigidos diretamente → I2, I3, D1, A1, A3.

## Clarifications

### Session 2026-04-05

- Q: Ao fechar o modal de ajuda, se o jogador estava em estado `'paused'` (pausa deliberada via P) no momento em que abriu a ajuda, o jogo deve retomar automaticamente? → A: Não — apenas `status === 'playing'` no momento de abertura aciona auto-resume; se estava `'paused'`, permanece pausado ao fechar.
- Q: Qual valor canônico exibe o campo de melhor score no HUD quando o ranking está vazio — `"—"` ou `"0"`? → A: `"—"` (traço) — indica ausência de recorde registrado; zero seria ambíguo com score real.
- Q: Em viewports ≤ 480px, o resumo de controles da tela inicial deve exibir ícones sem texto: quais — Unicode, emojis, ou ocultar? → A: Caracteres Unicode simples (`←↑↓→`, `⏸`, `?`) — sem assets externos, consistente com a abordagem vanilla do projeto.
- Q: `bestScoreAtStart` deve ser `null` ou `0` quando o ranking está vazio? → A: `null` — preserva a distinção semântica entre "sem recorde registrado" e "recorde real de zero pontos"; `null` → exibe `"—"` no HUD.
- Q: Na tela de resultado por campo completo, o diferenciador visual deve ser apenas texto, cor diferente ou manter shake? → A: Apenas texto `"Campo Completo! 🏆"` em `var(--clr-accent)`, sem animação shake — YAGNI; mesmos elementos UI de score e ranking.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Visualizar Melhor Score no HUD Durante a Partida (Priority: P1)

Enquanto joga, o jogador quer ver qual é o melhor score já registrado para ter uma referência de quanto falta para superar o recorde. Esta informação deve estar sempre visível durante o jogo, sem necessidade de pausar ou navegar para outra tela.

**Why this priority**: A Constituição do projeto (Princípio III) exige explicitamente que o high score seja "exibido junto ao score atual". A sua ausência viola um princípio não-negociável e bloqueia o início da implementação. É o único bloqueador classificado como CRÍTICO no relatório de análise.

**Independent Test**: Pode ser testado iniciando uma partida com pelo menos um score salvo no ranking e verificando que um campo "Recorde:" aparece visível no HUD durante toda a partida. Pode ser testado independentemente dos demais — basta ter a tela de jogo com HUD funcional.

**Acceptance Scenarios**:

1. **Given** o ranking está vazio (nenhum score salvo), **When** o jogador inicia uma partida, **Then** o HUD exibe o campo de melhor score com o valor `"—"` (traço), indicando que ainda não há recorde registrado.
2. **Given** o ranking tem "15" como maior score, **When** o jogador inicia uma nova partida, **Then** o HUD exibe "Recorde: 15" (ou equivalente) de forma visível durante toda a partida.
3. **Given** o jogador está em uma partida com recorde de 15 visível no HUD, **When** o score do jogador ultrapassa 15, **Then** o HUD ainda exibe o valor lido no início da partida (não atualiza em tempo real — a referência é o recorde anterior ao início).

---

### User Story 2 — Retomada Automática ao Fechar Modal de Ajuda (Priority: P2)

O jogador abre a ajuda durante uma partida ativa usando a tecla H ou o botão de ajuda. Após consultar os controles, fecha o modal e espera que o jogo retome automaticamente — sem precisar pressionar P ou "Retomar" novamente, porque não iniciou uma pausa deliberada, apenas consultou a documentação do jogo.

**Why this priority**: O Acceptance Scenario 3 do User Story 6 de `001-snake-game-core` afirma que "o jogo retoma (se estava em andamento)" ao fechar a ajuda. A especificação de tarefas (T040) contradiz este cenário com comportamento oposto. Resolver antes de implementar evita retrabalho garantido.

**Independent Test**: Pode ser testado iniciando uma partida, abrindo a ajuda (tecla H), fechando com o botão fechar ou Escape, e verificando que a cobra volta a se mover sem nenhuma ação adicional.

**Acceptance Scenarios**:

1. **Given** a partida está em andamento (`status === 'playing'`), **When** o jogador abre o modal de ajuda (H/? ou botão `[?]`), **Then** o jogo pausa automaticamente e o modal de ajuda é exibido (comportamento já definido em US6-S2 do feature 001).
2. **Given** o modal de ajuda está aberto e foi aberto durante `status === 'playing'`, **When** o jogador fecha o modal (botão fechar ou tecla Escape), **Then** o jogo retoma automaticamente sem qualquer ação adicional do jogador.
3. **Given** o jogo estava pausado voluntariamente (P), **When** o jogador abre a ajuda e a fecha, **Then** o jogo permanece pausado — não retoma automaticamente.
4. **Given** o modal de ajuda está aberto e foi aberto diretamente da tela inicial (sem partida ativa), **When** o jogador fecha o modal, **Then** o sistema retorna à tela inicial sem iniciar, pausar ou retomar nenhuma partida.

---

### User Story 3 — Resumo de Controles na Tela Inicial (Priority: P3)

Na tela inicial, o jogador consegue ver uma referência rápida e discreta dos controles do jogo sem precisar abrir o modal de ajuda. Este resumo é adaptado ao tipo de dispositivo: teclado para desktop, swipe e botões para mobile.

**Why this priority**: A Constituição (Princípio IV) e os contratos de tela (`contracts/screens.md`) especificam este resumo como elemento obrigatório da tela inicial. Nenhuma tarefa atual o cobre. Sem ele, a tela inicial está incompleta conforme a Constituição.

**Independent Test**: Pode ser testado abrindo a tela inicial em dois viewports: 1024px (desktop) e 320px (mobile), verificando que o resumo de controles correto aparece em cada caso — sem necessidade de qualquer interação.

**Acceptance Scenarios**:

1. **Given** o jogador abre o jogo em um desktop (viewport ≥ 768px), **When** a tela inicial é exibida, **Then** um resumo discreto mostra os controles de teclado: setas/WASD para mover, P para pausar, H para ajuda.
2. **Given** o jogador abre o jogo em um mobile (viewport < 768px), **When** a tela inicial é exibida, **Then** o resumo mostra os controles touch: swipe para mover, botões on-screen, botão de pausa — sem mostrar controles de teclado.
3. **Given** qualquer dispositivo, **When** o resumo de controles é exibido, **Then** ele é visualmente secundário (tamanho, cor e posição não competem com os botões de ação "Jogar", seletor de dificuldade e "Ranking").
4. **Given** o jogador abre o jogo em viewport muito estreito (< 480px), **When** a tela inicial é exibida, **Then** o resumo exibe apenas caracteres Unicode compactos (`← ↑ ↓ → ⏸ ?`) sem texto adicional — puramente via CSS, sem ocultar completamente o elemento.

---

### User Story 4 — Encerramento por Campo Completo (Priority: P4)

Em uma partida excepcional onde a cobra cresce até preencher todas as células disponíveis, o jogo precisa responder de forma definida quando não há mais espaço para spawnar alimento. O resultado deve ser distinto de um Game Over por colisão e deve valorizar a conquista do jogador.

**Why this priority**: O `spec.md` original deixa esta bifurcação em aberto ("declarar vitória ou encerrar"). A implementação requer uma decisão determinística. Embora seja um edge case raro (grade 20×20 = 400 células), a ausência de decisão causaria comportamento indeterminado em produção.

**Independent Test**: Pode ser testado em modo de desenvolvimento forçando o estado de `getEmptyCells() === []` após o crescimento da cobra, e verificando que a resposta do sistema é o encerramento especial com mensagem diferenciada.

**Acceptance Scenarios**:

1. **Given** a cobra ocupa todas as células exceto onde há alimento, **When** o jogador come esse último alimento (campo agora 100% preenchido), **Then** o jogo detecta que não há células vazias para spawnar novo alimento e declara encerramento especial com status "campo completo".
2. **Given** o encerramento por campo completo ocorre, **When** a tela de resultado é exibida, **Then** o título exibe `"Campo Completo! 🏆"` na cor `var(--clr-accent)` sem animação shake — reutilizando todos os outros elementos da tela (score, tempo, botões de ranking); nenhuma cor nova nem asset adicional é introduzido.
3. **Given** o encerramento por campo completo, **When** o score é avaliado para o ranking, **Then** as mesmas regras de qualificação para top 5 se aplicam normalmente (o encerramento especial não concede privilégio de ranking automático).

---

### Edge Cases

- O melhor score no HUD deve atualizar se o jogador salvar um novo recorde e iniciar nova partida imediatamente? → Não: o valor é lido uma vez em `game.start()` e mantido fixo durante a partida inteira. A próxima partida já lê o valor atualizado do localStorage.
- O que acontece se o jogador abre a ajuda enquanto o jogo está pausado (via P) e depois fecha a ajuda? → O jogo permanece pausado; apenas `status === 'playing'` no momento de abertura do modal aciona auto-resume (FR-027).
- Se o modal de ajuda for aberto da tela inicial e navigationar para outra tela ocorrer antes de fechar, o `closeModal('modal-help')` é seguro? → Sim: `closeModal` apenas remove o atributo visível do modal — não depende da tela ativa.
- O encerramento por campo cheio pode ocorrer em qualquer nível de dificuldade? → Sim: a grade é sempre 20×20 independente do nível; o número de obstáculos não reduz o espaço disponível para crescimento da cobra além de bloquear colisões.
- O resumo de controles na tela inicial entra em conflito com a tela inicial em viewports muito estreitos (320px)? → Em viewports < 480px exibe apenas caracteres Unicode compactos (`←↑↓→ ⏸ ?`) sem texto — via CSS puro (FR-028); nunca oculta completamente.

## Requirements *(mandatory)*

### Functional Requirements

*(Emendas à feature 001-snake-game-core — numeração continua de FR-025)*

- **FR-026**: O HUD exibido durante a partida MUST incluir um campo de "Melhor Score" que mostra o score do 1º lugar do ranking; se o ranking estiver vazio, MUST exibir `"—"` (traço em-dash) — nunca `"0"` ou string vazia; o valor é lido uma vez no início da partida (`game.start()`) e permanece fixo até o próximo início de partida.

- **FR-027** *(emenda FR-018)*: O comportamento ao fechar o modal de ajuda depende do estado em que o jogo estava no momento em que o modal foi **aberto**: (a) se `status === 'playing'` ao abrir, MUST retomar automaticamente ao fechar; (b) se `status === 'paused'` ao abrir (pausa deliberada do jogador), MUST permanecer pausado ao fechar — sem retomada automática; (c) se não havia sessão em andamento (tela inicial ou ranking), MUST retornar ao estado anterior sem iniciar nem alterar nenhuma partida.

- **FR-028** *(emenda FR-017)*: A tela inicial MUST exibir um resumo visual de controles de forma discreta e adaptada ao viewport: em viewports ≥ 768px, MUST exibir os controles de teclado (setas/WASD, P para pausar, H para ajuda) em texto; em viewports entre 480px e 767px, MUST exibir os controles touch (swipe, botões on-screen, botão pausar) em texto; em viewports < 480px, MUST exibir apenas caracteres Unicode compactos (`←↑↓→`, `⏸`, `?`) sem texto adicional; a alternância entre os três níveis MUST ser via CSS puro — sem lógica JavaScript adicional.

- **FR-029**: Quando o sistema detectar que não há células vazias para spawnar alimento após crescimento da cobra (campo completamente preenchido), MUST encerrar a partida com status `'complete'`; a tela de resultado MUST exibir o título `"Campo Completo! 🏆"` em `var(--clr-accent)` sem animação shake — reutilizando os elementos de score, tempo e ranking da tela de Game Over existente; MUST aplicar as regras normais de qualificação para o ranking; MUST NOT introduzir nova cor, novo asset ou nova tela.

### Key Entities

Nenhuma nova entidade de domínio. Emendas aos modelos existentes:

- **`GameSession.status`**: MUST aceitar o valor adicional `'complete'` (campo preenchido) além dos valores `'idle'` (inicial, antes de `game.start()`), `'playing'`, `'paused'` e `'game_over'`; o valor `'complete'` é tratado como equivalente a `'game_over'` para fins de encerramento do loop e qualificação para o ranking, com mensagem de UI diferenciada.
- **`GameSession`**: MUST expor o atributo `bestScoreAtStart: number | null` — `null` quando o ranking está vazio no momento de `start()`; valor numérico do 1º lugar quando há entradas; usado exclusivamente pelo HUD para exibir o recorde de referência sem nova leitura de localStorage por frame; `null` → HUD exibe `"—"`; number → HUD exibe o valor.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-012**: Em 100% das partidas iniciadas com ranking não-vazio, o HUD exibe o campo de melhor score com o valor correto do 1º lugar — verificável inspecionando o HUD em qualquer partida com e sem dados no localStorage.
- **SC-013**: Fechar o modal de ajuda com `status === 'playing'` anterior resulta em retomada automática em 100% dos casos; fechar com `status === 'paused'` anterior mantém o jogo pausado em 100% dos casos — verificável sem pressionar nenhum outro botão após fechar o modal.
- **SC-014**: A tela inicial exibe controles de teclado em viewport ≥ 768px, controles touch em viewport 480–767px e apenas caracteres Unicode compactos (`← ↑ ↓ → ⏸ ?`) em viewport < 480px, sem nenhuma linha de JavaScript adicional — verificável inspecionando o HTML/CSS resultante.
- **SC-015**: Em partidas que atingem campo completamente preenchido, o título exibido é `"Campo Completo! 🏆"` em `var(--clr-accent)` sem shake, o score é avaliado corretamente para o ranking e nenhuma cor nova é introduzida — verificável em teste de desenvolvimento com estado forçado.

## Assumptions

- A correção do bug de lógica grow/move no tick (I2), o redesenho do mecanismo de pausa para overlay sem ocultar o canvas (I3), a correção da citação errada de FR em T040 (A1), a refatoração do double `load()` em T031 (A3) e a distinção de escopo entre T002 e T046 (D1) são implementados diretamente em `tasks.md` sem requisitos de spec adicionais, pois são erros de especificação técnica sem impacto no comportamento observável pelo usuário.
- O valor `bestScoreAtStart` em `GameSession` não precisa ser persistido no localStorage — é apenas um atributo calculado no início da partida e descartado junto com a sessão.
- O resumo de controles na tela inicial é puramente informativo (não-interativo) — não aceita input do jogador, apenas o informa.
- O encerramento por "campo completo" não exige uma nova tela dedicada — pode ser uma variação da tela de Game Over existente com mensagem e título diferentes, reutilizando todos os elementos de UI de pontuação e ranking já presentes.
- Para fins de qualificação de ranking, `'complete'` e `'game_over'` são equivalentes — o score final qualifica da mesma forma para o top 5.
