# EcoRota

Site (React + Vite) e API (Node + Express + Prisma + MySQL).

```
ecorota3/
├── src/        site (usa a API em /api)
├── backend/    API: rotas, banco de dados (Prisma) e login
│   ├── prisma/         schema.prisma (tabelas) e seed.js (dados iniciais)
│   ├── prisma.config.ts  configuração do Prisma (conexão, seed)
│   └── src/            server.js, app.js, routes/, middlewares/, lib/, utils/
└── bruno/      coleção do Bruno para testar a API
```

## Versões
- **MySQL 9.7 LTS** (última versão de suporte longo). A 8.4 LTS também funciona.
  Baixe em https://dev.mysql.com/downloads/mysql/ — não precisa de Docker.
- **Prisma 7.10** (`^7.10.0`). O Prisma 8 ainda é *release candidate*, então a versão está fixada na linha 7.
  **Não rode** `npm install prisma@latest`.
- **Node 20.19+** (recomendado 22 ou 24) e **Express 5**.

## Como rodar

### 1. Banco de dados
Instale o MySQL, abra o terminal do MySQL (ou o Workbench) e crie o banco:
```sql
CREATE DATABASE ecorota CHARACTER SET utf8mb4;
```

### 2. API
```bash
cd backend
npm install
cp .env.example .env     # abra o .env e coloque a senha do seu MySQL e o JWT_SECRET
npm run setup            # cria as tabelas + gera o Prisma Client + insere os dados iniciais
npm run dev              # API em http://localhost:3333/api
```
Teste: abra http://localhost:3333/api/health (deve mostrar `"status":"ok"`).

**Já tinha rodado o setup antes?** Esta versão adicionou `latitude` e `longitude` aos ecopontos. Rode:
```bash
npm run db:migrate -- --name ecoponto_coordenadas
npm run db:generate
```

Outros comandos: `npm run db:seed` (reinsere dados iniciais se a tabela estiver vazia),
`npm run db:studio` (visualizar o banco no navegador), `npm run db:migrate` (após alterar o `schema.prisma`).

### 3. Site
Em outro terminal, na pasta raiz:
```bash
npm install
npm run dev              # http://localhost:5173
```

> O site usa o **Leaflet** para o mapa de ecopontos. Rode `npm install` na pasta raiz para instalá-lo.

### 4. Bruno
Bruno > **Open Collection** > pasta `bruno/` > ambiente **local**.
Rode **Auth > Login** primeiro: o token fica salvo e é usado nas rotas protegidas.

## Administrador
Criado pelo seed com `ADMIN_USER` / `ADMIN_PASSWORD` do `.env` (padrão `admin` / `admin123`).
Entre em Eventos > Área do Administrador. **Troque a senha antes de publicar o site.**

## Rotas (`/api`)
| Recurso | Qualquer pessoa | Só administrador (token) |
|---|---|---|
| `/eventos`, `/ecopontos`, `/noticias`, `/perguntas` | `GET /` e `GET /:id` | `POST /`, `PUT /:id`, `DELETE /:id` |
| `/auth` | — | `POST /login` (público), `GET /me` |
| `/health` | `GET` | — |

## Erros
Toda falha responde `{ "erro": { "codigo", "mensagem", "detalhes" } }`:
`400` dados inválidos · `401` sem login/token inválido/expirado · `404` não encontrado ·
`409` registro duplicado · `503` banco fora do ar · `500` erro interno.
Quem trata isso é `backend/src/middlewares/erros.js`.

## Páginas
- **Turismo Consciente:** os botões *Tabela de Valores* e *Legislação Completa* abrem janelas com os dados da taxa de resíduos (conteúdo em `src/pages/Turismo.jsx`, no topo do arquivo).
- **Notícias:** os 3 cards mostram as notícias mais recentes **cadastradas no painel do administrador** (Eventos > Área do Administrador > aba Notícias). Cada notícia tem categoria, título, resumo, imagem, data e o **link da matéria original** (botão "Ler matéria"). A página confere novidades a cada 5 minutos. Se a API estiver fora do ar ou não houver notícias, aparecem notícias de exemplo.
  - Novo campo `link` na tabela de notícias: rode `npm run db:migrate -- --name noticia_link` e `npm run db:generate` em `backend/`.
  - A Prefeitura de Caraguatatuba bloqueia leitura automática (a API do WordPress responde 403 e não há feed RSS), então a rota `GET /api/noticias/prefeitura` ficou **desativada no site**. Se um dia a Prefeitura liberar o acesso, ela já está pronta (veja `backend/src/services/noticiasPrefeitura.js`).
