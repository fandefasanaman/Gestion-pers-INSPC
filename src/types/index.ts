export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  service: string;
  position: string;
  registrationNumber: string;
  profileImage?: string;
  isActive: boolean;
  createdAt: string;
}

export type UserRole = 'employee' | 'service_chief' | 'hr' | 'admin';

export interface MovementRequest {
  id: string;
  personnelId: string;
  type: MovementType;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  destination?: string;
  documents: Document[];
  status: MovementStatus;
  validations: Validation[];
  createdAt: string;
  updatedAt: string;
  urgency: 'low' | 'medium' | 'high';
  budgetEstimate?: number;
}

export type MovementType = 
  | 'leave' // Congé
  | 'mission' // Mission
  | 'training' // Formation
  | 'transfer' // Mutation
  | 'delegation' // Délégation
  | 'sick_leave' // Congé maladie
  | 'maternity_leave' // Congé maternité
  | 'other'; // Autre

export type MovementStatus = 
  | 'draft' // Brouillon
  | 'submitted' // Soumise
  | 'pending_service_chief' // En attente chef service
  | 'pending_hr' // En attente RH
  | 'pending_admin' // En attente admin
  | 'approved' // Approuvée
  | 'rejected' // Rejetée
  | 'cancelled' // Annulée
  | 'completed'; // Terminée

export interface Validation {
  id: string;
  validatorId: string;
  validatorRole: UserRole;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  validatedAt?: string;
  order: number;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'movement_created' | 'validation_request' | 'status_updated' | 'deadline_approaching';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedMovementId?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  chiefId: string;
  employeeCount: number;
}

export interface DashboardStats {
  totalMovements: number;
  pendingMovements: number;
  approvedMovements: number;
  rejectedMovements: number;
  activePersonnel: number;
  monthlyTrends: {
    month: string;
    movements: number;
    approvals: number;
  }[];
}