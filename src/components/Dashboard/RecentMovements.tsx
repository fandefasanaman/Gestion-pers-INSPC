import React from 'react';
import { Clock, User } from 'lucide-react';
import { Movement } from '../../types';

interface RecentMovementsProps {
  movements: Movement[];
}

const statusColors = {
  brouillon: 'bg-gray-100 text-gray-800',
  soumise: 'bg-blue-100 text-blue-800',
  en_cours: 'bg-yellow-100 text-yellow-800',
  approuvee: 'bg-green-100 text-green-800',
  rejetee: 'bg-red-100 text-red-800',
};

const statusLabels = {
  brouillon: 'Brouillon',
  soumise: 'Soumise',
  en_cours: 'En cours',
  approuvee: 'Approuvée',
  rejetee: 'Rejetée',
};

const movementTypeLabels = {
  conge: 'Congé',
  mission: 'Mission',
  permission_absence: 'Permission d\'absence',
  autorisation_absence: 'Autorisation d\'absence',
  convalescence: 'Convalescence',
  hospitalise: 'Hospitalisé',
  formation: 'Formation',
  repos_maladie: 'Repos maladie',
};

export default function RecentMovements({ movements }: RecentMovementsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Mouvements Récents</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {movements.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Aucun mouvement récent
          </div>
        ) : (
          movements.slice(0, 5).map((movement) => (
            <div key={movement.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {movementTypeLabels[movement.type]}
                    </p>
                    <p className="text-xs text-gray-500">
                      {movement.personnel?.prenoms} {movement.personnel?.nom}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[movement.statut]}`}>
                    {statusLabels[movement.statut]}
                  </span>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(movement.date_demande).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}