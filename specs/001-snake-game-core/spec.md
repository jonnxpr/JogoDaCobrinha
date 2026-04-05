# Feature Specification: Jogo da Cobrinha — Núcleo Completo

**Feature Branch**: `001-snake-game-core`  
**Created**: 2026-04-05  
**Status**: Draft  
**Input**: User description: "Será construído um Jogo da Cobrinha com níveis de dificuldade selecionáveis. O jogo deve ter obstáculos de acordo com o nível de dificuldade. O jogador deve ser capaz de reiniciar o jogo facilmente, pausar, ver quanto tempo está durando a jogatina, e a cada vez que reiniciar o tempo reinicia também. Precisa ser salvo os 5 maiores scores, e ao final de cada jogatina o jogador pode colocar o nome que quiser para marcar o seu score da jogatina realizada, e se for colocado um nome já existente não permite e exige que seja colocado um nome diferente ou clicar no botão para gerar nome aleatório diferente de qualquer nome já existente na lista para salvar o score daquela jogatina."

## Clarifications

### Session 2026-04-05

- Q: Qual é a regra de formato e comprimento máximo para o nome do jogador no ranking? → A: Letras, números, espaços e hífens; máximo 20 caracteres.
- Q: A pontuação por alimento varia conforme o nível de dificuldade? → A: Sim — multiplicador por nível: Fácil ×1, Médio ×2, Difícil ×3.
- Q: Controle touch no mobile deve usar swipe, botões on-screen, ou ambos? → A: Ambos simultaneamente — swipe E botões direcionais on-screen.
- Q: O ranking pode ser consultado fora da tela de Game Over? → A: Sim — também acessível na tela inicial via botão dedicado.
- Q: O que acontece quando a janela do navegador perde o foco durante uma partida? → A: O jogo pausa automaticamente; o cronômetro congela; a retomada requer ação explícita do jogador.

### Session 2026-04-05 (Round 2)

- Q: Qual estratégia de orientação a objetos deve ser usada na implementação? → A: Classes individuais por entidade (Snake, Arena, GameSession, Ranking, UIManager, Game como orquestrador) com composição pura — zero herança desnecessária.
- Q: Qual formato e conceito visual para o favicon? → A: Emoji 🐍 via SVG data URI inline no `<link rel="icon">` do `index.html` — sem arquivo externo, sem build step. *(Decisão final reafirmada em Q4.)*
- Q: Onde devem aparecer os créditos do autor e o copyright dinâmico? → A: `<footer>` fixo no rodapé de todas as telas, texto discreto em cor secundária neon; copyright gerado dinamicamente via `new Date().getFullYear()` — nenhum ano hardcoded.
- Q: Como o favicon deve ser entregue no repositório (gerado com IA vs. abordagem existente)? → A: Emoji 🐍 via SVG data URI inline — manter a abordagem já definida em tasks.md (T048); nenhum arquivo de imagem externo necessário.
- Q: O tasks.md deve ser atualizado agora para refletir OOP, footer e favicon, ou aguardar /speckit.tasks? → A: Atualizar tasks.md agora — adicionar tarefa de footer com copyright dinâmico, ajustar descrições das tarefas de entidades para usar `class` ES6+, e confirmar favicon emoji SVG data URI.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Jogar a Cobrinha e Marcar Pontos (Priority: P1)

O jogador abre o jogo no navegador e inicia uma partida. A cobra se move continuamente pelo campo.
O jogador a direciona para comer os alimentos que aparecem no campo; a cada alimento comido a cobra
cresce e o score aumenta. A partida termina quando a cobra colide com uma parede, com um obstáculo
ou com o próprio corpo. O score final é exibido na tela de Game Over.

**Why this priority**: Sem a mecânica central do jogo nenhuma outra funcionalidade tem sentido.
É o MVP absoluto que entrega a proposta de valor do projeto.

**Independent Test**: Pode ser testado abrindo `index.html`, iniciando uma partida, movendo a cobra
até colidir, e verificando que o score exibido corresponde à quantidade de alimentos consumidos.

**Acceptance Scenarios**:

1. **Given** o jogo está na tela inicial, **When** o jogador clica em "Jogar", **Then** uma cobra de
   3 segmentos aparece no centro do campo e começa a se mover automaticamente.
2. **Given** a cobra está em movimento, **When** a cabeça da cobra alcança a posição de um alimento,
   **Then** a cobra cresce em 1 segmento, o score aumenta em 1 ponto e um novo alimento aparece em
   uma célula vazia aleatória.
