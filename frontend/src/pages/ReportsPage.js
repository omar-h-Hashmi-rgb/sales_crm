import React from 'react';
import { ChartBarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ReportsPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <ChartBarIcon className="h-7 w-7 mr-3 text-primary-600" />
          Reports & Analytics
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Track performance and analyze lead conversion metrics
        </p>
      </div>

      {/* Coming Soon */}
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Reports Coming Soon
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          We're working on comprehensive reporting features including lead conversion rates, 
          performance metrics, and detailed analytics. Stay tuned!
        </p>
      </div>
    </div>
  );
};

export default ReportsPage;