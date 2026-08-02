# teste-tecnico-inmeta

API de Gerenciamento de documentação de colaboradores.

Permite cadastrar colaboradores e tipos de documento, vincular quais documentos cada colaborador deve enviar, receber os arquivos enviados (com versionamento), consultar os documentos pendentes e ver estatísticas gerais do time.

## Stack

- **Node.js 20** + **TypeScript** + **Fastify 5**
- **Prisma 7** (com driver adapter `@prisma/adapter-pg`) sobre **PostgreSQL**
- Validação com **Zod** + `fastify-type-provider-zod`
- Autenticação **JWT** (`@fastify/jwt`) com senhas hasheadas via **bcryptjs**
- Upload de arquivos via `multipart/form-data` (`@fastify/multipart`) com storage local servido por `@fastify/static`
- Swagger UI (`/docs`) para documentação interativa da API
- Testes com **Vitest** (unitários e integração)
- **pnpm** como gerenciador de pacotes

## Estrutura do projeto

```
src/
├── application/          # use-cases e factories (regras de negócio)
├── domain/
│   ├── entities/         # entidades com factories estáticas
│   ├── providers/        # interfaces (password hasher, token, storage)
│   └── repositories/     # contratos de persistência
├── infrastructure/       # implementações (Prisma, bcrypt, JWT, storage local)
├── presentation/http/    # controllers, rotas, schemas e resources
├── shared/               # config (env, i18n) e tipos compartilhados
├── tests/                # fakes, specs e testes de integração
└── server.ts             # bootstrap da aplicação
prisma/
├── schema.prisma         # modelo de dados
├── migrations/           # migrações SQL
└── seed.ts               # seed idempotente de dados de teste
```

## Pré-requisitos

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- PostgreSQL 15 (local ou via Docker)

## Executando localmente (sem Docker)

1. Instale as dependências:

   ```bash
   pnpm install
   ```

2. Crie o arquivo `.env` a partir do exemplo:

   ```bash
   cp .env.example .env
   ```

   Ajuste `DATABASE_URL` (PostgreSQL) e `JWT_SECRET` conforme necessário.

3. Crie o banco de dados e aplique as migrações:

   ```bash
   createdb inmeta_db   # se necessário
   pnpm prisma:migrate
   ```

4. Popule com dados de teste (opcional):

   ```bash
   pnpm prisma:seed
   ```

5. Suba a API em modo desenvolvimento:

   ```bash
   pnpm dev
   ```

A API fica disponível em `http://localhost:3000` e a documentação em `http://localhost:3000/docs`.

## Executando com Docker Compose

O `docker-compose.yml` sobe o **PostgreSQL** e a **API** (aplicando migrações e executando o seed automaticamente):

