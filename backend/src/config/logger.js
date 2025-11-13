import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

/**
 * Formato customizado para logs em desenvolvimento
 * Mostra: timestamp level: message [metadata]
 */
const devFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} ${level}: ${stack || message}`;
  
  // Adicionar metadata se houver
  const metaString = Object.keys(metadata).length 
    ? `\n${JSON.stringify(metadata, null, 2)}` 
    : '';
  
  return msg + metaString;
});

/**
 * Formato para produção (JSON estruturado)
 */
const prodFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  json()
);

/**
 * Configuração do logger
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  defaultMeta: { 
    service: 'mais-gestao-api',
    environment: process.env.NODE_ENV 
  },
  transports: [
    // Log de erros em arquivo separado
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Log combinado de tudo
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
  ],
  
  // Não sair do processo em caso de erro
  exitOnError: false,
});

/**
 * Em desenvolvimento, também logar no console com cores
 */
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'HH:mm:ss' }),
      printf(({ level, message, timestamp, stack }) => {
        return `${timestamp} ${level}: ${stack || message}`;
      })
    ),
  }));
}

/**
 * Stream para integração com Morgan (HTTP logs)
 */
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

/**
 * Função auxiliar para logar requisições HTTP
 */
logger.logRequest = (req, res, duration) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.originalUrl,
    status: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
};

/**
 * Função auxiliar para logar operações de banco de dados
 */
logger.logDatabase = (operation, details) => {
  logger.debug('Database Operation', {
    operation,
    ...details,
  });
};

/**
 * Função auxiliar para logar erros de autenticação
 */
logger.logAuthError = (email, reason) => {
  logger.warn('Authentication Failed', {
    email,
    reason,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Função auxiliar para logar operações de segurança
 */
logger.logSecurity = (event, details) => {
  logger.warn('Security Event', {
    event,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

// Criar diretório de logs se não existir
import fs from 'fs';
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export default logger;