import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { categoryService } from '../../services/api';

const categorySchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  tipo: z.enum(['receita', 'despesa']),
  cor: z.string().regex(/^#([A-Fa-f0-9]{6})$/, 'Cor inválida'),
  icone: z.string().min(1, 'Ícone é obrigatório'),
});

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
  '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#ec4899', '#f43f5e'
];

const ICONS = [
  '💰', '💵', '💳', '🏦', '📊', '📈', '📉', '🎯',
  '🍔', '🍕', '🥗', '🍜', '☕', '🚗', '🚌', '✈️',
  '🏠', '🏥', '💊', '📚', '🎓', '🎮', '🎬', '🎵',
  '👕', '👔', '👗', '💄', '💍', '🎁', '🐶', '🐱',
  '⚽', '🏋️', '🎨', '📱', '💻', '🔧', '⚡', '🌟'
];

export default function CategoryModal({ isOpen, onClose, category, onSuccess }) {
  const isEditing = !!category;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nome: '',
      tipo: 'despesa',
      cor: '#ef4444',
      icone: '💰',
    },
  });

  const selectedColor = watch('cor');
  const selectedIcon = watch('icone');

  useEffect(() => {
    if (isOpen && category) {
      reset({
        nome: category.nome,
        tipo: category.tipo,
        cor: category.cor,
        icone: category.icone,
      });
    } else if (isOpen && !category) {
      reset({
        nome: '',
        tipo: 'despesa',
        cor: '#ef4444',
        icone: '💰',
      });
    }
  }, [isOpen, category, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await categoryService.update(category.id, data);
        toast.success('Categoria atualizada com sucesso');
      } else {
        await categoryService.create(data);
        toast.success('Categoria criada com sucesso');
      }

      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar categoria');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome */}
            <div>
              <label htmlFor="nome" className="label">
                Nome da Categoria
              </label>
              <input
                {...register('nome')}
                type="text"
                id="nome"
                className="input"
                placeholder="Ex: Pets, Academia, etc"
              />
              {errors.nome && (
                <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
              )}
            </div>

            {/* Tipo */}
            <div>
              <label className="label">Tipo</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue('tipo', 'receita')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    watch('tipo') === 'receita'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  Receita
                </button>
                <button
                  type="button"
                  onClick={() => setValue('tipo', 'despesa')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    watch('tipo') === 'despesa'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  Despesa
                </button>
              </div>
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

            {/* Ícone */}
            <div>
              <label className="label">Ícone</label>
              <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setValue('icone', icon)}
                    className={`w-10 h-10 rounded-lg text-2xl flex items-center justify-center transition-all ${
                      selectedIcon === icon
                        ? 'bg-primary-100 ring-2 ring-primary-500 scale-110'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              {errors.icone && (
                <p className="mt-1 text-sm text-red-600">{errors.icone.message}</p>
              )}
            </div>

            {/* Preview */}
            <div className="border-t pt-4">
              <label className="label">Preview</label>
              <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: `${selectedColor}20` }}
                >
                  {selectedIcon}
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-900">{watch('nome') || 'Nome da categoria'}</p>
                  <p className="text-sm text-gray-500 capitalize">{watch('tipo')}</p>
                </div>
              </div>
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