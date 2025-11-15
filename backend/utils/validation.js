const Joi = require('joi');

// Phone validation - supports both formats
const phoneRegex = /^(\+91[1-9]\d{9}|[6-9]\d{9})$/;

const leadSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().pattern(phoneRegex).required().messages({
    'string.pattern.base': 'Phone must be a valid Indian mobile number (10 digits starting with 6-9 or +91 format)'
  }),
  email: Joi.string().email().optional().allow(''),
  location: Joi.string().max(200).optional().allow(''),
  address: Joi.string().max(500).optional().allow(''),
  services: Joi.array().items(Joi.string()).optional(),
  service_category: Joi.string().max(100).optional().allow(''),
  notes: Joi.string().max(1000).optional().allow(''),
  source: Joi.string().valid('meta', 'google_ads', 'manual').required(),
  source_campaign_id: Joi.string().max(255).optional().allow(''),
  source_ad_id: Joi.string().max(255).optional().allow('')
});

const statusSchema = Joi.object({
  status: Joi.string().valid('new', 'contacted', 'follow-up', 'qualified', 'converted', 'lost').required(),
  notes: Joi.string().max(500).optional().allow('')
});

const assignmentSchema = Joi.object({
  assigned_to_user_id: Joi.string().uuid().required()
});

const commentSchema = Joi.object({
  comment: Joi.string().min(1).max(1000).required()
});

const bookingSchema = Joi.object({
  customer_name: Joi.string().min(2).max(100).required(),
  customer_phone: Joi.string().pattern(phoneRegex).required(),
  customer_email: Joi.string().email().optional().allow(''),
  location: Joi.string().max(200).required(),
  services: Joi.array().items(Joi.string()).min(1).required(),
  date: Joi.date().iso().required(),
  time_slot: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

module.exports = {
  leadSchema,
  statusSchema,
  assignmentSchema,
  commentSchema,
  bookingSchema,
  loginSchema,
  phoneRegex
};