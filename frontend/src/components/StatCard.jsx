import React from 'react';

const StatCard = ({ title, value, icon, description, color = '#0d9488', bg = '#ccfbf1' }) => {
  return (
    <div className="stat-card">
      <div style={{ flex: 1 }}>
        <div className="stat-label-row">
          <span className="stat-card-title">{title}</span>
        </div>
        <div className="stat-card-value">{value}</div>
        {description && <div className="stat-card-desc">{description}</div>}
      </div>
      <div className="stat-icon-container" style={{ background: bg, color: color }}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
