import React from 'react';
import { 
  Home, 
  FileText, 
  CheckCircle, 
  Calendar, 
  BarChart3, 
  Users, 
  Settings,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { id: 'dashboard', name: 'Tableau de Bord', icon: Home, roles: ['personnel', 'chef_service', 'rh', 'admin'] },
  { id: 'requests', name: 'Mes Demandes', icon: FileText, roles: ['personnel', 'chef_service', 'rh', 'admin'] },
  { id: 'validations', name: 'Validations', icon: CheckCircle, roles: ['chef_service', 'rh', 'admin'] },
  { id: 'planning', name: 'Planning', icon: Calendar, roles: ['personnel', 'chef_service', 'rh', 'admin'] },
  { id: 'reports', name: 'Rapports', icon: BarChart3, roles: ['chef_service', 'rh', 'admin'] },
  { id: 'personnel', name: 'Personnel', icon: Users, roles: ['rh', 'admin'] },
  { id: 'settings', name: 'Paramètres', icon: Settings, roles: ['admin'] },
];

export default function Sidebar({ currentView, onViewChange, isOpen, onClose }: SidebarProps) {
  const { personnel } = useAuth();

  const canAccess = (roles: string[]) => {
    return personnel?.role && roles.includes(personnel.role);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          <span className="text-lg font-semibold text-gray-900">Menu</span>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {navigation.map((item) => {
            if (!canAccess(item.roles)) return null;
            
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  onClose();
                }}
                className={`
                  w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-purple-100 text-purple-900 border-r-2 border-purple-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className={`mr-3 w-5 h-5 ${isActive ? 'text-purple-600' : 'text-gray-500'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}