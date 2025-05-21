import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ClaimStatus } from '../../../types/claim';

const COLORS = {
  [ClaimStatus.New]: '#FF8042',
  [ClaimStatus.Screening]: '#0088FE',
  [ClaimStatus.Analyzing]: '#FFBB28',
  [ClaimStatus.Negotiation]: '#8884d8',
  [ClaimStatus.Accepted]: '#82ca9d',
  [ClaimStatus.Closed]: '#A9A9A9',
};

interface ChartData {
  name: string;
  value: number;
}

interface ClaimStatusChartProps {
  data: ChartData[];
  height?: number;
  className?: string;
}

export const ClaimStatusChart: React.FC<ClaimStatusChartProps> = ({ 
  data,
  height = 300,
  className = ''
}) => {
  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm ${className}`} style={{ height }}>
      <h3 className="text-lg font-medium mb-4">Claims by Status</h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.name as ClaimStatus] || '#777'} 
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} claims`, 'Count']} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};