import { z } from 'zod';

/**
 * Schema de validação para variáveis de ambiente
 * Garante que todas as configurações necessárias estão presentes e válidas
 */
const envSchema = z.object({
  // Banco de Dados
  DATABASE_URL: z
    .string({ required_error: 'DATABASE_URL é obrigatória' })
    .url('DATABASE_URL deve ser uma URL válida')
    .startsWith('postgresql://', 'DATABASE_URL deve começar com postgresql://'),

  // JWT
  JWT_SECRET: z
    .string({ required_error: 'JWT_SECRET é obrigatória' })
    .min(32, 'JWT_SECRET deve ter no mínimo 32 caracteres para segurança adequada'),

  JWT_EXPIRES_IN: z
    .string({ required_error: 'JWT_EXPIRES_IN é obrigatória' })
    .regex(/^\d+[dwh]$/, 'JWT_EXPIRES_IN deve estar no formato: 7d, 24h, 1w'),

  // Servidor
  NODE_ENV: z
    .enum(['development', 'production', 'test'], {
      required_error: 'NODE_ENV é obrigatória',
      invalid_type_error: 'NODE_ENV deve ser: development, production ou test'
    }),

  PORT: z
    .string({ required_error: 'PORT é obrigatória' })
    .regex(/^\d+$/, 'PORT deve ser um número')
    .transform(Number)
    .refine(port => port >= 1000 && port <= 65535, 'PORT deve estar entre 1000 e 65535'),

  // CORS
  CORS_ORIGIN: z
    .string({ required_error: 'CORS_ORIGIN é obrigatória' })
    .min(1, 'CORS_ORIGIN não pode estar vazia'),

  // Rate Limiting (opcionais com valores padrão)
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .optional()
    .default('900000')
    .transform(Number),

  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .optional()
    .default('100')
    .transform(Number),

  // Logs
  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
    .optional()
    .default('info'),
});

/**
 * Valida as variáveis de ambiente no startup da aplicação
 * Se houver erro, exibe mensagens claras e encerra o processo
 * 
 * @returns {Object} Variáveis de ambiente validadas e tipadas
 */
export const validateEnv = () => {
  try {
    const validatedEnv = envSchema.parse(process.env);
    
    console.log('✅ Variáveis de ambiente validadas com sucesso');
    
    // Mostrar configurações (sem expor senhas)
    if (process.env.NODE_ENV === 'development') {
      console.log('📋 Configurações:');
      console.log(`   - NODE_ENV: ${validatedEnv.NODE_ENV}`);
      console.log(`   - PORT: ${validatedEnv.PORT}`);
      console.log(`   - LOG_LEVEL: ${validatedEnv.LOG_LEVEL}`);
      console.log(`   - JWT_EXPIRES_IN: ${validatedEnv.JWT_EXPIRES_IN}`);
      console.log(`   - Database: ${validatedEnv.DATABASE_URL.split('@')[1]?.split('/')[0] || 'configurado'}`);
    }
    
    return validatedEnv;
  } catch (error) {
    console.error('❌ ERRO: Variáveis de ambiente inválidas ou ausentes');
    console.error('');
    console.error('Por favor, verifique seu arquivo .env:');
    console.error('');
    
    if (error instanceof z.ZodError) {
      error.errors.forEach((err, index) => {
        const field = err.path.join('.');
        console.error(`   ${index + 1}. ${field}:`);
        console.error(`      ${err.message}`);
        console.error('');
      });
    }
    
    console.error('💡 Dica: Copie o arquivo .env.example e preencha os valores necessários');
    console.error('');
    
    // Encerrar processo com código de erro
    process.exit(1);
  }
};

/**
 * Exporta as variáveis validadas para uso na aplicação
 * Garante tipagem correta e valores validados
 */
//export const env = validateEnv();