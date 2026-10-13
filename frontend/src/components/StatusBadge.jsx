import React from 'react';

const StatusBadge = ({ status }) => {
  const getSlug = (st) => {
    switch (st) {
      case 'Submitted':
        return 'submitted';
      case 'Assigned':
        return 'assigned';
      case 'In Progress':
        return 'in-progress';
      case 'Resolved':
        return 'resolved';
      default:
        return 'submitted';
    }
  };

  const slug = getSlug(status);

  return (
    <span className={`status-badge ${slug}`}>
      <span className="status-badge-dot" />
      <span>{status}</span>
    </span>
  );
};

export default StatusBadge;
