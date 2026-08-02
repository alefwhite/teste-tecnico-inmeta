# Fluxo do Sistema — Guia de Integração com o Frontend

Este documento descreve, passo a passo, o funcionamento completo da **API de Gerenciamento de Documentação de Colaboradores**, com o objetivo de facilitar a integração com o frontend.

---

## 1. Visão geral

O sistema gerencia a **documentação obrigatória de colaboradores**. O fluxo central é:

1. **Cadastra-se colaboradores** (quem precisa entregar documentos).
2. **Cadastra-se tipos de documento** (RG, CPF, CNH, etc.).
3. **Vincula-se** cada colaborador aos tipos de documento que ele **precisa** entregar.
4. O colaborador **envia o arquivo** do documento (com versionamento).
5. A plataforma lista o que está **pendente** e mostra **estatísticas** do time.

Toda a API (exceto login e criação de colaborador) exige **autenticação via JWT**.

---

## 2. Como rodar o projeto

Pré-requisitos: Node.js 20+, pnpm e PostgreSQL 15.

```bash
pnpm install
cp .env.example .env          # ajuste DATABASE_URL e JWT_SECRET
pnpm prisma:migrate           # cria/aplica as migrações
pnpm prisma:seed              # (opcional) dados de teste
pnpm dev                      # sobe a API em http://localhost:3000
```

Swagger interativo: `http://localhost:3000/docs`
Health check: `GET http://localhost:3000/`

Alternativa via Docker:

```bash
docker compose up --build
```

**Usuário de teste criado pelo seed:** `ana@example.com` / `secret123`

### Variáveis de ambiente

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `NODE_ENV` | `development` | Ambiente da aplicação |
| `PORT` | `3000` | Porta do servidor |
| `DATABASE_URL` | — | URL de conexão do PostgreSQL |
| `JWT_SECRET` | — | Segredo para assinar os tokens JWT |
| `UPLOAD_DIR` | `./uploads` | Diretório onde os arquivos são salvos |

---

## 3. Conceitos do domínio (modelo de dados)

| Entidade | Tabela | Papel |
| --- | --- | --- |
| **Colaborador** | `collaborators` | Pessoa que precisa entregar documentos |
| **Tipo de documento** | `document_types` | Categoria de documento (RG, CPF, CNH...) |
| **Vínculo** | `collaborator_document_types` | "O colaborador **deve** entregar este tipo" (obrigação) |
| **Documento** | `documents` | Registro de que o colaborador **entregou** um tipo |
| **Versão de documento** | `document_versions` | Cada arquivo enviado (um documento pode ter várias versões) |

**Relações importantes:**

- `collaborators` 1:N `collaborator_document_types` N:1 `document_types` → o vínculo liga colaborador e tipo.
- `collaborators` 1:N `documents` N:1 `document_types` → o documento também referencia colaborador + tipo.
- `documents` 1:N `document_versions`.
- Tanto o vínculo quanto o documento são **únicos** por par `(collaboratorId, documentTypeId)`.

> **Diferença entre vínculo e documento:** o vínculo representa o que o colaborador **deve** entregar; o documento representa o que ele **já entregou** (com arquivos/versões). Um documento só pode ser enviado se existir o vínculo correspondente.

**Soft delete:** colaboradores, tipos e documentos usam `deletedAt` (não são removidos do banco). A API filtra os registros deletados automaticamente.

---

## 4. Fluxo de autenticação

A autenticação usa **JWT** com dois tokens:

| Token | Onde fica | Validade |
| --- | --- | --- |
| `accessToken` | Corpo da resposta do login (header `Authorization: Bearer <token>`) | 15 minutos |
| `refreshToken` | Cookie `refreshToken` (HttpOnly) | 30 dias |

> ⚠️ **Atenção para o frontend:** o `refreshToken` é gravado em cookie, mas **ainda não existe endpoint de refresh** na API. Quando o `accessToken` expirar (15 min), o usuário precisará fazer login novamente (o backend já tem TODO para implementar o refresh).

### 4.1 Login

`POST /auth/login` — **não requer autenticação**

```json
{
  "email": "ana@example.com",
  "password": "secret123"
}
```

Resposta `200`:

```json
{
  "accessToken": "eyJhbGciOi...",
  "collaborator": {
    "id": "00000000-0000-0000-0000-000000000001",
    "name": "Ana Souza",
    "email": "ana@example.com"
  }
}
```

