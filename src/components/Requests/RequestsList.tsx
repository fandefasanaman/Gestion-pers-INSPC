import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Movement } from '../../types';
import RequestForm from './RequestForm';

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

export default function RequestsList() {
  const { personnel } = useAuth();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMovements();
  }, [personnel]);

  const fetchMovements = async () => {
    if (!personnel) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('movements')
      .select(`
        *,
        personnel:personnel_id (*)
      `)
      .eq('personnel_id', personnel.id)
      .order('date_demande', { ascending: false });

    if (data && !error) {
      setMovements(data);
    }
    setLoading(false);
  };

  const filteredMovements = movements.filter(movement =>
    movementTypeLabels[movement.type].toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.motif.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mes Demandes</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Demande
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher une demande..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'Aucune demande trouvée' : 'Aucune demande pour le moment'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motif
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date demande
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMovements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {movementTypeLabels[movement.type]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(movement.date_debut).toLocaleDateString('fr-FR')} - 
                      {new Date(movement.date_fin).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 truncate block max-w-xs">
                        {movement.motif}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[movement.statut]}`}>
                        {statusLabels[movement.statut]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(movement.date_demande).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        {movement.statut === 'brouillon' && (
                          <>
                            <button className="p-1 text-gray-400 hover:text-purple-600">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <RequestForm
          onClose={() => setShowForm(false)}
          onSuccess={() => fetchMovements()}
        />
      )}
    </div>
  );
}