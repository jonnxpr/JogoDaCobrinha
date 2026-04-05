# Contract: Telas e Transições de UI

**Feature**: `001-snake-game-core`  
**Date**: 2026-04-05

Este contrato define as telas do jogo, seu conteúdo mínimo obrigatório e as transições entre elas.
Implementado em `js/ui.js`. Todas as telas DEVEM ser funcionais em viewports ≥320px.

---

## Telas

### 1. `screen-home` — Tela Inicial

**Ativação**: ao carregar o jogo; ao cancelar ranking; ao retornar do Game Over sem salvar.

**Conteúdo obrigatório**:
- Título do jogo com efeito neon
- Seletor de dificuldade: 3 botões (Fácil / Médio / Difícil) — um sempre selecionado (padrão: Fácil)
- Botão **"Jogar"** (primário)
- Botão **"Ranking"** / "Melhores Scores"
- Botão / ícone **"Ajuda"** `[?]`
- Resumo visual dos controles (desktop: setas/WASD; mobile: swipe + botões)

**Transições**:
| Ação | Tela destino |
|------|-------------|
| Clicar "Jogar" | `screen-game` |
| Clicar "Ranking" | `screen-ranking` |
| Clicar "Ajuda" | `modal-help` (overlay sobre home) |

---

### 2. `screen-game` — Partida em Andamento

**Ativação**: ao clicar "Jogar" na home; ao reiniciar a partida.

**Conteúdo obrigatório**:
- Canvas de jogo (cobra, alimento, obstáculos, grade sutil)
- HUD superior: Score atual (grande) | Tempo (MM:SS) | Nível + multiplicador
- Mobile only: 4 botões direcionais on-screen (▲ ▼ ◀ ▶)
- Botão **"Pausar"** visível (desktop e mobile)
- Botão **"Reiniciar"** visível

**Transições**:
| Ação / Evento | Tela destino |
|---------------|-------------|
| Tecla P / botão Pausar | `screen-paused` |
| `visibilitychange` (foco perdido) | `screen-paused` (automático) |
| Tecla H / `?` | `modal-help` (jogo pausa antes de abrir) |
| Colisão fatal | `screen-gameover` |
| Clicar Reiniciar | `screen-game` (novo jogo) |

---

### 3. `screen-paused` — Jogo Pausado

**Ativação**: ao pausar manualmente ou por perda de foco.

**Conteúdo obrigatório**:
- Canvas de jogo (congelado — último frame renderizado)
- Overlay semitransparente escuro sobre o canvas
- Texto "PAUSADO" (neon, centralizado)
- Botão **"Retomar"**
- Botão **"Reiniciar"**
- Score atual e tempo visíveis

**Transições**:
| Ação | Tela destino |
|------|-------------|
| Clicar / tecla "Retomar" | `screen-game` |
| Clicar "Reiniciar" | `screen-game` (novo jogo) |

---

### 4. `screen-gameover` — Game Over

**Ativação**: ao ocorrer colisão fatal.

**Conteúdo obrigatório**:
- Texto "GAME OVER" (animação de entrada)
- Score final da partida (destaque)
- Tempo de duração da sessão
- Nível jogado
- Se `qualifiesForRanking(score) === true`: exibir `modal-save-name` imediatamente
- Se não qualifica: mensagem "Não entrou no Top 5" + score mínimo necessário
- Botão **"Jogar Novamente"** (reinicia)
- Botão **"Ver Ranking"**
- Botão **"Menu Principal"**

**Transições**:
| Ação | Tela destino |
|------|-------------|
| Modal salvar nome (confirmar) | `screen-ranking` |
| Modal salvar nome (cancelar) | permanecer em `screen-gameover` (sem modal) |
| Clicar "Jogar Novamente" | `screen-game` |
| Clicar "Ver Ranking" | `screen-ranking` |
| Clicar "Menu Principal" | `screen-home` |

---

### 5. `screen-ranking` — Ranking / Melhores Scores

