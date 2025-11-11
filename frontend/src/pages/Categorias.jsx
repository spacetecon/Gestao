import { useState, useEffect } from 'react';
import { Plus, Tag, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { categoryService } from '../services/api';
import CategoryModal from '../components/modals/CategoryModal';

export default function Categorias() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'receita', 'despesa'

  useEffect(() => {
    loadCategories();
  }, []);

  // ✅ CORRIGIDO: Adicionado finally block
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAll();
      setCategories(response.data.data);
    } catch (error) {
      toast.error('Erro ao carregar categorias');
      console.error(error);
    } finally {
      setLoading(false); // ✅ Sempre executa
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleEdit = (category) => {
    if (category.isDefault) {
      toast.error('Não é possível editar categorias padrão');
      return;
    }
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleDelete = async (category) => {
    if (category.isDefault) {
      toast.error('Não é possível deletar categorias padrão');
      return;
    }

    if (!confirm(`Deseja realmente deletar a categoria "${category.nome}"?`)) return;

    try {
      await categoryService.delete(category.id);
      toast.success('Categoria deletada com sucesso');
      loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao deletar categoria');
    }
  };

  const filteredCategories = categories.filter((cat) => {
    if (filter === 'all') return true;
    return cat.tipo === filter;
  });

  const categoriesByType = {
    receita: filteredCategories.filter((cat) => cat.tipo === 'receita'),
    despesa: filteredCategories.filter((cat) => cat.tipo === 'despesa'),
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-600">Gerencie suas categorias de receitas e despesas</p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Nova Categoria
        </button>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas ({categories.length})
          </button>
          <button
            onClick={() => setFilter('receita')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'receita'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <TrendingUp className="h-4 w-4 inline mr-1" />
            Receitas ({categoriesByType.receita.length})
          </button>
          <button
            onClick={() => setFilter('despesa')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'despesa'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <TrendingDown className="h-4 w-4 inline mr-1" />
            Despesas ({categoriesByType.despesa.length})
          </button>
        </div>
      </div>

      {/* Lista de Categorias */}
      {filteredCategories.length === 0 ? (
        <div className="card text-center py-12">
          <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Nenhuma categoria encontrada</h3>
          <p className="text-gray-600 mt-2">Crie sua primeira categoria personalizada</p>
          <button onClick={handleCreate} className="btn-primary mt-4">
            <Plus className="h-5 w-5 mr-2 inline" />
            Criar Categoria
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Categorias de Receita */}
          {(filter === 'all' || filter === 'receita') && categoriesByType.receita.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Receitas
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {categoriesByType.receita.map((category) => (
                  <div
                    key={category.id}
                    className="card hover:shadow-md transition-all cursor-pointer group relative"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-3"
                        style={{ backgroundColor: `${category.cor}20` }}
                      >
                        {category.icone || '💰'}
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {category.nome}
                      </h4>
                      {category.isDefault && (
                        <span className="text-xs text-gray-500 mt-1">Padrão</span>
                      )}
                    </div>

                    {!category.isDefault && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(category);
                          }}
                          className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-gray-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(category);
                          }}
                          className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categorias de Despesa */}
          {(filter === 'all' || filter === 'despesa') && categoriesByType.despesa.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
                Despesas
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {categoriesByType.despesa.map((category) => (
                  <div
                    key={category.id}
                    className="card hover:shadow-md transition-all cursor-pointer group relative"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-3"
                        style={{ backgroundColor: `${category.cor}20` }}
                      >
                        {category.icone || '💰'}
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {category.nome}
                      </h4>
                      {category.isDefault && (
                        <span className="text-xs text-gray-500 mt-1">Padrão</span>
                      )}
                    </div>

                    {!category.isDefault && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(category);
                          }}
                          className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-gray-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(category);
                          }}
                          className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Informação */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <Tag className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Sobre as categorias</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                • As categorias <strong>padrão</strong> não podem ser editadas ou deletadas
              </p>
              <p className="mt-1">
                • Você pode criar <strong>categorias personalizadas</strong> para suas necessidades
              </p>
              <p className="mt-1">
                • Categorias com transações vinculadas não podem ser deletadas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        category={editingCategory}
        onSuccess={() => {
          loadCategories();
          setModalOpen(false);
        }}
      />
    </div>
  );
}