import React from 'react';
import MainDashboard from './components/dashboard/MainDashboard';
import { Login } from './components/auth/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import './App.css';

// Componente Wrapper para lidar com o loading e verificar acesso
const AppContent = () => {
  const { user, loading, hasAccess } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0EB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C0392B]"></div>
      </div>
    );
  }

  // Se não estiver logado ou não tiver acesso, mostra o Login
  if (!user || !hasAccess) {
    return <Login />;
  }

  // Se passou pelas verificações, usuário logado e com acesso!
  return <MainDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="App">
          <AppContent />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;