import prisma from '../config/database.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

/**
 * @route   GET /api/dashboard/summary
 * @desc    Obter resumo geral do mês atual
 * @access  Private
 */
export const getSummary = asyncHandler(async (req, res) => {
  const now = new Date();
  const primeiroDiaMes = new Date(now.getFullYear(), now.getMonth(), 1);
  const ultimoDiaMes = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Buscar transações do mês
  const transacoesMes = await prisma.transaction.findMany({
    where: {
      userId: req.userId,
      status: 'concluida',
      data: {
        gte: primeiroDiaMes,
        lte: ultimoDiaMes
      }
    },
    select: {
      tipo: true,
      valor: true
    }
  });

  // Calcular totais
  let totalReceitas = 0;
  let totalDespesas = 0;

  transacoesMes.forEach(t => {
    const valor = parseFloat(t.valor);
    if (t.tipo === 'receita') {
      totalReceitas += valor;
    } else {
      totalDespesas += valor;
    }
  });

  const saldo = totalReceitas - totalDespesas;

  // Buscar saldo total de todas as contas
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

  // Comparar com mês anterior
  const primeiroDiaMesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const ultimoDiaMesAnterior = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const transacoesMesAnterior = await prisma.transaction.findMany({
    where: {
      userId: req.userId,
      status: 'concluida',
      data: {
        gte: primeiroDiaMesAnterior,
        lte: ultimoDiaMesAnterior
      }
    },
    select: {
      tipo: true,
      valor: true
    }
  });

  let totalReceitasMesAnterior = 0;
  let totalDespesasMesAnterior = 0;

  transacoesMesAnterior.forEach(t => {
    const valor = parseFloat(t.valor);
    if (t.tipo === 'receita') {
      totalReceitasMesAnterior += valor;
    } else {
      totalDespesasMesAnterior += valor;
    }
  });

  // Calcular variações percentuais
  const variacaoReceitas = totalReceitasMesAnterior > 0
    ? ((totalReceitas - totalReceitasMesAnterior) / totalReceitasMesAnterior) * 100
    : 0;

  const variacaoDespesas = totalDespesasMesAnterior > 0
    ? ((totalDespesas - totalDespesasMesAnterior) / totalDespesasMesAnterior) * 100
    : 0;

  res.json({
    success: true,
    data: {
      mesAtual: {
        receitas: totalReceitas.toFixed(2),
        despesas: totalDespesas.toFixed(2),
        saldo: saldo.toFixed(2)
      },
      mesAnterior: {
        receitas: totalReceitasMesAnterior.toFixed(2),
        despesas: totalDespesasMesAnterior.toFixed(2)
      },
      variacoes: {
        receitas: variacaoReceitas.toFixed(2),
        despesas: variacaoDespesas.toFixed(2)
      },
      saldoTotal: saldoTotal.toFixed(2),
      totalContas: contas.length
    }
  });
});

/**
 * @route   GET /api/dashboard/by-category
 * @desc    Obter gastos agrupados por categoria
 * @access  Private
 */
export const getByCategory = asyncHandler(async (req, res) => {
  const { tipo = 'despesa', periodo = 'mes' } = req.query;

  const now = new Date();
  let dataInicio;

  switch (periodo) {
    case 'semana':
      dataInicio = new Date(now);
      dataInicio.setDate(now.getDate() - 7);
      break;
    case 'ano':
      dataInicio = new Date(now.getFullYear(), 0, 1);
      break;
    case 'mes':
    default:
      dataInicio = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const transacoes = await prisma.transaction.findMany({
    where: {
      userId: req.userId,
      tipo,
      status: 'concluida',
      data: {
        gte: dataInicio
      }
    },
    include: {
      categoria: {
        select: {
          nome: true,
          cor: true,
          icone: true
        }
      }
    }
  });

  // Agrupar por categoria
  const porCategoria = {};

  transacoes.forEach(t => {
    const categoriaNome = t.categoria.nome;
    if (!porCategoria[categoriaNome]) {
      porCategoria[categoriaNome] = {
        nome: categoriaNome,
        cor: t.categoria.cor,
        icone: t.categoria.icone,
        total: 0,
        quantidade: 0
      };
    }
    porCategoria[categoriaNome].total += parseFloat(t.valor);
    porCategoria[categoriaNome].quantidade += 1;
  });

  // Converter para array e ordenar
  const resultado = Object.values(porCategoria)
    .sort((a, b) => b.total - a.total)
    .map(cat => ({
      ...cat,
      total: cat.total.toFixed(2)
    }));

  res.json({
    success: true,
    data: resultado
  });
});

/**
 * @route   GET /api/dashboard/balance-history
 * @desc    Obter evolução do saldo ao longo do tempo
 * @access  Private
 */
export const getBalanceHistory = asyncHandler(async (req, res) => {
  const { meses = 6 } = req.query;

  const resultado = [];
  const now = new Date();

  for (let i = parseInt(meses) - 1; i >= 0; i--) {
    const mes = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mesProximo = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

    const transacoes = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
        status: 'concluida',
        data: {
          gte: mes,
          lte: mesProximo
        }
      },
      select: {
        tipo: true,
        valor: true
      }
    });

    let receitas = 0;
    let despesas = 0;

    transacoes.forEach(t => {
      const valor = parseFloat(t.valor);
      if (t.tipo === 'receita') {
        receitas += valor;
      } else {
        despesas += valor;
      }
    });

    resultado.push({
      mes: mes.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      receitas: receitas.toFixed(2),
      despesas: despesas.toFixed(2),
      saldo: (receitas - despesas).toFixed(2)
    });
  }

  res.json({
    success: true,
    data: resultado
  });
});

/**
 * @route   GET /api/dashboard/recent-transactions
 * @desc    Obter últimas transações
 * @access  Private
 */
export const getRecentTransactions = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const transacoes = await prisma.transaction.findMany({
    where: {
      userId: req.userId
    },
    include: {
      categoria: {
        select: {
          nome: true,
          cor: true,
          icone: true
        }
      },
      account: {
        select: {
          nome: true
        }
      }
    },
    orderBy: { data: 'desc' },
    take: parseInt(limit)
  });

  res.json({
    success: true,
    data: transacoes
  });
});