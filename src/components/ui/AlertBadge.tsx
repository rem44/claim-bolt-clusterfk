import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { ClaimAlert } from '../../types/claim';

interface AlertBadgeProps {
  alerts: ClaimAlert[];
}

const AlertBadge: React.FC<AlertBadgeProps> = ({ alerts }) => {
  if (!alerts?.length) return null;

  const getAlertColor = () => {
    if (alerts.some(a => a.type === 'price_discrepancy')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (alerts.some(a => a.type === 'quantity_exceeded')) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const formatAlertType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="relative group">
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getAlertColor()}`}>
        <AlertTriangle size={12} className="mr-1" />
        {alerts.length > 1 ? `${alerts.length} Alerts` : '1 Alert'}
      </div>
      
      <div className="absolute z-10 invisible group-hover:visible bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px] mt-2 right-0">
        <div className="text-sm font-medium mb-2">Alert Details</div>
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div key={index} className="text-xs">
              <div className="font-medium">{alert.message}</div>
              {alert.details && (
                <div className="text-gray-500 mt-1">
                  {Object.entries(alert.details).map(([key, value]) => (
                    <div key={key}>
                      {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertBadge;