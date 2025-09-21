import React, { useState } from 'react';
import { useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Upload,
  Mail, 
  Phone,
  Building,
  UserCheck
} from 'lucide-react';
import PersonnelForm from '../Forms/PersonnelForm';
import PersonnelImport from '../Import/PersonnelImport';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// Supprimer l'import X qui manque
import { X } from 'lucide-react';

const Personnel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [showPersonnelForm, setShowPersonnelForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Charger les données personnel depuis Firebase
  const fetchPersonnel = async () => {
    try {
      setLoading(true);
      const personnelQuery = query(
        collection(db, 'personnel'),
        orderBy('nom', 'asc')
      );
      
      const querySnapshot = await getDocs(personnelQuery);
      const personnelData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          firstName: data.prenoms || '',
          lastName: data.nom || '',
          email: data.email || '',
          phone: data.telephone || '+261 XX XX XX XX',
          position: data.fonction || '',
          service: getServiceLabel(data.service) || 'Non défini',
          registrationNumber: data.im || '',
          role: data.role || 'employee',
          isActive: data.actif !== false,
          joinDate: data.date_entree_inspc || data.created_at || new Date().toISOString()
        };
      });
      
      setPersonnel(personnelData);
      console.log(`✅ ${personnelData.length} personnel(s) chargé(s) depuis Firebase`);
    } catch (error) {
      console.error('Erreur lors du chargement du personnel:', error);
      // En cas d'erreur, garder les données mockées comme fallback
      setPersonnel([
        {
          id: '1',
          firstName: 'Dr. Jean',
          lastName: 'ANDRIANO',
          email: 'jean.andriano@inspc.mg',
          phone: '+261 34 12 345 67',
          position: 'Chef de Service',
          service: 'Service Médical',
          registrationNumber: 'MED001',
          role: 'service_chief',
          isActive: true,
          joinDate: '2020-01-15'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant et lors des rafraîchissements
  useEffect(() => {
    fetchPersonnel();
  }, [refreshKey]);

  // Fonction pour rafraîchir les données
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Fonction pour gérer la fermeture de l'import avec rafraîchissement
  const handleImportClose = () => {
    setShowImportModal(false);
    // Rafraîchir les données après fermeture de l'import
    setTimeout(() => {
      handleRefresh();
    }, 500);
  };

  // Convertir les codes de service en labels lisibles
  const getServiceLabel = (serviceCode: string) => {
    const serviceMap: Record<string, string> = {
      // Directions
      'dg': 'Direction Générale (DG)',
      'daaf': 'Direction des Affaires Administratives et Financières (DAAF)',
      'dfr': 'Direction Formation et Recherche (DFR)',
      // Services
      'sps': 'Service Pédagogique et Scientifique (SPS)',
      'sf': 'Service Financier (SF)',
      'sa': 'Service Administratif (SA)',
      'sdoc': 'Service Documentation (SDoc)',
      // Unités
      'unite_echographie': 'Unité d\'Échographie',
      'unite_acupuncture': 'Unité d\'Acupuncture'
    };
    return serviceMap[serviceCode] || serviceCode;
  };

  const services = [
    // Directions
    'Direction Générale (DG)',
    'Direction des Affaires Administratives et Financières (DAAF)',
    'Direction Formation et Recherche (DFR)',
    // Services
    'Service Pédagogique et Scientifique (SPS)',
    'Service Financier (SF)',
    'Service Administratif (SA)',
    'Service Documentation (SDoc)',
    // Unités
    'Unité d\'Échographie',
    'Unité d\'Acupuncture'
  ];

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'hr':
        return 'Ressources Humaines';
      case 'service_chief':
        return 'Chef de Service';
      case 'employee':
        return 'Employé';
      default:
        return 'Inconnu';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'hr':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'service_chief':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'employee':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredPersonnel = personnel.filter(person => {
    const matchesSearch = 
      person.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesService = selectedService === 'all' || person.service === selectedService;
    
    return matchesSearch && matchesService;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Personnel</h1>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Users className="w-4 h-4" />
            <span>{loading ? 'Actualisation...' : 'Actualiser'}</span>
          </button>
          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import Excel</span>
          </button>
          <button 
            onClick={() => setShowPersonnelForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Personnel</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {loading && (
          <div className="mb-4 flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-gray-600">Chargement du personnel...</span>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, matricule..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">Tous les services</option>
              <optgroup label="Directions">
                <option value="Direction Générale (DG)">Direction Générale (DG)</option>
                <option value="Direction des Affaires Administratives et Financières (DAAF)">Direction des Affaires Administratives et Financières (DAAF)</option>
                <option value="Direction Formation et Recherche (DFR)">Direction Formation et Recherche (DFR)</option>
              </optgroup>
              <optgroup label="Services">
                <option value="Service Pédagogique et Scientifique (SPS)">Service Pédagogique et Scientifique (SPS)</option>
                <option value="Service Financier (SF)">Service Financier (SF)</option>
                <option value="Service Administratif (SA)">Service Administratif (SA)</option>
                <option value="Service Documentation (SDoc)">Service Documentation (SDoc)</option>
              </optgroup>
              <optgroup label="Unités">
                <option value="Unité d'Échographie">Unité d'Échographie</option>
                <option value="Unité d'Acupuncture">Unité d'Acupuncture</option>
              </optgroup>
            </select>
            
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
            </button>
          </div>
        </div>
      </div>

      {/* Personnel Grid */}
      {!loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPersonnel.map((person) => (
          <div key={person.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {person.firstName[0]}{person.lastName[0]}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {person.firstName} {person.lastName}
                </h3>
                <p className="text-sm text-gray-600">{person.position}</p>
              </div>
              {person.isActive && (
                <UserCheck className="w-5 h-5 text-green-500" />
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <a 
                  href={`mailto:${person.email}`}
                  className="text-sm text-blue-600 hover:text-blue-700 truncate"
                >
                  {person.email}
                </a>
              </div>
              
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{person.phone}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{person.service}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(person.role)}`}>
                  {getRoleLabel(person.role)}
                </span>
                <span className="text-xs text-gray-500">
                  Matricule: {person.registrationNumber}
                </span>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {filteredPersonnel.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun personnel trouvé</h3>
          <p className="text-gray-600">Essayez de modifier vos critères de recherche.</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h2>
        {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{personnel.length}</p>
            <p className="text-sm text-blue-600">Total Personnel</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{personnel.filter(p => p.isActive).length}</p>
            <p className="text-sm text-green-600">Personnel Actif</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{services.length}</p>
            <p className="text-sm text-purple-600">Services</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{personnel.filter(p => p.role === 'service_chief').length}</p>
            <p className="text-sm text-orange-600">Chefs Service</p>
          </div>
        </div>
        )}
      </div>

      {/* Personnel Form Modal */}
      <PersonnelForm
        isOpen={showPersonnelForm}
        onClose={() => setShowPersonnelForm(false)}
        onSubmit={(personnel) => {
          // TODO: Implement personnel creation logic
          console.log('Nouveau personnel créé:', personnel);
          // Here you would typically call an API to create the personnel
          // and then refresh the personnel list
        }}
      />

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Import Personnel Excel</h2>
              <button
                onClick={handleImportClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <PersonnelImport onImportSuccess={handleRefresh} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Personnel;