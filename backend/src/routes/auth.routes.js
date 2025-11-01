import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate, registerSchema, loginSchema } from '../validators/auth.validator.js';

const router = express.Router();

// Rotas públicas
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Rotas protegidas (requerem autenticação)
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

export default router;
