import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { accountService } from '../../services/api';

const accountSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  tipo: z.enum(['carteira', 'conta_corrente', 'poupanca', 'investimento']),
  saldoInicial: z.string().min(1, 'Saldo inicial é obrigatório'),
  cor: z.string().regex(/^#([A-Fa-f0-9]{6})$/, 'Cor inválida'),
});

const ACCOUNT_TYPES = [
  { value: 'carteira', label: 'Carteira' },
  { value: 'conta_corrente', label: 'Conta Corrente' },
  { value: 'poupanca', label: 'Poupança' },
  { value: 'investimento', label: 'Investimento' },
];

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
  '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#ec4899', '#f43f5e'
];

export default function AccountModal({ isOpen, onClose, account, onSuccess }) {
  const isEditing = !!account;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      nome: '',
      tipo: 'conta_corrente',
      saldoInicial: '0',
      cor: '#3b82f6',
    },
  });

  const selectedColor = watch('cor');

  // ✅ CORRIGIDO: Simplificado - não há async aqui, então não precisa de finally
  useEffect(() => {
    if (isOpen) {
      if (account) {
        reset({
          nome: account.nome,
          tipo: account.tipo,
          saldoInicial: account.saldoInicial.toString(),
          cor: account.cor,
        });
      } else {
        reset({
          nome: '',
          tipo: 'conta_corrente',
          saldoInicial: '0',
          cor: '#3b82f6',
        });
      }
    }
  }, [isOpen, account, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        saldoInicial: parseFloat(data.saldoInicial),
      };

      if (isEditing) {
        await accountService.update(account.id, payload);
        toast.success('Conta atualizada com sucesso');
      } else {
        await accountService.create(payload);
        toast.success('Conta criada com sucesso');
      }

      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar conta');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Editar Conta' : 'Nova Conta'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome */}
            <div>
              <label htmlFor="nome" className="label">
                Nome da Conta
              </label>
              <input
                {...register('nome')}
                type="text"
                id="nome"
                className="input"
                placeholder="Ex: Nubank, Carteira, etc"
              />
              {errors.nome && (
                <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
              )}
            </div>

            {/* Tipo */}
            <div>
              <label htmlFor="tipo" className="label">
                Tipo de Conta
              </label>
              <select {...register('tipo')} id="tipo" className="input">
                {ACCOUNT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.tipo && (
                <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>
              )}
            </div>

            {/* Saldo Inicial */}
            <div>
              <label htmlFor="saldoInicial" className="label">
                Saldo Inicial (R$)
              </label>
              <input
                {...register('saldoInicial')}
                type="number"
                step="0.01"
                id="saldoInicial"
                className="input"
                placeholder="0.00"
              />
              {errors.saldoInicial && (
                <p className="mt-1 text-sm text-red-600">{errors.saldoInicial.message}</p>
              )}
            </div>

            {/* Cor */}
            <div>
              <label className="label">Cor</label>
              <div className="grid grid-cols-6 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setValue('cor', color)}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      selectedColor === color
                        ? 'ring-2 ring-offset-2 ring-gray-900 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              {errors.cor && (
                <p className="mt-1 text-sm text-red-600">{errors.cor.message}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
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
        </div>
      </div>
    </div>
  );
}