import express from 'express';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getRecurringTransactions
} from '../controllers/transaction.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../validators/auth.validator.js';
import { createTransactionSchema, updateTransactionSchema } from '../validators/transaction.validator.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rotas
router.get('/recurring', getRecurringTransactions);
router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.post('/', validate(createTransactionSchema), createTransaction);
router.put('/:id', validate(updateTransactionSchema), updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
