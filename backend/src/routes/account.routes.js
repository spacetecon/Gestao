import express from 'express';
import {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  restoreAccount,
  permanentDeleteAccount,
  getAccountsSummary
} from '../controllers/account.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../validators/auth.validator.js';
import { createAccountSchema, updateAccountSchema } from '../validators/account.validator.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rotas
router.get('/summary', getAccountsSummary);
router.get('/', getAccounts);
router.get('/:id', getAccountById);
router.post('/', validate(createAccountSchema), createAccount);
router.put('/:id', validate(updateAccountSchema), updateAccount);

// ✅ Soft delete (padrão)
router.delete('/:id', deleteAccount);

// ✅ NOVO: Restaurar conta
router.post('/:id/restore', restoreAccount);

// ✅ NOVO: Deletar permanentemente (usar com cuidado)
router.delete('/:id/permanent', permanentDeleteAccount);

export default router;