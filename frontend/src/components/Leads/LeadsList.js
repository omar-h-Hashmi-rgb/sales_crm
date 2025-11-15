import React from 'react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../Common/StatusBadge';
import SourceIcon from '../Common/SourceIcon';
import EmptyState from '../Common/EmptyState';
import LoadingSpinner from '../Common/LoadingSpinner';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  UserIcon,
  EyeIcon,
  UserPlusIcon,
  StarIcon,
  PencilIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const LeadsList = ({ leads, loading, onView, onAssign, onEdit }) => {
  const { canAssignLeads, canEditLead, user } = useAuth();

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  const getServicesPreview = (services) => {
    if (!services || services.length === 0) return null;
    return services.slice(0, 2).join(', ') + (services.length > 2 ? `, +${services.length - 2} more` : '');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <LoadingSpinner size="lg" />
        <p className="text-center text-gray-500 mt-4">Loading leads...</p>
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <EmptyState
          type="leads"
          title="No leads found"
          message="No leads match your current filters. Try adjusting your search criteria or create a new lead."
          actionText={canAssignLeads() ? "Create New Lead" : null}
          onAction={canAssignLeads() ? () => window.location.href = '/leads/create' : null}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">
          Leads ({leads.length})
        </h3>
      </div>

      {/* Desktop table view */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lead Information
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Services
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status & Source
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assignment
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timeline
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className={`hover:bg-gray-50 transition-colors ${
                  lead.is_fresh ? 'bg-gradient-to-r from-blue-50 via-white to-green-50 border-l-4 border-primary-400' : ''
                }`}
              >
                {/* Lead Information */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {lead.is_fresh && (
                      <div className="flex-shrink-0 mr-3">
                        <StarIcon className="h-5 w-5 text-primary-500 fill-current" title="Fresh Lead" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {lead.name}
                      </div>
                      {lead.location && (
                        <div className="text-sm text-gray-500 truncate">
                          {lead.location}
                        </div>
                      )}
                      {lead.service_category && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {lead.service_category}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Contact Details */}
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-900">
                      <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {lead.phone}
                    </div>
                    {lead.email && (
                      <div className="flex items-center text-sm text-gray-500">
                        <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="truncate max-w-[150px]">{lead.email}</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* Services */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {lead.services && lead.services.length > 0 ? (
                      <div>
                        <div className="truncate max-w-[200px]" title={lead.services.join(', ')}>
                          {getServicesPreview(lead.services)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">No services specified</span>
                    )}
                  </div>
                </td>

                {/* Status & Source */}
                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-2">
                    <StatusBadge status={lead.status} />
                    <SourceIcon source={lead.source} />
                  </div>
                </td>

                {/* Assignment */}
                <td className="px-6 py-4">
                  {lead.assigned_to_name ? (
                    <div className="text-sm">
                      <div className="flex items-center text-gray-900">
                        <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-medium">{lead.assigned_to_name}</span>
                      </div>
                      {lead.assigned_at && (
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(lead.assigned_at)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Unassigned</span>
                  )}
                </td>

                {/* Timeline */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>Created: {formatDate(lead.created_at)}</span>
                    </div>
                    {lead.last_contacted_at && (
                      <div className="text-xs text-primary-600 mt-1">
                        Last contact: {formatDate(lead.last_contacted_at)}
                      </div>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onView(lead)}
                      className="inline-flex items-center p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-md transition-colors"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    
                    {canEditLead(lead) && (
                      <button
                        onClick={() => onEdit(lead)}
                        className="inline-flex items-center p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                        title="Edit Lead"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}
                    
                    {canAssignLeads() && (
                      <button
                        onClick={() => onAssign(lead)}
                        className="inline-flex items-center p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                        title="Assign Lead"
                      >
                        <UserPlusIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="lg:hidden divide-y divide-gray-200">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className={`p-4 ${
              lead.is_fresh ? 'bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-primary-400' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                {lead.is_fresh && (
                  <div className="flex-shrink-0 mt-1">
                    <StarIcon className="h-5 w-5 text-primary-500 fill-current" title="Fresh Lead" />
                  </div>
                )}
                
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {lead.name}
                  </h3>
                  
                  <div className="mt-1 flex items-center space-x-2">
                    <StatusBadge status={lead.status} />
                    <SourceIcon source={lead.source} />
                  </div>

                  {lead.service_category && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {lead.service_category}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Mobile actions */}
              <div className="flex items-center space-x-1 ml-4">
                <button
                  onClick={() => onView(lead)}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-md"
                  title="View Details"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                
                {canEditLead(lead) && (
                  <button
                    onClick={() => onEdit(lead)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-md"
                    title="Edit Lead"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                )}
                
                {canAssignLeads() && (
                  <button
                    onClick={() => onAssign(lead)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                    title="Assign Lead"
                  >
                    <UserPlusIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Mobile contact info */}
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                <span>{lead.phone}</span>
              </div>
              
              {lead.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="truncate">{lead.email}</span>
                </div>
              )}
              
              {lead.location && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="truncate">{lead.location}</span>
                </div>
              )}

              {lead.services && lead.services.length > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Services: </span>
                  <span>{getServicesPreview(lead.services)}</span>
                </div>
              )}
              
              {lead.assigned_to_name && (
                <div className="flex items-center text-sm text-gray-600">
                  <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Assigned to {lead.assigned_to_name}</span>
                </div>
              )}
            </div>
            
            {/* Mobile footer */}
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  <span>Created: {formatDate(lead.created_at)}</span>
                </div>
                {lead.last_contacted_at && (
                  <div className="text-primary-600">
                    Last contact: {formatDate(lead.last_contacted_at)}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile notes preview */}
            {lead.notes && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Notes</div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {lead.notes}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadsList;