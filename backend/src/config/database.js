import { PrismaClient } from '@prisma/client';

// Singleton pattern para evitar múltiplas instâncias do Prisma Client
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Testar conexão ao iniciar
prisma.$connect()
  .then(() => {
    console.log('✅ Conectado ao banco de dados PostgreSQL');
  })
  .catch((error) => {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  });

// Garantir que a conexão seja fechada quando o app terminar
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('👋 Conexão com o banco de dados fechada');
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('👋 Conexão com o banco de dados fechada (SIGINT)');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  console.log('👋 Conexão com o banco de dados fechada (SIGTERM)');
  process.exit(0);
});

export default prisma;