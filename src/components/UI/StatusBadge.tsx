import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-gray-500 text-white';
      case 'assigned': return 'bg-blue-500 text-white';
      case 'picked_up': return 'bg-yellow-500 text-gray-900';
      case 'in_transit': return 'bg-orange-600 text-white';
      case 'arrived_at_hub': return 'bg-purple-600 text-white';
      case 'handed_over': return 'bg-teal-600 text-white';
      case 'delivered': return 'bg-green-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getBadgeStyle(status)} capitalize shadow-sm`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

export default StatusBadge;