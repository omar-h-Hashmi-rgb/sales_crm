import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { bookingsAPI } from '../utils/api';
import BookingForm from '../components/Bookings/BookingForm';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import StatusBadge from '../components/Common/StatusBadge';
import EmptyState from '../components/Common/EmptyState';
import Pagination from '../components/Common/Pagination';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  CalendarIcon,
  PlusIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  TagIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const BookingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    date_from: '',
    date_to: ''
  });

  // Initialize filters from URL
  useEffect(() => {
    const urlFilters = {};
    for (const [key, value] of searchParams.entries()) {
      if (key === 'page') {
        setPagination(prev => ({ ...prev, page: parseInt(value) || 1 }));
      } else {
        urlFilters[key] = value;
      }
    }
    setFilters(prev => ({ ...prev, ...urlFilters }));
  }, [searchParams]);

  // Load bookings when filters change
  useEffect(() => {
    loadBookings();
  }, [filters, pagination.page]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      };
      
      const response = await bookingsAPI.getAll(params);
      setBookings(response.data.bookings || []);
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
    } catch (error) {
      toast.error('Failed to load bookings');
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // Update URL
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== '') {
        newParams.set(k, v);
      }
    });
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      date_from: '',
      date_to: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    setSearchParams({});
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  const handleBookingSuccess = () => {
    setShowCreateModal(false);
    loadBookings();
  };

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

  const hasActiveFilters = Object.values(filters).some(value => value && value !== '');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <CalendarIcon className="h-7 w-7 mr-3 text-primary-600" />
            Bookings
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage customer bookings and track conversions
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Booking
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer name, phone..."
                className="pl-10 input w-full"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>

          {/* Status filter */}
          <div className="w-full lg:w-48">
            <select
              className="input w-full"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date from */}
          <div className="w-full lg:w-48">
            <input
              type="date"
              className="input w-full"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              placeholder="From date"
            />
          </div>

          {/* Date to */}
          <div className="w-full lg:w-48">
            <input
              type="date"
              className="input w-full"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              placeholder="To date"
              min={filters.date_from || ''}
            />
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="btn-outline px-3 py-2 text-sm"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <LoadingSpinner size="lg" />
          <p className="text-center text-gray-500 mt-4">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200">
          <EmptyState
            type="bookings"
            title="No bookings found"
            message="No bookings match your current filters. Try adjusting your search criteria or create a new booking."
            actionText="Create First Booking"
            onAction={() => setShowCreateModal(true)}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Services
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {booking.lead_id && (
                          <div className="flex-shrink-0 mr-2">
                            <span className="h-2 w-2 bg-green-500 rounded-full" title="Converted from lead" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.customer_name}
                          </div>
                          {booking.location && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <MapPinIcon className="h-3 w-3 mr-1" />
                              {booking.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                          {booking.customer_phone}
                        </div>
                        {booking.customer_email && (
                          <div className="flex items-center text-sm text-gray-500">
                            <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="truncate max-w-[150px]">{booking.customer_email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {booking.services && booking.services.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {booking.services.slice(0, 2).map((service, index) => (
                            <span
                              key={index}
                              className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full"
                            >
                              {service}
                            </span>
                          ))}
                          {booking.services.length > 2 && (
                            <span className="text-xs text-gray-500 px-2 py-1">
                              +{booking.services.length - 2} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No services</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {booking.date && booking.time_slot ? (
                          <div>
                            <div className="text-gray-900 flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {formatDate(booking.date)}
                            </div>
                            <div className="text-gray-500 flex items-center mt-1">
                              <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {booking.time_slot}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not scheduled</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={booking.status} />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(booking.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden divide-y divide-gray-200">
            {bookings.map((booking) => (
              <div key={booking.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    {booking.lead_id && (
                      <div className="flex-shrink-0 mt-1">
                        <span className="h-3 w-3 bg-green-500 rounded-full block" title="Converted from lead" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {booking.customer_name}
                      </h3>
                      <div className="mt-1">
                        <StatusBadge status={booking.status} />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {booking.customer_phone}
                  </div>
                  
                  {booking.customer_email && (
                    <div className="flex items-center text-gray-600">
                      <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {booking.customer_email}
                    </div>
                  )}
                  
                  {booking.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {booking.location}
                    </div>
                  )}

                  {booking.date && booking.time_slot && (
                    <div className="flex items-center text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {formatDate(booking.date)} at {booking.time_slot}
                    </div>
                  )}

                  {booking.services && booking.services.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {booking.services.map((service, index) => (
                        <span
                          key={index}
                          className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mt-3 text-xs text-gray-500">
                  Created: {formatDateTime(booking.created_at)}
                  {booking.lead_id && (
                    <span className="ml-2 text-green-600">• Converted from lead</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Create Booking Modal */}
      <BookingForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
};

export default BookingsPage;