import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../utils/api';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  XMarkIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const LeadFilters = ({ filters, onFiltersChange, onClearFilters }) => {
  const [users, setUsers] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleClearAll = () => {
    onClearFilters();
    setShowAdvanced(false);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value && value !== '' && (!Array.isArray(value) || value.length > 0)
  );

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      value && value !== '' && (!Array.isArray(value) || value.length > 0)
    ).length;
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'converted', label: 'Converted' },
    { value: 'lost', label: 'Lost' }
  ];

  const sourceOptions = [
    { value: '', label: 'All Sources' },
    { value: 'meta', label: 'Meta' },
    { value: 'google_ads', label: 'Google Ads' },
    { value: 'manual', label: 'Manual' }
  ];

  const tierOptions = [
    { value: '', label: 'All Tiers' },
    { value: '1', label: 'Admin' },
    { value: '2', label: 'Area Manager' },
    { value: '3', label: 'Store Manager' },
    { value: '4', label: 'Sales Rep' }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Main filter bar */}
      <div className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                className="pl-10 input w-full"
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>

          {/* Status filter */}
          <div className="w-full lg:w-48">
            <select
              className="input w-full"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Source filter */}
          <div className="w-full lg:w-48">
            <select
              className="input w-full"
              value={filters.source || ''}
              onChange={(e) => handleFilterChange('source', e.target.value)}
            >
              {sourceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Advanced filters toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`btn-outline flex items-center justify-center px-4 py-2 ${
                showAdvanced ? 'bg-primary-50 border-primary-200 text-primary-700' : ''
              }`}
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
              More
              {hasActiveFilters && (
                <span className="ml-2 bg-primary-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>

            {/* Clear all button - only show when there are active filters */}
            {hasActiveFilters && (
              <button
                onClick={handleClearAll}
                className="btn-outline text-gray-600 hover:text-gray-800 px-3 py-2"
                title="Clear all filters"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Assigned to filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned To
              </label>
              <select
                className="input w-full"
                value={filters.assigned_to || ''}
                onChange={(e) => handleFilterChange('assigned_to', e.target.value)}
                disabled={loading}
              >
                <option value="">All Users</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.tier_level === 1 ? 'Admin' : 
                              user.tier_level === 2 ? 'Area Mgr' : 
                              user.tier_level === 3 ? 'Store Mgr' : 'Sales Rep'})
                  </option>
                ))}
              </select>
            </div>

            {/* Tier filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Tier
              </label>
              <select
                className="input w-full"
                value={filters.tier_filter || ''}
                onChange={(e) => handleFilterChange('tier_filter', e.target.value)}
              >
                {tierOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fresh leads filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lead Type
              </label>
              <select
                className="input w-full"
                value={filters.is_fresh || ''}
                onChange={(e) => handleFilterChange('is_fresh', e.target.value)}
              >
                <option value="">All Leads</option>
                <option value="true">Fresh Leads Only</option>
                <option value="false">Assigned Leads Only</option>
              </select>
            </div>

            {/* Service category filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Category
              </label>
              <select
                className="input w-full"
                value={filters.service_category || ''}
                onChange={(e) => handleFilterChange('service_category', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Repair">Repair</option>
                <option value="Cosmetic">Cosmetic</option>
                <option value="Safety">Safety</option>
                <option value="Premium">Premium</option>
                <option value="Basic">Basic</option>
              </select>
            </div>

            {/* Date from */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created From
              </label>
              <input
                type="date"
                className="input w-full"
                value={filters.date_from || ''}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Date to */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created To
              </label>
              <input
                type="date"
                className="input w-full"
                value={filters.date_to || ''}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                min={filters.date_from || ''}
              />
            </div>

            {/* Location filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                placeholder="Filter by location..."
                className="input w-full"
                value={filters.location || ''}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            {/* Last contacted filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Contacted
              </label>
              <select
                className="input w-full"
                value={filters.last_contacted || ''}
                onChange={(e) => handleFilterChange('last_contacted', e.target.value)}
              >
                <option value="">Any Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this_week">This Week</option>
                <option value="last_week">Last Week</option>
                <option value="this_month">This Month</option>
                <option value="never">Never Contacted</option>
              </select>
            </div>
          </div>

          {/* Advanced filter actions */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {hasActiveFilters ? (
                <span>
                  {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} applied
                </span>
              ) : (
                <span>No filters applied</span>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleClearAll}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
                disabled={!hasActiveFilters}
              >
                Clear All Filters
              </button>
              <button
                onClick={() => setShowAdvanced(false)}
                className="btn-outline text-sm px-3 py-1"
              >
                Hide Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadFilters;