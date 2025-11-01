import { z } from 'zod';

/**
 * Schema de validação para registro de usuário
 */
export const registerSchema = z.object({
  nome: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),

  email: z
    .string({ required_error: 'E-mail é obrigatório' })
    .email('E-mail inválido')
    .toLowerCase()
    .trim(),

  senha: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),

  confirmarSenha: z
    .string({ required_error: 'Confirmação de senha é obrigatória' })
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
});

/**
 * Schema de validação para login
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'E-mail é obrigatório' })
    .email('E-mail inválido')
    .toLowerCase()
    .trim(),

  senha: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(1, 'Senha é obrigatória')
});

/**
 * Middleware para validar dados com Zod
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Erro de validação',
          errors: error.errors.map(err => ({
            campo: err.path.join('.'),
            mensagem: err.message
          }))
        });
      }
      next(error);
    }
  };
};
