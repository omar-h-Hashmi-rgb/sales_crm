import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LeadForm from '../components/Leads/LeadForm';
import {
  ArrowLeftIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

const CreateLeadPage = () => {
  const navigate = useNavigate();
  const { canCreateLeads } = useAuth();

  // Redirect if user doesn't have permission
  if (!canCreateLeads()) {
    navigate('/leads');
    return null;
  }

  const handleSuccess = () => {
    navigate('/leads');
  };

  const handleCancel = () => {
    navigate('/leads');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/leads')}
            className="btn-outline p-2"
            title="Back to Leads"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <UserPlusIcon className="h-7 w-7 mr-3 text-primary-600" />
              Create New Lead
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Add a new sales lead to the system
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <LeadForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CreateLeadPage;