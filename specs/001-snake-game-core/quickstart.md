# Quickstart: Jogo da Cobrinha

**Feature**: `001-snake-game-core`  
**Date**: 2026-04-05

---

## Pré-requisitos

- Conta GitHub com repositório privado `JogoDaCobrinha`
- Git instalado (qualquer versão recente)
- Navegador moderno (Chrome, Firefox, Safari ou Edge — versão dos últimos 2 anos)
- **Para servidor local (opcional)**: Node.js 18+ e npm

> O jogo funciona abrindo `index.html` diretamente **sem nenhuma dependência**. O servidor local é opcional.

---

## 1. Clonar o Repositório

```bash
git clone https://github.com/<seu-usuario>/JogoDaCobrinha.git
cd JogoDaCobrinha
```

---

## 2. Rodar Localmente

### Opção A — Servidor Vite (recomendado)

```bash
npm install       # instala o Vite (apenas na primeira vez)
npm run dev       # inicia em http://localhost:8000
```

O jogo abre automaticamente no navegador em `http://localhost:8000`. HMR ativo — alterações nos arquivos aparecem sem recarregar.

### Opção B — Abrir direto no navegador (sem npm)

```bash
# Linux / macOS
open index.html
# ou arraste o arquivo index.html para a janela do browser
```

> **Chrome**: se scripts de módulo não carregarem via `file://`, use a Opção A (Vite) ou:
> ```bash
> python3 -m http.server 8000
> # depois acesse http://localhost:8000
> ```

---

## 3. Estrutura de Arquivos

```
/
├── index.html          ← Ponto de entrada — carrega todas as telas e scripts
├── package.json        ← devDependency Vite; script `npm run dev` (porta 8000)
├── .gitignore          ← deve incluir node_modules/
├── css/
│   └── style.css       ← Tema neon, variáveis CSS, layout responsivo, animações
├── js/
│   ├── config.js       ← Constantes: grade, dificuldades, ranking, word lists
│   ├── game.js         ← Classes Game, GameSession, Snake, Arena; game loop (rAF)
│   ├── controls.js     ← Teclado, swipe, botões on-screen, visibilitychange
│   ├── ranking.js      ← Classe Ranking: CRUD, validação, localStorage
│   └── ui.js           ← Classe UIManager: gerenciador de telas, renderização
└── .github/
    └── workflows/
        └── deploy.yml  ← Pipeline GitHub Actions → GitHub Pages
```

---

## 4. Configurar GitHub Pages (uma vez)

1. No GitHub, acesse o repositório `JogoDaCobrinha`.
2. Vá em **Settings → Pages**.
3. Em **Source**, selecione **"GitHub Actions"**.
4. Salvar.

A partir daí, qualquer `push` na branch `main` dispara o pipeline automaticamente.

---

## 5. Deploy Manual (primeiro deploy)

```bash
git add .
git commit -m "feat: implementação inicial do jogo"
git push origin main
```

O pipeline `.github/workflows/deploy.yml` é disparado e a URL pública do jogo estará disponível em:

```
https://<seu-usuario>.github.io/JogoDaCobrinha/
```

Acompanhe o progresso em **Actions → Deploy to GitHub Pages** no GitHub.

---

## 6. Redeploy (fluxo normal de desenvolvimento)

```bash
# Editar arquivos...
git add .
git commit -m "fix: descrição da mudança"
git push origin main
# Pipeline rodar automaticamente (~30s) → site atualizado
```

---

## 7. Verificar Responsividade

Após abrir o jogo (local ou no Pages):

1. **Desktop**: usar normalmente com teclado (setas / WASD, P para pausar, H para ajuda).
2. **Mobile no DevTools**: pressionar F12 → ícone de dispositivo móvel → selecionar "iPhone SE" (375×667) ou "Galaxy S8" (360×740).
3. **Mobile real**: acessar a URL do GitHub Pages pelo smartphone.

Pontos de verificação obrigatórios por viewport:

| Viewport | Check |
|----------|-------|
| 320px largura | Canvas visível; botões on-screen; HUD legível |
| 768px (tablet) | Layout bem distribuído; canvas proporcional |
| 1024px+ (desktop) | Canvas centralizado; HUD completo; sem botões on-screen |

---

## 8. Convenções de Commit

Seguir Conventional Commits (exigido pela constituição):

| Prefixo | Quando usar |
|---------|-------------|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `style:` | Mudanças visuais / CSS |
| `refactor:` | Refatoração sem mudança de comportamento |
| `docs:` | Documentação (specs, README) |
| `ci:` | Mudanças no pipeline GitHub Actions |

---

## 9. Variáveis de Configuração Rápida

Para ajustar o comportamento do jogo sem alterar a lógica, edite `js/config.js`:

```js
const GRID_COLS = 20;     // colunas da grade (padrão: 20)
const GRID_ROWS = 20;     // linhas da grade (padrão: 20)
const RANKING_MAX_ENTRIES = 5;  // máximo de entradas no ranking
// Velocidades e obstáculos por nível: objeto DIFFICULTIES
```
