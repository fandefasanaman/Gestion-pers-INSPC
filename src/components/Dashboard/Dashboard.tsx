import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import StatsCard from './StatsCard';
import RecentMovements from './RecentMovements';
import { Movement } from '../../types';

export default function Dashboard() {
  const { personnel } = useAuth();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingApproval: 0,
    approved: 0,
    inProgress: 0
  });

  useEffect(() => {
    if (personnel) {
      fetchMovements();
      fetchStats();
    } else {
      // Set demo data when no user is authenticated
      setStats({
        totalRequests: 12,
        pendingApproval: 3,
        approved: 8,
        inProgress: 1
      });
      setMovements([]);
    }
  }, [personnel]);

  const fetchMovements = async () => {
    if (!personnel) return;

    let query = supabase
      .from('movements')
      .select(`
        *,
        personnel:personnel_id (*)
      `)
      .order('date_demande', { ascending: false });

    // Filter based on role
    if (personnel.role === 'personnel') {
      query = query.eq('personnel_id', personnel.id);
    }

    const { data, error } = await query.limit(10);
    
    if (data && !error) {
      setMovements(data);
    }
  };

  const fetchStats = async () => {
    if (!personnel) return;

    let baseQuery = supabase.from('movements').select('statut');
    
    if (personnel.role === 'personnel') {
      baseQuery = baseQuery.eq('personnel_id', personnel.id);
    }

    const { data, error } = await baseQuery;
    
    if (data && !error) {
      const totalRequests = data.length;
      const pendingApproval = data.filter(m => m.statut === 'soumise').length;
      const approved = data.filter(m => m.statut === 'approuvee').length;
      const inProgress = data.filter(m => m.statut === 'en_cours').length;

      setStats({
        totalRequests,
        pendingApproval,
        approved,
        inProgress
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Tableau de Bord
        </h1>
        <p className="text-gray-600 mt-1">
          {personnel ? `Bienvenue, ${personnel.prenoms} ${personnel.nom}` : 'Mode Démonstration - Tableau de Bord INSPC'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Demandes"
          value={stats.totalRequests}
          icon={FileText}
          color="purple"
        />
        <StatsCard
          title="En Attente"
          value={stats.pendingApproval}
          icon={Clock}
          color="yellow"
        />
        <StatsCard
          title="En Cours"
          value={stats.inProgress}
          icon={Users}
          color="green"
        />
        <StatsCard
          title="Approuvées"
          value={stats.approved}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Recent Movements */}
      <RecentMovements movements={movements} />
      
      {!personnel && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-medium">ℹ</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Mode Démonstration</h3>
              <p className="text-sm text-blue-700 mt-1">
                Vous consultez l'application en mode démonstration. Connectez-vous pour accéder à vos données personnelles.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}