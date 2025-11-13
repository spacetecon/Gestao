import { PrismaClient } from '@prisma/client';
import logger from './logger.js';

// Singleton pattern para evitar múltiplas instâncias do Prisma Client
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ]
    : [
        { emit: 'event', level: 'error' },
      ],
});

// ✅ Integrar logs do Prisma com Winston
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug('Prisma Query', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });

  prisma.$on('info', (e) => {
    logger.info('Prisma Info', { message: e.message });
  });

  prisma.$on('warn', (e) => {
    logger.warn('Prisma Warning', { message: e.message });
  });
}

prisma.$on('error', (e) => {
  logger.error('Prisma Error', { 
    message: e.message,
    target: e.target,
  });
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// ✅ Testar conexão ao iniciar com logger
prisma.$connect()
  .then(() => {
    logger.info('✅ Conectado ao banco de dados PostgreSQL', {
      database: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'configured',
    });
  })
  .catch((error) => {
    logger.error('❌ Erro ao conectar ao banco de dados', { 
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  });

// ✅ Garantir que a conexão seja fechada quando o app terminar
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('👋 Conexão com o banco de dados fechada');
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  logger.info('👋 Conexão com o banco de dados fechada (SIGINT)');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  logger.info('👋 Conexão com o banco de dados fechada (SIGTERM)');
  process.exit(0);
});

export default prisma;