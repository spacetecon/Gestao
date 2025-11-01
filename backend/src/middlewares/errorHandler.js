import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

/**
 * Middleware global de tratamento de erros
 * Captura todos os erros da aplicação e retorna respostas padronizadas
 */
export const errorHandler = (err, req, res, next) => {
  console.error('❌ Erro capturado:', err);

  // Erro de validação do Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors: err.errors.map(e => ({
        campo: e.path.join('.'),
        mensagem: e.message
      }))
    });
  }

  // Erros do Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Violação de unique constraint
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Registro duplicado',
        detalhes: `O campo ${err.meta?.target} já existe`
      });
    }

    // Registro não encontrado
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Registro não encontrado'
      });
    }

    // Foreign key constraint failed
    if (err.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Referência inválida',
        detalhes: 'O registro referenciado não existe'
      });
    }
  }

  // Erro de validação do Prisma
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos fornecidos'
    });
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
  }

  // Erro customizado da aplicação
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Erro genérico (não esperado)
  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { 
      detalhes: err.message,
      stack: err.stack 
    })
  });
};

/**
 * Classe para criar erros customizados
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Wrapper para funções assíncronas
 * Evita try-catch em todos os controllers
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
