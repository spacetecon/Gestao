import prisma from '../config/database.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';

/**
 * @route   GET /api/categories
 * @desc    Listar categorias (padrão + personalizadas do usuário)
 * @access  Private
 */
export const getCategories = asyncHandler(async (req, res) => {
  const { tipo } = req.query; // 'receita' ou 'despesa'

  const where = {
    OR: [
      { isDefault: true }, // Categorias padrão do sistema
      { userId: req.userId } // Categorias personalizadas do usuário
    ]
  };

  if (tipo) {
    where.tipo = tipo;
  }

  const categorias = await prisma.category.findMany({
    where,
    orderBy: [
      { isDefault: 'desc' }, // Padrão primeiro
      { nome: 'asc' }
    ]
  });

  res.json({
    success: true,
    data: categorias
  });
});

/**
 * @route   POST /api/categories
 * @desc    Criar categoria personalizada
 * @access  Private
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { nome, tipo, cor, icone } = req.body;

  // Verificar se já existe uma categoria com esse nome para o usuário
  const categoriaExistente = await prisma.category.findFirst({
    where: {
      nome: { equals: nome, mode: 'insensitive' },
      userId: req.userId,
      tipo
    }
  });

  if (categoriaExistente) {
    throw new AppError('Você já possui uma categoria com esse nome', 409);
  }

  const categoria = await prisma.category.create({
    data: {
      nome,
      tipo,
      cor: cor || '#6b7280',
      icone: icone || 'tag',
      userId: req.userId,
      isDefault: false
    }
  });

  res.status(201).json({
    success: true,
    message: 'Categoria criada com sucesso',
    data: categoria
  });
});

/**
 * @route   PUT /api/categories/:id
 * @desc    Atualizar categoria personalizada
 * @access  Private
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nome, cor, icone } = req.body;

  // Verificar se a categoria existe e pertence ao usuário
  const categoria = await prisma.category.findFirst({
    where: {
      id,
      userId: req.userId,
      isDefault: false // Não pode editar categorias padrão
    }
  });

  if (!categoria) {
    throw new AppError('Categoria não encontrada ou não pode ser editada', 404);
  }

  const updateData = {};
  if (nome) updateData.nome = nome;
  if (cor) updateData.cor = cor;
  if (icone) updateData.icone = icone;

  const categoriaAtualizada = await prisma.category.update({
    where: { id },
    data: updateData
  });

  res.json({
    success: true,
    message: 'Categoria atualizada com sucesso',
    data: categoriaAtualizada
  });
});

/**
 * @route   DELETE /api/categories/:id
 * @desc    Deletar categoria personalizada
 * @access  Private
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verificar se a categoria existe e pertence ao usuário
  const categoria = await prisma.category.findFirst({
    where: {
      id,
      userId: req.userId,
      isDefault: false // Não pode deletar categorias padrão
    },
    include: {
      _count: {
        select: { transactions: true }
      }
    }
  });

  if (!categoria) {
    throw new AppError('Categoria não encontrada ou não pode ser deletada', 404);
  }

  // Avisar se houver transações vinculadas
  if (categoria._count.transactions > 0) {
    throw new AppError(
      `Não é possível deletar a categoria. Existem ${categoria._count.transactions} transações vinculadas.`,
      400
    );
  }

  await prisma.category.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Categoria deletada com sucesso'
  });
});