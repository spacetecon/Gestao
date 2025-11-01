# 🎨 +Gestão Frontend - Setup

## 📂 Estrutura do Projeto

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   └── Layout.jsx
│   │   └── Modals/
│   │       └── AccountModal.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   └── Contas.jsx
│   ├── services/
│   │   └── api.js
│   ├── store/
│   │   └── authStore.js
│   ├── utils/
│   │   └── index.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
└── .env
```

## 🚀 Instalação

### 1. Instalar dependências

```bash
cd frontend
npm install
```

### 2. Configurar variáveis de ambiente

```bash
# Criar arquivo .env
cp .env.example .env

# Editar o .env
VITE_API_URL=http://localhost:3001/api
```

### 3. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

O frontend estará disponível em: `http://localhost:5173`

## 📦 Dependências Principais

### Core
- **React 18** - Biblioteca UI
- **Vite** - Build tool ultra-rápido
- **React Router DOM** - Roteamento

### State Management
- **Zustand** - State global (auth)

### Forms & Validation
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

### UI & Styling
- **Tailwind CSS** - Framework CSS utility-first
- **Lucide React** - Ícones
- **Sonner** - Toast notifications

### Data Visualization
- **Recharts** - Gráficos e charts

### HTTP Client
- **Axios** - Requisições HTTP

### Utils
- **date-fns** - Manipulação de datas
- **clsx** + **tailwind-merge** - Utilitários CSS

## 🎨 Componentes Criados

### ✅ Páginas
- ✅ Login
- ✅ Register (Cadastro)
- ✅ Dashboard (com gráficos)
- ✅ Contas (CRUD completo)
- ⬜ Transações (placeholder)
- ⬜ Categorias (placeholder)
- ⬜ Configurações (placeholder)

### ✅ Componentes
- ✅ Layout (sidebar + topbar responsivo)
- ✅ AccountModal (criar/editar conta)
- ✅ ProtectedRoute (rotas protegidas)
- ✅ PublicRoute (rotas públicas)

### ✅ Funcionalidades
- ✅ Autenticação JWT
- ✅ Persistência de sessão (localStorage)
- ✅ Interceptors axios (token automático)
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design (mobile-first)
- ✅ Dark mode ready (estrutura)

## 🎯 Features do Dashboard

### Cards de Resumo
- Saldo Total (todas as contas)
- Receitas do Mês
- Despesas do Mês
- Saldo do Mês

### Gráficos
- **Gráfico de Pizza** - Despesas por categoria
- **Gráfico de Linha** - Evolução do saldo (6 meses)

### Transações Recentes
- Últimas 5 transações
- Com categoria e conta

## 💰 Features da Página de Contas

- ✅ Listar todas as contas
- ✅ Criar nova conta
- ✅ Editar conta
- ✅ Deletar conta
- ✅ Arquivar/Reativar conta
- ✅ Visualizar saldo total
- ✅ Filtrar contas ativas/arquivadas
- ✅ 4 tipos de conta (Carteira, Conta Corrente, Poupança, Investimento)
- ✅ Customização de cor
- ✅ Contador de transações por conta

## 🎨 Customização de Cores

O sistema usa Tailwind CSS com cores customizadas:

```javascript
// tailwind.config.js
colors: {
  primary: { /* Azul */ },
  success: '#10b981', // Verde
  danger: '#ef4444',  // Vermelho
  warning: '#f59e0b', // Amarelo
}
```

## 📱 Responsividade

O design é **mobile-first** com breakpoints:
- `sm:` - 640px+
- `md:` - 768px+
- `lg:` - 1024px+
- `xl:` - 1280px+

### Mobile
- Sidebar com menu hambúrguer
- Cards empilhados
- Formulários em coluna única

### Desktop
- Sidebar fixa lateral
- Grid de cards (2-4 colunas)
- Gráficos lado a lado

## 🔐 Autenticação

### Fluxo
1. Usuário faz login
2. Token JWT é salvo no localStorage
3. Interceptor adiciona token em todas as requisições
4. Se token inválido (401), redireciona para login

### Proteção de Rotas
```jsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint
```

## 📊 Integração com Backend

A API está configurada em `src/services/api.js`:

```javascript
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});
```

Todos os serviços estão organizados por módulo:
- `authService` - Login, registro, perfil
- `accountService` - CRUD de contas
- `categoryService` - CRUD de categorias
- `transactionService` - CRUD de transações
- `dashboardService` - Relatórios

## 🚧 Próximos Passos

### Páginas a Criar
1. **Transações** (completa)
   - Listar com filtros
   - Criar/editar/deletar
   - Modal de transação
   - Filtros por data, categoria, conta

2. **Categorias**
   - Listar categorias
   - Criar categoria personalizada
   - Editar/deletar

3. **Configurações**
   - Editar perfil
   - Alterar senha
   - Tema (claro/escuro)
   - Notificações

### Melhorias
- ⬜ Adicionar skeleton loaders
- ⬜ Implementar infinite scroll
- ⬜ Adicionar filtros avançados
- ⬜ Export de relatórios (PDF/Excel)
- ⬜ PWA (Service Workers)
- ⬜ Modo offline
- ⬜ Testes (Vitest + Testing Library)

## 🎨 Cores Padrão dos Ícones

Cada tipo de conta tem um ícone padrão:
- 💵 Carteira
- 🏦 Conta Corrente
- 🐷 Poupança
- 📈 Investimento

## 🐛 Troubleshooting

### Erro de CORS
- Certifique-se que o backend está rodando
- Verifique a URL da API no .env
- Backend deve ter CORS configurado

### Token expirado
- Faça login novamente
- Token válido por 7 dias (configurável no backend)

### Gráficos não aparecem
- Verifique se há dados no período
- Console do navegador para erros
- Backend deve estar retornando dados corretos

---

**Frontend MVP: ✅ 75% CONCLUÍDO**

Faltam apenas as páginas de Transações, Categorias e Configurações! 🚀