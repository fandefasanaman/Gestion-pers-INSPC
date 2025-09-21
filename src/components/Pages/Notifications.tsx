import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Filter,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  Info,
  Settings
} from 'lucide-react';
import { Notification } from '../../types';

const Notifications: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  // Mock notifications data
  const notifications: Notification[] = [
    {
      id: '1',
      userId: '4',
      type: 'validation_request',
      title: 'Nouvelle demande à valider',
      message: 'Une demande de congé de Hery RASOLOFO nécessite votre validation.',
      isRead: false,
      createdAt: '2024-03-10T14:30:00Z',
      relatedMovementId: '1'
    },
    {
      id: '2',
      userId: '4',
      type: 'status_updated',
      title: 'Demande approuvée',
      message: 'Votre demande de mission à Antananarivo a été approuvée par le service RH.',
      isRead: false,
      createdAt: '2024-03-09T16:45:00Z',
      relatedMovementId: '2'
    },
    {
      id: '3',
      userId: '4',
      type: 'deadline_approaching',
      title: 'Échéance approchante',
      message: 'Votre congé commence dans 3 jours. Pensez à finaliser vos dossiers en cours.',
      isRead: true,
      createdAt: '2024-03-08T09:15:00Z',
      relatedMovementId: '1'
    },
    {
      id: '4',
      userId: '4',
      type: 'movement_created',
      title: 'Demande créée',
      message: 'Votre demande de formation a été créée avec succès et transmise pour validation.',
      isRead: true,
      createdAt: '2024-03-07T11:20:00Z'
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'validation_request':
        return <CheckCheck className="w-5 h-5 text-blue-500" />;
      case 'status_updated':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'deadline_approaching':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'movement_created':
        return <Info className="w-5 h-5 text-teal-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string, isRead: boolean) => {
    const baseColor = isRead ? 'bg-gray-50' : 'bg-blue-50';
    const borderColor = isRead ? 'border-gray-200' : 'border-blue-200';
    
    return `${baseColor} ${borderColor}`;
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Il y a moins d\'une heure';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'validation':
        return notification.type === 'validation_request';
      case 'status':
        return notification.type === 'status_updated';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleMarkAsRead = () => {
    // TODO: Implement mark as read functionality
    console.log('Marking as read:', selectedNotifications);
    setSelectedNotifications([]);
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log('Deleting:', selectedNotifications);
    setSelectedNotifications([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Settings className="w-4 h-4" />
          <span>Paramètres</span>
        </button>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'all', label: 'Toutes' },
              { id: 'unread', label: 'Non lues' },
              { id: 'validation', label: 'Validations' },
              { id: 'status', label: 'Statuts' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {selectedNotifications.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedNotifications.length} sélectionnée{selectedNotifications.length > 1 ? 's' : ''}
              </span>
              <button
                onClick={handleMarkAsRead}
                className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
              >
                <Check className="w-4 h-4" />
                <span>Marquer comme lue</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer</span>
              </button>
            </div>
          )}
        </div>

        {filteredNotifications.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={selectedNotifications.length === filteredNotifications.length}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Sélectionner tout</span>
            </label>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`border rounded-xl p-4 transition-all hover:shadow-md ${getNotificationColor(notification.type, notification.isRead)}`}
          >
            <div className="flex items-start space-x-4">
              <input
                type="checkbox"
                checked={selectedNotifications.includes(notification.id)}
                onChange={() => handleSelectNotification(notification.id)}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`text-sm font-medium ${notification.isRead ? 'text-gray-900' : 'text-gray-900 font-semibold'}`}>
                      {notification.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {notification.message}
                    </p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatRelativeTime(notification.createdAt)}</span>
                      </span>
                      {notification.relatedMovementId && (
                        <button className="text-blue-600 hover:text-blue-700 font-medium">
                          Voir la demande →
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {!notification.isRead && (
                    <div className="flex-shrink-0 ml-4">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
          <p className="text-gray-600">
            {filter === 'unread' 
              ? 'Toutes vos notifications ont été lues.'
              : 'Vous n\'avez pas encore de notifications.'
            }
          </p>
        </div>
      )}

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Préférences de notification</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Notifications par email</h3>
              <p className="text-sm text-gray-600">Recevoir les notifications importantes par email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Notifications push</h3>
              <p className="text-sm text-gray-600">Recevoir des notifications sur votre navigateur</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Résumé hebdomadaire</h3>
              <p className="text-sm text-gray-600">Recevoir un résumé des activités chaque semaine</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;