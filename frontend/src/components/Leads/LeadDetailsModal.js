import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Modal from '../Common/Modal';
import StatusBadge from '../Common/StatusBadge';
import SourceIcon from '../Common/SourceIcon';
import LoadingSpinner from '../Common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { leadsAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  PencilIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

const LeadDetailsModal = ({ isOpen, onClose, lead, onEdit, onAssign, onStatusUpdate }) => {
  const { canUpdateStatus, canAssignLeads, canEditLead, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (isOpen && lead) {
      setNewStatus(lead.status);
      setStatusNotes('');
      setNewComment('');
      loadComments();
      loadHistory();
    }
  }, [isOpen, lead]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await leadsAPI.getComments(lead.id);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await leadsAPI.getHistory(lead.id);
      setHistory(response.data.history || []);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      setSubmitting(true);
      await leadsAPI.addComment(lead.id, { comment: newComment.trim() });
      setNewComment('');
      toast.success('Comment added successfully');
      loadComments();
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to add comment';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === lead.status) {
      toast.error('Please select a different status');
      return;
    }

    try {
      setSubmitting(true);
      await leadsAPI.updateStatus(lead.id, {
        status: newStatus,
        notes: statusNotes.trim() || undefined
      });
      
      toast.success('Status updated successfully');
      setStatusNotes('');
      loadHistory();
      onStatusUpdate && onStatusUpdate();
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update status';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'converted', label: 'Converted' },
    { value: 'lost', label: 'Lost' }
  ];

  if (!lead) return null;

  const tabs = [
    { id: 'details', name: 'Details', icon: DocumentTextIcon },
    { id: 'comments', name: `Comments (${comments.length})`, icon: ChatBubbleLeftIcon },
    { id: 'history', name: 'History', icon: ClockIcon }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-4xl"
      showCloseButton={true}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-gray-900">{lead.name}</h2>
              {lead.is_fresh && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  Fresh Lead
                </span>
              )}
            </div>
            
            <div className="mt-2 flex items-center space-x-4">
              <StatusBadge status={lead.status} />
              <SourceIcon source={lead.source} />
              {lead.service_category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {lead.service_category}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {canEditLead(lead) && (
              <button
                onClick={() => onEdit(lead)}
                className="btn-outline flex items-center"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </button>
            )}
            
            {canAssignLeads() && (
              <button
                onClick={() => onAssign(lead)}
                className="btn-primary flex items-center"
              >
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Assign
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab content */}
        <div className="min-h-[400px]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">{lead.phone}</span>
                    </div>
                    
                    {lead.email && (
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-900">{lead.email}</span>
                      </div>
                    )}
                    
                    {lead.location && (
                      <div className="flex items-center">
                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-900">{lead.location}</span>
                      </div>
                    )}
                    
                    {lead.address && (
                      <div className="flex items-start">
                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <span className="text-sm text-gray-900">{lead.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Lead Information</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">
                        Created: {formatDate(lead.created_at)}
                      </span>
                    </div>
                    
                    {lead.assigned_to_name && (
                      <div className="flex items-center">
                        <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-900">
                          Assigned to: {lead.assigned_to_name}
                        </span>
                      </div>
                    )}
                    
                    {lead.assigned_at && (
                      <div className="flex items-center">
                        <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-900">
                          Assigned: {formatDate(lead.assigned_at)}
                        </span>
                      </div>
                    )}
                    
                    {lead.last_contacted_at && (
                      <div className="flex items-center">
                        <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-900">
                          Last contacted: {formatDate(lead.last_contacted_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Services */}
              {lead.services && lead.services.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {lead.services.map((service, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Source Information */}
              {(lead.source_campaign_id || lead.source_ad_id) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Source Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {lead.source_campaign_id && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Campaign ID: </span>
                          <span className="text-sm text-gray-900">{lead.source_campaign_id}</span>
                        </div>
                      )}
                      {lead.source_ad_id && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Ad ID: </span>
                          <span className="text-sm text-gray-900">{lead.source_ad_id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {lead.notes && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Notes</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{lead.notes}</p>
                  </div>
                </div>
              )}

              {/* Status Update */}
              {canUpdateStatus(lead) && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Update Status</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Status
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="input max-w-xs"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (optional)
                      </label>
                      <textarea
                        value={statusNotes}
                        onChange={(e) => setStatusNotes(e.target.value)}
                        placeholder="Add notes about this status change..."
                        className="input max-w-md"
                        rows={3}
                      />
                    </div>
                    
                    <button
                      onClick={handleStatusUpdate}
                      disabled={!newStatus || newStatus === lead.status || submitting}
                      className="btn-primary"
                    >
                      {submitting ? 'Updating...' : 'Update Status'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-6">
              {/* Add comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Comment
                </label>
                <div className="space-y-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Enter your comment..."
                    className="input"
                    rows={3}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || submitting}
                    className="btn-primary"
                  >
                    {submitting ? 'Adding...' : 'Add Comment'}
                  </button>
                </div>
              </div>

              {/* Comments list */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Comments</h3>
                {loading ? (
                  <LoadingSpinner size="md" />
                ) : comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No comments yet. Be the first to add one!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {comment.user_name}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {comment.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Status History</h3>
              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No status changes recorded yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((entry) => (
                    <div key={entry.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <ClockIcon className="h-4 w-4 text-primary-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              Status changed from
                            </span>
                            {entry.old_status && (
                              <>
                                <span className="mx-1">
                                  <StatusBadge status={entry.old_status} />
                                </span>
                                <span className="text-sm font-medium text-gray-900">to</span>
                              </>
                            )}
                            <span className="ml-1">
                              <StatusBadge status={entry.new_status} />
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(entry.created_at)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          by {entry.changed_by_name}
                        </div>
                        {entry.notes && (
                          <div className="text-sm text-gray-700 mt-2 bg-white rounded p-2 border">
                            {entry.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default LeadDetailsModal;