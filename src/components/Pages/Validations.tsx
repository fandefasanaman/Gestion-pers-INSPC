import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  MessageSquare,
  Calendar,
  User,
  MapPin,
  AlertTriangle,
  Filter,
  Search
} from 'lucide-react';
import { useMovements } from '../../hooks/useMovements';
import { useAuth } from '../../contexts/AuthContext';
import { MovementRequest, MovementStatus } from '../../types';

const Validations: React.FC = () => {
  const { user } = useAuth();
  const { movements, loading, getPendingValidations, updateMovementStatus } = useMovements();
  const [selectedMovement, setSelectedMovement] = useState<MovementRequest | null>(null);
  const [validationComment, setValidationComment] = useState('');
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

  const pendingValidations = user ? getPendingValidations(user.id) : [];

  const getStatusLabel = (status: MovementStatus) => {
    switch (status) {
      case 'pending_service_chief':
        return 'En attente - Chef Service';
      case 'pending_hr':
        return 'En attente - RH';
      case 'pending_admin':
        return 'En attente - Admin';
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      default:
        return 'Inconnu';
    }
  };

  const getTypeLabel = (type: string) => {
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

  const handleValidation = async (movementId: string, action: 'approve' | 'reject') => {
    try {
      const newStatus: MovementStatus = action === 'approve' ? 'approved' : 'rejected';
      await updateMovementStatus(movementId, newStatus, validationComment);
      setSelectedMovement(null);
      setValidationComment('');
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
    }
  };

  const canValidate = (movement: MovementRequest) => {
    if (!user) return false;
    
    const currentValidation = movement.validations.find(v => 
      v.validatorId === user.id && v.status === 'pending'
    );
    
    return !!currentValidation;
  };

  const filteredMovements = pendingValidations.filter(movement => {
    const matchesSearch = 
      movement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
      (filter === 'pending' && movement.status.includes('pending')) ||
      (filter === 'urgent' && movement.urgency === 'high');
    
    return matchesSearch && matchesFilter;
  });

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
        <h1 className="text-2xl font-bold text-gray-900">Validations</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{pendingValidations.length} demande(s) en attente</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par titre, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'pending', label: 'En attente' },
              { id: 'urgent', label: 'Urgent' },
              { id: 'all', label: 'Tous' }
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
        </div>
      </div>

      {/* Validations List */}
      <div className="grid gap-4">
        {filteredMovements.map((movement) => (
          <div key={movement.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{movement.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(movement.urgency)}`}>
                    {movement.urgency === 'high' ? 'Urgent' : movement.urgency === 'medium' ? 'Normal' : 'Faible'}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    {getTypeLabel(movement.type)}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{movement.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Demandeur</p>
                      <p className="font-medium text-gray-900">Personnel #{movement.personnelId}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
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
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">Soumis le</p>
                      <p className="font-medium text-gray-900">
                        {new Date(movement.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>

                {movement.budgetEstimate && (
                  <div className="p-3 bg-gray-50 rounded-lg mb-4">
                    <p className="text-sm text-gray-600">
                      Budget estimé: <span className="font-medium">{movement.budgetEstimate.toLocaleString()} Ar</span>
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setSelectedMovement(movement)}
                  className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Examiner</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMovements.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune validation en attente</h3>
          <p className="text-gray-600">Toutes les demandes ont été traitées.</p>
        </div>
      )}

      {/* Validation Modal */}
      {selectedMovement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Validation de la demande</h2>
              <button
                onClick={() => setSelectedMovement(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">{selectedMovement.title}</h3>
                <p className="text-blue-800">{selectedMovement.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-2 font-medium">{getTypeLabel(selectedMovement.type)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Urgence:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(selectedMovement.urgency)}`}>
                    {selectedMovement.urgency === 'high' ? 'Urgent' : selectedMovement.urgency === 'medium' ? 'Normal' : 'Faible'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Date début:</span>
                  <span className="ml-2 font-medium">{new Date(selectedMovement.startDate).toLocaleDateString('fr-FR')}</span>
                </div>
                <div>
                  <span className="text-gray-500">Date fin:</span>
                  <span className="ml-2 font-medium">{new Date(selectedMovement.endDate).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              {selectedMovement.destination && (
                <div>
                  <span className="text-gray-500">Destination:</span>
                  <span className="ml-2 font-medium">{selectedMovement.destination}</span>
                </div>
              )}

              {selectedMovement.budgetEstimate && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <span className="text-yellow-800 font-medium">
                    Budget estimé: {selectedMovement.budgetEstimate.toLocaleString()} Ar
                  </span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaire de validation
                </label>
                <textarea
                  value={validationComment}
                  onChange={(e) => setValidationComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ajoutez un commentaire sur votre décision..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedMovement(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleValidation(selectedMovement.id, 'reject')}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Rejeter</span>
                </button>
                <button
                  onClick={() => handleValidation(selectedMovement.id, 'approve')}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approuver</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Validations;