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

// Fonction principale d'import vers Firebase Firestore
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
    console.log('🔥 Utilisation de Firebase Firestore (gpersinspc)');
    
    // Vérifier si l'utilisateur est connecté
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Utilisateur non authentifié. Veuillez vous connecter pour importer des données.');
    }
    
    const batch = writeBatch(db);
    
    for (const employee of employees) {
      try {
        let existingPersonnel = null;
        
        try {
          // Vérifier si l'employé existe déjà (par IM) dans Firestore
          const existingQuery = query(
            collection(db, 'personnel'),
            where('im', '==', employee.im)
          );
          
          const existingDocs = await getDocs(existingQuery);
          existingPersonnel = existingDocs.docs[0];
        } catch (queryError: any) {
          // Si erreur de permissions sur la lecture, continuer avec la création
          console.warn(`Impossible de vérifier l'existence de l'employé ${employee.im}:`, queryError.message);
          warnings.push(`Vérification d'existence impossible pour ${employee.nom} - création forcée`);
        }

        if (existingPersonnel) {
          // L'employé existe déjà
          if (options.skipDuplicates) {
            skipped++;
            warnings.push(`Employé ${employee.nom} ${employee.prenoms} (IM: ${employee.im}) ignoré - déjà existant`);
            continue;
          } else if (options.updateExisting) {
            try {
              // Mettre à jour l'employé existant
              const docRef = doc(db, 'personnel', existingPersonnel.id);
              batch.update(docRef, {
                nom: employee.nom,
                prenoms: employee.prenoms,
                date_naissance: employee.dateNaissance,
                lieu: employee.lieu,
                cin: employee.cin,
                corps: employee.corps,
                grade: employee.grade,
                indice: employee.indice,
                fonction: employee.fonction,
                date_entree_inspc: employee.dateEntreeINSPC,
                email: employee.email,
                service: employee.service,
                role: employee.role,
                actif: employee.actif,
                updated_at: new Date(),
                updated_by: currentUser.uid
              });
              updated++;
            } catch (updateError: any) {
              errors.push(`Erreur mise à jour ${employee.nom}: ${updateError.message}`);
            }
          } else {
            skipped++;
            warnings.push(`Employé ${employee.nom} ${employee.prenoms} (IM: ${employee.im}) ignoré - déjà existant`);
          }
        } else {
          try {
            // Créer un nouvel employé
            const docRef = doc(collection(db, 'personnel'), employee.id);
            const personnelData = {
              nom: employee.nom,
              prenoms: employee.prenoms,
              im: employee.im,
              date_naissance: employee.dateNaissance,
              lieu: employee.lieu,
              cin: employee.cin,
              corps: employee.corps,
              grade: employee.grade,
              indice: employee.indice,
              fonction: employee.fonction,
              date_entree_inspc: employee.dateEntreeINSPC,
              email: employee.email,
              service: employee.service,
              chef_service: 'ADMIN', // Valeur par défaut
              actif: employee.actif,
              role: employee.role,
              created_at: new Date(),
              updated_at: new Date(),
              created_by: currentUser.uid
            };

            batch.set(docRef, personnelData);
            created++;
            
            // Créer un compte utilisateur Firebase Auth si demandé
            if (options.createAccounts) {
              try {
                await createUserAccount(employee);
              } catch (authError) {
                warnings.push(`Compte utilisateur non créé pour ${employee.nom}: ${authError instanceof Error ? authError.message : 'Erreur inconnue'}`);
              }
            }
          } catch (createError: any) {
            errors.push(`Erreur création ${employee.nom}: ${createError.message}`);
          }
        }
      } catch (empError) {
        errors.push(`Erreur pour ${employee.nom}: ${empError instanceof Error ? empError.message : 'Erreur inconnue'}`);
      }
    }

    try {
      // Commit le batch dans Firestore
      console.log('💾 Sauvegarde dans Firebase Firestore...');
      await batch.commit();
      console.log(`✅ Import terminé avec succès: ${created} créés, ${updated} mis à jour, ${skipped} ignorés`);
    } catch (commitError: any) {
      console.error('❌ Erreur lors du commit:', commitError);
      
      // Analyser le type d'erreur
      if (commitError.code === 'permission-denied') {
        errors.push('ERREUR DE PERMISSIONS FIREBASE: Les règles de sécurité Firestore empêchent l\'écriture dans la collection "personnel". Veuillez configurer les règles Firebase pour autoriser les utilisateurs authentifiés à écrire dans cette collection. Consultez la documentation Firebase pour plus d\'informations.');
      } else if (commitError.code === 'unauthenticated') {
        errors.push('Utilisateur non authentifié. Veuillez vous reconnecter.');
      } else {
        errors.push(`Erreur de sauvegarde: ${commitError.message}`);
      }
    }

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
    
    let errorMessage = 'Erreur inconnue lors de l\'import';
    if (error instanceof Error) {
      if (error.message.includes('permission-denied')) {
        errorMessage = 'Permissions insuffisantes. Vérifiez vos droits d\'accès à la base de données.';
      } else if (error.message.includes('unauthenticated')) {
        errorMessage = 'Utilisateur non authentifié. Veuillez vous reconnecter.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return {
      success: false,
      total: employees.length,
      created,
      updated,
      skipped,
      errors: [errorMessage],
      warnings
    };
  }
}

// Créer un compte utilisateur Firebase Auth
async function createUserAccount(employee: ProcessedEmployeeData): Promise<void> {
  // Générer un mot de passe temporaire
  const tempPassword = generateTempPassword();
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, employee.email, tempPassword);
    
    // Ici vous pourriez envoyer un email avec les identifiants
    console.log(`👤 Compte Firebase Auth créé pour ${employee.email} avec mot de passe temporaire: ${tempPassword}`);
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('email-already-in-use')) {
        throw new Error('Email déjà utilisé par un autre compte');
      } else if (error.message.includes('weak-password')) {
        throw new Error('Mot de passe trop faible');
      }
    }
    throw new Error(`Impossible de créer le compte utilisateur Firebase: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
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

// Fonction pour exporter les données actuelles depuis Firebase
export async function exportPersonnelData(): Promise<void> {
  try {
    const personnelQuery = query(collection(db, 'personnel'));
    const querySnapshot = await getDocs(personnelQuery);
    
    if (querySnapshot.empty) {
      alert('Aucune donnée à exporter');
      return;
    }

    const personnel = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Préparer les données pour l'export
    const exportData = [
      [
        'N°', 'NOM', 'PRENOMS', 'IM', 'DATE NAISSANCE', 'LIEU', 'CIN', 
        'CORPS', 'GRADE', 'INDICE', 'FONCTION', 'DATE ENTREE INSPC', 
        'EMAIL', 'SERVICE', 'ROLE', 'ACTIF'
      ],
      ...personnel.map((p: any, index) => {
        // Convertir les codes de service en labels lisibles
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
        const serviceLabel = serviceMap[p.service] || p.service || '';
        
        return [
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
          serviceLabel,
          p.role || '',
          p.actif ? 'OUI' : 'NON'
        ];
      })
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