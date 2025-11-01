import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '../store/authStore';

const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmarSenha: z.string(),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
});

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await register(data);
    setIsLoading(false);

    if (result.success) {
      toast.success('Conta criada com sucesso!');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Erro ao criar conta');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo e Título */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-3xl">+</span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Crie sua conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Comece a gerenciar suas finanças gratuitamente
          </p>
        </div>

        {/* Formulário */}
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Nome */}
            <div>
              <label htmlFor="nome" className="label">
                Nome completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...registerField('nome')}
                  type="text"
                  id="nome"
                  className="input pl-10"
                  placeholder="João Silva"
                  autoComplete="name"
                />
              </div>
              {errors.nome && (
                <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
              )}
            </div>

            {/* E-mail */}
            <div>
              <label htmlFor="email" className="label">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...registerField('email')}
                  type="email"
                  id="email"
                  className="input pl-10"
                  placeholder="seu@email.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="senha" className="label">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...registerField('senha')}
                  type="password"
                  id="senha"
                  className="input pl-10"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              {errors.senha && (
                <p className="mt-1 text-sm text-red-600">{errors.senha.message}</p>
              )}
            </div>

            {/* Confirmar Senha */}
            <div>
              <label htmlFor="confirmarSenha" className="label">
                Confirmar senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...registerField('confirmarSenha')}
                  type="password"
                  id="confirmarSenha"
                  className="input pl-10"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmarSenha && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmarSenha.message}</p>
              )}
            </div>

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus className="-ml-1 mr-2 h-5 w-5" />
                  Criar conta
                </>
              )}
            </button>
          </form>

          {/* Link para login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          © 2025 +Gestão. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
