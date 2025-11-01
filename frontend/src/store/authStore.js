import { create } from 'zustand';
import { authService } from '../services/api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  // Login
  login: async (credentials) => {
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
