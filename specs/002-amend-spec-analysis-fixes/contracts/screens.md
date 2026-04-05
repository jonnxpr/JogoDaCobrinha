# Contract: Emendas ao Contrato de Telas e Transições de UI

**Feature**: `002-amend-spec-analysis-fixes`  
**Date**: 2026-04-05  
**Amends**: `specs/001-snake-game-core/contracts/screens.md`

> Este documento descreve **somente as alterações** ao contrato de telas original.
> O contrato completo de referência está em `specs/001-snake-game-core/contracts/screens.md`.
> Telas não mencionadas abaixo permanecem inalteradas.

---

## Alterações por Tela

### 1. `screen-home` — Tela Inicial

**Alteração**: adição do elemento `#controls-hint` ao conteúdo obrigatório (FR-028).

**Conteúdo obrigatório (delta)**:

| Item | Status | Detalhes |
|------|--------|---------|
| `#controls-hint` | **ADICIONADO** | Três sub-divs adaptados ao viewport — ver abaixo |
| Demais itens | Inalterados | Título, seletor de dificuldade, botões Jogar/Ranking/Ajuda |

**Especificação de `#controls-hint`**:

```html
<div id="controls-hint">
  <!-- visível apenas em viewport ≥ 768px -->
  <div class="controls-desktop">
    ⌨ Mover: ↑↓←→ ou WASD &nbsp;·&nbsp; P: Pausar &nbsp;·&nbsp; H: Ajuda
  </div>
  <!-- visível apenas em viewport 480–767px -->
  <div class="controls-mobile">
    👆 Swipe para mover &nbsp;·&nbsp; Botões: <span>⏸</span> Pausar &nbsp;·&nbsp; ? Ajuda
  </div>
  <!-- visível apenas em viewport < 480px -->
  <div class="controls-compact">
    ← ↑ ↓ → &nbsp; ⏸ &nbsp; ?
  </div>
</div>
```

**Requisitos visuais**:
- Posicionado abaixo dos botões de ação (Jogar, seletor de dificuldade, Ranking)
- Tipografia secundária (`font-size: 0.75rem` ou menor); `opacity: 0.6` para não competir com ações primárias
- Nenhuma interatividade (não é um botão, não captura input)

---

### 2. `screen-game` — Partida em Andamento

**Alteração**: HUD adquire campo de Melhor Score (FR-026).

**Conteúdo do HUD (delta)**:

| Campo HUD | Status | Elemento | Conteúdo |
|-----------|--------|---------|---------|
| Score atual | Inalterado | `#hud-score` | Pontuação da partida em tempo real |
| Tempo | Inalterado | `#hud-time` | Cronômetro `MM:SS` |
| Nível + multiplicador | Inalterado | `#hud-level` | Ex: `"Médio ×2"` |
| **Melhor Score** | **ADICIONADO** | `#hud-best` | Score do 1º lugar do ranking; `"—"` se vazio |

**Regra `#hud-best`**:
- Exibe `session.bestScoreAtStart` — valor fixo durante toda a partida
- Valor `null` → texto `"—"` (em-dash)
- Valor numérico → exibe o número (ex: `"42"`)
- Nunca exibe `"0"` ou string vazia como indicador de "sem recorde"
- Label sugerido: `"Recorde:"` ou equivalente visualmente distinguível do score atual

---

### 3. `screen-gameover` — Game Over / Campo Completo

**Alteração**: a tela passa a servir para dois status de encerramento: `'game_over'` e `'complete'` (FR-029).

**Comportamento condicional por `session.status`**:

| `session.status` | Título (`#gameover-status-msg`) | Cor do título | Animação shake |
|-----------------|--------------------------------|--------------|---------------|
| `'game_over'` | `"GAME OVER"` | Padrão (herda do CSS) | ✅ `animate-shake` adicionada |
| **`'complete'`** | **`"Campo Completo! 🏆"`** | `var(--clr-accent)` | ❌ sem shake |

**Demais elementos (inalterados em ambos os casos)**:
- Score final (`#gameover-score`)
- Tempo de duração (`#gameover-time`)
- Nível jogado (`#gameover-level`)
- Lógica de qualificação para ranking (identica para ambos os status)
- Botões: "Jogar Novamente", "Ver Ranking", "Menu Principal"

---

### 4. `modal-help` — Modal de Ajuda

**Alteração**: comportamento de fechamento agora depende do estado em que o jogo estava ao abrir o modal (FR-027, emenda da transição "Fechar").

**Transições atualizadas**:

| Estado ao **abrir** | Ação | Estado ao **fechar** |
|--------------------|------|---------------------|
| `session.status === 'playing'` | auto-pausa ao abrir | `game.resume()` automático ao fechar |
| `session.status === 'paused'` | modal abre sobre pausa | jogo permanece pausado ao fechar |
| Sem sessão ativa (tela inicial) | nenhuma pausa | retorno à tela inicial (sem ação) |

**Implementação**: campo `#activeStatusBeforeHelp` em `UIManager` rastreia o estado no momento de abertura.

**Contrato anterior (obsoleto)**:
```
Fechar (vindo da partida) → screen-paused → jogador retoma manualmente
```

**Contrato novo (FR-027)**:
```
Fechar (vindo de 'playing') → game.resume() → screen-game (automático)
Fechar (vindo de 'paused')  → permanece em screen-paused
Fechar (vindo da home)      → screen-home (sem mudança)
```

---

## Diagrama de Fluxo de Telas (atualizado)

```
screen-home ── [#controls-hint visível aqui: ⌨ / 👆 / ←→⏸?] ──────────────────┐
    │ Jogar              │ Ranking           │ Ajuda                              │
    ▼                    ▼                   ▼                                    │
screen-game          screen-ranking      modal-help ◀─────── (partida 'playing') ┘
  [HUD: +#hud-best]       │ Voltar            │ Fechar                           │
    │ P/blur               ▼                   ├── se 'playing' ao abrir → game.resume()
    ▼               screen-home               ├── se 'paused' ao abrir  → permanece pausado
screen-paused                                  └── se sem sessão         → screen-home
    │ Retomar
    ▼
screen-game ── colisão ──▶ screen-gameover
             └── campo cheio ──▶ screen-gameover [título: "Campo Completo! 🏆"]
                                      │ qualifica?
                                 modal-save-name
                                      │
                                 screen-ranking / screen-gameover
```
