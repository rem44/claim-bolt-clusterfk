import React, { useState, useEffect } from 'react';
import { useClaims } from '../context/ClaimsContext';
import { DateRangeFilter } from '../components/analytics/Filters/DateRangeFilter';
import { KPICard } from '../components/analytics/KPI/KPICard';
import { ClaimStatusChart } from '../components/analytics/Charts/ClaimStatusChart';
import { ClaimTrendChart } from '../components/analytics/Charts/ClaimTrendChart';
import { Download, FileText, Filter, ClipboardList, DollarSign, TrendingDown } from 'lucide-react';
import { 
  groupClaimsByStatus, 
  groupClaimsByDepartment,
  calculateFinancialMetrics,
  createTimeSeriesData,
  calculateTrend,
  getTopCauses
} from '../utils/analytics';
import { format, subMonths } from 'date-fns';

const AnalyticsDashboard: React.FC = () => {
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const { claims } = useClaims();
  
  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };
  
  const filteredClaims = claims.filter(claim => {
    const claimDate = new Date(claim.creation_date);
    return claimDate >= startDate && claimDate <= endDate;
  });

  const prevStartDate = new Date(startDate);
  prevStartDate.setDate(prevStartDate.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const prevClaims = claims.filter(claim => {
    const claimDate = new Date(claim.creation_date);
    return claimDate >= prevStartDate && claimDate < startDate;
  });

  const statusData = groupClaimsByStatus(filteredClaims);
  const trendData = createTimeSeriesData(filteredClaims, 'month');
  const { totalClaimed, totalSolution, totalSaved } = calculateFinancialMetrics(filteredClaims);
  const prevMetrics = calculateFinancialMetrics(prevClaims);

  const claimedTrend = calculateTrend(totalClaimed, prevMetrics.totalClaimed);
  const solutionTrend = calculateTrend(totalSolution, prevMetrics.totalSolution);
  const savedTrend = calculateTrend(totalSaved, prevMetrics.totalSaved);
  
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Analytics Dashboard</h1>
        <div className="flex gap-2">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter size={18} className="mr-2" />
            Advanced Filters
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={18} className="mr-2" />
            Export
          </button>
          <button className="flex items-center px-4 py-2 bg-corporate-secondary text-white rounded-md hover:bg-corporate-accent transition-colors">
            <FileText size={18} className="mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      <DateRangeFilter onChange={handleDateRangeChange} />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard 
          title="Active Claims" 
          value={filteredClaims.length} 
          trend={calculateTrend(filteredClaims.length, prevClaims.length)}
          icon={<ClipboardList size={24} />}
        />
        <KPICard 
          title="Total Claimed" 
          value={`$${totalClaimed.toLocaleString()}`}
          trend={claimedTrend}
          icon={<DollarSign size={24} />}
        />
        <KPICard 
          title="Total Solutions" 
          value={`$${totalSolution.toLocaleString()}`}
          trend={solutionTrend}
          icon={<DollarSign size={24} />}
        />
        <KPICard 
          title="Total Saved" 
          value={`$${totalSaved.toLocaleString()}`}
          trend={savedTrend}
          icon={<TrendingDown size={24} />}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClaimStatusChart data={statusData} height={400} />
        <ClaimTrendChart data={trendData} height={400} />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;