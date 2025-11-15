import React, { useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../Common/StatusBadge';
import SourceIcon from '../Common/SourceIcon';
import EmptyState from '../Common/EmptyState';
import LoadingSpinner from '../Common/LoadingSpinner';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  EyeIcon,
  UserPlusIcon,
  PencilIcon,
  StarIcon,
  MapPinIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const GroupedLeadsView = ({ groupedLeads, loading, groupBy, onView, onAssign, onEdit }) => {
  const { canAssignLeads, canEditLead } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  const toggleGroup = (groupKey) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getGroupIcon = () => {
    switch (groupBy) {
      case 'location':
        return MapPinIcon;
      case 'service':
        return TagIcon;
      default:
        return TagIcon;
    }
  };

  const getGroupTitle = () => {
    switch (groupBy) {
      case 'location':
        return 'Location';
      case 'service':
        return 'Service Category';
      default:
        return 'Group';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <LoadingSpinner size="lg" />
        <p className="text-center text-gray-500 mt-4">Loading grouped leads...</p>
      </div>
    );
  }

  if (!groupedLeads || groupedLeads.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <EmptyState
          type="leads"
          title="No grouped leads found"
          message="No leads match your current filters for grouping."
        />
      </div>
    );
  }

  const GroupIcon = getGroupIcon();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <GroupIcon className="h-5 w-5 mr-2 text-primary-600" />
            Leads Grouped by {getGroupTitle()}
          </h3>
          <span className="text-sm text-gray-500">
            {groupedLeads.reduce((total, group) => total + group.count, 0)} total leads
          </span>
        </div>
      </div>

      {/* Groups */}
      <div className="space-y-4">
        {groupedLeads.map((group) => {
          const groupKey = group.location || group.category || 'Unknown';
          const isExpanded = expandedGroups.has(groupKey);
          
          return (
            <div key={groupKey} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Group header */}
              <div
                className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleGroup(groupKey)}
              >
                <div className="flex items-center space-x-3">
                  <button className="text-gray-400 hover:text-gray-600">
                    {isExpanded ? (
                      <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5" />
                    )}
                  </button>
                  
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {groupKey || 'Unknown'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {group.count} lead{group.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Click to {isExpanded ? 'collapse' : 'expand'}</span>
                </div>
              </div>

              {/* Group content */}
              {isExpanded && (
                <div className="divide-y divide-gray-200">
                  {group.leads.map((lead) => (
                    <div
                      key={lead.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        lead.is_fresh ? 'bg-gradient-to-r from-blue-50 to-green-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        {/* Lead info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start space-x-3">
                            {lead.is_fresh && (
                              <StarIcon className="h-5 w-5 text-primary-500 fill-current mt-0.5" />
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h5 className="text-sm font-medium text-gray-900 truncate">
                                  {lead.name}
                                </h5>
                                <StatusBadge status={lead.status} />
                                <SourceIcon source={lead.source} />
                              </div>

                              <div className="text-sm text-gray-600 space-y-1">
                                <div>{lead.phone}</div>
                                {lead.email && <div>{lead.email}</div>}
                                {groupBy !== 'location' && lead.location && (
                                  <div className="flex items-center">
                                    <MapPinIcon className="h-4 w-4 mr-1" />
                                    {lead.location}
                                  </div>
                                )}
                                {lead.services && lead.services.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {lead.services.slice(0, 3).map((service, index) => (
                                      <span
                                        key={index}
                                        className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                                      >
                                        {service}
                                      </span>
                                    ))}
                                    {lead.services.length > 3 && (
                                      <span className="text-xs text-gray-500 px-2 py-1">
                                        +{lead.services.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between mt-3">
                                <div className="text-xs text-gray-500">
                                  Created: {formatDate(lead.created_at)}
                                </div>
                                {lead.assigned_to_name && (
                                  <div className="text-xs text-gray-600">
                                    Assigned to: {lead.assigned_to_name}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(lead);
                            }}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          
                          {canEditLead(lead) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(lead);
                              }}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                              title="Edit Lead"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          )}
                          
                          {canAssignLeads() && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAssign(lead);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                              title="Assign Lead"
                            >
                              <UserPlusIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroupedLeadsView;