import prisma from '../config/database.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';
import logger from '../config/logger.js';

/**
 * @route   GET /api/accounts
 * @desc    Listar todas as contas do usuário
 * @access  Private
 */
export const getAccounts = asyncHandler(async (req, res) => {
  const { ativa, incluirDeletadas } = req.query;

  const where = { 
    userId: req.userId,
    // ✅ NOVO: Por padrão, não mostrar contas deletadas
    deletadaEm: incluirDeletadas === 'true' ? undefined : null
  };

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
      userId: req.userId,
      deletadaEm: null // ✅ Não mostrar contas deletadas
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

  // ✅ Logar criação
  logger.info('Conta criada', {
    userId: req.userId,
    accountId: conta.id,
    accountName: conta.nome,
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
      userId: req.userId,
      deletadaEm: null // ✅ Não permitir editar contas deletadas
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

  // ✅ CORRIGIDO: Só atualizar saldo se o saldoInicial foi enviado E é diferente
  if (saldoInicial !== undefined && parseFloat(saldoInicial) !== parseFloat(contaExistente.saldoInicial)) {
    // Recalcular saldo baseado em transações
    const transacoes = await prisma.transaction.findMany({
      where: { accountId: id, status: 'concluida' },
      select: { tipo: true, valor: true }
    });
    
    let saldoTransacoes = 0;
    transacoes.forEach(t => {
      const valor = parseFloat(t.valor);
      saldoTransacoes += t.tipo === 'receita' ? valor : -valor;
    });
    
    updateData.saldoInicial = parseFloat(saldoInicial);
    updateData.saldoAtual = parseFloat(saldoInicial) + saldoTransacoes;
  }

  const conta = await prisma.account.update({
    where: { id },
    data: updateData
  });

  // ✅ Logar atualização
  logger.info('Conta atualizada', {
    userId: req.userId,
    accountId: conta.id,
    changes: Object.keys(updateData),
  });

  res.json({
    success: true,
    message: 'Conta atualizada com sucesso',
    data: conta
  });
});

/**
 * @route   DELETE /api/accounts/:id
 * @desc    Deletar conta (SOFT DELETE)
 * @access  Private
 * ✅ MODIFICADO: Agora usa soft delete ao invés de deletar fisicamente
 */
export const deleteAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verificar se a conta existe e pertence ao usuário
  const conta = await prisma.account.findFirst({
    where: {
      id,
      userId: req.userId,
      deletadaEm: null // ✅ Não permitir deletar conta já deletada
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

  // ✅ AVISO: Se houver transações vinculadas, avisar mas permitir soft delete
  if (conta._count.transactions > 0) {
    logger.warn('Conta com transações foi arquivada', {
      userId: req.userId,
      accountId: conta.id,
      transactionCount: conta._count.transactions,
    });
  }

  // ✅ SOFT DELETE: Marcar como deletada ao invés de remover do banco
  await prisma.account.update({
    where: { id },
    data: { 
      ativa: false,
      deletadaEm: new Date()
    }
  });

  // ✅ Logar exclusão
  logger.info('Conta arquivada (soft delete)', {
    userId: req.userId,
    accountId: conta.id,
    accountName: conta.nome,
    hadTransactions: conta._count.transactions > 0,
  });

  res.json({
    success: true,
    message: 'Conta arquivada com sucesso'
  });
});

/**
 * @route   POST /api/accounts/:id/restore
 * @desc    Restaurar conta deletada (SOFT DELETE)
 * @access  Private
 * ✅ NOVO: Endpoint para restaurar contas
 */
export const restoreAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verificar se a conta existe, pertence ao usuário e está deletada
  const conta = await prisma.account.findFirst({
    where: {
      id,
      userId: req.userId,
      deletadaEm: { not: null } // ✅ Apenas contas deletadas
    }
  });

  if (!conta) {
    throw new AppError('Conta não encontrada ou não está arquivada', 404);
  }

  // ✅ RESTAURAR: Remover data de exclusão e reativar
  const contaRestaurada = await prisma.account.update({
    where: { id },
    data: { 
      ativa: true,
      deletadaEm: null
    }
  });

  // ✅ Logar restauração
  logger.info('Conta restaurada', {
    userId: req.userId,
    accountId: conta.id,
    accountName: conta.nome,
  });

  res.json({
    success: true,
    message: 'Conta restaurada com sucesso',
    data: contaRestaurada
  });
});

/**
 * @route   DELETE /api/accounts/:id/permanent
 * @desc    Deletar conta permanentemente
 * @access  Private
 * ✅ NOVO: Endpoint para deletar permanentemente (usar com cuidado)
 */
export const permanentDeleteAccount = asyncHandler(async (req, res) => {
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

  // ✅ BLOQUEAR se houver transações
  if (conta._count.transactions > 0) {
    throw new AppError(
      `Não é possível deletar permanentemente. Existem ${conta._count.transactions} transações vinculadas.`,
      400
    );
  }

  // ✅ DELETAR FISICAMENTE (apenas se não houver transações)
  await prisma.account.delete({
    where: { id }
  });

  // ✅ Logar exclusão permanente
  logger.warn('Conta deletada permanentemente', {
    userId: req.userId,
    accountId: conta.id,
    accountName: conta.nome,
  });

  res.json({
    success: true,
    message: 'Conta deletada permanentemente'
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
      ativa: true,
      deletadaEm: null // ✅ Excluir contas deletadas do resumo
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