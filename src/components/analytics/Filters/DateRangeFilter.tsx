import React, { useState } from 'react';
import { format, subDays, subMonths, subYears } from 'date-fns';

interface DateRangeFilterProps {
  onChange: (startDate: Date, endDate: Date) => void;
  className?: string;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ onChange, className = '' }) => {
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  const handlePresetChange = (preset: string) => {
    const now = new Date();
    let newStartDate: Date;
    
    switch(preset) {
      case 'week':
        newStartDate = subDays(now, 7);
        break;
      case 'month':
        newStartDate = subMonths(now, 1);
        break;
      case 'quarter':
        newStartDate = subMonths(now, 3);
        break;
      case 'year':
        newStartDate = subYears(now, 1);
        break;
      default:
        newStartDate = subMonths(now, 1);
    }
    
    setStartDate(newStartDate);
    setEndDate(now);
    onChange(newStartDate, now);
  };
  
  return (
    <div className={`flex flex-col md:flex-row gap-4 items-center p-4 bg-white rounded-lg shadow-sm ${className}`}>
      <div className="flex gap-2">
        {['week', 'month', 'quarter', 'year'].map(preset => (
          <button
            key={preset}
            onClick={() => handlePresetChange(preset)}
            className="px-3 py-1 border rounded-md hover:bg-gray-50 transition-colors"
          >
            {preset.charAt(0).toUpperCase() + preset.slice(1)}
          </button>
        ))}
      </div>
      <div className="flex gap-4">
        <div>
          <label className="block text-sm text-gray-600">Start Date</label>
          <input
            type="date"
            value={format(startDate, 'yyyy-MM-dd')}
            onChange={(e) => {
              const date = new Date(e.target.value);
              setStartDate(date);
              onChange(date, endDate);
            }}
            className="p-2 border rounded-md focus:ring-corporate-secondary focus:border-corporate-secondary"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600">End Date</label>
          <input
            type="date"
            value={format(endDate, 'yyyy-MM-dd')}
            onChange={(e) => {
              const date = new Date(e.target.value);
              setEndDate(date);
              onChange(startDate, date);
            }}
            className="p-2 border rounded-md focus:ring-corporate-secondary focus:border-corporate-secondary"
          />
        </div>
      </div>
    </div>
  );
};