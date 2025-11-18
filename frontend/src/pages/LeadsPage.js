import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { leadsAPI } from '../utils/api';
import LeadFilters from '../components/Leads/LeadFilters';
import LeadsList from '../components/Leads/LeadsList';
import GroupedLeadsView from '../components/Leads/GroupedLeadsView';
import LeadDetailsModal from '../components/Leads/LeadDetailsModal';
import LeadAssignModal from '../components/Leads/LeadAssignModal';
import Pagination from '../components/Common/Pagination';
import toast from 'react-hot-toast';
import {
  ViewColumnsIcon,
  RectangleGroupIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const LeadsPage = () => {
  const { canCreateLeads } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [leads, setLeads] = useState([]);
  const [groupedLeads, setGroupedLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  
  // View state
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grouped'
  const [groupBy, setGroupBy] = useState('location'); // 'location' or 'service'
  
  // Modal state
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState({});

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters = {};
    for (const [key, value] of searchParams.entries()) {
      urlFilters[key] = value;
    }
    setFilters(urlFilters);
    
    if (urlFilters.page) {
      setPagination(prev => ({ ...prev, page: parseInt(urlFilters.page) || 1 }));
    }
  }, [searchParams]);

  // Load data when filters change
  useEffect(() => {
    if (viewMode === 'list') {
      loadLeads();
    } else {
      loadGroupedLeads();
    }
  }, [filters, pagination.page, pagination.limit, viewMode, groupBy]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      };
      
      const response = await leadsAPI.getAll(params);
      setLeads(response.data.leads || []);
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
    } catch (error) {
      toast.error('Failed to load leads');
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupedLeads = async () => {
    try {
      setLoading(true);
      const params = { by: groupBy, ...filters };
      const response = await leadsAPI.getGrouped(params);
      setGroupedLeads(response.data.groups || []);
    } catch (error) {
      toast.error('Failed to load grouped leads');
      console.error('Error loading grouped leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // Update URL params
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPagination(prev => ({ ...prev, page: 1 }));
    setSearchParams({});
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setShowDetailsModal(true);
  };

  const handleAssignLead = (lead) => {
    setSelectedLead(lead);
    setShowAssignModal(true);
  };

  const handleEditLead = (lead) => {
    // Navigate to edit page or open edit modal
    // For now, just show a toast
    toast.success('Edit functionality coming soon');
  };

  const handleAssignSuccess = () => {
    if (viewMode === 'list') {
      loadLeads();
    } else {
      loadGroupedLeads();
    }
  };

  const handleStatusUpdate = () => {
    if (viewMode === 'list') {
      loadLeads();
    } else {
      loadGroupedLeads();
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setLoading(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track your sales leads
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => handleViewModeChange('list')}
              className={`px-3 py-2 text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ViewColumnsIcon className="h-4 w-4 mr-1 inline" />
              List
            </button>
            <button
              onClick={() => handleViewModeChange('grouped')}
              className={`px-3 py-2 text-sm font-medium ${
                viewMode === 'grouped'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <RectangleGroupIcon className="h-4 w-4 mr-1 inline" />
              Grouped
            </button>
          </div>

          {/* Group By Selector (only show in grouped mode) */}
          {viewMode === 'grouped' && (
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="input py-2 text-sm"
            >
              <option value="location">Group by Location</option>
              <option value="service">Group by Service</option>
            </select>
          )}
          
          {/* Create Lead Button */}
          {canCreateLeads() && (
            <button className="btn-primary flex items-center">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Lead
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <LeadFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Content */}
      {viewMode === 'list' ? (
        <>
          <LeadsList
            leads={leads}
            loading={loading}
            onView={handleViewLead}
            onAssign={handleAssignLead}
            onEdit={handleEditLead}
          />
          
          {/* Pagination */}
          {!loading && pagination.pages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      ) : (
        <GroupedLeadsView
          groupedLeads={groupedLeads}
          loading={loading}
          groupBy={groupBy}
          onView={handleViewLead}
          onAssign={handleAssignLead}
          onEdit={handleEditLead}
        />
      )}

      {/* Modals */}
      <LeadDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        lead={selectedLead}
        onEdit={handleEditLead}
        onAssign={handleAssignLead}
        onStatusUpdate={handleStatusUpdate}
      />

      <LeadAssignModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        lead={selectedLead}
        onAssignSuccess={handleAssignSuccess}
      />
    </div>
  );
};

export default LeadsPage;