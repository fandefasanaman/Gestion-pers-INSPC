import { supabase } from '../lib/supabase';
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
    for (const employee of employees) {
      try {
        // Vérifier si l'employé existe déjà (par IM)
        const { data: existingPersonnel, error: checkError } = await supabase
          .from('personnel')
          .select('id, im, nom, prenoms')
          .eq('im', employee.im)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          // Erreur autre que "not found"
          errors.push(`Erreur lors de la vérification pour ${employee.nom}: ${checkError.message}`);
          continue;
        }

        if (existingPersonnel) {
          // L'employé existe déjà
          if (options.skipDuplicates) {
            skipped++;
            warnings.push(`Employé ${employee.nom} ${employee.prenoms} (IM: ${employee.im}) ignoré - déjà existant`);
            continue;
          } else if (options.updateExisting) {
            // Mettre à jour l'employé existant
            const { error: updateError } = await supabase
              .from('personnel')
              .update({
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
                updated_at: new Date().toISOString()
              })
              .eq('id', existingPersonnel.id);

            if (updateError) {
              errors.push(`Erreur lors de la mise à jour de ${employee.nom}: ${updateError.message}`);
            } else {
              updated++;
            }
          } else {
            skipped++;
            warnings.push(`Employé ${employee.nom} ${employee.prenoms} (IM: ${employee.im}) ignoré - déjà existant`);
          }
        } else {
          // Créer un nouvel employé
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
            role: employee.role
          };

          const { error: insertError } = await supabase
            .from('personnel')
            .insert(personnelData);

          if (insertError) {
            errors.push(`Erreur lors de la création de ${employee.nom}: ${insertError.message}`);
          } else {
            created++;
            
            // Créer un compte utilisateur si demandé
            if (options.createAccounts) {
              try {
                await createUserAccount(employee);
              } catch (authError) {
                warnings.push(`Compte utilisateur non créé pour ${employee.nom}: ${authError instanceof Error ? authError.message : 'Erreur inconnue'}`);
              }
            }
          }
        }
      } catch (empError) {
        errors.push(`Erreur pour ${employee.nom}: ${empError instanceof Error ? empError.message : 'Erreur inconnue'}`);
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

// Créer un compte utilisateur Supabase
async function createUserAccount(employee: ProcessedEmployeeData): Promise<void> {
  // Générer un mot de passe temporaire
  const tempPassword = generateTempPassword();
  
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: employee.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        nom: employee.nom,
        prenoms: employee.prenoms,
        im: employee.im,
        service: employee.service,
        role: employee.role
      }
    });

    if (error) {
      throw error;
    }

    // Ici vous pourriez envoyer un email avec les identifiants
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