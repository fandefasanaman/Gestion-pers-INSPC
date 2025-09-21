import React, { useState } from 'react';
import { 
  Plus, 
  Filter, 
  Download, 
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useMovements } from '../../hooks/useMovements';
import { useAuth } from '../../contexts/AuthContext';
import { MovementType } from '../../types';
import MovementForm from '../Forms/MovementForm';

const Movements: React.FC = () => {
  const { user } = useAuth();
  const { movements, loading, getMovementsByUser } = useMovements();
  const [showNewMovementForm, setShowNewMovementForm] = useState(false);
  const [filter, setFilter] = useState('all');

  const userMovements = user ? getMovementsByUser(user.id) : [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending_service_chief':
      case 'pending_hr':
      case 'pending_admin':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      case 'pending_service_chief':
        return 'En attente - Chef Service';
      case 'pending_hr':
        return 'En attente - RH';
      case 'pending_admin':
        return 'En attente - Admin';
      case 'submitted':
        return 'Soumis';
      default:
        return 'Inconnu';
    }
  };

  const getTypeLabel = (type: MovementType) => {
    switch (type) {
      case 'leave':
        return 'Congé';
      case 'mission':
        return 'Mission';
      case 'training':
        return 'Formation';
      case 'transfer':
        return 'Mutation';
      case 'delegation':
        return 'Délégation';
      case 'sick_leave':
        return 'Congé Maladie';
      case 'maternity_leave':
        return 'Congé Maternité';
      default:
        return 'Autre';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mes Mouvements</h1>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filtrer</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
          <button 
            onClick={() => setShowNewMovementForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Demande</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'all', label: 'Tous' },
          { id: 'pending', label: 'En attente' },
          { id: 'approved', label: 'Approuvés' },
          { id: 'rejected', label: 'Rejetés' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Movements List */}
      <div className="grid gap-4">
        {userMovements.map((movement) => (
          <div key={movement.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{movement.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(movement.urgency)}`}>
                    {movement.urgency === 'high' ? 'Urgent' : movement.urgency === 'medium' ? 'Normal' : 'Faible'}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{movement.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Type</p>
                      <p className="font-medium text-gray-900">{getTypeLabel(movement.type)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Période</p>
                      <p className="font-medium text-gray-900">
                        {new Date(movement.startDate).toLocaleDateString('fr-FR')} - {new Date(movement.endDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  
                  {movement.destination && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Destination</p>
                        <p className="font-medium text-gray-900">{movement.destination}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(movement.status)}
                    <div>
                      <p className="text-gray-500">Statut</p>
                      <p className="font-medium text-gray-900">{getStatusLabel(movement.status)}</p>
                    </div>
                  </div>
                </div>
                
                {movement.budgetEstimate && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Budget estimé: <span className="font-medium">{movement.budgetEstimate.toLocaleString()} Ar</span></p>
                  </div>
                )}
              </div>
              
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Voir détails →
              </button>
            </div>
          </div>
        ))}
      </div>

      {userMovements.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun mouvement trouvé</h3>
          <p className="text-gray-600 mb-6">Vous n'avez pas encore créé de demande de mouvement.</p>
          <button 
            onClick={() => setShowNewMovementForm(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Créer une demande</span>
          </button>
        </div>
      )}

      {/* Movement Form Modal */}
      <MovementForm
        isOpen={showNewMovementForm}
        onClose={() => setShowNewMovementForm(false)}
        onSubmit={() => {
          // Refresh movements list or show success message
          console.log('Movement created successfully');
        }}
      />
    </div>
  );
};

export default Movements;