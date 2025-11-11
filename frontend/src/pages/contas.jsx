import { useState, useEffect } from 'react';
import { Plus, Wallet, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { accountService } from '../services/api';
import { formatCurrency } from '../utils';
import AccountModal from '../components/modals/accountModal';

const ACCOUNT_TYPES = {
  carteira: { label: 'Carteira', icon: '💵' },
  conta_corrente: { label: 'Conta Corrente', icon: '🏦' },
  poupanca: { label: 'Poupança', icon: '🐷' },
  investimento: { label: 'Investimento', icon: '📈' },
};

export default function Contas() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, [showInactive]);

  // ✅ CORRIGIDO: Adicionado finally block
  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await accountService.getAll({ ativa: showInactive ? undefined : true });
      setAccounts(response.data.data);
    } catch (error) {
      toast.error('Erro ao carregar contas');
      console.error(error);
    } finally {
      setLoading(false); // ✅ Sempre executa
    }
  };

  const handleCreate = () => {
    setEditingAccount(null);
    setModalOpen(true);
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setModalOpen(true);
  };

  const handleDelete = async (account) => {
    if (!confirm(`Deseja realmente deletar a conta "${account.nome}"?`)) return;

    try {
      await accountService.delete(account.id);
      toast.success('Conta deletada com sucesso');
      loadAccounts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao deletar conta');
    }
  };

  const handleToggleActive = async (account) => {
    try {
      await accountService.update(account.id, { ativa: !account.ativa });
      toast.success(account.ativa ? 'Conta arquivada' : 'Conta reativada');
      loadAccounts();
    } catch (error) {
      toast.error('Erro ao atualizar conta');
    }
  };

  const totalBalance = accounts
    .filter(acc => acc.ativa)
    .reduce((sum, acc) => sum + parseFloat(acc.saldoAtual), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contas</h1>
          <p className="text-gray-600">Gerencie suas contas bancárias e carteiras</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Nova Conta
        </button>
      </div>

      {/* Resumo */}
      <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100">Saldo Total</p>
            <h2 className="text-4xl font-bold mt-2">{formatCurrency(totalBalance)}</h2>
            <p className="text-primary-100 text-sm mt-2">
              {accounts.filter(acc => acc.ativa).length} contas ativas
            </p>
          </div>
          <div className="p-4 bg-white/10 rounded-xl">
            <Wallet className="h-12 w-12" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setShowInactive(!showInactive)}
          className="btn-secondary flex items-center text-sm"
        >
          {showInactive ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
          {showInactive ? 'Mostrar apenas ativas' : 'Mostrar arquivadas'}
        </button>
      </div>

      {/* Lista de Contas */}
      {accounts.length === 0 ? (
        <div className="card text-center py-12">
          <Wallet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Nenhuma conta cadastrada</h3>
          <p className="text-gray-600 mt-2">Crie sua primeira conta para começar</p>
          <button onClick={handleCreate} className="btn-primary mt-4">
            <Plus className="h-5 w-5 mr-2 inline" />
            Criar Conta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <div
              key={account.id}
              className={`card hover:shadow-md transition-shadow ${
                !account.ativa ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${account.cor}20` }}
                  >
                    {ACCOUNT_TYPES[account.tipo]?.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{account.nome}</h3>
                    <p className="text-sm text-gray-500">
                      {ACCOUNT_TYPES[account.tipo]?.label}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(account)}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(account)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Saldo Atual</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(account.saldoAtual)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Saldo Inicial</span>
                  <span className="text-gray-600">
                    {formatCurrency(account.saldoInicial)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Transações</span>
                  <span className="text-gray-600">
                    {account._count?.transactions || 0}
                  </span>
                </div>
              </div>

              {!account.ativa && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Arquivada
                  </span>
                </div>
              )}

              <button
                onClick={() => handleToggleActive(account)}
                className="w-full mt-4 text-sm text-gray-600 hover:text-primary-600 transition-colors"
              >
                {account.ativa ? 'Arquivar conta' : 'Reativar conta'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AccountModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        account={editingAccount}
        onSuccess={() => {
          loadAccounts();
          setModalOpen(false);
        }}
      />
    </div>
  );
}