import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Pages/Dashboard';
import Movements from './components/Pages/Movements';
import Personnel from './components/Pages/Personnel';
import Validations from './components/Pages/Validations';
import Notifications from './components/Pages/Notifications';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'movements':
        return <Movements />;
      case 'personnel':
        return <Personnel />;
      case 'validations':
        return <Validations />;
      case 'reports':
        return <div className="p-8 text-center text-gray-500">Page des rapports en développement</div>;
      case 'services':
        return <div className="p-8 text-center text-gray-500">Page des services en développement</div>;
      case 'settings':
        return <div className="p-8 text-center text-gray-500">Page des paramètres en développement</div>;
      case 'notifications':
        return <Notifications />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;