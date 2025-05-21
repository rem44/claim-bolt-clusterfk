import React, { useState } from 'react';
import { useClaims } from '../context/ClaimsContext';
import { format } from 'date-fns';
import { AlertTriangle, ArrowUpDown, Filter, Eye } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import { Link } from 'react-router-dom';
import { ClaimAlert } from '../types/claim';

const AlertsPage: React.FC = () => {
  const { claims, loading, error } = useClaims();
  const [sortField, setSortField] = useState<string>('alert_count');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [alertTypeFilter, setAlertTypeFilter] = useState<string>('');

  const claimsWithAlerts = claims.filter(claim => claim.alerts?.length > 0);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredClaims = alertTypeFilter
    ? claimsWithAlerts.filter(claim => 
        claim.alerts.some(alert => alert.type === alertTypeFilter)
      )
    : claimsWithAlerts;

  const sortedClaims = [...filteredClaims].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'alert_count':
        comparison = (a.alerts?.length || 0) - (b.alerts?.length || 0);
        break;
      case 'claim_number':
        comparison = a.claim_number.localeCompare(b.claim_number);
        break;
      case 'creation_date':
        comparison = new Date(a.creation_date).getTime() - new Date(b.creation_date).getTime();
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-corporate-secondary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'price_discrepancy':
        return 'bg-red-100 text-red-800';
      case 'quantity_exceeded':
        return 'bg-orange-100 text-orange-800';
      case 'delayed_claim':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAlertType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Alerts</h1>
          <p className="text-gray-500">
            {claimsWithAlerts.length} claims require attention
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={alertTypeFilter}
              onChange={(e) => setAlertTypeFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-corporate-secondary focus:border-transparent"
            >
              <option value="">All Alert Types</option>
              <option value="price_discrepancy">Price Discrepancy</option>
              <option value="quantity_exceeded">Quantity Exceeded</option>
              <option value="delayed_claim">Delayed Claim</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alert Type
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('claim_number')}
                >
                  <div className="flex items-center">
                    <span>Claim</span>
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('creation_date')}
                >
                  <div className="flex items-center">
                    <span>Created</span>
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    <span>Status</span>
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alert Details
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedClaims.map((claim) => (
                <tr key={claim.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {claim.alerts.map((alert: ClaimAlert, index: number) => (
                        <span
                          key={index}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAlertTypeColor(alert.type)}`}
                        >
                          <AlertTriangle size={12} className="mr-1" />
                          {formatAlertType(alert.type)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {claim.claim_number}
                    </div>
                    <div className="text-sm text-gray-500">
                      {claim.client?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(claim.creation_date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={claim.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 space-y-2">
                      {claim.alerts.map((alert: ClaimAlert, index: number) => (
                        <div key={index} className="text-sm">
                          <div className="font-medium">{alert.message}</div>
                          {alert.details && (
                            <div className="text-gray-500 text-xs mt-1">
                              {Object.entries(alert.details).map(([key, value]) => (
                                <div key={key} className="flex items-center">
                                  <span className="font-medium">{key}:</span>
                                  <span className="ml-1">
                                    {typeof value === 'object' ? JSON.stringify(value) : value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      to={`/claims/${claim.id}`}
                      className="text-corporate-secondary hover:text-corporate-accent"
                    >
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;