import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rotas
router.get('/', getCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
