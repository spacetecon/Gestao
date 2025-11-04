import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Importar rotas (criaremos em seguida)
import authRoutes from './routes/auth.routes.js';
import accountRoutes from './routes/account.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import categoryRoutes from './routes/category.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

// Middlewares customizados
import { errorHandler } from './middlewares/errorHandler.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ========================================
// MIDDLEWARES DE SEGURANÇA
// ========================================

// Helmet - Protege contra vulnerabilidades conhecidas
app.use(helmet());

// ========================================
// CORS - Permite requisições do frontend
// ========================================
const allowedOrigins = [
  'https://gestao-u64q.onrender.com', // backend no Render
  'http://localhost:5173', // ambiente local
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requisições locais, do backend e de qualquer domínio da Vercel
      if (
        !origin || // para Postman e testes locais
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin) // qualquer domínio *.vercel.app
      ) {
        callback(null, true);
      } else {
        console.warn('❌ CORS bloqueado para origem:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);



// Rate Limiting - Previne ataques de força bruta
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limite de requisições
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ========================================
// MIDDLEWARES DE UTILIDADE
// ========================================

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger de requisições (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ========================================
// ROTAS
// ========================================

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '+Gestão API está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// ========================================
// MIDDLEWARE DE ERRO (SEMPRE POR ÚLTIMO)
// ========================================
app.use(errorHandler);

// ========================================
// INICIALIZAÇÃO DO SERVIDOR
// ========================================
app.listen(PORT, () => {
  console.log('🚀 ========================================');
  console.log(`🚀 +Gestão API rodando na porta ${PORT}`);
  console.log(`🚀 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 URL: http://localhost:${PORT}`);
  console.log('🚀 ========================================');
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Erro não tratado:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Exceção não capturada:', err);
  process.exit(1);
});

export default app;
