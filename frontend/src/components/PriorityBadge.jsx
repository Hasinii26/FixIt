import React from 'react';
import { AlertTriangle, Clock, ArrowDown } from 'lucide-react';

const PriorityBadge = ({ priority }) => {
  const getBadgeConfig = (pr) => {
    switch (pr) {
      case 'High':
        return {
          className: 'priority-high',
          icon: <AlertTriangle size={12} />,
        };
      case 'Medium':
        return {
          className: 'priority-medium',
          icon: <Clock size={12} />,
        };
      case 'Low':
        return {
          className: 'priority-low',
          icon: <ArrowDown size={12} />,
        };
      default:
        return {
          className: 'priority-medium',
          icon: <Clock size={12} />,
        };
    }
  };

  const { className, icon } = getBadgeConfig(priority);

  return (
    <span className={`priority-badge-box ${className}`}>
      {icon}
      <span>{priority}</span>
    </span>
  );
};

export default PriorityBadge;