- **Descarte:** *Ver todos no mapa* abre um mapa (OpenStreetMap) com todos os ecopontos cadastrados. A posição vem da **latitude/longitude cadastradas no painel do administrador** (campo "Localização no mapa"). Sem elas, o site tenta achar pelo endereço (Nominatim) e, por último, pelo bairro (posição aproximada).

Fotos: coloque hero.png, lixeiras.jpg, litoral.jpg e praia.jpg em public/img.

## Deploy na Vercel

Repositório: https://github.com/luanqueirozifsp311-ai/Eco-Rota.git

O projeto está configurado para publicar **site + API juntos** na Vercel:
- o Vite gera o site estático em `dist/`;
- `scripts/vercel-build.mjs` gera o Prisma Client e empacota a API Express em `api-dist/handler.js`;
- `api/index.js` expõe a API como serverless function;
- `vercel.json` manda `/api/*` para a function e o restante para o `index.html` (rotas do React Router).

### 1. Banco de dados

Use um MySQL acessível pela internet (PlanetScale, Aiven, Railway, etc.) e crie o banco:

```sql
CREATE DATABASE ecorota CHARACTER SET utf8mb4;
```

Libere conexões externas (em provedores com allowlist, libere `0.0.0.0/0` — as Functions da Vercel não têm IP fixo).

### 2. Importar na Vercel

1. **Add New → Project → Import** o repositório acima (raiz do projeto, sem alterar o diretório).
2. Framework: **Vite**. A Vercel já lê `vercel.json`; não mude os comandos de build.
3. Em **Environment Variables**, configure (Production/Preview):

| Variável | Exemplo | Observação |
|---|---|---|
| `DATABASE_URL` | `mysql://usuario:senha@host:3306/ecorota` | Ou use `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`. |
| `DATABASE_SSL` | `true` | Necessário na maioria dos bancos gerenciados. |
| `JWT_SECRET` | texto longo e aleatório | Obrigatório para o login. |
| `ADMIN_USER` / `ADMIN_PASSWORD` | `admin` / senha forte | Usados apenas no seed. **Troque a senha padrão.** |
| `CORS_ORIGIN` | `https://seu-projeto.vercel.app` | Opcional: com `/api` no mesmo domínio não é necessário. Aceita `*` ou uma lista separada por vírgula. |
| `VITE_API_URL` | (vazio) | Opcional: deixe vazio para usar `/api` no mesmo domínio. Só preencha se a API estiver em outro host. |

> Variáveis `VITE_*` são incorporadas no build. Se alterar `VITE_API_URL`, faça um novo deploy.

4. Deploy. O build instala as dependências do site e do `backend/`, gera o Prisma Client e empacota a API.

### 3. Migrations e seed (uma vez)

O build não mexe no banco. Depois do primeiro deploy, crie as tabelas e o administrador apontando para o banco de produção:

```bash
git clone https://github.com/luanqueirozifsp311-ai/Eco-Rota.git
cd Eco-Rota
npm ci --prefix backend
cp backend/.env.example backend/.env   # preencha com as MESMAS variáveis de produção
npm --prefix backend run setup:producao
```

O comando roda `prisma migrate deploy` (tabela inicial já versionada em `backend/prisma/migrations`), gera o client e insere os dados iniciais. Para atualizar o schema depois, crie uma nova migration em `backend/` com `npm run db:migrate -- --name nome` e rode `npm run db:deploy` no ambiente de produção.

### 4. Verificar

Abra `https://<seu-projeto>.vercel.app/api/health` — deve responder `{"status":"ok","banco":"ok"}`. Depois teste o login em **Eventos → Área do Administrador**.
