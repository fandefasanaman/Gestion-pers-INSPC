import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  FileText, 
  Upload, 
  AlertCircle,
  Save,
  Send
} from 'lucide-react';
import { MovementType, MovementRequest } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useMovements } from '../../hooks/useMovements';

interface MovementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (movement: MovementRequest) => void;
}

const MovementForm: React.FC<MovementFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const { user } = useAuth();
  const { createMovement } = useMovements();
  
  const [formData, setFormData] = useState({
    type: 'leave' as MovementType,
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    destination: '',
    urgency: 'medium' as 'low' | 'medium' | 'high',
    budgetEstimate: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);

  const movementTypes = [
    { value: 'leave', label: 'Congé annuel', requiresDestination: false },
    { value: 'sick_leave', label: 'Congé maladie', requiresDestination: false },
    { value: 'maternity_leave', label: 'Congé maternité', requiresDestination: false },
    { value: 'mission', label: 'Mission', requiresDestination: true },
    { value: 'training', label: 'Formation', requiresDestination: true },
    { value: 'transfer', label: 'Mutation', requiresDestination: true },
    { value: 'delegation', label: 'Délégation', requiresDestination: true },
    { value: 'other', label: 'Autre', requiresDestination: false }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La description est obligatoire';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'La date de début est obligatoire';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'La date de fin est obligatoire';
    }
    
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'La date de fin doit être postérieure à la date de début';
    }
    
    const selectedType = movementTypes.find(t => t.value === formData.type);
    if (selectedType?.requiresDestination && !formData.destination.trim()) {
      newErrors.destination = 'La destination est obligatoire pour ce type de mouvement';
    }
    
    if (formData.budgetEstimate && isNaN(Number(formData.budgetEstimate))) {
      newErrors.budgetEstimate = 'Le budget doit être un nombre valide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    
    if (!isDraft && !validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const movementData = {
        personnelId: user!.id,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        destination: formData.destination || undefined,
        urgency: formData.urgency,
        budgetEstimate: formData.budgetEstimate ? Number(formData.budgetEstimate) : undefined,
        documents: [] // TODO: Handle file uploads
      };
      
      const newMovement = await createMovement(movementData);
      
      if (onSubmit) {
        onSubmit(newMovement);
      }
      
      onClose();
      
      // Reset form
      setFormData({
        type: 'leave',
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        destination: '',
        urgency: 'medium',
        budgetEstimate: ''
      });
      setDocuments([]);
      
    } catch (error) {
      console.error('Erreur lors de la création du mouvement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocuments(prev => [...prev, ...files]);
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  const selectedType = movementTypes.find(t => t.value === formData.type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Nouvelle Demande de Mouvement</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 space-y-6">
          {/* Type de mouvement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de mouvement *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as MovementType }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {movementTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ex: Congé annuel été 2024"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Décrivez le motif et les détails de votre demande..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.startDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.startDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.endDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Destination (conditionnelle) */}
          {selectedType?.requiresDestination && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.destination ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Antananarivo, Toamasina..."
                />
              </div>
              {errors.destination && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.destination}
                </p>
              )}
            </div>
          )}

          {/* Urgence et Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau d'urgence
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value as 'low' | 'medium' | 'high' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="low">Faible</option>
                <option value="medium">Normal</option>
                <option value="high">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget estimé (Ar)
              </label>
              <input
                type="number"
                value={formData.budgetEstimate}
                onChange={(e) => setFormData(prev => ({ ...prev, budgetEstimate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.budgetEstimate ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.budgetEstimate && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.budgetEstimate}
                </p>
              )}
            </div>
          </div>

          {/* Documents */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documents justificatifs
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Cliquez pour ajouter des fichiers ou glissez-déposez
                </span>
                <span className="text-xs text-gray-500">
                  PDF, DOC, DOCX, JPG, PNG (max 10MB par fichier)
                </span>
              </label>
            </div>

            {documents.length > 0 && (
              <div className="mt-3 space-y-2">
                {documents.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Sauvegarder brouillon</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Soumettre</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovementForm;