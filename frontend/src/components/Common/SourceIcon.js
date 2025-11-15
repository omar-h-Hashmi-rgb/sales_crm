import React from 'react';
import { 
  GlobeAltIcon,
  MagnifyingGlassIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const SourceIcon = ({ source, className = 'h-4 w-4' }) => {
  const getSourceConfig = (source) => {
    const configs = {
      meta: {
        icon: GlobeAltIcon,
        label: 'Meta',
        color: 'text-blue-600'
      },
      google_ads: {
        icon: MagnifyingGlassIcon,
        label: 'Google Ads',
        color: 'text-green-600'
      },
      manual: {
        icon: UserIcon,
        label: 'Manual',
        color: 'text-gray-600'
      }
    };

    return configs[source] || {
      icon: UserIcon,
      label: source,
      color: 'text-gray-600'
    };
  };

  const { icon: Icon, label, color } = getSourceConfig(source);

  return (
    <div className="flex items-center space-x-1" title={label}>
      <Icon className={`${className} ${color}`} />
      <span className={`text-xs ${color}`}>{label}</span>
    </div>
  );
};

export default SourceIcon;