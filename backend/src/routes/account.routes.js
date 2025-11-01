import express from 'express';
import {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
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
router.delete('/:id', deleteAccount);

export default router;
