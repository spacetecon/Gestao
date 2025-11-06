import { create } from 'zustand';
import { authService } from '../services/api';

const isPublicMode = import.meta.env.VITE_PUBLIC_MODE === 'true';

const demoUser = {
  id: 'demo-user',
  nome: 'Usuário Demo',
  email: 'demo@demo.com',
  loja: { id: 'demo-loja', nome: 'Loja Demo' },
  cargo: 'Administrador',
};

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || (isPublicMode ? demoUser : null),
  token: localStorage.getItem('token') || (isPublicMode ? 'demo-token' : null),
  isAuthenticated: !!localStorage.getItem('token') || isPublicMode,
  isLoading: false,
  error: null,

  // Login
  login: async (credentials) => {
    if (isPublicMode) {
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('user', JSON.stringify(demoUser));
      set({
        user: demoUser,
        token: 'demo-token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return { success: true, demo: true };
    }

    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials);
      const { usuario, token } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));
      
      set({
        user: usuario,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao fazer login';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Registro
  register: async (data) => {
    if (isPublicMode) {
      return { success: false, error: 'Registro desativado no modo público.' };
    }

    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(data);
      const { usuario, token } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));
      
      set({
        user: usuario,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao criar conta';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Logout
  logout: () => {
    if (isPublicMode) return; // impede logout no modo público
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  // Atualizar perfil
  updateUser: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData });
  },

  // Limpar erro
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
