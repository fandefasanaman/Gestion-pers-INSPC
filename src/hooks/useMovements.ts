import { useState, useEffect } from 'react';
import { MovementRequest, MovementStatus, MovementType } from '../types';

// Mock data for development
const mockMovements: MovementRequest[] = [
  {
    id: '1',
    personnelId: '4',
    type: 'leave',
    title: 'Congé annuel',
    description: 'Congé annuel planifié pour les vacances familiales',
    startDate: '2024-03-15',
    endDate: '2024-03-29',
    documents: [],
    status: 'pending_service_chief',
    validations: [
      {
        id: '1',
        validatorId: '3',
        validatorRole: 'service_chief',
        status: 'pending',
        order: 1
      }
    ],
    urgency: 'medium',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z'
  },
  {
    id: '2',
    personnelId: '4',
    type: 'mission',
    title: 'Mission de formation à Antananarivo',
    description: 'Participation au séminaire sur les nouvelles technologies médicales',
    startDate: '2024-04-10',
    endDate: '2024-04-12',
    destination: 'Antananarivo',
    documents: [],
    status: 'approved',
    validations: [
      {
        id: '2',
        validatorId: '3',
        validatorRole: 'service_chief',
        status: 'approved',
        comment: 'Formation importante pour le service',
        validatedAt: '2024-03-02T14:30:00Z',
        order: 1
      },
      {
        id: '3',
        validatorId: '2',
        validatorRole: 'hr',
        status: 'approved',
        comment: 'Budget approuvé',
        validatedAt: '2024-03-03T09:15:00Z',
        order: 2
      }
    ],
    urgency: 'high',
    budgetEstimate: 500000,
    createdAt: '2024-02-28T08:00:00Z',
    updatedAt: '2024-03-03T09:15:00Z'
  }
];

export const useMovements = () => {
  const [movements, setMovements] = useState<MovementRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setMovements(mockMovements);
      setLoading(false);
    }, 1000);
  }, []);

  const createMovement = async (movement: Omit<MovementRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'validations'>) => {
    const newMovement: MovementRequest = {
      ...movement,
      id: Date.now().toString(),
      status: 'submitted',
      validations: [
        {
          id: Date.now().toString(),
          validatorId: '3', // Mock service chief
          validatorRole: 'service_chief',
          status: 'pending',
          order: 1
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setMovements(prev => [...prev, newMovement]);
    return newMovement;
  };

  const updateMovementStatus = async (movementId: string, status: MovementStatus, comment?: string) => {
    setMovements(prev => prev.map(movement => {
      if (movement.id === movementId) {
        return {
          ...movement,
          status,
          updatedAt: new Date().toISOString()
        };
      }
      return movement;
    }));
  };

  const getMovementsByUser = (userId: string) => {
    return movements.filter(movement => movement.personnelId === userId);
  };

  const getPendingValidations = (validatorId: string) => {
    return movements.filter(movement => 
      movement.validations.some(validation => 
        validation.validatorId === validatorId && validation.status === 'pending'
      )
    );
  };

  return {
    movements,
    loading,
    createMovement,
    updateMovementStatus,
    getMovementsByUser,
    getPendingValidations
  };
};