Além do corpo, o servidor envia o cookie `refreshToken` via `Set-Cookie` (HttpOnly, `SameSite=Lax` em dev). **O frontend não acessa esse cookie via JS** — ele é enviado automaticamente nas próximas requisições (se estiver no mesmo domínio) e limpo no logout.

Credenciais inválidas → `401`:

```json
{ "message": "Invalid credentials" }
```

### 4.2 Logout

`POST /auth/logout` — limpa o cookie `refreshToken`. Resposta `204` (sem corpo).

### 4.3 Autorização nas demais rotas

Quase todas as rotas exigem o header:

```
Authorization: Bearer <accessToken>
```

Se o token estiver ausente, inválido ou expirado → `401`:

```json
{ "message": "Invalid or expired token" }
```

> **Exceções (não exigem token):** `POST /auth/login` e `POST /collaborators`.

**Dica de integração:** no frontend, guarde o `accessToken` (ex.: memória/localStorage/sessionStorage) e anexe-o em um interceptor de requisições. Lembre que ele expira em **15 minutos**.

---

## 5. Fluxos de ponta a ponta

### Fluxo A — Cadastro e gestão de colaboradores

| Passo | Ação | Endpoint |
| --- | --- | --- |
| 1 | Criar colaborador (público) | `POST /collaborators` |
| 2 | Listar colaboradores | `GET /collaborators` |
| 3 | Ver detalhe | `GET /collaborators/:id` |
| 4 | Editar nome/email/senha | `PATCH /collaborators/:id` |
| 5 | Remover (soft delete) | `DELETE /collaborators/:id` |

**Criar colaborador** — `POST /collaborators`:

```json
{
  "name": "Duda Martins",
  "email": "duda@example.com",
  "password": "secret123"
}
```

Resposta `201`:

```json
{
  "id": "08a1f4a2-...",
  "name": "Duda Martins",
  "email": "duda@example.com"
}
```

- Email duplicado → `409` `{ "message": "Collaborator with this email already exists." }`
- **Importante:** o `password` nunca retorna nas respostas.

**Listar** — `GET /collaborators?page=1&limit=20&search=ana`

- `page` (padrão 1), `limit` (padrão 20, máx. 100), `search` (filtra por nome ou email, sem diferenciar maiúsculas).
- Retorno paginado:

```json
{
  "data": [
    { "id": "00000000-...", "name": "Ana Souza", "email": "ana@example.com" }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

**Atualizar** — `PATCH /collaborators/:id` — campos opcionais `name`, `email`, `password`.

**Remover** — `DELETE /collaborators/:id` → `204`. Além de marcar o colaborador como deletado, também faz soft delete dos documentos dele.

---

### Fluxo B — Cadastro e gestão de tipos de documento

| Passo | Ação | Endpoint |
| --- | --- | --- |
| 1 | Criar tipo | `POST /document-types` |
| 2 | Listar tipos | `GET /document-types` |
| 3 | Editar tipo | `PATCH /document-types/:id` |
| 4 | Remover (soft delete) | `DELETE /document-types/:id` |

**Criar tipo** — `POST /document-types`:

```json
{
  "name": "Comprovante de Residência",
  "description": "Comprovante de endereço"
}
```

Resposta `201`:

```json
{
  "id": "00000000-0000-0000-0000-000000000104",
  "name": "Comprovante de Residência",
  "description": "Comprovante de endereço"
}
```

- Nome duplicado → `409` `{ "message": "Document type with this name already exists." }`

**Listar** — `GET /document-types` → `{ "data": [ ... ] }` (sem paginação).

---

### Fluxo C — Vincular colaborador a tipos de documento

Aqui se define **quais documentos cada colaborador deve entregar**. Este passo é **pré-requisito** para o envio de arquivos.

| Passo | Ação | Endpoint |
| --- | --- | --- |
| 1 | Vincular | `POST /collaborators/:collaboratorId/document-types` |
| 2 | Desvincular | `DELETE /collaborators/:collaboratorId/document-types/:documentTypeId` |

**Vincular** — `POST /collaborators/:collaboratorId/document-types`:

```json
{
  "documentTypeId": "00000000-0000-0000-0000-000000000101"
}
```

Resposta `201`:

```json
{
  "id": "5f3b...",
  "collaboratorId": "00000000-0000-0000-0000-000000000001",
  "documentTypeId": "00000000-0000-0000-0000-000000000101",
  "createdAt": "2026-08-02T00:00:00.000Z"
}
```

- Colaborador ou tipo não encontrados → `404`.
- Vínculo já existente → `409` `{ "message": "Collaborator is already linked to this document type." }`

**Desvincular** — `DELETE` → `204`. Se o vínculo não existir → `404`.

> 💡 **Sugestão de UX:** ao criar/editar um colaborador, o frontend pode oferecer uma tela de "documentos exigidos" que usa os endpoints de vínculo acima.

---

### Fluxo D — Envio de documentos (upload de arquivo)

**Enviar arquivo** — `POST /documents` — requer `multipart/form-data` e autenticação.

Campos do formulário:

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `documentTypeId` | texto (UUID) | Tipo de documento que está sendo entregue |
| `file` | arquivo | O arquivo em si (até **16 MB**) |

> ℹ️ **Sobre a ordem dos campos:** a ordem **não importa**. O backend percorre todas as partes do formulário (`request.parts()`) e procura o campo `documentTypeId` (texto) e o campo `file` (arquivo), em qualquer posição. Antes dessa refatoração, o `request.file()` resolvia no **primeiro arquivo** e os campos de texto que viessem **depois** dele eram ignorados — causando `400 "A valid documentTypeId is required."`. Por isso, mantenha como boa prática campos de texto antes de arquivos, mas saiba que a API aceita qualquer ordem. Se o upload falhar com esse 400 e você não tiver reiniciado a aplicação, reinicie o servidor (a stream não consumida anteriormente pode ter deixado a conexão travada).

**Exemplo com `curl`:**

```bash
curl -X POST http://localhost:3000/documents \
  -H "Authorization: Bearer <accessToken>" \
  -F "documentTypeId=00000000-0000-0000-0000-000000000101" \
  -F "file=@./ana-rg.pdf;type=application/pdf"
