import React, { useState } from 'react';
import { useClaims } from '../context/ClaimsContext';
import { BarChart3, PieChart, LineChart, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ClaimStatus, Department, ClaimCategory } from '../types/claim';

const ReportsPage: React.FC = () => {
  const { claims } = useClaims();
  const [selectedReport, setSelectedReport] = useState('status');
  const [dateRange, setDateRange] = useState('month');

  const getFilteredClaims = () => {
    const now = new Date();
    const filterDate = new Date();
    
    switch (dateRange) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return claims;
    }

    return claims.filter(claim => new Date(claim.creation_date) >= filterDate);
  };

  const getStatusData = () => {
    const statusCounts = Object.values(ClaimStatus).reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {} as Record<string, number>);

    getFilteredClaims().forEach(claim => {
      statusCounts[claim.status]++;
    });

    return statusCounts;
  };

  const getDepartmentData = () => {
    const departmentCounts = Object.values(Department).reduce((acc, dept) => {
      acc[dept] = 0;
      return acc;
    }, {} as Record<string, number>);

    getFilteredClaims().forEach(claim => {
      departmentCounts[claim.department]++;
    });

    return departmentCounts;
  };

  const getCategoryData = () => {
    const categoryCounts = Object.values(ClaimCategory).reduce((acc, category) => {
      acc[category] = 0;
      return acc;
    }, {} as Record<string, number>);

    getFilteredClaims().forEach(claim => {
      categoryCounts[claim.claim_category]++;
    });

    return categoryCounts;
  };

  const getFinancialData = () => {
    const data = getFilteredClaims().reduce((acc, claim) => {
      acc.totalClaimed += claim.claimed_amount;
      acc.totalSolution += claim.solution_amount;
      acc.totalSaved += claim.saved_amount;
      return acc;
    }, { totalClaimed: 0, totalSolution: 0, totalSaved: 0 });

    return data;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Reports & Analytics</h1>
        <button className="bg-corporate-secondary hover:bg-corporate-accent text-white px-4 py-2 rounded-md transition-colors duration-300 flex items-center">
          <Download size={20} className="mr-2" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Report Type</h2>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-corporate-secondary focus:border-transparent"
            >
              <option value="status">Claims by Status</option>
              <option value="department">Claims by Department</option>
              <option value="category">Claims by Category</option>
              <option value="financial">Financial Overview</option>
            </select>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-medium text-gray-500">Time Period</h3>
            <div className="flex space-x-2">
              {['week', 'month', 'quarter', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setDateRange(period)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    dateRange === period
                      ? 'bg-corporate-secondary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {selectedReport === 'status' && (
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <PieChart size={20} className="mr-2 text-corporate-secondary" />
                  Claims by Status
                </h3>
                <div className="space-y-2">
                  {Object.entries(getStatusData()).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          status === ClaimStatus.New ? 'bg-red-500' :
                          status === ClaimStatus.Screening ? 'bg-blue-500' :
                          status === ClaimStatus.Analyzing ? 'bg-yellow-500' :
                          status === ClaimStatus.Negotiation ? 'bg-purple-500' :
                          status === ClaimStatus.Accepted ? 'bg-green-500' :
                          'bg-gray-500'
                        }`}></div>
                        <span className="text-sm text-gray-600">{status}</span>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedReport === 'department' && (
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <BarChart3 size={20} className="mr-2 text-corporate-secondary" />
                  Claims by Department
                </h3>
                <div className="space-y-2">
                  {Object.entries(getDepartmentData()).map(([dept, count]) => (
                    <div key={dept} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{dept}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedReport === 'category' && (
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <PieChart size={20} className="mr-2 text-corporate-secondary" />
                  Claims by Category
                </h3>
                <div className="space-y-2">
                  {Object.entries(getCategoryData()).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{category}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedReport === 'financial' && (
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <LineChart size={20} className="mr-2 text-corporate-secondary" />
                  Financial Overview
                </h3>
                <div className="space-y-4">
                  {Object.entries(getFinancialData()).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">
                        {key === 'totalClaimed' ? 'Total Claimed Amount' :
                         key === 'totalSolution' ? 'Total Solution Amount' :
                         'Total Saved Amount'}
                      </div>
                      <div className={`text-xl font-semibold ${
                        key === 'totalSaved' && value >= 0 ? 'text-green-600' :
                        key === 'totalSaved' ? 'text-red-600' :
                        'text-gray-900'
                      }`}>
                        ${Math.abs(value).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {getFilteredClaims()
              .sort((a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime())
              .slice(0, 5)
              .map(claim => (
                <div key={claim.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <div className="font-medium text-gray-900">{claim.claim_number}</div>
                    <div className="text-sm text-gray-500">
                      Status changed to {claim.status}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(claim.last_updated), 'MMM d, yyyy')}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;