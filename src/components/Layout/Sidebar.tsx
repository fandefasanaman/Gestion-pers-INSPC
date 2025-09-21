import React from 'react';
import { 
  Home, 
  Users, 
  FileText, 
  CheckSquare, 
  BarChart3, 
  Settings, 
  Building,
  Bell,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: Home },
    { id: 'movements', label: 'Mes Mouvements', icon: FileText },
    { id: 'personnel', label: 'Personnel', icon: Users },
    ...(user?.role !== 'employee' ? [
      { id: 'validations', label: 'Validations', icon: CheckSquare },
      { id: 'reports', label: 'Rapports', icon: BarChart3 }
    ] : []),
    ...(user?.role === 'admin' ? [
      { id: 'services', label: 'Services', icon: Building },
      { id: 'settings', label: 'Paramètres', icon: Settings }
    ] : []),
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  return (
    <aside className="w-64 bg-white shadow-lg h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">INSPC</h1>
            <p className="text-sm text-gray-500">Gestion Personnel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500">{user?.position}</p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 text-gray-400" />
          <span className="text-sm">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;