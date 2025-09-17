import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'purple' | 'green' | 'yellow' | 'red';
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
}

const colorClasses = {
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    text: 'text-purple-900'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    text: 'text-green-900'
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600',
    text: 'text-yellow-900'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    text: 'text-red-900'
  }
};

export default function StatsCard({ title, value, icon: Icon, color, change }: StatsCardProps) {
  const classes = colorClasses[color];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${classes.text} mt-1`}>{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {change.trend === 'up' ? '+' : '-'}{change.value}% ce mois
            </p>
          )}
        </div>
        <div className={`p-3 ${classes.bg} rounded-lg`}>
          <Icon className={`w-6 h-6 ${classes.icon}`} />
        </div>
      </div>
    </div>
  );
}