**Ativação**: ao clicar "Ranking" na home; ao confirmar save de nome; ao clicar "Ver Ranking" no Game Over.

**Conteúdo obrigatório**:
- Título "🏆 Melhores Scores" (ou sem emoji se preferir texto puro)
- Tabela com colunas: Posição | Nome | Score | Dificuldade | Data
- Se vazio: mensagem "Nenhum score registrado ainda. Jogue e entre para o Top 5!"
- Botão **"Voltar"** (retorna à tela de origem: home ou game over)
- Botão **"Jogar"** (atalho para iniciar nova partida)

**Transições**:
| Ação | Tela destino |
|------|-------------|
| Clicar "Voltar" (vindo da home) | `screen-home` |
| Clicar "Voltar" (vindo do game over) | `screen-gameover` |
| Clicar "Jogar" | `screen-game` |

---

### 6. `modal-help` — Modal de Ajuda (overlay)

**Ativação**: ao clicar "Ajuda" na home; ao pressionar H/? durante a partida (pausa automática).

**Conteúdo obrigatório**:
- Título "Como Jogar"
- **Seção Desktop**: setas direcionais / WASD; P = pausar; R = reiniciar; H = ajuda
- **Seção Mobile**: swipe para mover; botões on-screen; botão pausar; botão reiniciar
- **Objetivo**: descrição breve do objetivo do jogo e regras de pontuação por dificuldade
- Botão **"Fechar"** (X ou botão explícito)

**Transições**:
| Ação | Estado retorno |
|------|---------------|
| Fechar (vindo da home) | `screen-home` (sem pausa) |
| Fechar (vindo da partida) | `screen-paused` → jogador retoma manualmente |

---

### 7. `modal-save-name` — Modal Salvar Nome no Ranking (sub-overlay do Game Over)

**Ativação**: automaticamente quando `qualifiesForRanking(score) === true` na tela de Game Over.

**Conteúdo obrigatório**:
- Texto de parabéns + score obtido
- Campo de texto para nome do jogador (placeholder: "Seu nome")
- Regras visíveis: "Letras, números, espaços e hífens. Máx 20 caracteres."
- Botão **"Nome Aleatório"** (preenche o campo automaticamente)
- Botão **"Salvar"** (confirma; habilitado apenas se campo válido)
- Botão **"Não salvar"** (cancela sem alterar ranking)
- Área de erro: exibe mensagem específica em caso de:
  - Nome vazio
  - Formato inválido (caracteres não permitidos)
  - Nome duplicado (case-insensitive)

**Transições**:
| Ação | Estado |
|------|--------|
| Salvar (nome válido e único) | Fechar modal; ir para `screen-ranking` |
| Não salvar | Fechar modal; permanecer em `screen-gameover` |

---

## Diagrama de Fluxo de Telas

```
screen-home
    │ Jogar              │ Ranking           │ Ajuda
    ▼                    ▼                   ▼
screen-game          screen-ranking      modal-help
    │ P/blur              │ Voltar            │ Fechar
    ▼                     ▼                  ▼
screen-paused        screen-home         (origem)
    │ Retomar
    ▼
screen-game ── colisão ──▶ screen-gameover
                                 │ qualifica?
                            modal-save-name
                                 │ salvar/cancelar
                            screen-ranking / screen-gameover
```

---

## Notas de Implementação (para `js/ui.js`)

- Uma única função `showScreen(screenId)` oculta todas as telas e exibe a solicitada.
- CSS classes `screen--active` / `screen--hidden` controlam visibilidade via `display: flex / none`.
- Transições entre telas usam `opacity` fade de 200ms (transition CSS, sem JS animation frames).
- O `modal-help` e `modal-save-name` são overlays sobre a tela atual (não são telas independentes); implementados como `<div>` com `position: fixed; z-index: 100`.
- A tela atual é rastreada em `ui.currentScreen` para determinar o destino do "Voltar" no ranking.
