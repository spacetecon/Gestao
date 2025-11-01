import prisma from '../config/database.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';

/**
 * @route   GET /api/accounts
 * @desc    Listar todas as contas do usuário
 * @access  Private
 */
export const getAccounts = asyncHandler(async (req, res) => {
  const { ativa } = req.query;

  const where = { userId: req.userId };

  // Filtrar apenas contas ativas se especificado
  if (ativa !== undefined) {
    where.ativa = ativa === 'true';
  }

  const contas = await prisma.account.findMany({
    where,
    orderBy: { criadaEm: 'desc' },
    include: {
      _count: {
        select: { transactions: true }
      }
    }
  });

  res.json({
    success: true,
    data: contas
  });
});

/**
 * @route   GET /api/accounts/:id
 * @desc    Obter detalhes de uma conta específica
 * @access  Private
 */
export const getAccountById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const conta = await prisma.account.findFirst({
    where: {
      id,
      userId: req.userId
    },
    include: {
      _count: {
        select: { transactions: true }
      }
    }
  });

  if (!conta) {
    throw new AppError('Conta não encontrada', 404);
  }

  res.json({
    success: true,
    data: conta
  });
});

/**
 * @route   POST /api/accounts
 * @desc    Criar nova conta
 * @access  Private
 */
export const createAccount = asyncHandler(async (req, res) => {
  const { nome, tipo, saldoInicial, cor, icone } = req.body;

  const conta = await prisma.account.create({
    data: {
      nome,
      tipo,
      saldoInicial,
      saldoAtual: saldoInicial, // Saldo atual começa igual ao inicial
      cor,
      icone,
      userId: req.userId
    }
  });

  res.status(201).json({
    success: true,
    message: 'Conta criada com sucesso',
    data: conta
  });
});

/**
 * @route   PUT /api/accounts/:id
 * @desc    Atualizar conta
 * @access  Private
 */
export const updateAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nome, tipo, cor, icone, ativa, saldoInicial } = req.body;

  // Verificar se a conta existe e pertence ao usuário
  const contaExistente = await prisma.account.findFirst({
    where: {
      id,
      userId: req.userId
    }
  });

  if (!contaExistente) {
    throw new AppError('Conta não encontrada', 404);
  }

  const updateData = {};
  
  // Atualizar campos simples
  if (nome !== undefined) updateData.nome = nome;
  if (tipo !== undefined) updateData.tipo = tipo;
  if (cor !== undefined) updateData.cor = cor;
  if (icone !== undefined) updateData.icone = icone;
  if (ativa !== undefined) updateData.ativa = ativa;

  // CORREÇÃO: Só atualizar saldo se o saldoInicial foi enviado E é diferente
  if (saldoInicial !== undefined && saldoInicial !== contaExistente.saldoInicial) {
    const diferenca = parseFloat(saldoInicial) - parseFloat(contaExistente.saldoInicial);
    updateData.saldoInicial = parseFloat(saldoInicial);
    updateData.saldoAtual = parseFloat(contaExistente.saldoAtual) + diferenca;
  }

  const conta = await prisma.account.update({
    where: { id },
    data: updateData
  });

  res.json({
    success: true,
    message: 'Conta atualizada com sucesso',
    data: conta
  });
});

/**
 * @route   DELETE /api/accounts/:id
 * @desc    Deletar conta
 * @access  Private
 */
export const deleteAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verificar se a conta existe e pertence ao usuário
  const conta = await prisma.account.findFirst({
    where: {
      id,
      userId: req.userId
    },
    include: {
      _count: {
        select: { transactions: true }
      }
    }
  });

  if (!conta) {
    throw new AppError('Conta não encontrada', 404);
  }

  // Avisar se houver transações vinculadas
  if (conta._count.transactions > 0) {
    throw new AppError(
      `Não é possível deletar a conta. Existem ${conta._count.transactions} transações vinculadas.`,
      400
    );
  }

  await prisma.account.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Conta deletada com sucesso'
  });
});

/**
 * @route   GET /api/accounts/summary
 * @desc    Obter resumo de todas as contas (saldo total, etc)
 * @access  Private
 */
export const getAccountsSummary = asyncHandler(async (req, res) => {
  const contas = await prisma.account.findMany({
    where: {
      userId: req.userId,
      ativa: true
    },
    select: {
      saldoAtual: true
    }
  });

  const saldoTotal = contas.reduce(
    (acc, conta) => acc + parseFloat(conta.saldoAtual),
    0
  );

  res.json({
    success: true,
    data: {
      totalContas: contas.length,
      saldoTotal: saldoTotal.toFixed(2)
    }
  });
});


/**
 * @route   DELETE /api/accounts/:id
 * @desc    Deletar conta
 * @access  Private
 */
