import React, { useState } from 'react';
import { bookingsAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../Common/LoadingSpinner';
import Modal from '../Common/Modal';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  TagIcon,
  CheckCircleIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const BookingForm = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    location: '',
    services: [],
    date: '',
    time_slot: ''
  });

  const [serviceInput, setServiceInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [conversionInfo, setConversionInfo] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Customer name is required';
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'Phone number is required';
    } else {
      const phoneRegex = /^(\+91[1-9]\d{9}|[6-9]\d{9})$/;
      if (!phoneRegex.test(formData.customer_phone.replace(/\s+/g, ''))) {
        newErrors.customer_phone = 'Please enter a valid Indian mobile number';
      }
    }

    if (formData.customer_email && formData.customer_email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.customer_email)) {
        newErrors.customer_email = 'Please enter a valid email address';
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.services.length === 0) {
      newErrors.services = 'At least one service is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
    }

    if (!formData.time_slot) {
      newErrors.time_slot = 'Time slot is required';
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
      setConversionInfo(null);
      
      const submitData = {
        ...formData,
        customer_phone: formData.customer_phone.replace(/\s+/g, ''),
        customer_email: formData.customer_email || null
      };

      const response = await bookingsAPI.create(submitData);
      const result = response.data;

      if (result.conversion) {
        setConversionInfo({
          lead_id: result.lead_id,
          message: result.message
        });
        toast.success('🎉 Booking created and lead converted!', { duration: 5000 });
      } else {
        toast.success('Booking created successfully!');
      }

      // Reset form
      setFormData({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        location: '',
        services: [],
        date: '',
        time_slot: ''
      });
      
      onSuccess && onSuccess(result);
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create booking';
      toast.error(message);
      console.error('Error creating booking:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      location: '',
      services: [],
      date: '',
      time_slot: ''
    });
    setErrors({});
    setConversionInfo(null);
    onClose();
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00'
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

  // Get minimum date (today)
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Booking"
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Conversion notification */}
        {conversionInfo && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
              <div className="text-green-800">
                <p className="font-medium">Lead Conversion Detected!</p>
                <p className="text-sm mt-1">{conversionInfo.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Customer Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <PhoneIcon className="h-5 w-5 mr-2 text-primary-600" />
            Customer Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                className={`input ${errors.customer_name ? 'border-red-300 focus:ring-red-500' : ''}`}
                placeholder="Enter customer name"
              />
              {errors.customer_name && (
                <p className="mt-1 text-sm text-red-600">{errors.customer_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                  className={`pl-10 input ${errors.customer_phone ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="+91 9876543210"
                />
              </div>
              {errors.customer_phone && (
                <p className="mt-1 text-sm text-red-600">{errors.customer_phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => handleInputChange('customer_email', e.target.value)}
                  className={`pl-10 input ${errors.customer_email ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="customer@example.com"
                />
              </div>
              {errors.customer_email && (
                <p className="mt-1 text-sm text-red-600">{errors.customer_email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={`pl-10 input ${errors.location ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Service location"
                />
              </div>
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>
          </div>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <TagIcon className="h-5 w-5 mr-2 text-primary-600" />
            Services Required *
          </h3>

          {/* Quick add services */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Quick add common services:</p>
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
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Selected Services:</p>
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

          {errors.services && (
            <p className="text-sm text-red-600">{errors.services}</p>
          )}
        </div>

        {/* Scheduling */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-primary-600" />
            Schedule Booking
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  min={getMinDate()}
                  className={`pl-10 input ${errors.date ? 'border-red-300 focus:ring-red-500' : ''}`}
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Slot *
              </label>
              <div className="relative">
                <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={formData.time_slot}
                  onChange={(e) => handleInputChange('time_slot', e.target.value)}
                  className={`pl-10 input ${errors.time_slot ? 'border-red-300 focus:ring-red-500' : ''}`}
                >
                  <option value="">Select time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              {errors.time_slot && (
                <p className="mt-1 text-sm text-red-600">{errors.time_slot}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="btn-outline"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex items-center"
          >
            {submitting && <LoadingSpinner size="sm" className="mr-2" />}
            {submitting ? 'Creating...' : 'Create Booking'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BookingForm;