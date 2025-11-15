import React from 'react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../Common/StatusBadge';
import SourceIcon from '../Common/SourceIcon';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
  StarIcon,
  EyeIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

const LeadCard = ({ lead, onView, onAssign }) => {
  const { canAssignLeads } = useAuth();

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const formatTime = (dateString) => {
    try {
      return format(new Date(dateString), 'HH:mm');
    } catch {
      return '';
    }
  };

  return (
    <div className={`card p-4 hover:shadow-md transition-shadow ${lead.is_fresh ? 'fresh-lead' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          {/* Fresh indicator */}
          {lead.is_fresh && (
            <div className="flex-shrink-0">
              <StarIcon className="h-5 w-5 text-primary-500 fill-current" title="Fresh Lead" />
            </div>
          )}
          
          {/* Lead info */}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {lead.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <StatusBadge status={lead.status} />
              <SourceIcon source={lead.source} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(lead)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          
          {canAssignLeads() && (
            <button
              onClick={() => onAssign(lead)}
              className="p-2 text-primary-600 hover:text-primary-800 rounded-md hover:bg-primary-50"
              title="Assign Lead"
            >
              <UserPlusIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <PhoneIcon className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">{lead.phone}</span>
        </div>
        
        {lead.email && (
          <div className="flex items-center text-sm text-gray-600">
            <EnvelopeIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
        
        {lead.location && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{lead.location}</span>
          </div>
        )}
      </div>

      {/* Services */}
      {lead.services && lead.services.length > 0 && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-1">Services</div>
          <div className="flex flex-wrap gap-1">
            {lead.services.slice(0, 3).map((service, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
              >
                {service}
              </span>
            ))}
            {lead.services.length > 3 && (
              <span className="inline-block text-xs text-gray-500 px-2 py-1">
                +{lead.services.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Assignment info */}
      {lead.assigned_to_name && (
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <UserIcon className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">
            Assigned to {lead.assigned_to_name}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <div className="flex items-center">
          <CalendarIcon className="h-3 w-3 mr-1" />
          <span>{formatDate(lead.created_at)}</span>
        </div>
        
        {lead.last_contacted_at && (
          <div className="text-right">
            <div>Last contacted</div>
            <div className="font-medium">
              {formatDate(lead.last_contacted_at)} {formatTime(lead.last_contacted_at)}
            </div>
          </div>
        )}
      </div>

      {/* Notes preview */}
      {lead.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-1">Notes</div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {lead.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default LeadCard;