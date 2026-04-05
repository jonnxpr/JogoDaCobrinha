# Data Model: Jogo da Cobrinha — Núcleo Completo

**Feature**: `001-snake-game-core`  
**Date**: 2026-04-05  
**Source**: spec.md (Key Entities) + research.md (R-001 a R-006)

---

## Entidades do Domínio

### 1. `DifficultyConfig`

Configuração imutável por nível de dificuldade. Definida em `js/config.js` como constante.

| Campo | Tipo | Fácil | Médio | Difícil | Descrição |
|-------|------|-------|-------|---------|-----------|
| `name` | string | `'easy'` | `'medium'` | `'hard'` | Chave interna |
| `label` | string | `'Fácil'` | `'Médio'` | `'Difícil'` | Rótulo exibido ao usuário |
| `speed` | number | `6` | `10` | `15` | Células por segundo (define `stepInterval = 1000 / speed` ms) |
| `obstacleCount` | number | `0` | `5` | `12` | Número de obstáculos fixos no campo |
| `scoreMultiplier` | number | `1` | `2` | `3` | Pontos adicionados por alimento consumido |

**Notas**:
- `stepInterval` é derivado: `Math.floor(1000 / speed)` ms entre cada avanço da cobra.
- `obstacleCount: 0` no nível Fácil significa campo sem obstáculos — apenas bordas.

---

### 2. `GameSession`

Estado de uma partida ativa. Vive em memória em `js/game.js`; não persistido.

| Campo | Tipo | Valores | Descrição |
|-------|------|---------|-----------|
| `score` | number | ≥0 | Pontuação acumulada da partida atual |
| `elapsedMs` | number | ≥0 | Milissegundos acumulados de jogo (exclui tempo pausado) |
| `status` | string | `'idle'` \| `'playing'` \| `'paused'` \| `'game_over'` | Estado atual |
| `difficulty` | string | `'easy'` \| `'medium'` \| `'hard'` | Nível selecionado antes da partida |

**Transições de estado**:
```
      [tela inicial]
           │ iniciar
           ▼
         idle ──────────── reiniciar ──────────▶ playing
           │                                       │   │
           └──────────────────────────────────────┘   │ pausar (tecla, botão, visibilitychange)
                                                        ▼
                                                      paused
                                                        │ retomar
                                                        ▼
                                                     playing
                                                        │ colisão
                                                        ▼
                                                    game_over
                                                        │ reiniciar
                                                        ▼
                                                     playing (novo estado)
```

---

### 3. `Snake`

Estado da cobra dentro de uma partida. Gerenciada em `js/game.js`.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `segments` | `Array<{x: number, y: number}>` | Posições dos segmentos, índice 0 = cabeça |
| `direction` | string | `'UP'` \| `'DOWN'` \| `'LEFT'` \| `'RIGHT'` — direção atual de movimento |
| `pendingDirection` | string | Próxima direção (buffered, validada; evita giro 180°) |

**Invariantes**:
- `segments.length ≥ 3` (cobra inicial tem 3 segmentos).
- `segments[0]` = cabeça; `segments[segments.length-1]` = cauda.
- Nenhum segmento ocupa a mesma célula que outro (`Set` de `"x,y"` para checagem O(1)).
- `pendingDirection` nunca é oposta a `direction` (tentativa de giro 180° é descartada silenciosamente).

**Posição inicial**: centro da grade (`Math.floor(GRID_COLS / 2)`, `Math.floor(GRID_ROWS / 2)`), orientada para direita.

---

### 4. `Arena`

O campo de jogo. Estado gerado no início de cada partida em `js/game.js`.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `cols` | number | Número de colunas da grade (constante: `20`) |
| `rows` | number | Número de linhas da grade (constante: `20`) |
| `obstacles` | `Array<{x: number, y: number}>` | Posições dos obstáculos; fixas por sessão |
| `food` | `{x: number, y: number}` | Posição atual do alimento |

**Regras de geração**:
1. `obstacles` são sorteados aleatoriamente dentre células que **não** estejam ocupadas por nenhum segmento da cobra inicial.
2. Após gerar obstáculos, `food` é sorteado em uma célula que **não** seja obstáculo nem segmento.
3. Se `obstacleCount` exceder células livres disponíveis (impossível com grade 20×20 e cobra de 3 células, mas defensivo): gerar o máximo possível.

**Verificação de colisão**:
- Com borda: `head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows`
- Com obstáculo: `obstacles.some(o => o.x === head.x && o.y === head.y)` — usar `Set` para O(1)
- Com corpo: `segments.slice(1).some(s => s.x === head.x && s.y === head.y)` — usar `Set` para O(1)

---

### 5. `RankingEntry`

Uma entrada no ranking de melhores scores. Persistida em `localStorage`.

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| `playerName` | string | 1–20 chars; regex `/^[a-zA-Z0-9 \-]+$/`; único case-insensitive | Nome do jogador |
| `score` | number | ≥0 | Pontuação obtida na partida |
| `difficulty` | string | `'easy'` \| `'medium'` \| `'hard'` | Dificuldade da partida |
| `savedAt` | string | ISO 8601 (`new Date().toISOString()`) | Timestamp do salvamento |

**Regras do Ranking**:
- Máximo 5 entradas.
- Ordenação: `score` descendente; empate → `savedAt` ascendente (quem salvou primeiro fica acima).
- **Inserção**: se `score > ranking[4].score` (ou `ranking.length < 5`), adicionar e reordenar; remover o último se necessário.
- **Unicidade de nome**: `ranking.some(e => e.playerName.toLowerCase() === newName.toLowerCase())` deve ser `false` para aceitar.

**Schema localStorage**:
```
chave: "snakeRanking"
valor: JSON.stringify(RankingEntry[])  // array de 0 a 5 entradas
```

---

## Diagrama de Relações

```
DifficultyConfig ──── define ────▶ GameSession
                                       │
                     compõe ──────────┤
                        │             │
                      Snake         Arena
                        │             │
                    segments      obstacles + food

GameSession ── ao encerrar ──▶ RankingEntry (se qualificar para top 5)
RankingEntry[] ── persiste em ──▶ localStorage["snakeRanking"]
```

---

## Constantes Globais (`js/config.js`)

```js
const GRID_COLS = 20;
const GRID_ROWS = 20;
const INITIAL_SNAKE_LENGTH = 3;
const RANKING_MAX_ENTRIES = 5;
const RANKING_STORAGE_KEY = 'snakeRanking';
const PLAYER_NAME_REGEX = /^[a-zA-Z0-9 \-]{1,20}$/;

const DIFFICULTIES = {
  easy:   { name: 'easy', label: 'Fácil',  speed: 6,  obstacleCount: 0,  scoreMultiplier: 1 },
  medium: { name: 'medium', label: 'Médio', speed: 10, obstacleCount: 5,  scoreMultiplier: 2 },
  hard:   { name: 'hard', label: 'Difícil', speed: 15, obstacleCount: 12, scoreMultiplier: 3 },
};

const ADJECTIVES = ['Swift','Neon','Shadow','Turbo','Pixel','Cyber','Blaze','Storm','Venom','Hyper'];
const NOUNS      = ['Cobra','Viper','Python','Mamba','Hydra','Drake','Fang','Coil','Asp','Bolt'];
```
