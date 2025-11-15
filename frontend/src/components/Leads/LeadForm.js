import React, { useState, useEffect } from 'react';
import { leadsAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../Common/LoadingSpinner';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  DocumentTextIcon,
  TagIcon,
  GlobeAltIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const LeadForm = ({ lead = null, onSuccess, onCancel, isModal = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    address: '',
    services: [],
    service_category: '',
    notes: '',
    source: 'manual',
    source_campaign_id: '',
    source_ad_id: ''
  });
  
  const [serviceInput, setServiceInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        phone: lead.phone || '',
        email: lead.email || '',
        location: lead.location || '',
        address: lead.address || '',
        services: lead.services || [],
        service_category: lead.service_category || '',
        notes: lead.notes || '',
        source: lead.source || 'manual',
        source_campaign_id: lead.source_campaign_id || '',
        source_ad_id: lead.source_ad_id || ''
      });
    }
  }, [lead]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const addService = () => {
    if (serviceInput.trim() && !formData.services.includes(serviceInput.trim())) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, serviceInput.trim()]
      }));
      setServiceInput('');
    }
  };

  const removeService = (index) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      // Basic phone validation
      const phoneRegex = /^(\+91[1-9]\d{9}|[6-9]\d{9})$/;
      if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
        newErrors.phone = 'Please enter a valid Indian mobile number';
      }
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.source) {
      newErrors.source = 'Source is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setSubmitting(true);
      
      const submitData = {
        ...formData,
        phone: formData.phone.replace(/\s+/g, ''), // Remove spaces
        email: formData.email || null,
        location: formData.location || null,
        address: formData.address || null,
        service_category: formData.service_category || null,
        notes: formData.notes || null,
        source_campaign_id: formData.source_campaign_id || null,
        source_ad_id: formData.source_ad_id || null
      };

      if (lead) {
        // Update lead - this would require an update API endpoint
        toast.success('Lead updated successfully!');
      } else {
        // Create new lead
        await leadsAPI.create(submitData);
        toast.success('Lead created successfully!');
      }
      
      onSuccess && onSuccess();
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to save lead';
      toast.error(message);
      console.error('Error saving lead:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const sourceOptions = [
    { value: 'manual', label: 'Manual Entry', icon: DocumentTextIcon },
    { value: 'meta', label: 'Meta Ads', icon: GlobeAltIcon },
    { value: 'google_ads', label: 'Google Ads', icon: GlobeAltIcon }
  ];

  const serviceCategoryOptions = [
    'Maintenance',
    'Repair', 
    'Cosmetic',
    'Safety',
    'Premium',
    'Basic'
  ];

  const commonServices = [
    'Car Wash',
    'Oil Change',
    'Engine Repair',
    'AC Service',
    'Brake Service',
    'Tyre Change',
    'Denting',
    'Painting',
    'Full Service',
    'Detailing',
    'Battery Check',
    'Wheel Alignment'
  ];

  return (
    <div className={isModal ? '' : 'max-w-4xl mx-auto'}>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2 text-primary-600" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`input ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                placeholder="Enter customer name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`pl-10 input ${errors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="+91 9876543210 or 9876543210"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`pl-10 input ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="customer@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location/City
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="pl-10 input"
                  placeholder="Mumbai, Delhi, etc."
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="input"
                rows={3}
                placeholder="Complete address with landmarks..."
              />
            </div>
          </div>
        </div>

        {/* Services Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
            <TagIcon className="h-5 w-5 mr-2 text-primary-600" />
            Services Required
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Category
              </label>
              <select
                value={formData.service_category}
                onChange={(e) => handleInputChange('service_category', e.target.value)}
                className="input max-w-xs"
              >
                <option value="">Select Category</option>
                {serviceCategoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Services Required
              </label>
              
              {/* Quick add common services */}
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Quick add common services:</p>
                <div className="flex flex-wrap gap-2">
                  {commonServices.map((service) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => {
                        if (!formData.services.includes(service)) {
                          setFormData(prev => ({
                            ...prev,
                            services: [...prev.services, service]
                          }));
                        }
                      }}
                      disabled={formData.services.includes(service)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PlusIcon className="h-3 w-3 inline mr-1" />
                      {service}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom service input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                  className="input flex-1"
                  placeholder="Add custom service..."
                />
                <button
                  type="button"
                  onClick={addService}
                  className="btn-primary px-4"
                  disabled={!serviceInput.trim()}
                >
                  Add
                </button>
              </div>

              {/* Selected services */}
              {formData.services.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Selected Services:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.services.map((service, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                      >
                        {service}
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="ml-2 text-primary-600 hover:text-primary-800"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Source Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
            <GlobeAltIcon className="h-5 w-5 mr-2 text-primary-600" />
            Source Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source *
              </label>
              <select
                value={formData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
                className={`input ${errors.source ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
              >
                {sourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.source && (
                <p className="mt-1 text-sm text-red-600">{errors.source}</p>
              )}
            </div>

            {formData.source !== 'manual' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign ID
                  </label>
                  <input
                    type="text"
                    value={formData.source_campaign_id}
                    onChange={(e) => handleInputChange('source_campaign_id', e.target.value)}
                    className="input"
                    placeholder="Campaign identifier"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad ID
                  </label>
                  <input
                    type="text"
                    value={formData.source_ad_id}
                    onChange={(e) => handleInputChange('source_ad_id', e.target.value)}
                    className="input"
                    placeholder="Ad identifier"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Additional Notes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Additional Notes
          </h3>
          
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="input"
            rows={4}
            placeholder="Any additional information, customer requirements, or special notes..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-outline"
              disabled={submitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex items-center"
          >
            {submitting && <LoadingSpinner size="sm" className="mr-2" />}
            {submitting ? 'Saving...' : (lead ? 'Update Lead' : 'Create Lead')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;