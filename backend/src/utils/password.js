import bcrypt from 'bcryptjs';

/**
 * Gera o hash de uma senha
 * @param {String} password - Senha em texto plano
 * @returns {Promise<String>} Hash da senha
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compara uma senha com seu hash
 * @param {String} password - Senha em texto plano
 * @param {String} hash - Hash para comparar
 * @returns {Promise<Boolean>} True se a senha corresponde ao hash
 */
export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Valida se uma senha atende aos critérios mínimos
 * @param {String} password - Senha a ser validada
 * @returns {Object} { valid: Boolean, errors: Array }
 */
export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 6) {
    errors.push('A senha deve ter no mínimo 6 caracteres');
  }

  if (password.length > 100) {
    errors.push('A senha deve ter no máximo 100 caracteres');
  }

  // Opcional: adicionar mais validações
  // if (!/[A-Z]/.test(password)) {
  //   errors.push('A senha deve conter pelo menos uma letra maiúscula');
  // }

  // if (!/[0-9]/.test(password)) {
  //   errors.push('A senha deve conter pelo menos um número');
  // }

  return {
    valid: errors.length === 0,
    errors
  };
};
