import * as XLSX from 'xlsx';

export interface RawEmployeeData {
  numero?: string | number;
  nomPrenoms?: string;
  im?: string;
  dateNaissance?: string | number | Date;
  lieu?: string;
  cin?: string;
  dateCin?: string | number | Date;
  lieuCin?: string;
  corps?: string;
  grade?: string;
  indice?: string | number;
  imputationBudgetaire?: string;
  dateEntreeAdmin?: string | number | Date;
  fonction?: string;
  dateEntreeINSPC?: string | number | Date;
}

export interface ProcessedEmployeeData {
  id: string;
  numero: number;
  nom: string;
  prenoms: string;
  im: string;
  dateNaissance: string | null;
  lieu: string;
  cin: string;
  dateCin: string | null;
  lieuCin: string;
  corps: string;
  grade: string;
  indice: number;
  imputationBudgetaire: string;
  dateEntreeAdmin: string | null;
  fonction: string;
  dateEntreeINSPC: string | null;
  email: string;
  service: string;
  role: 'personnel' | 'chef_service' | 'rh' | 'admin';
  actif: boolean;
  ligneSource: number;
  fichierSource: string;
}

export interface ValidationResult {
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

// Nettoyer l'IM (retirer espaces)
export function cleanIM(im: string | number | undefined): string {
  return (im || '').toString().replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
}

// Nettoyer le CIN
export function cleanCIN(cin: string | number | undefined): string {
  return (cin || '').toString().replace(/\s+/g, '').trim();
}

// Nettoyer les nombres
export function cleanNumber(num: string | number | undefined): string {
  return (num || '').toString().replace(/\s+/g, '').replace(/[^\d]/g, '');
}

// Parser les dates Excel
export function parseExcelDate(dateValue: string | number | Date | undefined): string | null {
  if (!dateValue) return null;
  
  // Si c'est déjà une date
  if (dateValue instanceof Date) {
    return dateValue.toISOString().split('T')[0];
  }
  
  // Si c'est un nombre Excel (nombre de jours depuis 1900)
  if (typeof dateValue === 'number') {
    const date = XLSX.SSF.parse_date_code(dateValue);
    return date ? new Date(date.y, date.m - 1, date.d).toISOString().split('T')[0] : null;
  }
  
  // Si c'est une chaîne DD/MM/YYYY
  if (typeof dateValue === 'string') {
    const parts = dateValue.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toISOString().split('T')[0];
    }
  }
  
  return null;
}