```

**Exemplo com `fetch` (frontend):**

```ts
const form = new FormData();
form.append("documentTypeId", documentTypeId);
form.append("file", file); // objeto File/Blob

const res = await fetch(`${API}/documents`, {
  method: "POST",
  headers: { Authorization: `Bearer ${accessToken}` },
  body: form, // browser define multipart/form-data + boundary
});
```

**Regras do backend (`SubmitDocumentUseCase`):**

1. O colaborador é identificado pelo token (`sub` do JWT) — **não** vem no body.
2. Verifica se o colaborador está vinculado ao tipo de documento. Se **não** → `400` `{ "message": "Collaborator is not linked to this document type." }`
3. Salva o arquivo no storage local (`UPLOAD_DIR`).
4. Cria/reativa o `documents` (se já existir com `deletedAt`, reativa) e cria uma **nova versão** (`versionNumber` incrementado).
5. Em caso de falha no banco, o arquivo salvo é removido.

Resposta `201`:

```json
{
  "document": {
    "id": "00000000-0000-0000-0000-000000000201",
    "collaboratorId": "00000000-0000-0000-0000-000000000001",
    "documentTypeId": "00000000-0000-0000-0000-000000000101"
  },
  "version": {
    "id": "b2c1...",
    "versionNumber": 1,
    "fileName": "ana-rg.pdf",
    "fileSize": 15360,
    "mimeType": "application/pdf",
    "storageKey": "d44f6c59-....pdf",
    "storageUrl": "/uploads/d44f6c59-....pdf",
    "createdAt": "2026-08-02T00:00:00.000Z"
  }
}
```

> ⚠️ **Atenção:** não defina o `Content-Type` manualmente no fetch — deixe o browser montar o `multipart/form-data` com o boundary correto.

**Acessar o arquivo enviado:** o `storageUrl` é relativo (`/uploads/...`). Para exibir, concatene com a base da API: `http://localhost:3000/uploads/....pdf`. Os arquivos são servidos estaticamente por `@fastify/static`.

---

### Fluxo E — Consultas: pendências, histórico e estatísticas

**Listar pendências** — `GET /documents/pending` (autenticado)

Lista os **vínculos que ainda não possuem documento entregue** (usa `LEFT JOIN` com `documents` e filtra `d.id IS NULL`).

Query params (todos opcionais):

| Parâmetro | Descrição |
| --- | --- |
| `page` | Padrão 1 |
| `limit` | Padrão 20, máx. 100 |
| `collaboratorId` | Filtra por colaborador |
| `documentTypeId` | Filtra por tipo de documento |
| `search` | Filtra por nome/email do colaborador |

Resposta `200`:

