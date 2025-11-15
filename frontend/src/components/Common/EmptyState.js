import React from 'react';
import { 
  DocumentIcon, 
  UsersIcon, 
  CalendarIcon,
  PlusIcon 
} from '@heroicons/react/24/outline';

const EmptyState = ({ 
  icon: CustomIcon, 
  title, 
  message, 
  actionText, 
  onAction,
  type = 'default'
}) => {
  const getDefaultIcon = () => {
    const icons = {
      leads: UsersIcon,
      bookings: CalendarIcon,
      documents: DocumentIcon,
      default: DocumentIcon
    };
    return icons[type] || icons.default;
  };

  const Icon = CustomIcon || getDefaultIcon();

  return (
    <div className="text-center py-12">
      <div className="mx-auto h-12 w-12 text-gray-400">
        <Icon className="h-12 w-12" />
      </div>
      <h3 className="mt-4 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">{message}</p>
      {actionText && onAction && (
        <div className="mt-6">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center btn-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;