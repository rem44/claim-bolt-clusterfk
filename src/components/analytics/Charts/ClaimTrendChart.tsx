import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { TimeSeriesData } from '../../../utils/analytics';

interface ClaimTrendChartProps {
  data: TimeSeriesData[];
  height?: number;
  className?: string;
}

export const ClaimTrendChart: React.FC<ClaimTrendChartProps> = ({ 
  data,
  height = 300,
  className = ''
}) => {
  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm ${className}`} style={{ height }}>
      <h3 className="text-lg font-medium mb-4">Claims Trend</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => format(parseISO(date), 'MMM d')}
          />
          <YAxis />
          <Tooltip 
            labelFormatter={(date) => format(parseISO(date), 'MMM d, yyyy')}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            name="New Claims"
            stroke="#0088FE"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};