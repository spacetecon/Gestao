import jwt from 'jsonwebtoken';

/**
 * Gera um token JWT para o usuário
 * @param {Object} payload - Dados a serem incluídos no token
 * @returns {String} Token JWT
 */
export const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

/**
 * Verifica e decodifica um token JWT
 * @param {String} token - Token a ser verificado
 * @returns {Object} Dados decodificados do token
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Decodifica um token sem verificar (útil para debug)
 * @param {String} token - Token a ser decodificado
 * @returns {Object} Dados do token
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};
