export interface Personnel {
  id: string;
  nom: string;
  prenoms: string;
  im: string;
  date_naissance: string;
  lieu: string;
  cin: string;
  corps: string;
  grade: string;
  indice: number;
  fonction: string;
  date_entree_inspc: string;
  email: string;
  service: string;
  chef_service: string;
  actif: boolean;
  role?: 'personnel' | 'chef_service' | 'rh' | 'admin';
}

export type MovementType = 
  | 'conge' 
  | 'mission' 
  | 'permission_absence' 
  | 'autorisation_absence' 
  | 'convalescence' 
  | 'hospitalise' 
  | 'formation' 
  | 'repos_maladie';

export type MovementStatus = 
  | 'brouillon' 
  | 'soumise' 
  | 'en_cours' 
  | 'approuvee' 
  | 'rejetee';

export interface Movement {
  id: string;
  personnel_id: string;
  type: MovementType;
  date_debut: string;
  date_fin: string;
  motif: string;
  justification: string;
  piece_jointe?: string[];
  statut: MovementStatus;
  demande_par: string;
  date_demande: string;
  validation_hierarchie?: {
    valide_par?: string;
    date_validation?: string;
    commentaire?: string;
    statut: 'en_attente' | 'approuve' | 'rejete';
  };
  validation_rh?: {
    valide_par?: string;
    date_validation?: string;
    commentaire?: string;
    statut: 'en_attente' | 'approuve' | 'rejete';
  };
  personnel?: Personnel;
}

export interface Notification {
  id: string;
  destinataire_id: string;
  type: string;
  titre: string;
  message: string;
  mouvement_id?: string;
  lu: boolean;
  date_creation: string;
}