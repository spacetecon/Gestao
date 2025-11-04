import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import useAuthStore from './store/authStore';
import Layout from './components/layout/layout';
import Login from './pages/login';
import Register from './pages/register';
import Dashboard from './pages/dashboard';
import Contas from './pages/contas';
import Transacoes from './pages/Transacoes';
import Categorias from './pages/Categorias';
import Configuracoes from './pages/Configuracoes';
import './index.css';
function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Rotas Públicas */}
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/register"
          element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />}
        />

        {/* Rotas Protegidas */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Layout>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        <Route
          path="/contas"
          element={
            isAuthenticated ? (
              <Layout>
                <Contas />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        <Route
          path="/transacoes"
          element={
            isAuthenticated ? (
              <Layout>
                <Transacoes />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        <Route
          path="/categorias"
          element={
            isAuthenticated ? (
              <Layout>
                <Categorias />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        <Route
          path="/configuracoes"
          element={
            isAuthenticated ? (
              <Layout>
                <Configuracoes />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Redirecionar raiz para dashboard ou login */}
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900">404</h1>
                <p className="text-xl text-gray-600 mt-4">Página não encontrada</p>
                <a href="/dashboard" className="btn-primary mt-6 inline-block">
                  Voltar ao Dashboard
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;