import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Bell, Palette, Save, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../services/api';
import useAuthStore from '../store/authStore';
import { getInitials } from '../utils';

const profileSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
});

const passwordSchema = z.object({
  senhaAtual: z.string().min(6, 'Senha atual é obrigatória'),
  novaSenha: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
  confirmarNovaSenha: z.string(),
}).refine((data) => data.novaSenha === data.confirmarNovaSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarNovaSenha'],
});

export default function Configuracoes() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('perfil');
  const [theme, setTheme] = useState('light');

  // Form de perfil
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: errorsProfile, isSubmitting: isSubmittingProfile },
    reset: resetProfile,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nome: user?.nome || '',
      email: user?.email || '',
    },
  });

  // Form de senha
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword, isSubmitting: isSubmittingPassword },
    reset: resetPassword,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        nome: user.nome,
        email: user.email,
      });
    }
  }, [user, resetProfile]);

  const onSubmitProfile = async (data) => {
    try {
      const response = await authService.updateProfile(data);
      updateUser(response.data.data);
      toast.success('Perfil atualizado com sucesso');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar perfil');
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      await authService.changePassword({
        senhaAtual: data.senhaAtual,
        novaSenha: data.novaSenha,
      });
      toast.success('Senha alterada com sucesso');
      resetPassword();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao alterar senha');
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    toast.success(`Tema ${newTheme === 'light' ? 'claro' : 'escuro'} aplicado`);
    // Aqui você implementaria a lógica real do tema
  };

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'seguranca', label: 'Segurança', icon: Lock },
    { id: 'aparencia', label: 'Aparência', icon: Palette },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie suas preferências e conta</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de Tabs */}
        <div className="lg:col-span-1">
          <div className="card p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mr-3 ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Tab: Perfil */}
          {activeTab === 'perfil' && (
            <div className="space-y-6">
              <div className="card">
                <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-semibold text-2xl">
                      {getInitials(user?.nome)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user?.nome}</h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="nome" className="label">
                      Nome completo
                    </label>
                    <input
                      {...registerProfile('nome')}
                      type="text"
                      id="nome"
                      className="input"
                      placeholder="Seu nome"
                    />
                    {errorsProfile.nome && (
                      <p className="mt-1 text-sm text-red-600">{errorsProfile.nome.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="label">
                      E-mail
                    </label>
                    <input
                      {...registerProfile('email')}
                      type="email"
                      id="email"
                      className="input"
                      placeholder="seu@email.com"
                    />
                    {errorsProfile.email && (
                      <p className="mt-1 text-sm text-red-600">{errorsProfile.email.message}</p>
                    )}
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmittingProfile}
                      className="btn-primary flex items-center"
                    >
                      {isSubmittingProfile ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="-ml-1 mr-2 h-5 w-5" />
                          Salvar alterações
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Informações da Conta */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações da Conta</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Membro desde</span>
                    <span className="font-medium text-gray-900">
                      {new Date(user?.dataCadastro).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ID do usuário</span>
                    <span className="font-mono text-xs text-gray-500">{user?.id.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Segurança */}
          {activeTab === 'seguranca' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Alterar Senha</h3>
              <p className="text-sm text-gray-600 mb-6">
                Certifique-se de usar uma senha forte com no mínimo 6 caracteres.
              </p>

              <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                <div>
                  <label htmlFor="senhaAtual" className="label">
                    Senha atual
                  </label>
                  <input
                    {...registerPassword('senhaAtual')}
                    type="password"
                    id="senhaAtual"
                    className="input"
                    placeholder="••••••••"
                  />
                  {errorsPassword.senhaAtual && (
                    <p className="mt-1 text-sm text-red-600">{errorsPassword.senhaAtual.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="novaSenha" className="label">
                    Nova senha
                  </label>
                  <input
                    {...registerPassword('novaSenha')}
                    type="password"
                    id="novaSenha"
                    className="input"
                    placeholder="••••••••"
                  />
                  {errorsPassword.novaSenha && (
                    <p className="mt-1 text-sm text-red-600">{errorsPassword.novaSenha.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmarNovaSenha" className="label">
                    Confirmar nova senha
                  </label>
                  <input
                    {...registerPassword('confirmarNovaSenha')}
                    type="password"
                    id="confirmarNovaSenha"
                    className="input"
                    placeholder="••••••••"
                  />
                  {errorsPassword.confirmarNovaSenha && (
                    <p className="mt-1 text-sm text-red-600">{errorsPassword.confirmarNovaSenha.message}</p>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmittingPassword}
                    className="btn-primary flex items-center"
                  >
                    {isSubmittingPassword ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                        Alterando...
                      </>
                    ) : (
                      <>
                        <Lock className="-ml-1 mr-2 h-5 w-5" />
                        Alterar senha
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab: Aparência */}
          {activeTab === 'aparencia' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tema</h3>
              <p className="text-sm text-gray-600 mb-6">
                Escolha o tema de sua preferência para a interface.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tema Claro */}
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`relative p-4 border-2 rounded-lg transition-all ${
                    theme === 'light'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {theme === 'light' && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-5 w-5 text-primary-600" />
                    </div>
                  )}
                  <div className="bg-white rounded-lg p-4 shadow-sm mb-3">
                    <div className="h-2 w-16 bg-gray-200 rounded mb-2"></div>
                    <div className="h-2 w-full bg-gray-100 rounded mb-1"></div>
                    <div className="h-2 w-3/4 bg-gray-100 rounded"></div>
                  </div>
                  <p className="font-medium text-gray-900">Claro</p>
                  <p className="text-sm text-gray-500">Tema claro e limpo</p>
                </button>

                {/* Tema Escuro */}
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`relative p-4 border-2 rounded-lg transition-all ${
                    theme === 'dark'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {theme === 'dark' && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-5 w-5 text-primary-600" />
                    </div>
                  )}
                  <div className="bg-gray-900 rounded-lg p-4 shadow-sm mb-3">
                    <div className="h-2 w-16 bg-gray-700 rounded mb-2"></div>
                    <div className="h-2 w-full bg-gray-800 rounded mb-1"></div>
                    <div className="h-2 w-3/4 bg-gray-800 rounded"></div>
                  </div>
                  <p className="font-medium text-gray-900">Escuro</p>
                  <p className="text-sm text-gray-500">Reduz o cansaço visual</p>
                </button>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ O tema escuro será implementado em uma versão futura. Por enquanto, apenas o tema claro está disponível.
                </p>
              </div>
            </div>
          )}

          {/* Tab: Notificações */}
          {activeTab === 'notificacoes' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferências de Notificações</h3>
              <p className="text-sm text-gray-600 mb-6">
                Configure como você deseja receber notificações.
              </p>

              <div className="space-y-4">
                {/* Notificação 1 */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Transações</p>
                    <p className="text-sm text-gray-500">Receber notificações de novas transações</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {/* Notificação 2 */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Relatórios Mensais</p>
                    <p className="text-sm text-gray-500">Receber resumo mensal por e-mail</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {/* Notificação 3 */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Alertas de Gastos</p>
                    <p className="text-sm text-gray-500">Notificar quando ultrapassar orçamento</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {/* Notificação 4 */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Novidades e Atualizações</p>
                    <p className="text-sm text-gray-500">Receber novidades sobre o +Gestão</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 As notificações por e-mail e push serão implementadas em breve!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}