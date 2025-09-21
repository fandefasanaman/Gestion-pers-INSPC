import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Calendar,
  Download,
  Filter,
  TrendingUp,
  PieChart,
  Activity,
  Building,
  GraduationCap,
  Clock,
  Search,
  Eye
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

interface ReportData {
  personnel: any[];
  totalPersonnel: number;
  activePersonnel: number;
  serviceStats: { [key: string]: number };
  gradeStats: { [key: string]: number };
  roleStats: { [key: string]: number };
}

const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData>({
    personnel: [],
    totalPersonnel: 0,
    activePersonnel: 0,
    serviceStats: {},
    gradeStats: {},
    roleStats: {}
  });
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [serviceFilter, setServiceFilter] = useState('all');

  // Services INSPC
  const services = [
    'Direction Générale (DG)',
    'Direction des Affaires Administratives et Financières (DAAF)',
    'Direction Formation et Recherche (DFR)',
    'Service Pédagogique et Scientifique (SPS)',
    'Service Financier (SF)',
    'Service Administratif (SA)',
    'Service Documentation (SDoc)',
    'Unité d\'Échographie',
    'Unité d\'Acupuncture'
  ];

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
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
          service: getServiceLabel(data.service) || 'Non défini',
          role: data.role || 'employee',
          grade: data.grade || 'Non défini',
          isActive: data.actif !== false,
          joinDate: data.date_entree_inspc || data.created_at || new Date().toISOString(),
          fonction: data.fonction || ''
        };
      });

      // Calculer les statistiques
      const totalPersonnel = personnelData.length;
      const activePersonnel = personnelData.filter(p => p.isActive).length;
      
      // Statistiques par service
      const serviceStats: { [key: string]: number } = {};
      personnelData.forEach(person => {
        serviceStats[person.service] = (serviceStats[person.service] || 0) + 1;
      });

      // Statistiques par grade
      const gradeStats: { [key: string]: number } = {};
      personnelData.forEach(person => {
        gradeStats[person.grade] = (gradeStats[person.grade] || 0) + 1;
      });

      // Statistiques par rôle
      const roleStats: { [key: string]: number } = {};
      personnelData.forEach(person => {
        const roleLabel = getRoleLabel(person.role);
        roleStats[roleLabel] = (roleStats[roleLabel] || 0) + 1;
      });

      setReportData({
        personnel: personnelData,
        totalPersonnel,
        activePersonnel,
        serviceStats,
        gradeStats,
        roleStats
      });

    } catch (error) {
      console.error('Erreur lors du chargement des données de rapport:', error);
      // Données de démonstration en cas d'erreur
      setReportData({
        personnel: [],
        totalPersonnel: 0,
        activePersonnel: 0,
        serviceStats: {
          'Service Administratif (SA)': 15,
          'Service Pédagogique et Scientifique (SPS)': 12,
          'Direction Générale (DG)': 8
        },
        gradeStats: {
          'Stagiaire': 10,
          '2/1': 15,
          'P/2': 8,
          'PCE/1': 2
        },
        roleStats: {
          'Employé': 25,
          'Chef de Service': 8,
          'Administrateur': 2
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const getServiceLabel = (serviceCode: string) => {
    const serviceMap: Record<string, string> = {
      'dg': 'Direction Générale (DG)',
      'daaf': 'Direction des Affaires Administratives et Financières (DAAF)',
      'dfr': 'Direction Formation et Recherche (DFR)',
      'sps': 'Service Pédagogique et Scientifique (SPS)',
      'sf': 'Service Financier (SF)',
      'sa': 'Service Administratif (SA)',
      'sdoc': 'Service Documentation (SDoc)',
      'unite_echographie': 'Unité d\'Échographie',
      'unite_acupuncture': 'Unité d\'Acupuncture'
    };
    return serviceMap[serviceCode] || serviceCode;
  };

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

  const reportTypes = [
    {
      id: 'personnel',
      title: 'Rapport Personnel',
      description: 'Liste complète du personnel par service',
      icon: Users,
      color: 'bg-blue-500',
      count: reportData.totalPersonnel
    },
    {
      id: 'statistics',
      title: 'Rapport Statistiques',
      description: 'Répartition par service, grade, ancienneté',
      icon: PieChart,
      color: 'bg-green-500',
      count: Object.keys(reportData.serviceStats).length
    },
    {
      id: 'movements',
      title: 'Rapport Mouvements',
      description: 'Historique des affectations et mutations',
      icon: Activity,
      color: 'bg-purple-500',
      count: 0
    },
    {
      id: 'formations',
      title: 'Rapport Formations',
      description: 'Formations suivies par le personnel',
      icon: GraduationCap,
      color: 'bg-orange-500',
      count: 0
    },
    {
      id: 'presences',
      title: 'Rapport Présences',
      description: 'Suivi des présences et absences',
      icon: Clock,
      color: 'bg-teal-500',
      count: reportData.activePersonnel
    }
  ];

  const exportToPDF = (reportType: string) => {
    // TODO: Implémenter l'export PDF
    console.log(`Export PDF pour ${reportType}`);
    alert(`Export PDF pour ${reportType} - Fonctionnalité à implémenter`);
  };

  const exportToExcel = (reportType: string) => {
    // TODO: Implémenter l'export Excel
    console.log(`Export Excel pour ${reportType}`);
    alert(`Export Excel pour ${reportType} - Fonctionnalité à implémenter`);
  };

  const renderPersonnelReport = () => {
    const filteredPersonnel = reportData.personnel.filter(person => {
      if (serviceFilter !== 'all' && person.service !== serviceFilter) {
        return false;
      }
      return true;
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Rapport Personnel Complet</h3>
          <div className="flex items-center space-x-3">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les services</option>
              {services.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
            <button
              onClick={() => exportToPDF('personnel')}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => exportToExcel('personnel')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Personnel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fonction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPersonnel.map((person) => (
                  <tr key={person.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-medium text-sm">
                            {person.firstName[0]}{person.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {person.firstName} {person.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            IM: {person.registrationNumber ? person.registrationNumber.replace(/,/g, ' ') : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {person.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {person.service}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {person.fonction}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {getRoleLabel(person.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        person.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {person.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Total: {filteredPersonnel.length} personnel(s) affiché(s)
        </div>
      </div>
    );
  };

  const renderStatisticsReport = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Rapport Statistiques</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => exportToPDF('statistics')}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => exportToExcel('statistics')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Répartition par service */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-blue-500" />
              Répartition par Service
            </h4>
            <div className="space-y-3">
              {Object.entries(reportData.serviceStats).map(([service, count]) => (
                <div key={service} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate">{service}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(count / reportData.totalPersonnel) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Répartition par rôle */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-500" />
              Répartition par Rôle
            </h4>
            <div className="space-y-3">
              {Object.entries(reportData.roleStats).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{role}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(count / reportData.totalPersonnel) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Répartition par grade */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
              Répartition par Grade
            </h4>
            <div className="space-y-3">
              {Object.entries(reportData.gradeStats).map(([grade, count]) => (
                <div key={grade} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{grade}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${(count / reportData.totalPersonnel) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistiques générales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-orange-500" />
              Statistiques Générales
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-900">Total Personnel</span>
                <span className="text-lg font-bold text-blue-600">{reportData.totalPersonnel}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-900">Personnel Actif</span>
                <span className="text-lg font-bold text-green-600">{reportData.activePersonnel}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-red-900">Personnel Inactif</span>
                <span className="text-lg font-bold text-red-600">{reportData.totalPersonnel - reportData.activePersonnel}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-purple-900">Services Actifs</span>
                <span className="text-lg font-bold text-purple-600">{Object.keys(reportData.serviceStats).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReportDetail = () => {
    switch (selectedReport) {
      case 'personnel':
        return renderPersonnelReport();
      case 'statistics':
        return renderStatisticsReport();
      case 'movements':
        return (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Rapport Mouvements</h3>
            <p className="text-gray-600">Fonctionnalité en développement</p>
          </div>
        );
      case 'formations':
        return (
          <div className="text-center py-12">
            <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Rapport Formations</h3>
            <p className="text-gray-600">Fonctionnalité en développement</p>
          </div>
        );
      case 'presences':
        return (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Rapport Présences</h3>
            <p className="text-gray-600">Fonctionnalité en développement</p>
          </div>
        );
      default:
        return null;
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
        <h1 className="text-2xl font-bold text-gray-900">📊 Rapports INSPC</h1>
        {selectedReport && (
          <button
            onClick={() => setSelectedReport(null)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span>← Retour aux rapports</span>
          </button>
        )}
      </div>

      {!selectedReport ? (
        <>
          {/* Vue d'ensemble des rapports */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              return (
                <div
                  key={report.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedReport(report.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${report.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{report.count}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{report.description}</p>
                  <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium">
                    <Eye className="w-4 h-4" />
                    <span>Voir le rapport</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Statistiques rapides */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Aperçu Général</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{reportData.totalPersonnel}</div>
                <div className="text-sm text-blue-600">Total Personnel</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{reportData.activePersonnel}</div>
                <div className="text-sm text-green-600">Personnel Actif</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{Object.keys(reportData.serviceStats).length}</div>
                <div className="text-sm text-purple-600">Services</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{Object.keys(reportData.roleStats).length}</div>
                <div className="text-sm text-orange-600">Rôles</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {renderReportDetail()}
        </div>
      )}
    </div>
  );
};

export default Reports;