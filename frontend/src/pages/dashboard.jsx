import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { dashboardService } from '../services/api';
import { formatCurrency, formatDate } from '../utils';
import { toast } from 'sonner';
import TransactionModal from '../components/modals/TransactionModal';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [byCategory, setByCategory] = useState([]);
  const [balanceHistory, setBalanceHistory] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ CORREÇÃO: Estado do modal
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, categoryRes, historyRes, transactionsRes] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getByCategory({ tipo: 'despesa', periodo: 'mes' }),
        dashboardService.getBalanceHistory({ meses: 6 }),
        dashboardService.getRecentTransactions({ limit: 5 }),
      ]);

      setSummary(summaryRes.data.data);
      setByCategory(categoryRes.data.data);
      setBalanceHistory(historyRes.data.data);
      setRecentTransactions(transactionsRes.data.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast.error('Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORREÇÃO: Função para abrir o modal
  const handleCreateTransaction = () => {
    console.log('🔵 Abrindo modal de transação');
    setModalOpen(true);
  };

  // ✅ CORREÇÃO: Função para fechar modal e recarregar dados
  const handleTransactionSuccess = () => {
    console.log('✅ Transação criada com sucesso');
    setModalOpen(false);
    loadDashboardData();
    toast.success('Transação criada com sucesso!');
  };

  // ✅ CORREÇÃO: Função para fechar modal sem salvar
  const handleCloseModal = () => {
    console.log('❌ Modal fechado sem salvar');
    setModalOpen(false);
  };

  const pieChartData = useMemo(() => 
    byCategory.map(cat => ({
      name: cat.nome,
      value: parseFloat(cat.total)
    })),
    [byCategory]
  );

  const lineChartData = useMemo(() =>
    balanceHistory.map(item => ({
      mes: item.mes,
      receitas: parseFloat(item.receitas),
      despesas: parseFloat(item.despesas),
      saldo: parseFloat(item.saldo)
    })),
    [balanceHistory]
  );

  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ✅ Header com botão funcionando */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral das suas finanças</p>
        </div>
        
        {/* ✅ BOTÃO CORRIGIDO */}
        <button 
          onClick={handleCreateTransaction}
          className="btn-primary flex items-center"
          type="button"
        >
          <Plus className="h-5 w-5 mr-2" />
          <span className="hidden sm:inline">Nova Transação</span>
          <span className="sm:hidden">Nova</span>
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Saldo Total */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Saldo Total</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(summary?.saldoTotal || 0)}
              </h3>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Wallet className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {summary?.totalContas || 0} contas ativas
          </p>
        </div>

        {/* Receitas */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receitas</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(summary?.mesAtual?.receitas || 0)}
              </h3>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {summary?.variacoes?.receitas > 0 ? '+' : ''}
            {summary?.variacoes?.receitas || 0}% vs mês anterior
          </p>
        </div>

        {/* Despesas */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Despesas</p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">
                {formatCurrency(summary?.mesAtual?.despesas || 0)}
              </h3>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {summary?.variacoes?.despesas > 0 ? '+' : ''}
            {summary?.variacoes?.despesas || 0}% vs mês anterior
          </p>
        </div>

        {/* Saldo do Mês */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Saldo do Mês</p>
              <h3 className={`text-2xl font-bold mt-1 ${parseFloat(summary?.mesAtual?.saldo || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary?.mesAtual?.saldo || 0)}
              </h3>
            </div>
            <div className={`p-3 rounded-lg ${parseFloat(summary?.mesAtual?.saldo || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <TrendingUp className={`h-6 w-6 ${parseFloat(summary?.mesAtual?.saldo || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Receitas - Despesas
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Despesas por Categoria
          </h3>
          {pieChartData && pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 mb-2">Sem despesas no período</p>
                <button 
                  onClick={handleCreateTransaction} 
                  className="text-sm text-primary-600 hover:text-primary-700"
                  type="button"
                >
                  Adicionar primeira despesa
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Gráfico de Linha */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Evolução do Saldo
          </h3>
          {lineChartData && lineChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="receitas" stroke="#10b981" name="Receitas" strokeWidth={2} />
                <Line type="monotone" dataKey="despesas" stroke="#ef4444" name="Despesas" strokeWidth={2} />
                <Line type="monotone" dataKey="saldo" stroke="#3b82f6" name="Saldo" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 mb-2">Sem dados no período</p>
                <button 
                  onClick={handleCreateTransaction} 
                  className="text-sm text-primary-600 hover:text-primary-700"
                  type="button"
                >
                  Adicionar primeira transação
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transações Recentes */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Transações Recentes
        </h3>
        {recentTransactions && recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${transaction.categoria?.cor}20` }}
                  >
                    <span className="text-xl">{transaction.categoria?.icone || '💰'}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.descricao}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.categoria?.nome} • {formatDate(transaction.data)}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-semibold ${
                    transaction.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaction.tipo === 'receita' ? '+' : '-'}
                  {formatCurrency(transaction.valor)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Nenhuma transação ainda</p>
            <button 
              onClick={handleCreateTransaction}
              className="btn-primary inline-flex items-center"
              type="button"
            >
              <Plus className="h-5 w-5 mr-2" />
              Criar primeira transação
            </button>
          </div>
        )}
      </div>

      {/* ✅ MODAL DE TRANSAÇÃO - Corrigido */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        transaction={null}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
}