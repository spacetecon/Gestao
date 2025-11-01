import { z } from 'zod';

/**
 * Schema de validação para criar conta
 */
export const createAccountSchema = z.object({
  nome: z
    .string({ required_error: 'Nome da conta é obrigatório' })
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .trim(),

  tipo: z
    .enum(['carteira', 'conta_corrente', 'poupanca', 'investimento'], {
      required_error: 'Tipo de conta é obrigatório',
      invalid_type_error: 'Tipo de conta inválido'
    }),

  saldoInicial: z
    .number({ required_error: 'Saldo inicial é obrigatório' })
    .or(z.string().transform(val => parseFloat(val)))
    .refine(val => !isNaN(val), 'Saldo inicial deve ser um número')
    .default(0),

  cor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6})$/, 'Cor deve ser um código hexadecimal válido')
    .optional()
    .default('#3b82f6'),

  icone: z
    .string()
    .max(30)
    .optional()
    .default('wallet')
});

/**
 * Schema de validação para atualizar conta
 */
export const updateAccountSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .trim()
    .optional(),

  tipo: z
    .enum(['carteira', 'conta_corrente', 'poupanca', 'investimento'])
    .optional(),

  saldoInicial: z
    .number()
    .or(z.string().transform(val => parseFloat(val)))
    .refine(val => !isNaN(val), 'Saldo inicial deve ser um número')
    .optional(),

  cor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6})$/, 'Cor deve ser um código hexadecimal válido')
    .optional(),

  icone: z
    .string()
    .max(30)
    .optional(),

  ativa: z
    .boolean()
    .optional()
});
