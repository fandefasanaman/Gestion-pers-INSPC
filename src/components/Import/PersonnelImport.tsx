import React, { useState } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Download,
  Users,
  Database,
  Settings
} from 'lucide-react';
import { parseExcelFile, validateEmployeeData, ProcessedEmployeeData } from '../../utils/excelParser';
import { executeImport, downloadExcelTemplate, ImportOptions, ImportResult } from '../../utils/importService';

interface ImportOptions {
  createAccounts: boolean;
  skipDuplicates: boolean;
  updateExisting: boolean;
}

interface ImportResult {
  success: boolean;
  total: number;
  created: number;
  updated: number;
  errors: string[];
  warnings: string[];
}

const PersonnelImport: React.FC = () => {
  const [previewData, setPreviewData] = useState<ProcessedEmployeeData[]>([]);
  const [importing, setImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [options, setOptions] = useState<ImportOptions>({
    createAccounts: false,
    skipDuplicates: true,
    updateExisting: false
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Vérifier le type de fichier
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      alert('Format de fichier non supporté. Utilisez .xlsx, .xls ou .csv');
      return;
    }

    try {
      setImporting(true);
      const employees = await parseExcelFile(file);
      setPreviewData(employees);
    } catch (error) {
      alert(`Erreur lors du parsing: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setImporting(false);
    }
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;

    try {
      setImporting(true);
      
      // Validation des données
      const validation = validateEmployeeData(previewData);
      if (!validation.isValid) {
        alert(`Validation échouée:\n${validation.errors.join('\n')}`);
        return;
      }

      // Simuler l'import (remplacer par l'appel API réel)
      const result = await performImport(previewData, options);
      setImportResult(result);
      setShowResult(true);
      
      if (result.success) {
        setPreviewData([]);
      }
      
    } catch (error) {
      alert(`Erreur lors de l'import: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setImporting(false);
    }
  };

  // Simulation de l'import (à remplacer par la vraie logique)
  const performImport = async (employees: ProcessedEmployeeData[], options: ImportOptions): Promise<ImportResult> => {
    return await executeImport(employees, options);
  };

  const clearPreview = () => {
    setPreviewData([]);
    setImportResult(null);
    setShowResult(false);
  };

  const downloadTemplate = () => {
    downloadExcelTemplate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">📋 Import Personnel INSPC</h1>
        <button
          onClick={downloadTemplate}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Template Excel</span>
        </button>
      </div>

      {/* Zone d'upload */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <FileSpreadsheet className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Glissez le fichier Excel ici ou cliquez pour sélectionner
              </h3>
              <p className="text-gray-600 mb-4">
                Formats acceptés: .xlsx, .xls, .csv
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInput}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Sélectionner un fichier</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Aperçu des données */}
      {previewData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              📊 Aperçu des données ({previewData.length} lignes détectées)
            </h3>
            <button
              onClick={clearPreview}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-700">N°</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Nom</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Prénoms</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">IM</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Fonction</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Service</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Email</th>
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 5).map((emp, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 px-3">{emp.numero}</td>
                    <td className="py-2 px-3 font-medium">{emp.nom}</td>
                    <td className="py-2 px-3">{emp.prenoms}</td>
                    <td className="py-2 px-3">{emp.im}</td>
                    <td className="py-2 px-3">{emp.fonction}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {emp.service}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-blue-600">{emp.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {previewData.length > 5 && (
            <p className="text-center text-gray-500 mt-3">
              ... et {previewData.length - 5} autres lignes
            </p>
          )}
        </div>
      )}

      {/* Configuration d'import */}
      {previewData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Configuration d'import
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={options.createAccounts}
                onChange={(e) => setOptions(prev => ({ ...prev, createAccounts: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Créer les comptes utilisateurs</div>
                <div className="text-sm text-gray-600">Générer les comptes d'authentification</div>
              </div>
            </label>
            
            <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={options.skipDuplicates}
                onChange={(e) => setOptions(prev => ({ ...prev, skipDuplicates: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Ignorer les doublons</div>
                <div className="text-sm text-gray-600">Passer les IM existants</div>
              </div>
            </label>
            
            <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={options.updateExisting}
                onChange={(e) => setOptions(prev => ({ ...prev, updateExisting: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">Mettre à jour les existants</div>
                <div className="text-sm text-gray-600">Modifier les données existantes</div>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      {previewData.length > 0 && (
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={clearPreview}
            className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-300"
          >
            Annuler
          </button>
          <button
            onClick={handleImport}
            disabled={importing}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {importing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Import en cours...</span>
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                <span>Importer {previewData.length} employés</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Modal de résultats */}
      {showResult && importResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                {importResult.success ? (
                  <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
                )}
                Résultat de l'import
              </h2>
              <button
                onClick={() => setShowResult(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Statistiques */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{importResult.total}</div>
                  <div className="text-sm text-gray-600">Total traité</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{importResult.created}</div>
                  <div className="text-sm text-green-600">Créés</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{importResult.updated}</div>
                  <div className="text-sm text-blue-600">Mis à jour</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                  <div className="text-sm text-red-600">Erreurs</div>
                </div>
                {importResult.skipped !== undefined && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">{importResult.skipped}</div>
                    <div className="text-sm text-gray-600">Ignorés</div>
                  </div>
                )}
              </div>

              {/* Erreurs */}
              {importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-medium text-red-800 mb-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Erreurs détectées
                  </h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    {importResult.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Avertissements */}
              {importResult.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-800 mb-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Avertissements
                  </h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {importResult.warnings.slice(0, 10).map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                    {importResult.warnings.length > 10 && (
                      <li>• ... et {importResult.warnings.length - 10} autres avertissements</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Succès */}
              {importResult.success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-800 mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Import réussi!
                  </h3>
                  <p className="text-sm text-green-700">
                    {importResult.created} nouveaux employés créés, {importResult.updated} mis à jour.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowResult(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonnelImport;