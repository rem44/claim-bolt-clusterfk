import React, { useState } from 'react';
import { useClaims } from '../context/ClaimsContext';
import { DateRangeFilter } from '../components/analytics/Filters/DateRangeFilter';
import { KPICard } from '../components/analytics/KPI/KPICard';
import { ClaimStatusChart } from '../components/analytics/Charts/ClaimStatusChart';
import { ClaimTrendChart } from '../components/analytics/Charts/ClaimTrendChart';
import { Download, FileText, Filter, ClipboardList, DollarSign, TrendingDown } from 'lucide-react';
import { format, subMonths } from 'date-fns';

const AnalyticsDashboard: React.FC = () => {
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const { claims, loading, error } = useClaims();
  
  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-corporate-secondary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  // Filter claims by date range
  const filteredClaims = claims.filter(claim => {
    const claimDate = new Date(claim.creation_date);
    return claimDate >= startDate && claimDate <= endDate;
  });

  // Calculate previous period for trend
  const prevStartDate = new Date(startDate);
  prevStartDate.setDate(prevStartDate.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const prevClaims = claims.filter(claim => {
    const claimDate = new Date(claim.creation_date);
    return claimDate >= prevStartDate && claimDate < startDate;
  });

  // Calculate metrics
  const totalClaimed = filteredClaims.reduce((sum, claim) => sum + claim.claimed_amount, 0);
  const totalSolution = filteredClaims.reduce((sum, claim) => sum + claim.solution_amount, 0);
  const totalSaved = filteredClaims.reduce((sum, claim) => sum + claim.saved_amount, 0);

  const prevTotalClaimed = prevClaims.reduce((sum, claim) => sum + claim.claimed_amount, 0);
  const prevTotalSolution = prevClaims.reduce((sum, claim) => sum + claim.solution_amount, 0);
  const prevTotalSaved = prevClaims.reduce((sum, claim) => sum + claim.saved_amount, 0);

  // Calculate trends
  const calculateTrend = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const claimsTrend = calculateTrend(filteredClaims.length, prevClaims.length);
  const claimedTrend = calculateTrend(totalClaimed, prevTotalClaimed);
  const solutionTrend = calculateTrend(totalSolution, prevTotalSolution);
  const savedTrend = calculateTrend(totalSaved, prevTotalSaved);

  // Prepare chart data
  const statusData = Object.entries(
    filteredClaims.reduce((acc, claim) => {
      acc[claim.status] = (acc[claim.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const trendData = (() => {
    const data = [];
    const days = 30;
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const count = filteredClaims.filter(claim => 
        format(new Date(claim.creation_date), 'yyyy-MM-dd') === dateStr
      ).length;
      
      data.push({ date: dateStr, count });
    }
    
    return data;
  })();

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
          trend={claimsTrend}
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