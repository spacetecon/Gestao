import { z } from 'zod';

/**
 * Schema de validação para criar transação
 */
export const createTransactionSchema = z.object({
  tipo: z
    .enum(['receita', 'despesa'], {
      required_error: 'Tipo é obrigatório',
      invalid_type_error: 'Tipo deve ser "receita" ou "despesa"'
    }),

  valor: z
    .number({ required_error: 'Valor é obrigatório' })
    .or(z.string().transform(val => parseFloat(val)))
    .refine(val => !isNaN(val) && val > 0, 'Valor deve ser um número positivo'),

  descricao: z
    .string({ required_error: 'Descrição é obrigatória' })
    .min(2, 'Descrição deve ter no mínimo 2 caracteres')
    .max(200, 'Descrição deve ter no máximo 200 caracteres')
    .trim(),

  data: z
    .string({ required_error: 'Data é obrigatória' })
    .datetime({ message: 'Data deve estar no formato ISO 8601' })
    .or(z.date())
    .transform(val => typeof val === 'string' ? new Date(val) : val),

  categoriaId: z
    .string({ required_error: 'Categoria é obrigatória' })
    .uuid('ID de categoria inválido'),

  accountId: z
    .string({ required_error: 'Conta é obrigatória' })
    .uuid('ID de conta inválido'),

  status: z
    .enum(['pendente', 'concluida', 'cancelada'])
    .optional()
    .default('concluida'),

  parcelado: z
    .boolean()
    .optional()
    .default(false),

  parcelas: z
    .number()
    .int()
    .min(2, 'Número de parcelas deve ser no mínimo 2')
    .max(60, 'Número de parcelas deve ser no máximo 60')
    .optional()
    .nullable(),

  parcelaAtual: z
    .number()
    .int()
    .min(1)
    .optional()
    .nullable(),

  recorrente: z
    .boolean()
    .optional()
    .default(false),

  frequencia: z
    .enum(['mensal', 'semanal', 'anual'])
    .optional()
    .nullable(),

  comprovante: z
    .string()
    .url('Comprovante deve ser uma URL válida')
    .optional()
    .nullable(),

  observacoes: z
    .string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional()
    .nullable()
});

/**
 * Schema de validação para atualizar transação
 */
export const updateTransactionSchema = z.object({
  tipo: z
    .enum(['receita', 'despesa'])
    .optional(),

  valor: z
    .number()
    .or(z.string().transform(val => parseFloat(val)))
    .refine(val => !isNaN(val) && val > 0, 'Valor deve ser um número positivo')
    .optional(),

  descricao: z
    .string()
    .min(2, 'Descrição deve ter no mínimo 2 caracteres')
    .max(200, 'Descrição deve ter no máximo 200 caracteres')
    .trim()
    .optional(),

  data: z
    .string()
    .datetime({ message: 'Data deve estar no formato ISO 8601' })
    .or(z.date())
    .transform(val => typeof val === 'string' ? new Date(val) : val)
    .optional(),

  categoriaId: z
    .string()
    .uuid('ID de categoria inválido')
    .optional(),

  accountId: z
    .string()
    .uuid('ID de conta inválido')
    .optional(),

  status: z
    .enum(['pendente', 'concluida', 'cancelada'])
    .optional(),

  comprovante: z
    .string()
    .url('Comprovante deve ser uma URL válida')
    .optional()
    .nullable(),

  observacoes: z
    .string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional()
    .nullable()
});
