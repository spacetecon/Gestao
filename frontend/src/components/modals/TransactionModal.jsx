import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { transactionService, accountService, categoryService } from '../../services/api';
import { formatDateForInput } from '../../utils';

const transactionSchema = z.object({
  tipo: z.enum(['receita', 'despesa']),
  valor: z.string().min(1, 'Valor é obrigatório'),
  descricao: z.string().min(2, 'Descrição deve ter no mínimo 2 caracteres'),
  data: z.string().min(1, 'Data é obrigatória'),
  categoriaId: z.string().min(1, 'Categoria é obrigatória'),
  accountId: z.string().min(1, 'Conta é obrigatória'),
  status: z.enum(['pendente', 'concluida', 'cancelada']),
  parcelado: z.boolean().optional(),
  parcelas: z.string().optional(),
  recorrente: z.boolean().optional(),
  frequencia: z.enum(['mensal', 'semanal', 'anual']).optional(),
  observacoes: z.string().optional(),
});

export default function TransactionModal({ isOpen, onClose, transaction, onSuccess }) {
  // ✅ DEBUG
  console.log('🔵 TransactionModal renderizado', { isOpen, transaction });
  
  const isEditing = !!transaction;
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      tipo: 'despesa',
      valor: '',
      descricao: '',
      data: formatDateForInput(new Date()),
      categoriaId: '',
      accountId: '',
      status: 'concluida',
      parcelado: false,
      parcelas: '',
      recorrente: false,
      frequencia: 'mensal',
      observacoes: '',
    },
  });

  const tipo = watch('tipo');
  const parcelado = watch('parcelado');
  const recorrente = watch('recorrente');

  useEffect(() => {
    if (isOpen) {
      console.log('🟢 Modal aberto, carregando dados...');
      
      const initialize = async () => {
        try {
          setLoading(true);
          
          const [accountsRes, categoriesRes] = await Promise.all([
            accountService.getAll({ ativa: true }),
            categoryService.getAll(),
          ]);
          
          console.log('✅ Dados carregados:', {
            accounts: accountsRes.data.data.length,
            categories: categoriesRes.data.data.length
          });
          
          setAccounts(accountsRes.data.data);
          setCategories(categoriesRes.data.data);
          
          if (transaction) {
            reset({
              tipo: transaction.tipo,
              valor: transaction.valor.toString(),
              descricao: transaction.descricao,
              data: transaction.data 
                ? formatDateForInput(new Date(transaction.data))
                : formatDateForInput(new Date()),
              categoriaId: transaction.categoriaId,
              accountId: transaction.accountId,
              status: transaction.status,
              parcelado: transaction.parcelado || false,
              parcelas: transaction.parcelas?.toString() || '',
              recorrente: transaction.recorrente || false,
              frequencia: transaction.frequencia || 'mensal',
              observacoes: transaction.observacoes || '',
            });
          } else {
            reset({
              tipo: 'despesa',
              valor: '',
              descricao: '',
              data: formatDateForInput(new Date()),
              categoriaId: '',
              accountId: '',
              status: 'concluida',
              parcelado: false,
              parcelas: '',
              recorrente: false,
              frequencia: 'mensal',
              observacoes: '',
            });
          }
        } catch (error) {
          console.error('❌ Erro ao carregar dados:', error);
          toast.error('Erro ao carregar dados');
        } finally {
          setLoading(false);
        }
      };
      
      initialize();
    }
  }, [isOpen, transaction, reset]);

  const onSubmit = async (data) => {
    console.log('📤 Submetendo transação:', data);
    
    try {
      const payload = {
        ...data,
        valor: parseFloat(data.valor),
        data: new Date(data.data).toISOString(),
        parcelas: data.parcelado && data.parcelas ? parseInt(data.parcelas) : null,
        parcelaAtual: data.parcelado && data.parcelas ? 1 : null,
        frequencia: data.recorrente ? data.frequencia : null,
      };

      console.log('📦 Payload:', payload);

      if (isEditing) {
        await transactionService.update(transaction.id, payload);
        toast.success('Transação atualizada com sucesso');
      } else {
        await transactionService.create(payload);
        toast.success('Transação criada com sucesso');
      }

      console.log('✅ Transação salva, chamando onSuccess');
      onSuccess();
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      toast.error(error.response?.data?.message || 'Erro ao salvar transação');
    }
  };

  // ✅ Se não estiver aberto, não renderizar nada
  if (!isOpen) {
    console.log('⚪ Modal fechado, não renderizando');
    return null;
  }

  console.log('🟡 Renderizando modal aberto');

  const filteredCategories = categories.filter(cat => cat.tipo === tipo);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
          onClick={() => {
            console.log('🔴 Backdrop clicado, fechando modal');
            onClose();
          }}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Editar Transação' : 'Nova Transação'}
            </h2>
            <button 
              onClick={() => {
                console.log('🔴 X clicado, fechando modal');
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Tipo */}
              <div>
                <label className="label">Tipo</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      console.log('✅ Selecionado: receita');
                      setValue('tipo', 'receita');
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      tipo === 'receita'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <TrendingUp className={`h-6 w-6 mx-auto mb-2 ${tipo === 'receita' ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={`font-medium ${tipo === 'receita' ? 'text-green-700' : 'text-gray-700'}`}>
                      Receita
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('✅ Selecionado: despesa');
                      setValue('tipo', 'despesa');
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      tipo === 'despesa'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <TrendingDown className={`h-6 w-6 mx-auto mb-2 ${tipo === 'despesa' ? 'text-red-600' : 'text-gray-400'}`} />
                    <span className={`font-medium ${tipo === 'despesa' ? 'text-red-700' : 'text-gray-700'}`}>
                      Despesa
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Valor */}
                <div>
                  <label htmlFor="valor" className="label">Valor (R$)</label>
                  <input
                    {...register('valor')}
                    type="number"
                    step="0.01"
                    id="valor"
                    className="input"
                    placeholder="0.00"
                  />
                  {errors.valor && <p className="mt-1 text-sm text-red-600">{errors.valor.message}</p>}
                </div>

                {/* Data */}
                <div>
                  <label htmlFor="data" className="label">Data</label>
                  <input {...register('data')} type="date" id="data" className="input" />
                  {errors.data && <p className="mt-1 text-sm text-red-600">{errors.data.message}</p>}
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label htmlFor="descricao" className="label">Descrição</label>
                <input
                  {...register('descricao')}
                  type="text"
                  id="descricao"
                  className="input"
                  placeholder="Ex: Supermercado, Salário, etc"
                />
                {errors.descricao && <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Categoria */}
                <div>
                  <label htmlFor="categoriaId" className="label">Categoria</label>
                  <select {...register('categoriaId')} id="categoriaId" className="input">
                    <option value="">Selecione...</option>
                    {filteredCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nome}
                      </option>
                    ))}
                  </select>
                  {errors.categoriaId && <p className="mt-1 text-sm text-red-600">{errors.categoriaId.message}</p>}
                </div>

                {/* Conta */}
                <div>
                  <label htmlFor="accountId" className="label">Conta</label>
                  <select {...register('accountId')} id="accountId" className="input">
                    <option value="">Selecione...</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.nome}
                      </option>
                    ))}
                  </select>
                  {errors.accountId && <p className="mt-1 text-sm text-red-600">{errors.accountId.message}</p>}
                </div>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="label">Status</label>
                <select {...register('status')} id="status" className="input">
                  <option value="concluida">Concluída</option>
                  <option value="pendente">Pendente</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              {/* Opções Avançadas */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <input {...register('parcelado')} type="checkbox" id="parcelado" className="rounded" />
                  <label htmlFor="parcelado" className="text-sm font-medium text-gray-700">
                    Transação parcelada
                  </label>
                </div>

                {parcelado && (
                  <div>
                    <label htmlFor="parcelas" className="label">Número de Parcelas</label>
                    <input
                      {...register('parcelas')}
                      type="number"
                      min="2"
                      max="60"
                      id="parcelas"
                      className="input"
                      placeholder="Ex: 12"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input {...register('recorrente')} type="checkbox" id="recorrente" className="rounded" />
                  <label htmlFor="recorrente" className="text-sm font-medium text-gray-700">
                    Transação recorrente
                  </label>
                </div>

                {recorrente && (
                  <div>
                    <label htmlFor="frequencia" className="label">Frequência</label>
                    <select {...register('frequencia')} id="frequencia" className="input">
                      <option value="mensal">Mensal</option>
                      <option value="semanal">Semanal</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Observações */}
              <div>
                <label htmlFor="observacoes" className="label">Observações (opcional)</label>
                <textarea
                  {...register('observacoes')}
                  id="observacoes"
                  rows="3"
                  className="input"
                  placeholder="Adicione observações sobre esta transação..."
                />
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    console.log('🔴 Cancelar clicado');
                    onClose();
                  }}
                  className="flex-1 btn-secondary" 
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Salvando...
                    </>
                  ) : (
                    <>{isEditing ? 'Atualizar' : 'Criar'}</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}