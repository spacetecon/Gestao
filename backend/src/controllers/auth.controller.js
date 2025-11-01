import prisma from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';

/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { nome, email, senha } = req.body;

  // Verificar se o e-mail já está cadastrado
  const usuarioExistente = await prisma.user.findUnique({
    where: { email }
  });

  if (usuarioExistente) {
    throw new AppError('E-mail já cadastrado', 409);
  }

  // Hash da senha
  const senhaHash = await hashPassword(senha);

  // Criar usuário
  const usuario = await prisma.user.create({
    data: {
      nome,
      email,
      senhaHash
    },
    select: {
      id: true,
      nome: true,
      email: true,
      dataCadastro: true
    }
  });

  // Gerar token JWT
  const token = generateToken({
    id: usuario.id,
    email: usuario.email
  });

  res.status(201).json({
    success: true,
    message: 'Usuário criado com sucesso',
    data: {
      usuario,
      token
    }
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Fazer login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, senha } = req.body;

  // Buscar usuário por e-mail
  const usuario = await prisma.user.findUnique({
    where: { email }
  });

  if (!usuario) {
    throw new AppError('E-mail ou senha incorretos', 401);
  }

  // Verificar senha
  const senhaCorreta = await comparePassword(senha, usuario.senhaHash);

  if (!senhaCorreta) {
    throw new AppError('E-mail ou senha incorretos', 401);
  }

  // Gerar token JWT
  const token = generateToken({
    id: usuario.id,
    email: usuario.email
  });

  // Remover senhaHash da resposta
  const { senhaHash, ...usuarioSemSenha } = usuario;

  res.json({
    success: true,
    message: 'Login realizado com sucesso',
    data: {
      usuario: usuarioSemSenha,
      token
    }
  });
});

/**
 * @route   GET /api/auth/profile
 * @desc    Obter perfil do usuário logado
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  // req.userId vem do middleware de autenticação
  const usuario = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      nome: true,
      email: true,
      dataCadastro: true,
      atualizadoEm: true
    }
  });

  if (!usuario) {
    throw new AppError('Usuário não encontrado', 404);
  }

  res.json({
    success: true,
    data: usuario
  });
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Atualizar perfil do usuário
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { nome, email } = req.body;
  const updateData = {};

  if (nome) updateData.nome = nome;
  if (email) {
    // Verificar se o novo e-mail já está em uso
    const emailEmUso = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: req.userId }
      }
    });

    if (emailEmUso) {
      throw new AppError('E-mail já está em uso', 409);
    }

    updateData.email = email;
  }

  const usuario = await prisma.user.update({
    where: { id: req.userId },
    data: updateData,
    select: {
      id: true,
      nome: true,
      email: true,
      dataCadastro: true,
      atualizadoEm: true
    }
  });

  res.json({
    success: true,
    message: 'Perfil atualizado com sucesso',
    data: usuario
  });
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Alterar senha do usuário
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { senhaAtual, novaSenha } = req.body;

  // Buscar usuário
  const usuario = await prisma.user.findUnique({
    where: { id: req.userId }
  });

  // Verificar senha atual
  const senhaCorreta = await comparePassword(senhaAtual, usuario.senhaHash);

  if (!senhaCorreta) {
    throw new AppError('Senha atual incorreta', 401);
  }

  // Hash da nova senha
  const novoHash = await hashPassword(novaSenha);

  // Atualizar senha
  await prisma.user.update({
    where: { id: req.userId },
    data: { senhaHash: novoHash }
  });

  res.json({
    success: true,
    message: 'Senha alterada com sucesso'
  });
});
