import { db, auth } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  writeBatch, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ProcessedEmployeeData } from './excelParser';

export interface ImportOptions {
  createAccounts: boolean;
  skipDuplicates: boolean;
  updateExisting: boolean;
}

export interface ImportResult {
  success: boolean;
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
  warnings: string[];
}

// Fonction principale d'import vers Supabase
export async function executeImport(
  employees: ProcessedEmployeeData[], 
  options: ImportOptions = {
    createAccounts: false,
    skipDuplicates: true,
    updateExisting: false
  }
): Promise<ImportResult> {
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    console.log('🔥 Utilisation de Firebase Firestore pour l\'import');
    const batch = writeBatch(db);
    
    for (const employee of employees) {
      try {
        // Vérifier si l'employé existe déjà dans Firestore
        const existingQuery = query(
          collection(db, 'personnel'),
          where('im', '==', employee.im)
        );
        
        const existingDocs = await getDocs(existingQuery);
        
        if (existingDocs.size > 0) {
          // L'employé existe déjà
          if (options.skipDuplicates) {
            skipped++;
            warnings.push(`Employé ${employee.nom} ${employee.prenoms} (IM: ${employee.im}) ignoré - déjà existant`);
            continue;
          } else if (options.updateExisting) {
            // Mettre à jour l'employé existant dans Firestore
            try {
              const existingDoc = existingDocs.docs[0];
              const docRef = doc(db, 'personnel', existingDoc.id);
              batch.update(docRef, {
                nom: employee.nom,
                prenoms: employee.prenoms,
                dateNaissance: employee.dateNaissance,
                lieu: employee.lieu,
                cin: employee.cin,
                corps: employee.corps,
                grade: employee.grade,
                indice: employee.indice,
                fonction: employee.fonction,
                dateEntreeINSPC: employee.dateEntreeINSPC,
                email: employee.email,
                service: employee.service,
                role: employee.role,
                actif: employee.actif,
                dateMiseAJour: new Date()
              });
              updated++;
            } catch (updateError: any) {
              errors.push(`Erreur lors de la mise à jour de ${employee.nom}: ${updateError.message}`);
            }
          } else {
            skipped++;
            warnings.push(`Employé ${employee.nom} ${employee.prenoms} (IM: ${employee.im}) ignoré - déjà existant`);
          }
        } else {
          // Créer un nouvel employé dans Firestore
          const personnelData = {
            nom: employee.nom,
            prenoms: employee.prenoms,
            im: employee.im,
            dateNaissance: employee.dateNaissance,
            lieu: employee.lieu,
            cin: employee.cin,
            corps: employee.corps,
            grade: employee.grade,
            indice: employee.indice,
            fonction: employee.fonction,
            dateEntreeINSPC: employee.dateEntreeINSPC,
            email: employee.email,
            service: employee.service,
            chefService: 'ADMIN', // Valeur par défaut
            actif: employee.actif,
            role: employee.role,
            dateCreation: new Date(),
            dateMiseAJour: new Date()
          };

          // Ajouter au batch Firestore
          const docRef = doc(collection(db, 'personnel'), employee.id);
          batch.set(docRef, personnelData);
          
          created++;
          
          // Créer un compte utilisateur Firebase si demandé
          if (options.createAccounts) {
            try {
              await createUserAccount(employee);
            } catch (authError) {
              warnings.push(`Compte utilisateur non créé pour ${employee.nom}: ${authError instanceof Error ? authError.message : 'Erreur inconnue'}`);
            }
          }
        }
      } catch (empError) {
        errors.push(`Erreur pour ${employee.nom}: ${empError instanceof Error ? empError.message : 'Erreur inconnue'}`);
      }
    }

    // Commit le batch dans Firestore
    console.log('💾 Sauvegarde dans Firestore...');
    await batch.commit();
    console.log('✅ Import terminé avec succès');

    return {
      success: errors.length === 0,
      total: employees.length,
      created,
      updated,
      skipped,
      errors,
      warnings
    };

  } catch (error) {
    console.error('❌ Erreur générale d\'import:', error);
    return {
      success: false,
      total: employees.length,
      created,
      updated,
      skipped,
      errors: [error instanceof Error ? error.message : 'Erreur inconnue lors de l\'import'],
      warnings
    };
  }
}

// Créer un compte utilisateur Firebase
async function createUserAccount(employee: ProcessedEmployeeData): Promise<void> {
  // Générer un mot de passe temporaire
  const tempPassword = `INSPC${employee.im}2025`;
  
  try {
    await createUserWithEmailAndPassword(auth, employee.email, tempPassword);

    console.log(`Compte créé pour ${employee.email} avec mot de passe temporaire: ${tempPassword}`);
    
  } catch (error) {
    throw new Error(`Impossible de créer le compte utilisateur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

// Générer un mot de passe temporaire
function generateTempPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Fonction pour télécharger un template Excel
export function downloadExcelTemplate(): void {
  const templateData = [
    [
      'N°', 
      'NOM ET PRENOMS', 
      'IM', 
      'DATE DE NAISSANCE', 
      'LIEU', 
      'CIN', 
      'DATE CIN', 
      'LIEU CIN', 
      'CORPS', 
      'GRADE', 
      'INDICE', 
      'IMPUTATION BUDGETAIRE', 
      'Date d\'entrée dans l\'ADM°', 
      'FONCTION', 
      'DATE D\'ENTREE A L\'INSPC'
    ],
    [
      '1', 
      'RAKOTO Jean Pierre', 
      '498 445', 
      '07/08/1990', 
      'Antananarivo', 
      '101 234 567 890', 
      '21/05/2010', 
      'Antananarivo', 
      'Médecin DE de la CAT VIII', 
      'Stagiaire', 
      '1600', 
      '00-71-9-110-00000', 
      '24/07/2024', 
      'Équipe de recherche', 
      '10/01/2025'
    ],
    [
      '2', 
      'ANDRY Marie Claire', 
      '512 789', 
      '15/03/1985', 
      'Fianarantsoa', 
      '101 850 315 001', 
      '10/06/2005', 
      'Fianarantsoa', 
      'Administratif', 
      'Attaché Principal', 
      '750', 
      '00-71-9-110-00000', 
      '01/02/2021', 
      'Responsable RH', 
      '15/02/2021'
    ]
  ];

  // Créer un CSV simple pour le template
  const csvContent = templateData.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_personnel_inspc.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Fonction pour exporter les données actuelles
export async function exportPersonnelData(): Promise<void> {
  try {
    const { data: personnel, error } = await supabase
      .from('personnel')
      .select('*')
      .order('nom');

    if (error) {
      throw error;
    }

    if (!personnel || personnel.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    // Préparer les données pour l'export
    const exportData = [
      [
        'N°', 'NOM', 'PRENOMS', 'IM', 'DATE NAISSANCE', 'LIEU', 'CIN', 
        'CORPS', 'GRADE', 'INDICE', 'FONCTION', 'DATE ENTREE INSPC', 
        'EMAIL', 'SERVICE', 'ROLE', 'ACTIF'
      ],
      ...personnel.map((p, index) => [
        index + 1,
        p.nom,
        p.prenoms,
        p.im,
        p.date_naissance || '',
        p.lieu || '',
        p.cin || '',
        p.corps || '',
        p.grade || '',
        p.indice || '',
        p.fonction || '',
        p.date_entree_inspc || '',
        p.email,
        p.service || '',
        p.role || '',
        p.actif ? 'OUI' : 'NON'
      ])
    ];

    const csvContent = exportData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `personnel_inspc_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error('Erreur lors de l\'export:', error);
    alert('Erreur lors de l\'export des données');
  }
}