import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Tag,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { getInitials } from '../../utils';

console.log('🟢 LAYOUT NOVO CARREGADO!');

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/contas', icon: Wallet, label: 'Contas' },
  { path: '/transacoes', icon: ArrowLeftRight, label: 'Transações' },
  { path: '/categorias', icon: Tag, label: 'Categorias' },
  { path: '/configuracoes', icon: Settings, label: 'Configurações' },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
   
      {/* MENU DESKTOP - SÓ >= 1024px */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          
          <div className="flex items-center flex-shrink-0 px-6 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">+</span>
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">Gestão</span>
          </div>

          <nav className="flex-1 px-3 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-semibold text-sm">{getInitials(user?.nome)}</span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.nome}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button onClick={handleLogout} className="ml-2 p-2 text-gray-400 hover:text-red-600 rounded-lg">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MENU MOBILE */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex flex-col max-w-xs w-full h-full bg-white shadow-xl">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button onClick={() => setSidebarOpen(false)} className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-gray-900 bg-opacity-30">
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center px-4 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">+</span>
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">Gestão</span>
              </div>
              <nav className="px-2 space-y-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center px-3 py-3 text-base font-medium rounded-lg ${
                        isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`mr-3 h-6 w-6 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center w-full">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-semibold text-sm">{getInitials(user?.nome)}</span>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.nome}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button onClick={() => { setSidebarOpen(false); handleLogout(); }} className="ml-2 p-2 text-gray-400 hover:text-red-600 rounded-lg">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO */}
      <div className="lg:pl-64">
        <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-gray-500 hover:text-gray-900">
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">+</span>
              </div>
              <span className="ml-2 text-lg font-bold text-gray-900">Gestão</span>
            </div>
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 font-semibold text-xs">{getInitials(user?.nome)}</span>
            </div>
          </div>
        </div>
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}