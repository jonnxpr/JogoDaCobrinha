# Jogo da Cobrinha

Jogo da Cobrinha é um jogo em HTML, CSS e JavaScript puro, com renderização em `Canvas`, controles para desktop e mobile, ranking persistente em cookies e interface responsiva. O projeto roda sem framework de produção e usa Vite apenas como servidor de desenvolvimento.

## Visão Geral

O objetivo é conduzir a cobra pela arena, comer alimentos, crescer e acumular pontos sem colidir com as bordas, com a própria cobra ou com obstáculos fixos. A partida pode ser pausada, reiniciada e consultada pela tela de ranking a qualquer momento.

O jogo inclui:

- Seleção de dificuldade: Fácil, Médio e Difícil.
- Seleção de tamanho do mapa: Pequeno, Médio e Grande.
- Obstáculos fixos de acordo com a dificuldade.
- Multiplicador de pontuação por dificuldade.
- Cronômetro da sessão.
- Pausa manual e pausa automática ao perder o foco da aba/janela.
- Controles para teclado, swipe e botões na tela.
- Ranking persistente com os 5 melhores scores.
- Validação de nome com unicidade e geração de nome aleatório.
- Tela de ajuda acessível antes e durante a partida.

## Como Executar

### Pré-requisitos

- Node.js instalado.
- npm disponível no terminal.

### Instalação

```bash
npm install
```

### Ambiente de desenvolvimento

```bash
npm run dev
```

O Vite sobe o projeto em `http://localhost:8000`.

### Uso direto

Também é possível abrir `index.html` no navegador, mas a forma recomendada para desenvolvimento é usar o servidor do Vite.

## Como Jogar

1. Escolha a dificuldade.
2. Escolha o tamanho do mapa.
3. Clique em "Jogar".
4. Direcione a cobra até o alimento.
5. Evite colidir com bordas, obstáculos e com o próprio corpo.
6. Se fizer um score alto o suficiente, você poderá salvar o resultado no ranking.

## Controles

### Desktop

- Setas ou WASD para mover.
- `P` para pausar e retomar.
- `R` para reiniciar durante a partida.
- `H` ou `?` para abrir a ajuda.
- `Esc` para voltar ao menu principal durante a partida.

### Mobile

- Swipe no canvas para mover.
- Botões direcionais na tela para mover.
- Botão de pausa para pausar e retomar.
- Botão de reinício para recomeçar.
- Botão de ajuda para abrir o modal de instruções.

## Regras do Jogo

- A cobra começa com 3 segmentos.
- O alimento aparece em uma célula vazia aleatória.
- Cada alimento consumido faz a cobra crescer 1 segmento.
- A pontuação por alimento depende da dificuldade ativa:
  - Fácil: `×1`
  - Médio: `×2`
  - Difícil: `×3`
- A colisão com bordas, obstáculos ou com o corpo termina a sessão.
- Ao pausar, a cobra para e o cronômetro congela.
- Ao perder o foco da aba ou da janela, o jogo pausa automaticamente.

## Ranking

O ranking é salvo em um cookie do navegador sob a chave `snakeRanking`.

- Mantém no máximo 5 entradas.
- Ordena por score em ordem decrescente.
- Usa a data de salvamento como critério secundário de desempate.
- Rejeita nomes repetidos, sem diferenciar maiúsculas e minúsculas.
- Aceita apenas letras, números, espaços e hífens, com até 20 caracteres.
- Possui um botão para gerar nome aleatório único quando possível.

Se o score não entrar no Top 5, a tela de resultado informa isso sem abrir o formulário de nome.

## Persistência

O jogo não usa backend. Os dados persistidos são apenas os scores salvos no navegador.

- Chave de persistência: `snakeRanking`
- Armazenamento: cookie do navegador
- Formato: array JSON
- Expiração: longa, para manter o ranking entre fechamentos da página

Se o usuário limpar os cookies do navegador, o ranking é perdido.

Para garantir que a persistência funcione corretamente, prefira executar o projeto via `npm run dev` ou em um servidor `http(s)`.

## Estrutura do Projeto

```text
/
├── index.html
├── package.json
├── css/
│   └── style.css
├── js/
│   ├── config.js
│   ├── controls.js
│   ├── game.js
│   ├── ranking.js
│   └── ui.js
└── specs/
    ├── 001-snake-game-core/
    └── 002-amend-spec-analysis-fixes/
```

### Arquivos Principais

- `index.html`: estrutura das telas, modal de ajuda, modal de salvar nome e canvas.
- `css/style.css`: tema visual, responsividade e estados da interface.
- `js/config.js`: constantes globais, dificuldades, tamanhos de mapa e listas de nomes.
- `js/game.js`: lógica principal do jogo, arena, cobra, sessão e loop.
- `js/controls.js`: teclado, swipe, botões, atalhos e eventos de visibilidade.
- `js/ranking.js`: persistência em cookie e validação do ranking.
- `js/ui.js`: renderização do canvas, HUD, modais e gerenciamento de telas.

## Arquitetura

O projeto segue uma abordagem orientada a objetos com classes ES6 e composição simples:

- `Snake`: controla segmentos, movimento e direção.
- `Arena`: controla obstáculos, alimento e células livres.
- `GameSession`: controla score, tempo, status e dificuldade ativa.
- `Ranking`: lê, valida e grava dados em cookie.
- `UIManager`: controla telas, HUD, canvas, modais e renderização.
- `Game`: orquestra a sessão e o loop principal.

## Detalhes Técnicos

- Sem transpiler na produção.
- Sem biblioteca de runtime para o jogo.
- Renderização feita com `Canvas API` nativa.
- Pausa automática baseada na `Page Visibility API`.
- Favicon em SVG inline via data URI com emoji de cobra.
- Rodapé com ano dinâmico.

## Requisitos Atendidos

O projeto foi desenhado para cobrir os principais requisitos do jogo:

- dificuldade selecionável;
- obstáculos por nível;
- pausa e reinício;
- cronômetro da sessão;
- ranking dos 5 melhores scores;
- validação de nome;
- suporte a desktop e mobile;
- tela de ajuda;
- persistência no navegador.

## Notas de Uso

- O ranking fica disponível na tela inicial e na tela de fim de jogo.
- O jogo pode ser pausado manualmente ou automaticamente quando a aba perde foco.
- O tamanho do mapa altera o espaço jogável, mas não muda a lógica base da sessão.

## Licença

Este repositório não declara uma licença explícita. Se você pretende publicar ou distribuir o projeto, adicione uma licença adequada.
