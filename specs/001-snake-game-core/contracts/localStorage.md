# Contract: localStorage Schema

**Feature**: `001-snake-game-core`  
**Date**: 2026-04-05

Este contrato define o schema de persistência do ranking no `localStorage` do navegador.
Qualquer código que leia ou escreva `localStorage` de dentro do jogo DEVE respeitar este contrato.

---

## Chave de Armazenamento

```
localStorage["snakeRanking"]
```

## Tipo do Valor

`JSON.stringify(RankingEntry[])` — string JSON de um array de 0 a 5 objetos.

Se a chave não existir, o jogo trata como ranking vazio (`[]`).

## Schema de `RankingEntry`

```json
{
  "playerName": "NeonCobra",
  "score": 42,
  "difficulty": "hard",
  "savedAt": "2026-04-05T14:30:00.000Z"
}
```

| Campo | Tipo JSON | Restrições |
|-------|-----------|------------|
| `playerName` | `string` | 1–20 chars; `/^[a-zA-Z0-9 \-]+$/`; único case-insensitive no array |
| `score` | `number` | inteiro ≥ 0 |
| `difficulty` | `string` | enum: `"easy"` \| `"medium"` \| `"hard"` |
| `savedAt` | `string` | ISO 8601 UTC (ex: `"2026-04-05T14:30:00.000Z"`) |

## Exemplo de Valor Completo

```json
[
  {"playerName": "NeonCobra",  "score": 42, "difficulty": "hard",   "savedAt": "2026-04-05T14:30:00.000Z"},
  {"playerName": "SwiftViper", "score": 30, "difficulty": "medium", "savedAt": "2026-04-05T13:10:00.000Z"},
  {"playerName": "TurboAsp",   "score": 18, "difficulty": "easy",   "savedAt": "2026-04-05T12:00:00.000Z"},
  {"playerName": "CyberMamba", "score": 18, "difficulty": "medium", "savedAt": "2026-04-05T11:55:00.000Z"},
  {"playerName": "PixelFang",  "score": 10, "difficulty": "easy",   "savedAt": "2026-04-05T10:00:00.000Z"}
]
```

## Operações Obrigatórias (implementadas em `js/ranking.js`)

### Leitura (`loadRanking`)
```
1. Ler localStorage["snakeRanking"]
2. Se null/undefined: retornar []
3. JSON.parse(); se falhar (JSON inválido): retornar [] e limpar a chave corrompida
4. Filtrar entradas que não satisfaçam o schema (campo ausente ou tipo incorreto)
5. Retornar array ordenado por score DESC, savedAt ASC
```

### Escrita (`saveRanking`)
```
1. Receber (playerName, score, difficulty)
2. Validar playerName com PLAYER_NAME_REGEX (1–20 chars, conjunto permitido)
3. Verificar unicidade case-insensitive
4. Se inválido: lançar erro descritivo (não salvar)
5. Criar RankingEntry com savedAt = new Date().toISOString()
6. Carregar ranking atual; adicionar nova entrada; reordenar (score DESC, savedAt ASC)
7. Truncar para máximo 5 entradas (remover cauda)
8. JSON.stringify e salvar em localStorage["snakeRanking"]
```

### Qualificação (`qualifiesForRanking`)
```
1. Carregar ranking atual
2. Se length < 5: retornar true
3. Se score > ranking[4].score: retornar true
4. Caso contrário: retornar false
```

## Compatibilidade

- `localStorage` deve estar disponível. Se `window.localStorage` lançar `SecurityError`
  (ex: modo privado restrito em alguns browsers), o jogo DEVE continuar funcionando sem ranking
  persistido e exibir aviso não-bloqueante ao tentar salvar.