```json
{
  "data": [
    {
      "collaborator": {
        "id": "00000000-0000-0000-0000-000000000001",
        "name": "Ana Souza",
        "email": "ana@example.com"
      },
      "documentType": {
        "id": "00000000-0000-0000-0000-000000000103",
        "name": "CNH"
      },
      "linkedAt": "2026-08-02T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

**Listar documentos entregues** — `GET /collaborators/:collaboratorId/documents` (autenticado)

Lista os documentos que o colaborador já **entregou**, cada um com a sua **versão ativa** (a mais recente — `versionNumber` máximo). Paginação com `page` (padrão 1) e `limit` (padrão 20, máx. 100).

```json
{
  "data": [
    {
      "document": { "id": "00000000-...", "documentTypeId": "00000000-..." },
      "documentType": { "id": "00000000-...", "name": "RG" },
      "activeVersion": {
        "id": "b2c1...",
        "versionNumber": 2,
        "fileName": "ana-rg-v2.pdf",
        "fileSize": 20480,
        "mimeType": "application/pdf",
        "storageKey": "...",
        "storageUrl": "/uploads/...",
        "createdAt": "2026-08-02T00:00:00.000Z"
      }
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1 }
}
```

- Colaborador inexistente ou deletado → `404`.
- A **versão ativa** é a de maior `versionNumber` (a mais recente); as anteriores continuam no histórico (`GET /documents/:id/versions`).

**Histórico de versões** — `GET /documents/:id/versions` (autenticado)

```json
{
  "documentId": "00000000-0000-0000-0000-000000000202",
  "versions": [
    {
      "id": "...",
      "versionNumber": 1,
      "fileName": "ana-cpf.pdf",
      "fileSize": 12288,
      "mimeType": "application/pdf",
      "storageKey": "...",
      "storageUrl": "/uploads/...",
      "createdAt": "2026-08-02T00:00:00.000Z"
    }
  ]
}
```

As versões vêm em **ordem crescente** de `versionNumber`. Documento inexistente → `404`.

**Remover documento** — `DELETE /documents/:id` → `204` (soft delete). Após remover, o documento volta a aparecer em `/documents/pending` (pois o vínculo continua existindo).

**Estatísticas do dashboard** — `GET /stats/dashboard` (autenticado)

```json
{
  "completionRate": 25,
  "totalLinks": 4,
  "completedLinks": 1,
  "topPendingDocumentTypes": [
    {
      "documentTypeId": "00000000-0000-0000-0000-000000000103",
      "name": "CNH",
      "pendingCount": 2
    }
  ],
  "recentSubmissions": [
    {
      "version": {
        "id": "...",
        "versionNumber": 2,
        "fileName": "ana-cpf-v2.pdf",
        "fileSize": 20480,
        "mimeType": "application/pdf",
        "createdAt": "2026-08-02T00:00:00.000Z"
      },
      "collaborator": { "id": "...", "name": "Ana Souza" },
      "documentType": { "id": "...", "name": "CPF" }
    }
  ]
}
```

- `completionRate` = `completedLinks / totalLinks` em %; `null` se não houver vínculos.
- `topPendingDocumentTypes`: até 5 tipos com mais pendências.
- `recentSubmissions`: últimas 10 versões enviadas.

---

## 6. Referência rápida de endpoints

| Método | Rota | Autenticado | Descrição |
| --- | --- | --- | --- |
| GET | `/` | Não | Health check |
| POST | `/auth/login` | Não | Login (retorna accessToken + cookie) |
| POST | `/auth/logout` | Não | Logout (limpa cookie) |
| POST | `/collaborators` | Não | Criar colaborador |
| GET | `/collaborators` | Sim | Listar colaboradores (paginado) |
| GET | `/collaborators/:id` | Sim | Detalhe de colaborador |
| GET | `/collaborators/:collaboratorId/documents` | Sim | Documentos entregues com versão ativa |
| PATCH | `/collaborators/:id` | Sim | Atualizar colaborador |
| DELETE | `/collaborators/:id` | Sim | Remover colaborador (soft delete) |
| POST | `/document-types` | Sim | Criar tipo de documento |
| GET | `/document-types` | Sim | Listar tipos de documento |
| PATCH | `/document-types/:id` | Sim | Atualizar tipo |
| DELETE | `/document-types/:id` | Sim | Remover tipo (soft delete) |
| POST | `/collaborators/:collaboratorId/document-types` | Sim | Vincular colaborador a tipo |
| DELETE | `/collaborators/:collaboratorId/document-types/:documentTypeId` | Sim | Desvincular |
| POST | `/documents` | Sim | Enviar arquivo (multipart) |
| GET | `/documents/pending` | Sim | Listar pendências (paginado) |
| GET | `/documents/:id/versions` | Sim | Histórico de versões |
| DELETE | `/documents/:id` | Sim | Remover documento (soft delete) |
| GET | `/stats/dashboard` | Sim | Estatísticas do dashboard |

---

## 7. Formato de erros

| Situação | Status | Corpo |
| --- | --- | --- |
| Validação de entrada (Zod) | `400` | `{ "message": "Erro de validação nos dados fornecidos.", "errors": { "email": ["Invalid email address"] } }` |
| Erro de negócio (`AppError`) | `400`/`401`/`404`/`409` | `{ "message": "..." }` |
| Erro inesperado | `500` | `{ "message": "Internal server error" }` |

Lista de mensagens de erro por status:

- **400** — arquivo ausente, `documentTypeId` inválido, colaborador não vinculado ao tipo.
- **401** — credenciais inválidas; token ausente/inválido/expirado.
- **404** — colaborador, tipo, vínculo ou documento não encontrado.
- **409** — email duplicado, nome de tipo duplicado, vínculo já existente.

**Formato de erros de validação de campo** (`errors` é um objeto `campo -> array de mensagens`). O frontend pode iterar essas chaves para exibir erros por input.

---

## 8. Detalhes importantes para o frontend

### 8.1 CORS e credenciais

- CORS libera apenas `http://localhost:3000` com `credentials: true` (configurado em `src/app.ts`).
- Se o frontend rodar em outra porta/URL, é preciso ajustar `origin` em `src/app.ts`.
- O cookie `refreshToken` é `HttpOnly` (não acessível via `document.cookie`) e `SameSite=Lax` em dev.

### 8.2 Autenticação na prática

1. Login → guarde `accessToken` no frontend.
2. Anexe `Authorization: Bearer <token>` em todas as chamadas autenticadas.
3. Token expira em **15 min**; sem endpoint de refresh por enquanto.

### 8.3 Upload de arquivos

- `POST /documents` com `FormData` (campo texto `documentTypeId` + campo `file`).
- A **ordem dos campos é indiferente** — o backend lê todas as partes do formulário (`request.parts()`).
- Limite de **16 MB** por arquivo.
- Resposta traz `version.storageUrl` para exibir/download do arquivo (`{BASE}/uploads/...`).

### 8.4 Paginação

- Respostas de listas usam `{ data: [...], meta: { page, limit, total, totalPages } }`.
- Query: `page` (1) e `limit` (20, máx. 100).

### 8.5 IDs

- Todos os IDs são **UUIDs** (validados pelas rotas com Zod). Envie sempre como string.

---

## 9. Diagrama do fluxo principal

```
Colaborador  ──(cria)──▶  POST /collaborators
    │
    ▼
Vínculo  ──(exige tipo)──▶  POST /collaborators/:id/document-types
    │
    ▼
Envio  ──(upload)──▶  POST /documents (multipart)  → cria version
    │
    ▼
Pendências  ──(o que falta)──▶  GET /documents/pending
    │
    ▼
Dashboard  ──(visão geral)──▶  GET /stats/dashboard
```

---

## 10. Estrutura do código (orientação para devs)

```
src/
├── application/            # use-cases (regras de negócio) + factories
├── domain/
│   ├── entities/           # entidades
│   ├── providers/          # contratos (password hasher, token, storage)
│   ├── errors/             # AppError e subclasses (400/401/404/409)
│   └── repositories/       # contratos de persistência
├── infrastructure/
│   ├── auth/               # bcrypt + JWT (token provider)
│   ├── database/           # Prisma (conexão + repositories)
│   └── storage/            # storage local de arquivos
├── presentation/http/
│   ├── controllers/        # recebem request/reply e chamam use-cases
│   ├── routes/             # definição das rotas + schemas Zod
│   ├── middlewares/        # authenticate e error-handler
│   ├── resource/           # formatação das respostas
│   └── schemas/            # schemas compartilhados (pagination)
├── shared/                 # env, i18n, tipos de paginação
└── server.ts               # bootstrap
```

Fluxo de uma requisição:

```
Rotas (schema Zod) → Middleware authenticate (JWT) → Controller → Use-case → Repository/Provider → Resource (formata resposta)
```
