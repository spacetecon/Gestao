import express from 'express';
import {
  getSummary,
  getByCategory,
  getBalanceHistory,
  getRecentTransactions
} from '../controllers/dashboard.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rotas
router.get('/summary', getSummary);
router.get('/by-category', getByCategory);
router.get('/balance-history', getBalanceHistory);
router.get('/recent-transactions', getRecentTransactions);

export default router;
