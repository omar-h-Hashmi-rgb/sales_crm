import React, { useState, useEffect } from 'react';
import Modal from '../Common/Modal';
import LoadingSpinner from '../Common/LoadingSpinner';
import { usersAPI, leadsAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { UserIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const LeadAssignModal = ({ isOpen, onClose, lead, onAssignSuccess }) => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setSelectedUserId('');
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data.users || []);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) {
      toast.error('Please select a user to assign');
      return;
    }

    try {
      setSubmitting(true);
      await leadsAPI.assign(lead.id, { assigned_to_user_id: selectedUserId });
      
      toast.success('Lead assigned successfully!');
      onAssignSuccess();
      onClose();
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to assign lead';
      toast.error(message);
      console.error('Error assigning lead:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getTierName = (tierLevel) => {
    const tierNames = {
      1: 'Admin',
      2: 'Area Manager',
      3: 'Store Manager',
      4: 'Sales Rep'
    };
    return tierNames[tierLevel] || 'Unknown';
  };

  const getTierColor = (tierLevel) => {
    const colors = {
      1: 'bg-red-100 text-red-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-green-100 text-green-800',
      4: 'bg-yellow-100 text-yellow-800'
    };
    return colors[tierLevel] || 'bg-gray-100 text-gray-800';
  };

  const groupedUsers = users.reduce((acc, user) => {
    const tierKey = user.tier_level;
    if (!acc[tierKey]) {
      acc[tierKey] = [];
    }
    acc[tierKey].push(user);
    return acc;
  }, {});

  const sortedTiers = Object.keys(groupedUsers).sort((a, b) => parseInt(a) - parseInt(b));

  if (!lead) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Lead"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Lead information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Lead Information</h4>
          <div className="space-y-2">
            <div><span className="font-medium">Name:</span> {lead.name}</div>
            <div><span className="font-medium">Phone:</span> {lead.phone}</div>
            {lead.email && <div><span className="font-medium">Email:</span> {lead.email}</div>}
            {lead.location && <div><span className="font-medium">Location:</span> {lead.location}</div>}
            {lead.services && lead.services.length > 0 && (
              <div><span className="font-medium">Services:</span> {lead.services.join(', ')}</div>
            )}
          </div>
        </div>

        {/* Current assignment */}
        {lead.assigned_to_name && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800">
                Currently assigned to: <span className="font-medium">{lead.assigned_to_name}</span>
              </span>
            </div>
          </div>
        )}

        {/* User selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select User to Assign
          </label>

          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {sortedTiers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No users available for assignment
                </div>
              ) : (
                sortedTiers.map((tierLevel) => (
                  <div key={tierLevel} className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${getTierColor(parseInt(tierLevel))}`}>
                        Tier {tierLevel}
                      </span>
                      {getTierName(parseInt(tierLevel))}
                    </h5>
                    
                    <div className="space-y-2">
                      {groupedUsers[tierLevel].map((user) => (
                        <label
                          key={user.id}
                          className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedUserId === user.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="assignedUser"
                            value={user.id}
                            checked={selectedUserId === user.id}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center">
                              <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-900">
                                {user.name}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                          {user.id === lead.assigned_to_user_id && (
                            <span className="ml-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                              Current
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="btn-outline"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={!selectedUserId || submitting || loading}
            className="btn-primary flex items-center"
          >
            {submitting && <LoadingSpinner size="sm" className="mr-2" />}
            {submitting ? 'Assigning...' : 'Assign Lead'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LeadAssignModal;