3. **Given** a cobra está em movimento, **When** a cabeça colide com a borda do campo, obstáculo ou
   corpo da cobra, **Then** o jogo exibe a tela de Game Over com o score final.
4. **Given** o jogador está em qualquer tela, **When** o jogo é aberto em um smartphone (320px+),
   **Then** todos os elementos de UI e o campo de jogo são legíveis e interagíveis sem rolagem horizontal.

---

### User Story 2 — Pausar e Reiniciar a Partida (Priority: P2)

O jogador pode pausar a partida a qualquer momento, retomá-la de onde parou, ou reiniciá-la do zero.
Ao reiniciar, o score e o cronômetro são zerados.

**Why this priority**: Controles de pausa e reinício são funcionalidades básicas de usabilidade que
o enunciado exige explicitamente e que os jogadores esperam em qualquer jogo.

**Independent Test**: Pode ser testado iniciando uma partida, pressionando a tecla de pausa (ou botão
equivalente), verificando que a cobra para e o cronômetro congela, depois retomando e verificando que
o jogo continua exatamente de onde parou. E reiniciando para verificar zeragem completa.

**Acceptance Scenarios**:

1. **Given** a partida está em andamento, **When** o jogador aciona a pausa (tecla P ou botão),
   **Then** a cobra para de se mover, o cronômetro congela e um indicador visual de pausa é mostrado.
2. **Given** o jogo está pausado, **When** o jogador aciona retomar, **Then** a cobra retoma o
   movimento e o cronômetro volta a contar a partir do mesmo valor.
3. **Given** a partida está em andamento ou pausada, **When** o jogador aciona reiniciar,
   **Then** o score é zerado, o cronômetro é zerado, e uma nova partida começa com a mesma
   dificuldade selecionada anteriormente.
4. **Given** o jogo está na tela de Game Over, **When** o jogador aciona reiniciar, **Then** uma nova
   partida começa com score e cronômetro zerados.

---

### User Story 3 — Selecionar Dificuldade e Enfrentar Obstáculos (Priority: P3)

Antes de iniciar uma partida, o jogador escolhe o nível de dificuldade (Fácil, Médio, Difícil). O nível
determina a velocidade da cobra e a quantidade de obstáculos fixos presentes no campo. Obstáculos
causam Game Over ao toque da cabeça da cobra.

**Why this priority**: Níveis de dificuldade e obstáculos são requisitos explícitos do enunciado e
constituem a principal variável de desafio e rejogabilidade do jogo.

**Independent Test**: Pode ser testado selecionando cada nível separadamente, iniciando a partida e
verificando visually que: (a) a velocidade da cobra difere entre níveis; (b) o número de obstáculos
visíveis no campo é coerente com o nível; (c) colidir com um obstáculo provoca Game Over.

**Acceptance Scenarios**:

1. **Given** o jogador está na tela inicial, **When** a tela é exibida, **Then** os 3 níveis de
   dificuldade (Fácil, Médio, Difícil) estão visíveis e selecionáveis.
2. **Given** o nível "Difícil" está selecionado, **When** a partida inicia, **Then** a cobra se
   move mais rápido que no nível "Fácil" e há mais obstáculos no campo do que no nível "Médio".
3. **Given** a partida está em andamento, **When** a cabeça da cobra atinge a célula de um obstáculo,
   **Then** o jogo exibe Game Over imediatamente.
4. **Given** qualquer nível selecionado, **When** o campo de jogo é renderizado, **Then** nenhum
   obstáculo aparece sobre a posição inicial da cobra ou sobre a posição do alimento.

---

### User Story 4 — Acompanhar o Cronômetro da Sessão (Priority: P4)

Durante toda a partida, um cronômetro mostra ao jogador há quanto tempo a sessão está em andamento,
contando a partir do momento em que a partida começa. O cronômetro congela quando o jogo é pausado
e reinicia quando o jogador reinicia a partida.

**Why this priority**: O cronômetro é requisito explícito do enunciado e agrega informação valiosa
sobre o desempenho do jogador além do score.

**Independent Test**: Pode ser testado iniciando uma partida e observando que o contador avança em
tempo real, congelando ao pausar e reiniciando ao usar o botão de reiniciar.

**Acceptance Scenarios**:

