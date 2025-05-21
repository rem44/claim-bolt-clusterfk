import { Claim, ClaimStatus, Department } from '../types/claim';
import { format, subDays, subMonths, startOfDay, endOfDay } from 'date-fns';

export interface TimeSeriesData {
  date: string;
  count: number;
  value?: number;
}

export interface ChartData {
  name: string;
  value: number;
}

export function groupClaimsByStatus(claims: Claim[]): ChartData[] {
  const statusCounts = Object.values(ClaimStatus).reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {} as Record<string, number>);

  claims.forEach(claim => {
    statusCounts[claim.status]++;
  });

  return Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value
  }));
}

export function groupClaimsByDepartment(claims: Claim[]): ChartData[] {
  const deptCounts = Object.values(Department).reduce((acc, dept) => {
    acc[dept] = 0;
    return acc;
  }, {} as Record<string, number>);

  claims.forEach(claim => {
    deptCounts[claim.department]++;
  });

  return Object.entries(deptCounts).map(([name, value]) => ({
    name,
    value
  }));
}

export function calculateFinancialMetrics(claims: Claim[]) {
  return claims.reduce((acc, claim) => ({
    totalClaimed: acc.totalClaimed + claim.claimed_amount,
    totalSolution: acc.totalSolution + claim.solution_amount,
    totalSaved: acc.totalSaved + claim.saved_amount
  }), {
    totalClaimed: 0,
    totalSolution: 0,
    totalSaved: 0
  });
}

export function createTimeSeriesData(
  claims: Claim[],
  period: 'week' | 'month' | 'quarter',
  metric: 'count' | 'claimed_amount' | 'solution_amount' = 'count'
): TimeSeriesData[] {
  const now = new Date();
  const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
  const startDate = subDays(now, days);

  const datePoints = Array.from({ length: days }, (_, i) => {
    const date = subDays(now, days - i - 1);
    return format(date, 'yyyy-MM-dd');
  });

  const data = datePoints.map(date => {
    const dayStart = startOfDay(new Date(date));
    const dayEnd = endOfDay(new Date(date));
    
    const dayClaims = claims.filter(claim => {
      const claimDate = new Date(claim.creation_date);
      return claimDate >= dayStart && claimDate <= dayEnd;
    });

    return {
      date,
      count: dayClaims.length,
      value: metric === 'count' 
        ? dayClaims.length 
        : dayClaims.reduce((sum, claim) => sum + claim[metric], 0)
    };
  });

  return data;
}

export function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function getTopCauses(claims: Claim[], limit: number = 5): ChartData[] {
  const causes = claims.reduce((acc, claim) => {
    const cause = claim.identified_cause || 'Unknown';
    acc[cause] = (acc[cause] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(causes)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}