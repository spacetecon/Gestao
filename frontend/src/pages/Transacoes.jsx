import { useState, useEffect } from 'react';
import { Plus, Filter, Edit2, Trash2, TrendingUp, TrendingDown, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { transactionService, accountService, categoryService } from '../services/api';
import { formatCurrency, formatDate } from '../utils';
import TransactionModal from '../components/modals/TransactionModal';

// ✅ NOVO: Hook customizado para detectar mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return isMobile;
};

export default function Transacoes() {
  const isMobile = useIsMobile(); // ✅ Detectar mobile
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Paginação
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filtros
  const [filters, setFilters] = useState({
    tipo: '',
    accountId: '',
    categoriaId: '',
    status: '',
    dataInicio: '',
    dataFim: '',
    search: '',
  });

  useEffect(() => {
    loadTransactions();
    loadFilterData();
  }, [page, filters]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        ),
      };

      const response = await transactionService.getAll(params);
      setTransactions(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      toast.error('Erro ao carregar transações');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterData = async () => {
    try {
      const [accountsRes, categoriesRes] = await Promise.all([
        accountService.getAll({ ativa: true }),
        categoryService.getAll(),
      ]);
      setAccounts(accountsRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (error) {
      console.error('Erro ao carregar dados de filtro:', error);
    }
  };

  const handleCreate = () => {
    setEditingTransaction(null);
    setModalOpen(true);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setModalOpen(true);
  };

  const handleDelete = async (transaction) => {
    if (!confirm(`Deseja realmente deletar a transação "${transaction.descricao}"?`)) return;

    try {
      await transactionService.delete(transaction.id);
      toast.success('Transação deletada com sucesso');
      loadTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao deletar transação');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      tipo: '',
      accountId: '',
      categoriaId: '',
      status: '',
      dataInicio: '',
      dataFim: '',
      search: '',
    });
    setPage(1);
  };

  const getStatusBadge = (status) => {
    const badges = {
      concluida: 'badge-success',
      pendente: 'badge-warning',
      cancelada: 'badge-danger',
    };
    const labels = {
      concluida: 'Concluída',
      pendente: 'Pendente',
      cancelada: 'Cancelada',
    };
    return <span className={`badge ${badges[status]}`}>{labels[status]}</span>;
  };

  // Calcular totais
  const totals = transactions.reduce(
    (acc, t) => {
      const valor = parseFloat(t.valor);
      if (t.tipo === 'receita' && t.status === 'concluida') {
        acc.receitas += valor;
      } else if (t.tipo === 'despesa' && t.status === 'concluida') {
        acc.despesas += valor;
      }
      return acc;
    },
    { receitas: 0, despesas: 0 }
  );

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transações</h1>
          <p className="text-gray-600">Gerencie suas receitas e despesas</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </button>
          <button 
            onClick={handleCreate} 
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nova
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Receitas</p>
              <h3 className="text-xl sm:text-2xl font-bold text-green-700 mt-1">
                {formatCurrency(totals.receitas)}
              </h3>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Despesas</p>
              <h3 className="text-xl sm:text-2xl font-bold text-red-700 mt-1">
                {formatCurrency(totals.despesas)}
              </h3>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card bg-primary-50 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-600 font-medium">Saldo</p>
              <h3 className={`text-xl sm:text-2xl font-bold mt-1 ${
                totals.receitas - totals.despesas >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {formatCurrency(totals.receitas - totals.despesas)}
              </h3>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="card">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Tipo</label>
              <select
                value={filters.tipo}
                onChange={(e) => handleFilterChange('tipo', e.target.value)}
                className="input"
              >
                <option value="">Todos</option>
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
              </select>
            </div>

            <div>
              <label className="label">Conta</label>
              <select
                value={filters.accountId}
                onChange={(e) => handleFilterChange('accountId', e.target.value)}
                className="input"
              >
                <option value="">Todas</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Categoria</label>
              <select
                value={filters.categoriaId}
                onChange={(e) => handleFilterChange('categoriaId', e.target.value)}
                className="input"
              >
                <option value="">Todas</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input"
              >
                <option value="">Todos</option>
                <option value="concluida">Concluída</option>
                <option value="pendente">Pendente</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            <div>
              <label className="label">Data Início</label>
              <input
                type="date"
                value={filters.dataInicio}
                onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="label">Data Fim</label>
              <input
                type="date"
                value={filters.dataFim}
                onChange={(e) => handleFilterChange('dataFim', e.target.value)}
                className="input"
              />
            </div>
          </div>

          <button onClick={clearFilters} className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
            Limpar filtros
          </button>
        </div>
      )}

      {/* Lista de Transações */}
      {transactions.length === 0 ? (
        <div className="card text-center py-12">
          <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Nenhuma transação encontrada</h3>
          <p className="text-gray-600 mt-2">Crie sua primeira transação para começar</p>
          <button onClick={handleCreate} className="btn-primary mt-4">
            <Plus className="h-5 w-5 mr-2 inline" />
            Criar Transação
          </button>
        </div>
      ) : (
        <>
          {/* ✅ NOVO: Renderização condicional - Cards no mobile, tabela no desktop */}
          {isMobile ? (
            // ✅ VERSÃO MOBILE - Cards
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="card hover:shadow-md transition-shadow">
                  {/* Header do Card */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${transaction.categoria.cor}20` }}
                      >
                        <span className="text-xl">{transaction.categoria.icone || '💰'}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 truncate">{transaction.descricao}</p>
                        <p className="text-sm text-gray-500 truncate">{transaction.categoria.nome}</p>
                      </div>
                    </div>
                    <span
                      className={`font-bold text-lg flex-shrink-0 ml-2 ${
                        transaction.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.tipo === 'receita' ? '+' : '-'}
                      {formatCurrency(transaction.valor)}
                    </span>
                  </div>

                  {/* Detalhes do Card */}
                  <div className="grid grid-cols-2 gap-2 text-sm border-t pt-3">
                    <div>
                      <p className="text-gray-500 text-xs">Data</p>
                      <p className="text-gray-900 font-medium">{formatDate(transaction.data)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Conta</p>
                      <p className="text-gray-900 font-medium truncate">{transaction.account.nome}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Status</p>
                      <div className="mt-1">{getStatusBadge(transaction.status)}</div>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Ações</p>
                      <div className="flex space-x-1 mt-1">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          aria-label="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          aria-label="Deletar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Badges extras */}
                  {(transaction.parcelado || transaction.recorrente) && (
                    <div className="flex space-x-2 mt-3 pt-3 border-t">
                      {transaction.parcelado && (
                        <span className="badge badge-info text-xs">
                          {transaction.parcelaAtual}/{transaction.parcelas}x
                        </span>
                      )}
                      {transaction.recorrente && (
                        <span className="badge badge-info text-xs">🔄 Recorrente</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // ✅ VERSÃO DESKTOP - Tabela
            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Conta
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(transaction.data)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                              style={{ backgroundColor: `${transaction.categoria.cor}20` }}
                            >
                              <span className="text-sm">{transaction.categoria.icone || '💰'}</span>
                            </div>
                            <div>
                              <p className="font-medium">{transaction.descricao}</p>
                              {transaction.parcelado && (
                                <p className="text-xs text-gray-500">
                                  {transaction.parcelaAtual}/{transaction.parcelas}x
                                </p>
                              )}
                              {transaction.recorrente && (
                                <p className="text-xs text-gray-500">🔄 Recorrente</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {transaction.categoria.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {transaction.account.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {getStatusBadge(transaction.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold">
                          <span
                            className={
                              transaction.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                            }
                          >
                            {transaction.tipo === 'receita' ? '+' : '-'}
                            {formatCurrency(transaction.valor)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(transaction)}
                              className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(transaction)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Página {page} de {totalPages}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Próxima</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        transaction={editingTransaction}
        onSuccess={() => {
          loadTransactions();
          setModalOpen(false);
        }}
      />
    </div>
  );
}