1. **Given** a partida inicia, **When** os primeiros segundos passam, **Then** o cronômetro visível
   na tela avança segundos de forma precisa.
2. **Given** o jogo está pausado, **When** o jogador espera 5 segundos, **Then** o cronômetro não
   avança.
3. **Given** a partida está em andamento por 30 segundos, **When** o jogador reinicia,
   **Then** o cronômetro volta para 00:00 antes de iniciar a contagem novamente.
4. **Given** o jogo chega ao Game Over, **When** a tela de Game Over é exibida, **Then** o tempo
   final da sessão é visível junto ao score.

---

### User Story 5 — Salvar Score no Ranking dos 5 Melhores (Priority: P5)

Ao final de cada partida (Game Over), se o score qualificar para o top 5, o jogador é convidado a
inserir um nome para registrar sua pontuação. Nomes já existentes no ranking são rejeitados. Um botão
gera automaticamente um nome aleatório que não conflita com nenhum nome já salvo. O player pode também
optar por não salvar. O ranking permanece entre sessões do navegador.

**Why this priority**: Salvar scores com identificação é o principal motivador de rejogabilidade.
É um requisito explícito com regras de negócio específicas (unicidade de nomes, top 5).

**Independent Test**: Pode ser testado jogando até Game Over, tentando inserir um nome duplicado
(deve ser rejeitado), usando o gerador de nome aleatório (deve gerar nome único), confirmando o save
e verificando que o ranking mostra a entrada correta após recarregar a página.

**Acceptance Scenarios**:

1. **Given** o Game Over ocorre e o score entra no top 5, **When** a tela de Game Over é exibida,
   **Then** um formulário de entrada de nome é apresentado ao jogador.
2. **Given** o formulário de nome está aberto, **When** o jogador digita um nome já existente no
   ranking e confirma, **Then** o sistema rejeita a entrada, exibe uma mensagem de erro e mantém o
   formulário aberto exigindo um nome diferente.
3. **Given** o formulário de nome está aberto, **When** o jogador clica em "Nome Aleatório",
   **Then** o campo é preenchido com um nome gerado automaticamente que não corresponde a nenhum nome
   já presente no ranking.
4. **Given** o jogador confirma um nome válido (único), **When** a confirmação é processada,
   **Then** o score é adicionado ao ranking, ordenado por pontuação descendente, e o ranking exibe
   no máximo 5 entradas.
5. **Given** o ranking já possui 5 entradas e o novo score é menor que qualquer entrada existente,
   **When** o Game Over ocorre, **Then** o formulário de nome NÃO é exibido; uma mensagem informa que
   o score não qualificou para o top 5.
6. **Given** o jogador não quer salvar seu score, **When** ele clica em "Não salvar" / cancela,
   **Then** o score é descartado e o jogador retorna à tela inicial sem alterar o ranking.
7. **Given** o jogador está na tela inicial, **When** ele clica no botão "Ranking" / "Melhores Scores",
   **Then** é exibida a lista atual dos até 5 melhores scores com nome, pontuação e dificuldade;
   se o ranking estiver vazio, uma mensagem informativa é exibida no lugar.

---

### User Story 6 — Tela de Ajuda com Comandos (Priority: P6)

O jogo exibe uma tela de ajuda, acessível antes e durante a partida, que lista todos os controles
disponíveis de acordo com o tipo de dispositivo (teclado para desktop, toque/botões para mobile).

**Why this priority**: Requisito explícito do enunciado e da constituição do projeto. Necessário para
onboarding de novos jogadores em qualquer plataforma.

**Independent Test**: Pode ser testado abrindo a tela de ajuda no desktop (tecla H) e no mobile
(botão de ajuda), verificando que os controles corretos estão listados para cada plataforma.

**Acceptance Scenarios**:

1. **Given** o jogador está na tela inicial, **When** ele clica no ícone/botão de ajuda,
   **Then** uma tela/modal lista todos os controles: direcionais (setas/WASD) para desktop; swipe
   direcional no canvas E botões on-screen para mobile; pausa (P / botão); reiniciar; abrir ajuda —
   com seções claramente distintas para desktop e mobile.
2. **Given** a partida está em andamento no desktop, **When** o jogador pressiona H ou ?,
   **Then** o jogo pausa automaticamente e a tela de ajuda é exibida.
3. **Given** a tela de ajuda está aberta, **When** o jogador fecha a ajuda,
   **Then** o jogo retoma (se estava com `status === 'playing'` ao abrir a ajuda) ou retorna ao
   estado anterior sem retomar (se estava com `status === 'paused'` ou sem partida ativa).

