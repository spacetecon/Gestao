import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

/**
 * Middleware de autenticação JWT
 * Verifica se o usuário está autenticado e adiciona os dados ao req.user
 */
export const authenticate = (req, res, next) => {
  try {
    // Pegar o token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError('Token de autenticação não fornecido', 401);
    }

    // Formato esperado: "Bearer TOKEN"
    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      throw new AppError('Formato de token inválido', 401);
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      throw new AppError('Token mal formatado', 401);
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adicionar dados do usuário à requisição
    req.userId = decoded.id;
    req.userEmail = decoded.email;

    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token inválido', 401));
    }

    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expirado', 401));
    }

    return next(error);
  }
};

/**
 * Middleware opcional - Permite passar sem autenticação mas adiciona dados se autenticado
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  try {
    const [, token] = authHeader.split(' ');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.userId = decoded.id;
    req.userEmail = decoded.email;
  } catch (error) {
    // Ignora erros, apenas não adiciona o userId
  }

  return next();
};