// Formater en TitleCase
export function toTitleCase(str: string): string {
  return (str || '').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

// Générer email automatiquement
export function generateEmail(nom: string, prenoms: string): string {
  const nomClean = nom.toLowerCase().replace(/[^a-z]/g, '');
  const prenomsClean = prenoms.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
  return `${prenomsClean}.${nomClean}@inspc.mg`;
}

// Déterminer le service basé sur la fonction
export function determineService(fonction: string): string {
  const fonctionLower = fonction.toLowerCase();
  
  // Directions
  if (fonctionLower.includes('directeur général') || fonctionLower.includes('direction générale')) {
    return 'Direction Générale (DG)';
  }
  if (fonctionLower.includes('daaf') || fonctionLower.includes('affaires administratives') || fonctionLower.includes('affaires financières')) {
    return 'Direction des Affaires Administratives et Financières (DAAF)';
  }
  if (fonctionLower.includes('dfr') || fonctionLower.includes('formation') || fonctionLower.includes('recherche')) {
    return 'Direction Formation et Recherche (DFR)';
  }
  
  // Services
  if (fonctionLower.includes('pédagogique') || fonctionLower.includes('scientifique') || fonctionLower.includes('sps')) {
    return 'Service Pédagogique et Scientifique (SPS)';
  }
  if (fonctionLower.includes('financier') || fonctionLower.includes('comptable') || fonctionLower.includes('budget')) {
    return 'Service Financier (SF)';
  }
  if (fonctionLower.includes('administratif') || fonctionLower.includes('secrétariat') || fonctionLower.includes('administration')) {
    return 'Service Administratif (SA)';
  }
  if (fonctionLower.includes('documentation') || fonctionLower.includes('bibliothèque') || fonctionLower.includes('archive')) {
    return 'Service Documentation (SDoc)';
  }
  
  // Unités
  if (fonctionLower.includes('échographie') || fonctionLower.includes('echographie')) {
    return 'Unité d\'Échographie';
  }
  if (fonctionLower.includes('acupuncture')) {
    return 'Unité d\'Acupuncture';
  }
  
  // Par défaut
  return 'Service Administratif (SA)';
}

// Déterminer le rôle basé sur la fonction
export function determineRole(fonction: string): 'personnel' | 'chef_service' | 'rh' | 'admin' {
  const fonctionLower = fonction.toLowerCase();
  
  if (fonctionLower.includes('directeur général') || fonctionLower.includes('administrateur')) {
    return 'admin';
  }
  if (fonctionLower.includes('directeur') || fonctionLower.includes('chef de service') || fonctionLower.includes('responsable')) {
    return 'chef_service';
  }
  if (fonctionLower.includes('daaf') && (fonctionLower.includes('directeur') || fonctionLower.includes('responsable'))) {
    return 'rh';
  }
  
  return 'personnel';
}

// Parser une ligne d'employé
export function parseEmployeeRow(row: any[], lineNumber: number): ProcessedEmployeeData {
  try {
    const [
      numero,           // A: N°
      nomPrenoms,       // B: NOM ET PRENOMS  
      im,               // C: IM
      dateNaissance,    // D: DATE DE NAISSANCE
      lieu,             // E: LIEU
      cin,              // F: CIN
      dateCin,          // G: DATE CIN
      lieuCin,          // H: LIEU CIN
      corps,            // I: CORPS
      grade,            // J: GRADE
      indice,           // K: INDICE
      imputation,       // L: IMPUTATION BUDGETAIRE
      dateEntreeAdmin,  // M: Date d'entrée dans l'ADM°
      fonction,         // N: FONCTION
      dateEntreeINSPC   // O: DATE D'ENTREE A L'INSPC
    ] = row;
    
    // Séparer nom et prénoms
    const nomPrenomsClean = (nomPrenoms || '').trim();
    const nomParts = nomPrenomsClean.split(' ');
    const nom = nomParts[0] || '';
    const prenoms = nomParts.slice(1).join(' ') || '';
    
    return {
      id: `emp_${String(numero || lineNumber).padStart(3, '0')}`,
      numero: parseInt(String(numero)) || lineNumber,
      nom: nom.toUpperCase(),
      prenoms: toTitleCase(prenoms),
      im: cleanIM(im),
      dateNaissance: parseExcelDate(dateNaissance),
      lieu: (lieu || '').trim(),
      cin: cleanCIN(cin),
      dateCin: parseExcelDate(dateCin),
      lieuCin: (lieuCin || '').trim(),
      corps: (corps || '').trim(),
      grade: (grade || '').trim(),
      indice: parseInt(cleanNumber(indice)) || 0,
      imputationBudgetaire: (imputation || '00-71-9-110-00000').trim(),
      dateEntreeAdmin: parseExcelDate(dateEntreeAdmin),
      fonction: (fonction || '').trim(),
      dateEntreeINSPC: parseExcelDate(dateEntreeINSPC),
      
      // Champs générés automatiquement
      email: generateEmail(nom, prenoms),
      service: determineService(fonction || ''),
      role: determineRole(fonction || ''),
      actif: true,
      
      // Métadonnées d'import
      ligneSource: lineNumber,
      fichierSource: 'LISTE PERSONNEL INSPC SEPTEMBRE 2025'
    };
    
  } catch (error) {
    throw new Error(`Ligne ${lineNumber}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

// Fonction de parsing du fichier Excel
export async function parseExcelFile(file: File): Promise<ProcessedEmployeeData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convertir en JSON avec options
        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          header: 1, // Utiliser les indices comme clés
          defval: '', // Valeur par défaut pour cellules vides
          raw: false // Conserver le formatage des dates
        });
        
        // Ignorer la ligne d'en-tête (index 0)
        const dataRows = jsonData.slice(1) as any[][];
        
        // Parser chaque ligne
        const employees = dataRows
          .filter(row => row[0] && row[1]) // Filtrer lignes vides
          .map((row, index) => parseEmployeeRow(row, index + 2)); // +2 car on ignore l'en-tête et commence à 1
        
        resolve(employees);
        
      } catch (error) {
        reject(new Error(`Erreur de parsing: ${error instanceof Error ? error.message : 'Erreur inconnue'}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsArrayBuffer(file);
  });
}

// Valider les données avant import
export function validateEmployeeData(employees: ProcessedEmployeeData[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const duplicates = new Map<string, number>();
  
  employees.forEach((emp, index) => {
    const ligne = emp.ligneSource;
    
    // Vérifications obligatoires
    if (!emp.nom) errors.push(`Ligne ${ligne}: Nom manquant`);
    if (!emp.im) errors.push(`Ligne ${ligne}: IM manquant`);
    if (!emp.fonction) warnings.push(`Ligne ${ligne}: Fonction manquante`);
    
    // Vérification des doublons IM
    if (duplicates.has(emp.im)) {
      errors.push(`Ligne ${ligne}: IM ${emp.im} en doublon (déjà ligne ${duplicates.get(emp.im)})`);
    } else {
      duplicates.set(emp.im, ligne);
    }
    
    // Validation format CIN (si présent)
    if (emp.cin && !/^\d{12}$/.test(emp.cin)) {
      warnings.push(`Ligne ${ligne}: Format CIN invalide (${emp.cin})`);
    }
    
    // Validation dates cohérentes
    if (emp.dateNaissance && emp.dateEntreeINSPC) {
      const birthDate = new Date(emp.dateNaissance);
      const entryDate = new Date(emp.dateEntreeINSPC);
      const age = (entryDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      if (age < 16) {
        warnings.push(`Ligne ${ligne}: Age suspect (${Math.round(age)} ans)`);
      }
    }
    
    // Validation indice
    if (emp.indice && (emp.indice < 100 || emp.indice > 5000)) {
      warnings.push(`Ligne ${ligne}: Indice suspect (${emp.indice})`);
    }
  });
  
  return { errors, warnings, isValid: errors.length === 0 };
}