---

### Edge Cases

- O que acontece se o jogador tenta mover a cobra na direção oposta ao movimento atual (giro 180°)?
  → O comando deve ser ignorado silenciosamente; a cobra continua no mesmo sentido.
- O que acontece se o jogador aciona swipe e botão on-screen ao mesmo tempo (input simultâneo)?
  → O primeiro input registrado no frame atual é processado; o segundo é descartado para aquele frame.
- O que acontece se o jogador troca de aba ou minimiza o navegador durante uma partida?
  → O jogo pausa automaticamente e o cronômetro congela; ao retornar, o estado de pausa permanece
  ativo e o jogador deve acionar retomada explicitamente para evitar mortes injustas.
- O que acontece se não há células vazias disponíveis para spawnar um novo alimento (campo lotado)?
  → O jogo deve declarar vitória ou encerrar a partida com um indicador de "Campo cheio".
- O que acontece se o jogador fechar o navegador no meio da partida?
  → A partida em andamento é perdida; o ranking salvo no localStorage é preservado.
- O que acontece se o campo de jogo estiver vazio de células livres para obstáculos no nível Difícil?
  → Os obstáculos são distribuídos até o máximo possível sem cobrir a cobra inicial ou o alimento.
- O que acontece se o campo de nome no formulário de ranking estiver vazio ao confirmar?
  → O sistema exibe erro de validação pedindo um nome antes de aceitar.
- O que acontece se o gerador de nomes aleatórios esgotar permutações disponíveis?
  → O gerador cai para um fallback com sufixo numérico incremental garantindo unicidade.
- O que acontece se o jogador digita caracteres especiais (ex: `<script>`, emojis) no campo de nome?
  → O sistema rejeita a entrada com mensagem de erro de formato; o formulário permanece aberto;
  nenhuma verificação de duplicidade é realizada para entradas inválidas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST renderizar um campo de jogo em grade onde uma cobra se move continuamente
  segmento a segmento por célula.
- **FR-002**: O campo MUST exibir no máximo um alimento por vez em uma célula vazia aleatória; uma
  nova posição MUST ser sorteada imediatamente após o alimento ser consumido.
- **FR-003**: Ao consumir um alimento, a cobra MUST crescer 1 segmento e o score MUST ser incrementado
  pelo valor correspondente ao nível de dificuldade ativo (Fácil: +1 ponto, Médio: +2 pontos,
  Difícil: +3 pontos), de forma imediata e visível.
- **FR-020**: O nível de dificuldade e o multiplicador de pontuação ativo MUST ser exibidos de forma
  visível na tela durante a partida, para que o jogador saiba quantos pontos cada alimento vale.
- **FR-004**: O jogo MUST entrar em estado de Game Over quando a cabeça da cobra colidir com: a borda
  do campo, um obstáculo ou qualquer segmento do próprio corpo da cobra.
- **FR-005**: O jogador MUST poder pausar e retomar a partida a qualquer momento; enquanto pausado,
  a cobra MUST ficar imóvel e o cronômetro MUST parar.
- **FR-022**: O jogo MUST pausar automaticamente quando a janela/aba do navegador perder o foco
  (troca de aba, minimização da janela, bloqueio de tela no mobile); o cronômetro MUST congelar
  imediatamente; a partida MUST NOT retomar automaticamente ao recuperar o foco — o jogador MUST
  acionar a retomada explicitamente.
- **FR-006**: O jogador MUST poder reiniciar a partida a qualquer momento (em jogo, pausado ou Game
  Over); ao reiniciar, score, cobra e cronômetro MUST ser completamente zerados.
- **FR-007**: O jogo MUST oferecer 3 níveis de dificuldade selecionáveis antes de cada partida:
  Fácil, Médio e Difícil; o nível MUST afetar a velocidade de movimento da cobra.
- **FR-008**: Cada nível de dificuldade MUST determinar uma quantidade distinta de obstáculos fixos
  posicionados aleatoriamente no campo no início da partida; obstáculos MUST NOT ocupar a posição
  inicial da cobra nem a posição do alimento.
- **FR-009**: Um cronômetro de sessão MUST ser exibido em tempo real durante a partida, contando
  minutos e segundos desde o início; MUST congelar ao pausar e zerar ao reiniciar.
- **FR-010**: Na tela de Game Over, se o score qualificar para o top 5, o sistema MUST exibir um
  formulário permitindo ao jogador informar um nome para registrar o score no ranking.
- **FR-011**: O ranking MUST armazenar no máximo 5 entradas, ordenadas por score (descendente); ao
  atingir o limite, uma nova entrada MUST substituir a menor pontuação somente se o novo score for
  superior.
- **FR-012**: O sistema MUST rejeitar nomes duplicados no ranking; a comparação de nomes MUST ser
  case-insensitive; uma mensagem de erro MUST ser exibida e o formulário MUST permanecer aberto.
- **FR-019**: O sistema MUST validar o nome informado no formulário de ranking: são permitidos apenas
  letras (maiúsculas e minúsculas), números, espaços e hífens; o nome MUST ter entre 1 e 20 caracteres;
  entradas fora deste formato MUST ser rejeitadas com mensagem de erro específica antes de qualquer
  verificação de duplicidade.
- **FR-013**: O formulário de ranking MUST oferecer um botão "Nome Aleatório" que preenche o campo
  com um nome gerado automaticamente, garantindo que não coincida com nenhum nome já no ranking.
- **FR-014**: O formulário de ranking MUST oferecer opção de cancelar/não salvar; cancelar MUST não
  alterar o ranking.
- **FR-021**: A tela inicial MUST conter um botão "Ranking" (ou equivalente) que exibe o ranking
  completo (até 5 entradas com nome, score e dificuldade) sem necessidade de jogar; se vazio,
  MUST exibir mensagem informando que ainda não há scores registrados.
- **FR-015**: O ranking MUST ser persistido entre sessões usando armazenamento local do navegador;
  os dados MUST sobreviver a recarregamentos de página.
- **FR-016**: Em dispositivos desktop, a cobra MUST ser controlada pelas teclas de seta direcional
  e WASD; em dispositivos touch, MUST ser suportado simultaneamente: (a) swipe direcional sobre o
  canvas (deslizar para cima/baixo/esquerda/direita muda a direção da cobra) e (b) botões direcionais
  on-screen visíveis na interface; ambos os métodos MUST funcionar de forma independente e simultânea.
- **FR-017**: Todas as telas do jogo (inicial, ranking, em jogo, pausado, game over, ajuda) MUST
  ser completamente funcionais e legíveis em viewports a partir de 320px de largura; a tela de
  ranking MUST ser acessível tanto a partir da tela inicial quanto da tela de Game Over.
- **FR-018**: Uma tela de ajuda MUST estar disponível na tela inicial e durante a partida, listando
  todos os controles disponíveis separados por tipo de dispositivo.
- **FR-023**: A implementação MUST adotar orientação a objetos com classes ES6+ individuais por
  entidade de domínio (`Snake`, `Arena`, `GameSession`, `Ranking`, `UIManager`, `Game`); a classe
  `Game` MUST orquestrar as demais via composição; herança de classes de domínio é PROHIBITED.
- **FR-024**: O `index.html` MUST incluir um favicon definido via SVG data URI inline no elemento
  `<link rel="icon" type="image/svg+xml">` usando o emoji 🐍 — sem arquivos de imagem externos;
  a abordagem MUST funcionar em todos os navegadores modernos alvo (Chrome 110+, Firefox 115+,
  Safari 16+, Edge 110+) sem dependência de servidor ou build step.
- **FR-025**: O `index.html` MUST conter um `<footer>` visível em todas as telas com o texto
  "Criado por Jonathan Douglas Diego Tavares" e a linha de copyright no formato
  `© [ano] Jonathan Douglas Diego Tavares`; o ano MUST ser gerado dinamicamente via
  `new Date().getFullYear()` no carregamento da página — nenhum ano pode ser hardcoded no HTML
  ou no CSS; o footer MUST ser estilizado de forma discreta (cor secundária neon, menor que o
  conteúdo principal) e nunca sobrepor elementos interativos do jogo.
- **FR-026**: O HUD visível durante a partida MUST exibir o maior score registrado no ranking
  (valor do 1º lugar) como referência para o jogador; se o ranking estiver vazio, MUST exibir
  "—"; o valor é lido uma única vez em `game.start()` — não durante os frames da
  partida — e armazenado em `GameSession.bestScoreAtStart`.