```bash
docker compose up --build
```

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`
- PostgreSQL: `localhost:5432` (usuário `inmeta`, senha `inmeta_password`, banco `inmeta_db`)

Os arquivos enviados são persistidos no volume nomeado `inmeta-uploads`, e os dados do Postgres em `inmeta-pgdata`. Para subir apenas a API sem rebuild: `docker compose up -d api`.

## Dados de teste

O seed cria colaboradores, tipos de documento, vínculos e documentos com versões. Usuário para login:

- **Email:** `ana@example.com`
- **Senha:** `secret123`

## Scripts

| Comando                     | Descrição                                        |
| --------------------------- | ------------------------------------------------ |
| `pnpm dev`                  | Inicia a API com hot-reload (`tsx watch`)        |
| `pnpm build`                | Gera o Prisma Client e compila TypeScript        |
| `pnpm start`                | Executa o build em `dist`                        |
| `pnpm test`                 | Roda os testes unitários (Vitest)                |
| `pnpm test:integration`     | Roda os testes de integração (usa `inmeta_test`) |
| `pnpm prisma:migrate`       | Cria/aplica migrações (`migrate dev`)            |
| `pnpm prisma:deploy`        | Aplica migrações pendentes                       |
| `pnpm prisma:seed`          | Executa o seed de dados de teste                 |
| `pnpm prisma:studio`        | Abre o Prisma Studio                             |

> Os testes de integração esperam um PostgreSQL acessível em `localhost:5432` (banco `inmeta_test`) ou a variável `TEST_DATABASE_URL`. O setup global aplica as migrações automaticamente.

## Endpoints

### Autenticação

| Método | Rota            | Descrição                                |
| ------ | --------------- | ---------------------------------------- |
| POST   | `/auth/login`   | Autentica e retorna `accessToken`        |
| POST   | `/auth/logout`  | Limpa o cookie de refresh token          |

### Colaboradores

| Método | Rota                     | Autenticado | Descrição            |
| ------ | ------------------------ | ----------- | -------------------- |
| POST   | `/collaborators`         | Não         | Cria colaborador     |
| GET    | `/collaborators`         | Sim         | Lista (paginado)     |
| GET    | `/collaborators/:id`     | Sim         | Busca por id         |
| GET    | `/collaborators/:collaboratorId/documents` | Sim | Lista documentos entregues com a versão ativa |
| PATCH  | `/collaborators/:id`     | Sim         | Atualiza             |
| DELETE | `/collaborators/:id`     | Sim         | Soft delete          |

### Tipos de documento

| Método | Rota                        | Autenticado | Descrição        |
| ------ | --------------------------- | ----------- | ---------------- |
| POST   | `/document-types`           | Sim         | Cria tipo        |
| GET    | `/document-types`           | Sim         | Lista            |
| PATCH  | `/document-types/:id`       | Sim         | Atualiza         |
| DELETE | `/document-types/:id`       | Sim         | Soft delete      |

### Vínculos (colaborador ↔ tipo de documento)

| Método | Rota                                                        | Descrição                                   |
| ------ | ----------------------------------------------------------- | ------------------------------------------- |
| POST   | `/collaborators/:collaboratorId/document-types`             | Vincula colaborador a um tipo de documento  |
| DELETE | `/collaborators/:collaboratorId/document-types/:documentTypeId` | Remove o vínculo                           |

### Documentos

| Método | Rota                      | Descrição                                           |
| ------ | ------------------------- | --------------------------------------------------- |
| POST   | `/documents`              | Envia arquivo (`multipart/form-data`), cria versão  |
| GET    | `/documents/pending`      | Lista documentos pendentes (paginado/filtros)       |
| GET    | `/documents/:id/versions` | Histórico de versões do documento                   |
| DELETE | `/documents/:id`          | Soft delete do documento                            |

#### Enviar documento

`POST /documents` espera `multipart/form-data` com o campo `documentTypeId` (UUID) e o campo `file` (arquivo, até 16 MB). Os arquivos são salvos em `UPLOAD_DIR` (padrão `./uploads`) e expostos em `/uploads/{storageKey}`.

```bash
curl -X POST http://localhost:3000/documents \
  -H "Authorization: Bearer $TOKEN" \
  -F "documentTypeId=<UUID do tipo de documento>" \
  -F "file=@./rg.pdf;type=application/pdf"
```

No frontend, use `FormData` (o `Content-Type` é definido automaticamente pelo browser):

```ts
const form = new FormData();
form.append("documentTypeId", documentTypeId);
form.append("file", file);

