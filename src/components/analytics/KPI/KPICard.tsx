import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon?: React.ReactNode;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  trend, 
  icon,
  className = ''
}) => {
  const getTrendDisplay = () => {
    if (trend === undefined) return null;
    
    const isPositive = trend > 0;
    const trendClass = isPositive ? 'text-green-600' : 'text-red-600';
    const TrendIcon = isPositive ? ArrowUp : ArrowDown;
    
    return (
      <div className={`flex items-center ${trendClass}`}>
        <TrendIcon size={16} className="mr-1" />
        <span>{Math.abs(trend).toFixed(1)}%</span>
      </div>
    );
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && <div className="text-corporate-secondary">{icon}</div>}
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-semibold">{value}</p>
        {getTrendDisplay()}
      </div>
    </div>
  );
};