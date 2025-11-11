import prisma from '../config/database.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';

/**
 * Função auxiliar para atualizar o saldo da conta
 * MODIFICADO: Agora aceita transaction opcional do Prisma
 */
async function atualizarSaldoConta(accountId, tx = prisma) {
  // Buscar todas as transações concluídas da conta
  const transacoes = await tx.transaction.findMany({
    where: {
      accountId,
      status: 'concluida'
    },
    select: {
      tipo: true,
      valor: true
    }
  });

  // Calcular saldo atual
  const conta = await tx.account.findUnique({
    where: { id: accountId },
    select: { saldoInicial: true }
  });

  let saldoAtual = parseFloat(conta.saldoInicial);

  transacoes.forEach(t => {
    const valor = parseFloat(t.valor);
    if (t.tipo === 'receita') {
      saldoAtual += valor;
    } else {
      saldoAtual -= valor;
    }
  });

  // Atualizar saldo da conta
  await tx.account.update({
    where: { id: accountId },
    data: { saldoAtual }
  });

  return saldoAtual;
}

/**
 * @route   GET /api/transactions
 * @desc    Listar transações com filtros
 * @access  Private
 */
export const getTransactions = asyncHandler(async (req, res) => {
  const {
    tipo,
    accountId,
    categoriaId,
    status,
    dataInicio,
    dataFim,
    limit = 50,
    page = 1
  } = req.query;

  const where = { userId: req.userId };

  // Aplicar filtros
  if (tipo) where.tipo = tipo;
  if (accountId) where.accountId = accountId;
  if (categoriaId) where.categoriaId = categoriaId;
  if (status) where.status = status;

  // Filtro de data
  if (dataInicio || dataFim) {
    where.data = {};
    if (dataInicio) where.data.gte = new Date(dataInicio);
    if (dataFim) where.data.lte = new Date(dataFim);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [transacoes, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        categoria: {
          select: { id: true, nome: true, cor: true, icone: true }
        },
        account: {
          select: { id: true, nome: true, tipo: true }
        }
      },
      orderBy: { data: 'desc' },
      take: parseInt(limit),
      skip
    }),
    prisma.transaction.count({ where })
  ]);

  res.json({
    success: true,
    data: transacoes,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * @route   GET /api/transactions/:id
 * @desc    Obter detalhes de uma transação específica
 * @access  Private
 */
export const getTransactionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const transacao = await prisma.transaction.findFirst({
    where: {
      id,
      userId: req.userId
    },
    include: {
      categoria: true,
      account: true
    }
  });

  if (!transacao) {
    throw new AppError('Transação não encontrada', 404);
  }

  res.json({
    success: true,
    data: transacao
  });
});

/**
 * @route   POST /api/transactions
 * @desc    Criar nova transação
 * @access  Private
 * ✅ MODIFICADO: Agora usa transação atômica do Prisma
 */
export const createTransaction = asyncHandler(async (req, res) => {
  const {
    tipo,
    valor,
    descricao,
    data,
    categoriaId,
    accountId,
    status,
    parcelado,
    parcelas,
    parcelaAtual,
    recorrente,
    frequencia,
    comprovante,
    observacoes
  } = req.body;

  // Verificar se a conta pertence ao usuário
  const conta = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId: req.userId
    }
  });

  if (!conta) {
    throw new AppError('Conta não encontrada', 404);
  }

  // ✅ USAR TRANSAÇÃO ATÔMICA
  const resultado = await prisma.$transaction(async (tx) => {
    // Criar transação
    const transacao = await tx.transaction.create({
      data: {
        tipo,
        valor,
        descricao,
        data,
        categoriaId,
        accountId,
        userId: req.userId,
        status: status || 'concluida',
        parcelado: parcelado || false,
        parcelas,
        parcelaAtual,
        recorrente: recorrente || false,
        frequencia,
        comprovante,
        observacoes
      },
      include: {
        categoria: true,
        account: true
      }
    });

    // Atualizar saldo da conta se a transação estiver concluída
    if (transacao.status === 'concluida') {
      await atualizarSaldoConta(accountId, tx);
    }

    return transacao;
  });

  res.status(201).json({
    success: true,
    message: 'Transação criada com sucesso',
    data: resultado
  });
});

/**
 * @route   PUT /api/transactions/:id
 * @desc    Atualizar transação
 * @access  Private
 * ✅ MODIFICADO: Agora usa transação atômica do Prisma
 */
export const updateTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Verificar se a transação existe e pertence ao usuário
  const transacaoExistente = await prisma.transaction.findFirst({
    where: {
      id,
      userId: req.userId
    }
  });

  if (!transacaoExistente) {
    throw new AppError('Transação não encontrada', 404);
  }

  // Se mudar a conta, verificar se pertence ao usuário
  if (updateData.accountId) {
    const conta = await prisma.account.findFirst({
      where: {
        id: updateData.accountId,
        userId: req.userId
      }
    });

    if (!conta) {
      throw new AppError('Conta não encontrada', 404);
    }
  }

  // ✅ USAR TRANSAÇÃO ATÔMICA
  const resultado = await prisma.$transaction(async (tx) => {
    // Atualizar transação
    const transacao = await tx.transaction.update({
      where: { id },
      data: updateData,
      include: {
        categoria: true,
        account: true
      }
    });

    // Atualizar saldo da conta atual
    await atualizarSaldoConta(transacao.accountId, tx);
    
    // Se a conta mudou, atualizar saldo da conta antiga também
    if (updateData.accountId && updateData.accountId !== transacaoExistente.accountId) {
      await atualizarSaldoConta(transacaoExistente.accountId, tx);
    }

    return transacao;
  });

  res.json({
    success: true,
    message: 'Transação atualizada com sucesso',
    data: resultado
  });
});

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Deletar transação
 * @access  Private
 * ✅ MODIFICADO: Agora usa transação atômica do Prisma
 */
export const deleteTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verificar se a transação existe e pertence ao usuário
  const transacao = await prisma.transaction.findFirst({
    where: {
      id,
      userId: req.userId
    }
  });

  if (!transacao) {
    throw new AppError('Transação não encontrada', 404);
  }

  // ✅ USAR TRANSAÇÃO ATÔMICA
  await prisma.$transaction(async (tx) => {
    // Deletar transação
    await tx.transaction.delete({
      where: { id }
    });

    // Atualizar saldo da conta
    await atualizarSaldoConta(transacao.accountId, tx);
  });

  res.json({
    success: true,
    message: 'Transação deletada com sucesso'
  });
});

/**
 * @route   GET /api/transactions/recurring
 * @desc    Listar transações recorrentes
 * @access  Private
 */
export const getRecurringTransactions = asyncHandler(async (req, res) => {
  const transacoes = await prisma.transaction.findMany({
    where: {
      userId: req.userId,
      recorrente: true
    },
    include: {
      categoria: true,
      account: true
    },
    orderBy: { data: 'desc' }
  });

  res.json({
    success: true,
    data: transacoes
  });
});