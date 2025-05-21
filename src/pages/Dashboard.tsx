import React, { useState, useEffect } from 'react';
import { useClaims } from '../context/ClaimsContext';
import { format } from 'date-fns';
import { Eye, ArrowUpDown, Filter, Grid, Brush as RollerBrush } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import AlertBadge from '../components/ui/AlertBadge';
import { Link } from 'react-router-dom';
import { ProductCategory, ClaimCategory } from '../types/claim';

const Dashboard: React.FC = () => {
  const { claims, calculateTotals, loading, error, refreshClaims } = useClaims();
  const [sortField, setSortField] = useState<string>('creation_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    cause: ClaimCategory.ManufacturingDefect,
    installed: '',
    hasAlerts: false,
  });

  useEffect(() => {
    refreshClaims();
  }, []);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredClaims = claims.filter(claim => {
    return (
      (filters.status === '' || claim.status === filters.status) &&
      (filters.department === '' || claim.department === filters.department) &&
      (filters.cause === '' || claim.claim_category === filters.cause) &&
      (filters.installed === '' || 
        (filters.installed === 'yes' ? claim.installed : !claim.installed)) &&
      (!filters.hasAlerts || (claim.alerts && claim.alerts.length > 0))
    );
  });

  const sortedClaims = [...filteredClaims].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'creation_date':
        comparison = new Date(a.creation_date).getTime() - new Date(b.creation_date).getTime();
        break;
      case 'claim_number':
        comparison = a.claim_number.localeCompare(b.claim_number);
        break;
      case 'clientName':
        comparison = a.client?.name?.localeCompare(b.client?.name || '') || 0;
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'department':
        comparison = a.department.localeCompare(b.department);
        break;
      case 'solution_amount':
        comparison = a.solution_amount - b.solution_amount;
        break;
      case 'claimed_amount':
        comparison = a.claimed_amount - b.claimed_amount;
        break;
      case 'saved_amount':
        comparison = a.saved_amount - b.saved_amount;
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const uniqueDepartments = Array.from(new Set(claims.map(claim => claim.department)));
  
  const { totalSolution, totalClaimed, totalSaved } = calculateTotals();

  const getCategoryIcon = (category: ProductCategory) => {
    switch (category) {
      case ProductCategory.Tiles:
        return <Grid size={16} className="text-blue-600" />;
      case ProductCategory.Broadloom:
        return <RollerBrush size={16} className="text-green-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-corporate-blue"></div>
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

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Active Claims" 
          value={claims.filter(c => c.status !== 'Closed').length.toString()} 
          icon="📋" 
          color="bg-blue-50 text-blue-600"
        />
        <StatCard 
          title="Solution Amount" 
          value={`$${totalSolution.toLocaleString()}`} 
          icon="💰" 
          color="bg-green-50 text-green-600"
        />
        <StatCard 
          title="Claimed Amount" 
          value={`$${totalClaimed.toLocaleString()}`} 
          icon="💸" 
          color="bg-red-50 text-red-600"
        />
        <StatCard 
          title="Total Saved" 
          value={`$${totalSaved.toLocaleString()}`} 
          icon="💎" 
          color={totalSaved >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}
        />
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <div className="flex items-center mb-2">
          <Filter size={16} className="mr-2 text-gray-500" />
          <h3 className="font-semibold">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-corporate-secondary focus:border-corporate-secondary"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Statuses</option>
              {Object.values(claims.map(c => c.status)).map((status, index) => (
                <option key={index} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-corporate-secondary focus:border-corporate-secondary"
              value={filters.department}
              onChange={(e) => setFilters({...filters, department: e.target.value})}
            >
              <option value="">All Departments</option>
              {uniqueDepartments.map((dept, index) => (
                <option key={index} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cause</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-corporate-secondary focus:border-corporate-secondary"
              value={filters.cause}
              onChange={(e) => setFilters({...filters, cause: e.target.value})}
            >
              <option value="">All Causes</option>
              <option value={ClaimCategory.ManufacturingDefect}>Manufacturing Defect</option>
              <option value={ClaimCategory.ShippingIssue}>Shipping Issue</option>
              <option value={ClaimCategory.AppearanceOrPerformance}>Appearance or Performance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Installed</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-corporate-secondary focus:border-corporate-secondary"
              value={filters.installed}
              onChange={(e) => setFilters({...filters, installed: e.target.value})}
            >
              <option value="">All</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alerts</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-corporate-secondary focus:border-corporate-secondary"
              value={filters.hasAlerts ? 'yes' : 'no'}
              onChange={(e) => setFilters({...filters, hasAlerts: e.target.value === 'yes'})}
            >
              <option value="no">All Claims</option>
              <option value="yes">With Alerts Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <SortableHeader
                  title="Claim"
                  field="claim_number"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  title="Date"
                  field="creation_date"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  title="Status"
                  field="status"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  title="Department"
                  field="department"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cause
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Installed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <SortableHeader
                  title="Solution $"
                  field="solution_amount"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                  className="text-right"
                />
                <SortableHeader
                  title="Claimed $"
                  field="claimed_amount"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                  className="text-right"
                />
                <SortableHeader
                  title="Saved $"
                  field="saved_amount"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                  className="text-right"
                />
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedClaims.map((claim, index) => (
                <tr 
                  key={claim.id} 
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-150`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(claim.category as ProductCategory)}
                      <span className="text-sm text-gray-600">{claim.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {claim.claim_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {claim.client?.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(claim.creation_date), 'dd-MMM-yy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={claim.status} />
                      {claim.alerts?.length > 0 && <AlertBadge alerts={claim.alerts} />}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {claim.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {claim.claim_category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {claim.installed ? 
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Yes</span> : 
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">No</span>
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {claim.invoice_link ? 
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye size={16} />
                      </button> : 
                      '—'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${claim.solution_amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right font-medium">
                    ${claim.claimed_amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`
                      px-2 py-1 rounded text-sm font-medium
                      ${claim.saved_amount >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                    `}>
                      ${Math.abs(claim.saved_amount).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      to={`/claims/${claim.id}`}
                      className="text-corporate-blue hover:text-corporate-lightBlue transition-colors duration-200"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td colSpan={8} className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Total ({sortedClaims.length} claims)
                </td>
                <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                  ${sortedClaims.reduce((sum, claim) => sum + claim.solution_amount, 0).toLocaleString()}
                </td>
                <td className="px-6 py-3 text-right text-sm font-medium text-red-600">
                  ${sortedClaims.reduce((sum, claim) => sum + claim.claimed_amount, 0).toLocaleString()}
                </td>
                <td className="px-6 py-3 text-right text-sm font-medium">
                  <span className={`
                    px-2 py-1 rounded
                    ${totalSaved >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  `}>
                    ${Math.abs(sortedClaims.reduce((sum, claim) => sum + claim.saved_amount, 0)).toLocaleString()}
                  </span>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center">
        <div className={`${color} p-3 rounded-full`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
};

interface SortableHeaderProps {
  title: string;
  field: string;
  currentSort: string;
  direction: 'asc' | 'desc';
  onSort: (field: string) => void;
  className?: string;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ 
  title, 
  field, 
  currentSort, 
  direction, 
  onSort,
  className = "text-left" 
}) => {
  return (
    <th 
      className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{title}</span>
        <ArrowUpDown 
          size={14} 
          className={`${currentSort === field ? 'text-corporate-blue' : 'text-gray-400'}`} 
        />
      </div>
    </th>
  );
};

export default Dashboard;