- **FR-027** *(emenda a FR-018)*: Ao fechar o modal de ajuda com `status === 'playing'` no momento
  da abertura, o jogo MUST retomar automaticamente sem ação adicional do jogador; ao fechar o modal
  de ajuda com `status === 'paused'` no momento da abertura, o jogo MUST permanecer pausado (sem
  retomar automaticamente); ao fechar o modal de ajuda quando não há partida ativa (`null` — a partir
  da tela inicial ou de ranking), o sistema MUST retornar ao estado anterior sem iniciar nem alterar
  nenhuma partida.
- **FR-028** *(emenda a FR-017)*: A tela inicial MUST exibir um resumo visual discreto dos
  controles principais adaptado ao dispositivo: em viewports ≥ 768px, MUST exibir controles de
  teclado (setas/WASD, P para pausar, H para ajuda); em viewports 480–767px, MUST exibir controles
  touch (swipe, botões on-screen, botão pausar); em viewports < 480px, MUST exibir apenas
  caracteres Unicode compactos (`← ↑ ↓ → ⏸ ?`) sem texto adicional; a alternância MUST ser via
  CSS puro — sem lógica JavaScript adicional.
- **FR-029**: Quando não houver células vazias para spawnar alimento após crescimento da cobra,
  o jogo MUST encerrar a partida com status `'complete'` — visualmente distinto de Game Over
  por colisão — exibindo mensagem de conquista; as regras de qualificação para top 5 se aplicam
  normalmente.

### Key Entities

Todas as entidades MUST ser implementadas como **classes ES6+** com responsabilidade única. A arquitetura utiliza **composição pura** (sem herança desnecessária) — a classe `Game` orquestra as demais por injeção de dependência.

- **`class GameSession`**: representa uma partida ativa; atributos: score, elapsedMs, status (`'idle'` — valor inicial antes de `game.start()` / `'playing'` / `'paused'` / `'game_over'` / `'complete'`), difficulty, bestScoreAtStart (lido do ranking em `game.start()` — FR-026); nenhuma lógica de renderização.
- **`class Snake`**: coleção ordenada de segmentos em posições da grade; atributos: head position, direction (+ pendingDirection buffer), segments array; métodos: `move()`, `grow()`, `setDirection()`, `occupiesCell()`.
- **`class Arena`**: grade de jogo; atributos: dimensions (cols × rows), obstacle positions, food position; métodos: `generateObstacles()`, `spawnFood()`, `getEmptyCells()`; não conhece Snake diretamente (recebe posições por parâmetro).
- **`class Ranking`**: gerente do ranking persistido; encapsula toda a lógica de leitura/escrita no localStorage; métodos: `load()`, `save(entry)`, `qualifies(score)`, `validateName(name)`, `generateRandomName()`.
- **`class UIManager`**: gerente de telas e renderização; métodos: `showScreen()`, `render()`, `#updateHUD()` (privado — chamado internamente por `render()`), `openModal()`, `closeModal()`, `openHelpModal(statusBeforeHelp)`, `closeHelpModal(game)`, `showPauseOverlay()`, `hidePauseOverlay()`; não contém lógica de jogo.
- **`class Game`**: orquestrador principal; compõe `GameSession`, `Snake`, `Arena` e referencia `UIManager` + `Ranking`; responsável pelo loop `requestAnimationFrame` e pela máquina de estados da partida.
- **`DifficultyConfig`**: objeto de configuração simples (não requer classe) — constante imutável definida em `config.js`; atributos: name (Fácil/Médio/Difícil), speed (cells/second), obstacleCount, scoreMultiplier (1 / 2 / 3).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um novo jogador consegue abrir o jogo, completar uma partida e salvar seu score no
  ranking em menos de 2 minutos, sem assistência externa.
- **SC-002**: O jogo roda sem travamentos visíveis em smartphones mid-range de até 5 anos de uso,
  em qualquer dos 3 níveis de dificuldade.
- **SC-003**: Todos os controles (direcionais, pausa, reiniciar, ajuda) respondem visualmente ao
  input em menos de 100ms em qualquer dispositivo suportado.
- **SC-004**: O ranking mantém corretamente os 5 maiores scores, em ordem decrescente, após múltiplos
  ciclos de jogar → salvar → fechar → reabrir o navegador.
- **SC-005**: Nunca há duas entradas com o mesmo nome (case-insensitive) no ranking simultaneamente,
  independentemente de quantas partidas forem jogadas.
- **SC-006**: O jogo é completamente jogável em viewport de 320px de largura sem rolagem horizontal
  e sem sobreposição de elementos de UI.
