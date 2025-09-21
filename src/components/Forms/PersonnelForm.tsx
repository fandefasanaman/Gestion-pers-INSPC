import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Calendar,
  MapPin,
  Building,
  Save,
  AlertCircle,
  CreditCard,
  Briefcase,
  Hash,
  Users,
  CheckCircle,
  Phone
} from 'lucide-react';
import { UserRole } from '../../types';
import { db } from '../../lib/firebase';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';

interface PersonnelFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (personnel: any) => void;
  editData?: any;
}

const PersonnelForm: React.FC<PersonnelFormProps> = ({ isOpen, onClose, onSubmit, editData }) => {
  const [formData, setFormData] = useState({
    numero: '',
    nom: '',
    prenoms: '',
    im: '',
    dateNaissance: '',
    lieuNaissance: '',
    telephone: '',
    cin: '',
    dateCIN: '',
    lieuCIN: '',
    corps: '',
    grade: '',
    indice: '',
    imputationBudgetaire: '00-71-9-110-00000',
    dateEntreeAdmin: '',
    fonction: '',
    dateEntreeINSPC: '',
    service: '',
    email: '',
    statut: 'actif'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Corps INSPC exhaustif
  const corpsOptions = [
    { value: 'medecin_cat8', label: 'Médecin DE de la CAT VIII' },
    { value: 'medecin_cat9', label: 'Médecin DE de la CAT IX' },
    { value: 'realisateur_adj', label: 'Réalisateur Adjoint' },
    { value: 'concepteur', label: 'Concepteur' },
    { value: 'physicien_cat9', label: 'Physicien contractuel de la CAT IX' },
    { value: 'technicien_sup', label: 'Technicien Supérieur' },
    { value: 'realisateur', label: 'Réalisateur' },
    { value: 'sous_operateur', label: 'Sous Opérateur' },
    { value: 'employe_service', label: 'Employé de Service' },
    { value: 'operateur', label: 'Opérateur' },
    { value: 'encadreur', label: 'Encadreur' },
    { value: 'chauffeur', label: 'Chauffeur' },
    { value: 'chargee_etudes_cat7', label: 'Chargée d\'études de la CAT VII' },
    { value: 'ecd', label: 'ECD (Emploi Contractuel Décentralisé)' },
    { value: 'eld', label: 'ELD (Emploi Local de Développement)' }
  ];

  // Grades selon le corps
  const gradesByCorps: Record<string, { value: string; label: string }[]> = {
    medecin_cat8: [
      { value: 'stagiaire', label: 'Stagiaire' },
      { value: '2/1', label: '2/1' },
      { value: 'P/2', label: 'P/2' },
      { value: 'PCE/1', label: 'PCE/1' }
    ],
    medecin_cat9: [
      { value: 'stagiaire', label: 'Stagiaire' },
      { value: '2/1', label: '2/1' },
      { value: 'P/2', label: 'P/2' },
      { value: 'PCE/1', label: 'PCE/1' },
      { value: 'HCE/1', label: 'HCE/1' }
    ],
    technicien_sup: [
      { value: 'stagiaire', label: 'Stagiaire' },
      { value: '2/1', label: '2/1' },
      { value: 'P/2', label: 'P/2' },
      { value: 'PCE/1', label: 'PCE/1' }
    ],
    // Grades par défaut pour les autres corps
    default: [
      { value: 'stagiaire', label: 'Stagiaire' },
      { value: '2/1', label: '2/1' },
      { value: 'P/2', label: 'P/2' },
      { value: 'PCE/1', label: 'PCE/1' }
    ]
  };

  // Services INSPC
  const servicesINSPC = [
    // Directions
    { value: 'dg', label: 'Direction Générale (DG)' },
    { value: 'daaf', label: 'Direction des Affaires Administratives et Financières (DAAF)' },
    { value: 'dfr', label: 'Direction Formation et Recherche (DFR)' },
    // Services
    { value: 'sps', label: 'Service Pédagogique et Scientifique (SPS)' },
    { value: 'sf', label: 'Service Financier (SF)' },
    { value: 'sa', label: 'Service Administratif (SA)' },
    { value: 'sdoc', label: 'Service Documentation (SDoc)' },
    // Unités
    { value: 'unite_echographie', label: 'Unité d\'Échographie' },
    { value: 'unite_acupuncture', label: 'Unité d\'Acupuncture' }
  ];

  // Fonction pour formater l'IM (remplacer virgule par espace)
  const formatIM = (im: string) => {
    if (!im) return '';
    return im.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
  };

  // Auto-génération du numéro séquentiel et chargement des données
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // Mode édition - charger les données existantes
        console.log('Mode édition - Données reçues:', editData);
        setFormData({
          numero: editData.registrationNumber || '',
          nom: editData.lastName || '',
          prenoms: editData.firstName || '',
          im: formatIM(editData.registrationNumber || ''),
          dateNaissance: editData.joinDate ? editData.joinDate.split('T')[0] : '',
          lieuNaissance: editData.lieu || '',
          telephone: editData.phone || '',
          cin: editData.cin || '',
          dateCIN: editData.dateCin ? editData.dateCin.split('T')[0] : '',
          lieuCIN: editData.lieuCin || '',
          corps: editData.corps || '',
          grade: editData.grade || '',
          indice: editData.indice ? editData.indice.toString() : '',
          imputationBudgetaire: '00-71-9-110-00000',
          dateEntreeAdmin: editData.dateEntreeAdmin ? editData.dateEntreeAdmin.split('T')[0] : '',
          fonction: editData.position || '',
          dateEntreeINSPC: editData.joinDate ? editData.joinDate.split('T')[0] : '',
          service: getServiceCode(editData.service) || '',
          email: editData.email || '',
          statut: editData.isActive ? 'actif' : 'inactif'
        });
      } else {
        // Mode création - générer un nouveau numéro
        const nextNumber = Math.floor(Math.random() * 1000) + 1;
        setFormData(prev => ({ ...prev, numero: nextNumber.toString().padStart(3, '0') }));
      }
    }
  }, [isOpen, editData]);

  // Fonction pour convertir le label de service en code
  const getServiceCode = (serviceLabel: string) => {
    const serviceMap: Record<string, string> = {
      'Direction Générale (DG)': 'dg',
      'Direction des Affaires Administratives et Financières (DAAF)': 'daaf',
      'Direction Formation et Recherche (DFR)': 'dfr',
      'Service Pédagogique et Scientifique (SPS)': 'sps',
      'Service Financier (SF)': 'sf',
      'Service Administratif (SA)': 'sa',
      'Service Documentation (SDoc)': 'sdoc',
      'Unité d\'Échographie': 'unite_echographie',
      'Unité d\'Acupuncture': 'unite_acupuncture'
    };
    return serviceMap[serviceLabel];
  };

  // Auto-génération de l'email (optionnelle, peut être modifiée manuellement)
  const generateEmail = () => {
    if (formData.prenoms && formData.nom) {
      const prenomFormatted = formData.prenoms.toLowerCase().split(' ')[0];
      const nomFormatted = formData.nom.toLowerCase();
      const email = `${prenomFormatted}.${nomFormatted}@inspc.mg`;
      setFormData(prev => ({ ...prev, email }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validations obligatoires
    if (!formData.numero.trim()) newErrors.numero = 'Le numéro est obligatoire';
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est obligatoire';
    if (!formData.prenoms.trim()) newErrors.prenoms = 'Les prénoms sont obligatoires';
    if (!formData.im.trim()) newErrors.im = 'L\'IM est obligatoire';
    if (!formData.dateNaissance) newErrors.dateNaissance = 'La date de naissance est obligatoire';
    if (!formData.lieuNaissance.trim()) newErrors.lieuNaissance = 'Le lieu de naissance est obligatoire';
    if (!formData.cin.trim()) newErrors.cin = 'Le CIN est obligatoire';
    if (!formData.corps) newErrors.corps = 'Le corps est obligatoire';
    if (!formData.grade) newErrors.grade = 'Le grade est obligatoire';
    if (!formData.indice.trim()) newErrors.indice = 'L\'indice est obligatoire';
    if (!formData.fonction.trim()) newErrors.fonction = 'La fonction est obligatoire';
    if (!formData.dateEntreeINSPC) newErrors.dateEntreeINSPC = 'La date d\'entrée INSPC est obligatoire';
    if (!formData.service) newErrors.service = 'Le service est obligatoire';
    if (!formData.email.trim()) newErrors.email = 'L\'email est obligatoire';

    // Validation format email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Validation format téléphone
    if (formData.telephone && !/^\+261\s?\d{2}\s?\d{2}\s?\d{3}\s?\d{2}$/.test(formData.telephone)) {
      newErrors.telephone = 'Format téléphone invalide (+261 XX XX XXX XX)';
    }

    // Validation CIN format malgache (12 chiffres)
    if (formData.cin && !/^\d{3}\s?\d{3}\s?\d{3}\s?\d{3}$/.test(formData.cin)) {
      newErrors.cin = 'Format CIN invalide (XXX XXX XXX XXX)';
    }

    // Validation indice numérique
    if (formData.indice && (isNaN(Number(formData.indice)) || Number(formData.indice) < 0)) {
      newErrors.indice = 'L\'indice doit être un nombre positif';
    }

    // Validation cohérence des dates
    if (formData.dateNaissance && formData.dateEntreeAdmin) {
      const naissance = new Date(formData.dateNaissance);
      const entreeAdmin = new Date(formData.dateEntreeAdmin);
      if (naissance >= entreeAdmin) {
        newErrors.dateEntreeAdmin = 'La date d\'entrée doit être postérieure à la naissance';
      }
    }

    if (formData.dateEntreeAdmin && formData.dateEntreeINSPC) {
      const entreeAdmin = new Date(formData.dateEntreeAdmin);
      const entreeINSPC = new Date(formData.dateEntreeINSPC);
      if (entreeAdmin > entreeINSPC) {
        newErrors.dateEntreeINSPC = 'La date d\'entrée INSPC doit être postérieure à l\'entrée administration';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setShowSuccessMessage(false);
    
    try {
      // Préparer toutes les données pour la sauvegarde
      const personnelData = {
        numero: formData.numero, // Inclure le numéro dans la sauvegarde
        nom: formData.nom.toUpperCase(),
        prenoms: formData.prenoms,
        im: formatIM(formData.im),
        date_naissance: formData.dateNaissance,
        lieu: formData.lieuNaissance,
        telephone: formData.telephone,
        cin: formData.cin,
        date_cin: formData.dateCIN || null,
        lieu_cin: formData.lieuCIN,
        corps: formData.corps,
        grade: formData.grade,
        indice: Number(formData.indice),
        imputation_budgetaire: formData.imputationBudgetaire,
        date_entree_admin: formData.dateEntreeAdmin || null,
        fonction: formData.fonction,
        date_entree_inspc: formData.dateEntreeINSPC,
        service: formData.service,
        email: formData.email,
        actif: formData.statut === 'actif',
        updated_at: new Date()
      };
      
      if (editData && editData.id) {
        // Mode édition - Mettre à jour TOUS les champs
        const docRef = doc(db, 'personnel', editData.id);
        await updateDoc(docRef, personnelData);
        
        setSuccessMessage('Personnel modifié avec succès !');
        console.log(`✅ Personnel ${formData.nom} ${formData.prenoms} mis à jour avec succès`);
      } else {
        // Mode création - Créer un nouveau document avec TOUS les champs
        const newPersonnelData = {
          ...personnelData,
          created_at: new Date()
        };
        
        await addDoc(collection(db, 'personnel'), newPersonnelData);
        
        setSuccessMessage('Personnel créé avec succès !');
        console.log(`✅ Personnel ${formData.nom} ${formData.prenoms} créé avec succès`);
      }
      
      // Afficher le message de succès
      setShowSuccessMessage(true);
      
      // Notifier le parent du succès
      if (onSubmit) {
        onSubmit(personnelData);
      }
      
      // Fermer le modal après un délai
      setTimeout(() => {
        setShowSuccessMessage(false);
        onClose();
        resetForm();
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du personnel:', error);
      
      // Gestion des erreurs spécifiques
      let errorMessage = 'Erreur lors de la sauvegarde';
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          errorMessage = 'Permissions insuffisantes. Vérifiez vos droits d\'accès.';
        } else if (error.message.includes('unauthenticated')) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else {
          errorMessage = `Erreur: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      numero: '',
      nom: '',
      prenoms: '',
      im: '',
      dateNaissance: '',
      lieuNaissance: '',
      telephone: '',
      cin: '',
      dateCIN: '',
      lieuCIN: '',
      corps: '',
      grade: '',
      indice: '',
      imputationBudgetaire: '00-71-9-110-00000',
      dateEntreeAdmin: '',
      fonction: '',
      dateEntreeINSPC: '',
      service: '',
      email: '',
      statut: 'actif'
    });
    setErrors({});
  };

  const handleCancel = () => {
    if (loading) return; // Empêcher la fermeture pendant la sauvegarde
    
    resetForm();
    onClose();
  };

  const availableGrades = gradesByCorps[formData.corps] || gradesByCorps.default;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto employee-modal">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-purple-700">
          <h2 className="text-xl font-semibold text-white">
            {editData ? 'Modifier Personnel INSPC' : 'Nouveau Personnel INSPC'}
          </h2>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="p-2 hover:bg-purple-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Message de succès */}
          {showSuccessMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-medium">{successMessage}</p>
                <p className="text-green-600 text-sm">Fermeture automatique dans quelques secondes...</p>
              </div>
            </div>
          )}

          {/* Section 1: Informations d'identification */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-t-lg">
              <h3 className="text-lg font-medium flex items-center">
                <Hash className="w-5 h-5 mr-2" />
                Informations d'identification
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    N° <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${
                      errors.numero ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="001"
                  />
                  {errors.numero && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.numero}
                    </p>
                  )}
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value.toUpperCase() }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${
                      errors.nom ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="RAKOTO"
                    style={{ textTransform: 'uppercase' }}
                  />
                  {errors.nom && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.nom}
                    </p>
                  )}
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénoms <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.prenoms}
                    onChange={(e) => setFormData(prev => ({ ...prev, prenoms: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${
                      errors.prenoms ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Jean Pierre"
                  />
                  {errors.prenoms && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.prenoms}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IM (Identité Matricule) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.im}
                    onChange={(e) => setFormData(prev => ({ ...prev, im: formatIM(e.target.value) }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${
                      errors.im ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="498 445"
                  />
                  {errors.im && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.im}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: État civil */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-t-lg">
              <h3 className="text-lg font-medium flex items-center">
                <User className="w-5 h-5 mr-2" />
                État civil
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de naissance <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      value={formData.dateNaissance}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateNaissance: e.target.value }))}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${
                        errors.dateNaissance ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.dateNaissance && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.dateNaissance}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lieu de naissance <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.lieuNaissance}
                      onChange={(e) => setFormData(prev => ({ ...prev, lieuNaissance: e.target.value }))}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${
                        errors.lieuNaissance ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Antananarivo"
                    />
                  </div>
                  {errors.lieuNaissance && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.lieuNaissance}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${
                        errors.telephone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="+261 XX XX XX XX"
                    />
                  </div>
                  {errors.telephone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.telephone}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CIN <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.cin}
                      onChange={(e) => setFormData(prev => ({ ...prev, cin: e.target.value }))}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${
                        errors.cin ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="101 234 567 890"
                    />
                  </div>
                  {errors.cin && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.cin}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date CIN
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      value={formData.dateCIN}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateCIN: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lieu CIN
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.lieuCIN}
                      onChange={(e) => setFormData(prev => ({ ...prev, lieuCIN: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                      placeholder="Antananarivo"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Informations professionnelles */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-t-lg">
              <h3 className="text-lg font-medium flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Informations professionnelles
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Corps <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.corps}
                    onChange={(e) => setFormData(prev => ({ ...prev, corps: e.target.value, grade: '' }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${
                      errors.corps ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Sélectionner un corps</option>
                    {corpsOptions.map((corps) => (
                      <option key={corps.value} value={corps.value}>{corps.label}</option>
                    ))}
                  </select>
                  {errors.corps && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.corps}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${
                      errors.grade ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={!formData.corps}
                  >
                    <option value="">Sélectionner un grade</option>
                    {availableGrades.map((grade) => (
                      <option key={grade.value} value={grade.value}>{grade.label}</option>
                    ))}
                  </select>
                  {errors.grade && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.grade}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Indice <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.indice}
                    onChange={(e) => setFormData(prev => ({ ...prev, indice: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${
                      errors.indice ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="1600"
                    min="0"
                  />
                  {errors.indice && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.indice}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imputation budgétaire
                  </label>
                  <input
                    type="text"
                    value={formData.imputationBudgetaire}
                    onChange={(e) => setFormData(prev => ({ ...prev, imputationBudgetaire: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                    placeholder="00-71-9-110-00000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date entrée administration
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      value={formData.dateEntreeAdmin}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateEntreeAdmin: e.target.value }))}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${
                        errors.dateEntreeAdmin ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.dateEntreeAdmin && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.dateEntreeAdmin}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Affectation INSPC */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-t-lg">
              <h3 className="text-lg font-medium flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Affectation INSPC
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fonction <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fonction}
                    onChange={(e) => setFormData(prev => ({ ...prev, fonction: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${
                      errors.fonction ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Équipe de recherche"
                  />
                  {errors.fonction && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.fonction}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date entrée INSPC <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      value={formData.dateEntreeINSPC}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateEntreeINSPC: e.target.value }))}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${
                        errors.dateEntreeINSPC ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.dateEntreeINSPC && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.dateEntreeINSPC}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value }))}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${
                        errors.service ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Sélectionner un service</option>
                      <optgroup label="Directions">
                        <option value="dg">Direction Générale (DG)</option>
                        <option value="daaf">Direction des Affaires Administratives et Financières (DAAF)</option>
                        <option value="dfr">Direction Formation et Recherche (DFR)</option>
                      </optgroup>
                      <optgroup label="Services">
                        <option value="sps">Service Pédagogique et Scientifique (SPS)</option>
                        <option value="sf">Service Financier (SF)</option>
                        <option value="sa">Service Administratif (SA)</option>
                        <option value="sdoc">Service Documentation (SDoc)</option>
                      </optgroup>
                      <optgroup label="Unités">
                        <option value="unite_echographie">Unité d'Échographie</option>
                        <option value="unite_acupuncture">Unité d'Acupuncture</option>
                      </optgroup>
                    </select>
                  </div>
                  {errors.service && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.service}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email professionnel <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="felix.alain@inspc.mg"
                    />
                    <button
                      type="button"
                      onClick={generateEmail}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                    >
                      Auto
                    </button>
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={formData.statut}
                      onChange={(e) => setFormData(prev => ({ ...prev, statut: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                    >
                      <option value="actif">Actif</option>
                      <option value="inactif">Inactif</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{editData ? 'Mettre à jour' : 'Enregistrer'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonnelForm;