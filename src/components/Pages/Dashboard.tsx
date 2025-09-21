import React from 'react';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  Calendar,
  AlertTriangle
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    {
      label: 'Total Mouvements',
      value: '156',
      change: '+12%',
      changeType: 'positive',
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      label: 'En Attente',
      value: '23',
      change: '+5',
      changeType: 'neutral',
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      label: 'Approuvés',
      value: '108',
      change: '+8%',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      label: 'Personnel Actif',
      value: '245',
      change: '+2',
      changeType: 'positive',
      icon: Users,
      color: 'bg-teal-500'
    }
  ];

  const recentMovements = [
    {
      id: '1',
      employee: 'Hery RASOLOFO',
      type: 'Congé annuel',
      status: 'pending',
      date: '2024-03-15',
      service: 'Service Médical'
    },
    {
      id: '2',
      employee: 'Marie RAKOTO',
      type: 'Mission',
      status: 'approved',
      date: '2024-03-18',
      service: 'Administration'
    },
    {
      id: '3',
      employee: 'Jean ANDRIANO',
      type: 'Formation',
      status: 'pending',
      date: '2024-03-20',
      service: 'Service Médical'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approuvé';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Rejeté';
      default:
        return 'Inconnu';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm ${
                      stat.changeType === 'positive' 
                        ? 'text-green-600' 
                        : stat.changeType === 'negative'
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}>
                      {stat.change} ce mois
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Movements */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Mouvements Récents</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentMovements.map((movement) => (
                <div key={movement.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{movement.employee}</h3>
                    <p className="text-sm text-gray-600">{movement.type} • {movement.service}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(movement.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(movement.status)}`}>
                    {getStatusLabel(movement.status)}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
              Voir tous les mouvements →
            </button>
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Actions Rapides</h2>
            </div>
            <div className="p-6 space-y-3">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-medium">
                + Nouvelle Demande
              </button>
              <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-lg transition-colors font-medium">
                Voir les Validations
              </button>
              <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-lg transition-colors font-medium">
                Générer Rapport
              </button>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Alertes</h2>
            </div>
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">3 validations en attente</h3>
                    <p className="text-xs text-yellow-600 mt-1">Depuis plus de 2 jours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;