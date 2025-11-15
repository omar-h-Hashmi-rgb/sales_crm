import React from 'react';

const StatusBadge = ({ status, className = '' }) => {
  const getStatusConfig = (status) => {
    const configs = {
      new: {
        label: 'New',
        className: 'bg-gray-100 text-gray-800'
      },
      contacted: {
        label: 'Contacted',
        className: 'bg-blue-100 text-blue-800'
      },
      'follow-up': {
        label: 'Follow-up',
        className: 'bg-yellow-100 text-yellow-800'
      },
      qualified: {
        label: 'Qualified',
        className: 'bg-green-100 text-green-800'
      },
      converted: {
        label: 'Converted',
        className: 'bg-emerald-100 text-emerald-800'
      },
      lost: {
        label: 'Lost',
        className: 'bg-red-100 text-red-800'
      },
      pending: {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-800'
      },
      confirmed: {
        label: 'Confirmed',
        className: 'bg-green-100 text-green-800'
      },
      cancelled: {
        label: 'Cancelled',
        className: 'bg-red-100 text-red-800'
      }
    };

    return configs[status] || {
      label: status,
      className: 'bg-gray-100 text-gray-800'
    };
  };

  const { label, className: statusClass } = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass} ${className}`}>
      {label}
    </span>
  );
};

export default StatusBadge;