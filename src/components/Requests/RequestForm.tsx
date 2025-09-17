import React, { useState } from 'react';
import { Save, Send, X } from 'lucide-react';
import { MovementType } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface RequestFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const movementTypes: { value: MovementType; label: string }[] = [
  { value: 'conge', label: 'Congé' },
  { value: 'mission', label: 'Mission' },
  { value: 'permission_absence', label: 'Permission d\'absence' },
  { value: 'autorisation_absence', label: 'Autorisation d\'absence' },
  { value: 'convalescence', label: 'Convalescence' },
  { value: 'hospitalise', label: 'Hospitalisé' },
  { value: 'formation', label: 'Formation' },
  { value: 'repos_maladie', label: 'Repos maladie' },
];

export default function RequestForm({ onClose, onSuccess }: RequestFormProps) {
  const { personnel } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'conge' as MovementType,
    date_debut: '',
    date_fin: '',
    motif: '',
    justification: ''
  });

  const handleSubmit = async (e: React.FormEvent, status: 'brouillon' | 'soumise') => {
    e.preventDefault();
    if (!personnel) return;

    setLoading(true);

    const { error } = await supabase.from('movements').insert({
      ...formData,
      personnel_id: personnel.id,
      statut: status,
      demande_par: personnel.id,
      date_demande: new Date().toISOString(),
      validation_hierarchie: { statut: 'en_attente' },
      validation_rh: { statut: 'en_attente' }
    });

    setLoading(false);

    if (!error) {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Nouvelle Demande de Mouvement
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de mouvement *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as MovementType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {movementTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début *
              </label>
              <input
                type="date"
                required
                value={formData.date_debut}
                onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin *
              </label>
              <input
                type="date"
                required
                value={formData.date_fin}
                onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motif *
            </label>
            <input
              type="text"
              required
              value={formData.motif}
              onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
              placeholder="Motif de la demande"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Justification
            </label>
            <textarea
              rows={4}
              value={formData.justification}
              onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
              placeholder="Détails supplémentaires..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'brouillon')}
              disabled={loading}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'soumise')}
              disabled={loading}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Soumettre
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}