await fetch(`${API}/documents`, {
  method: "POST",
  headers: { Authorization: `Bearer ${accessToken}` },
  body: form,
});
```

> A ordem dos campos **não importa**: a API percorre todas as partes do formulário para encontrar o `documentTypeId` e o `file`, então eles podem vir em qualquer ordem. Como boa prática, mantenha os campos de texto antes do arquivo.

#### Listar documentos entregues por colaborador

`GET /collaborators/:collaboratorId/documents` (autenticado, paginado) retorna cada documento entregue pelo colaborador com a **versão ativa** (a mais recente). O histórico completo de versões fica disponível em `GET /documents/:id/versions`.

```json
{
  "data": [
    {
      "document": { "id": "uuid", "documentTypeId": "uuid" },
      "documentType": { "id": "uuid", "name": "RG" },
      "activeVersion": {
        "id": "uuid",
        "versionNumber": 2,
        "fileName": "rg-v2.pdf",
        "fileSize": 2048,
        "mimeType": "application/pdf",
        "storageKey": "...",
        "storageUrl": "http://localhost:3000/uploads/...",
        "createdAt": "2026-08-02T00:00:00.000Z"
      }
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1 }
}
```

Colaborador inexistente → `404`. Query params opcionais: `page` (1), `limit` (20, máx. 100).

### Estatísticas

| Método | Rota            | Descrição                       |
| ------ | --------------- | ------------------------------- |
| GET    | `/stats/dashboard` | Estatísticas gerais da documentação |

### Saúde

| Método | Rota | Descrição    |
| ------ | ---- | ------------ |
| GET    | `/`  | Health check |

## Variáveis de ambiente

| Variável      | Padrão          | Descrição                           |
| ------------- | --------------- | ----------------------------------- |
| `NODE_ENV`    | `development`   | Ambiente da aplicação               |
| `PORT`        | `3000`          | Porta do servidor HTTP              |
| `DATABASE_URL`| —               | URL de conexão do PostgreSQL        |
| `JWT_SECRET`  | —               | Segredo para assinatura dos tokens  |
| `UPLOAD_DIR`  | `./uploads`     | Diretório de armazenamento dos arquivos |

## Fora do escopo atual (melhorias futuras)

Estes itens ficaram **fora do escopo por decisão de priorização**: preferi um escopo menor e bem executado a um maior, incompleto e frágil. São ideias para evoluir o sistema com mais tempo:

### 1. Multi-tenant (empresas/organizações)

Hoje a aplicação é de tenant único: todos os colaboradores e documentos pertencem a um mesmo contexto. A evolução seria introduzir o conceito de **tenant** (ex.: empresa/cliente) e isolar os dados por tenant:

- Nova entidade `tenants`, com `tenantId` em `collaborators`, `document_types`, `links`, `documents` e `document_versions`.
- Toda query passaria a ser filtrada pelo `tenantId` do usuário autenticado (derivado do token).
- Isolamento de arquivos no storage (`uploads/{tenantId}/...`) e diretórios separados por tenant.
- Evitar o "vazamento" de dados entre organizações mesmo com tabelas compartilhadas.

### 2. Roles e controle de acesso (RBAC)

Hoje todo usuário autenticado enxerga as mesmas rotas. A ideia seria adicionar **roles** ao colaborador:

- **Colaborador** (papel padrão): visualizar e gerenciar apenas **os próprios** dados — seus documentos, histórico e pendências. Todas as consultas por colaborador passariam a exigir que o `sub` do token batesse com o recurso acessado (ex.: `GET /collaborators/:id/documents` só retornaria dados do próprio usuário).
- **Admin**: acesso administrativo — visualizar **todos** os colaboradores, listar/gestionar documentos de qualquer um, **desvincular** documentos/tipos, editar e remover colaboradores, e ver o dashboard geral. As rotas administrativas atuais (`GET /collaborators`, `GET /documents/pending`, `DELETE /...`, `GET /stats/dashboard`) seriam restritas a esse papel.

Implementação sugerida:
- Coluna `role` no `collaborators` (ex.: enum `COLLABORATOR | ADMIN`).
- Middleware de autorização além do `authenticate` atual (ex.: `requireRole("ADMIN")`).
- Verificação de posse de recurso nos use-cases (escopo horizontal: `collaboratorId === request.user.sub` para não-admins).

### 3. Outras evoluções em aberto

- **Refresh token**: o cookie `refreshToken` já é emitido no login, mas ainda não existe endpoint de refresh — quando implementado, o `accessToken` pode cair para 15 min.
- **Download/visualização de versões específicas** além da versão ativa.
- **Notificações** de pendências (ex.: lembrete de documentos faltantes).
