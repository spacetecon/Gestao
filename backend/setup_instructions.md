# 🚀 +Gestão Backend - Setup Inicial

## 📦 Passo 1: Criar a estrutura de pastas

Crie a seguinte estrutura no seu projeto:

```
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── errorHandler.js
│   ├── routes/
│   ├── services/
│   ├── utils/
│   │   ├── jwt.js
│   │   └── password.js
│   ├── validators/
│   └── server.js
├── .env
├── .env.example
├── .gitignore
└── package.json
```

## ⚙️ Passo 2: Instalar dependências

```bash
# Navegue até a pasta do backend
cd backend

# Instale as dependências
npm install
```

## 🗄️ Passo 3: Configurar o banco de dados

### Opção A: PostgreSQL Local (com Docker)

```bash
# Criar container PostgreSQL
docker run --name postgres-maisgestao \
  -e POSTGRES_USER=maisgestao \
  -e POSTGRES_PASSWORD=senha123 \
  -e POSTGRES_DB=maisgestao \
  -p 5432:5432 \
  -d postgres:15-alpine
```

DATABASE_URL no .env:
```
DATABASE_URL="postgresql://maisgestao:senha123@localhost:5432/maisgestao?schema=public"
```

### Opção B: Supabase (Recomendado para produção)

1. Acesse https://supabase.com e crie um projeto
2. Vá em Settings → Database
3. Copie a "Connection string" (URI)
4. Cole no .env como DATABASE_URL

### Opção C: NeonDB (Alternativa serverless)

1. Acesse https://neon.tech e crie um projeto
2. Copie a connection string
3. Cole no .env como DATABASE_URL

## 🔐 Passo 4: Configurar variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o .env com suas configurações
nano .env  # ou use seu editor preferido
```

**Gere uma chave JWT segura:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🏗️ Passo 5: Rodar as migrations do Prisma

```bash
# Gerar o cliente Prisma
npm run prisma:generate

# Criar as tabelas no banco
npm run prisma:migrate

# Popular com dados iniciais (categorias padrão)
npm run prisma:seed
```

## 🚀 Passo 6: Iniciar o servidor

```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Modo produção
npm start
```

Você verá:
```
🚀 ========================================
🚀 +Gestão API rodando na porta 3001
🚀 Ambiente: development
🚀 URL: http://localhost:3001
🚀 ========================================
✅ Conectado ao banco de dados PostgreSQL
```

## 🧪 Passo 7: Testar a API

Acesse no navegador ou use curl:
```bash
curl http://localhost:3001/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "message": "+Gestão API está funcionando!",
  "timestamp": "2025-10-12T..."
}
```

## 🛠️ Comandos úteis do Prisma

```bash
# Abrir interface visual do banco (Prisma Studio)
npm run prisma:studio

# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Reset do banco (CUIDADO: apaga tudo!)
npx prisma migrate reset

# Atualizar o schema sem criar migration
npx prisma db push
```

## 📝 Próximos passos

Agora vamos criar:

1. ✅ **Validators (Zod)** - Validação de dados
2. ✅ **Auth Routes + Controller** - Sistema de login/registro
3. ✅ **Account Routes + Controller** - CRUD de contas
4. ✅ **Transaction Routes + Controller** - CRUD de transações
5. ✅ **Category Routes + Controller** - CRUD de categorias
6. ✅ **Dashboard Routes + Controller** - Relatórios e resumos

## 🐛 Troubleshooting

### Erro de conexão com banco
- Verifique se o PostgreSQL está rodando
- Confira se a DATABASE_URL está correta no .env
- Teste a conexão: `npx prisma db pull`

### Erro "JWT_SECRET is not defined"
- Certifique-se de ter um .env com JWT_SECRET preenchido
- Reinicie o servidor após editar o .env

### Porta 3001 já em uso
- Mude o PORT no .env
- Ou mate o processo: `lsof -ti:3001 | xargs kill -9`

## 📚 Recursos

- [Documentação do Prisma](https://www.prisma.io/docs)
- [Express.js](https://expressjs.com)
- [JWT.io](https://jwt.io)

---

**Estrutura base criada com sucesso! 🎉**