- **SC-007**: Um jogador consegue entender como jogar em qualquer dispositivo lendo apenas a tela
  de ajuda in-game, sem consultar documentação externa.
- **SC-010**: Em um teste de troca de aba com partida ativa, a cobra MUST estar imóvel e o
  cronômetro MUST estar congelado 100ms após a perda de foco; ao retornar o foco, a partida MUST
  permanecer pausada até o jogador acionar retomada.
- **SC-009**: Em um teste lado a lado, comer o mesmo número de alimentos no nível Difícil MUST
  produzir exatamente 3× a pontuação obtida no nível Fácil.
- **SC-008**: O sistema rejeita 100% das tentativas de salvar nomes com caracteres não permitidos
  (fora de letras, números, espaços e hífens) ou com comprimento fora do intervalo 1–20 caracteres,
  exibindo mensagem de erro antes de verificar duplicidade.
- **SC-011**: O ano exibido no copyright do `<footer>` MUST corresponder ao ano corrente do
  sistema em 100% dos carregamentos — verificável recarregando a página em 1º de Janeiro de
  qualquer ano futuro sem alterar nenhum arquivo do projeto.
- **SC-012**: Em 100% das partidas iniciadas com ranking não-vazio, o HUD exibe o campo de
  melhor score com o valor correto do 1º lugar — verificável com e sem dados no localStorage.
- **SC-013**: Fechar o modal de ajuda com `status === 'playing'` anterior resulta em retomada
  automática em 100% dos casos; fechar com `status === 'paused'` anterior mantém o jogo pausado
  em 100% dos casos — verificável sem pressionar nenhum outro botão após fechar o modal.
- **SC-014**: A tela inicial exibe controles de teclado em viewport ≥ 768px, controles touch em
  viewport 480–767px e apenas caracteres Unicode compactos (`← ↑ ↓ → ⏸ ?`) em viewport < 480px,
  sem nenhuma linha de JavaScript adicional — verificável inspecionando o HTML/CSS resultante.
- **SC-015**: Em partidas que atingem campo completamente preenchido, o título exibido é
  `"Campo Completo! 🏆"` em `var(--clr-accent)` sem animação shake, o score é avaliado corretamente
  para o ranking e nenhuma cor nova é introduzida — verificável em teste de desenvolvimento com
  estado forçado.

## Assumptions

- O jogo é exclusivamente single-player; não há ranking compartilhado, backend ou sincronização online.
- O ranking é acessível na tela inicial (via botão dedicado) e na tela de Game Over (após salvar ou cancelar o score); não é exibido durante uma partida ativa.
- Os três níveis de dificuldade são: Fácil (poucos obstáculos, cobra lenta, +1 ponto/alimento),
  Médio (obstáculos moderados, velocidade média, +2 pontos/alimento) e Difícil (muitos obstáculos,
  cobra rápida, +3 pontos/alimento).
- Obstáculos são estáticos por sessão: são gerados aleatoriamente no início da partida e permanecem
  fixos até o reinício.
- Se o score não qualificar para o top 5, o formulário de nome não é exibido; uma mensagem informativa
  aparece no lugar.
- Empates no score são desempatados por ordem de inserção (quem entrou primeiro fica em posição superior).
- A comparação de nomes duplicados é case-insensitive ("Ana" e "ANA" são considerados o mesmo nome).
- Apenas um alimento aparece no campo por vez; múltiplos alimentos simultâneos estão fora do escopo.
- A tela de ajuda exibe controles de desktop e mobile separadamente; o jogo não precisa detectar
  automaticamente o tipo de dispositivo para filtrar o conteúdo da ajuda.
- O jogo é iniciado abrindo diretamente o arquivo `index.html` no navegador, sem necessidade de servidor.
- Quando o campo de jogo estiver completamente preenchido e não houver células vazias para spawnar
  alimento, o jogo encerra com status `'complete'` (Campo Completo) — não com Game Over por colisão
  — e exibe mensagem de conquista diferenciada; regras de ranking se aplicam normalmente (FR-029).
- A pausa é implementada como overlay absoluto sobre a tela de jogo, sem navegar para uma tela
  separada — o canvas e o estado de render permanecem visíveis durante a pausa.
- O melhor score exibido no HUD é lido do ranking uma vez no início de cada partida e permanece
  fixo até o próximo início — não é atualizado frame a frame (FR-026).
