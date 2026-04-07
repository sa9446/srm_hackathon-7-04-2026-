import React from 'react';

const MetricCard = ({ title, value, subtitle, icon, valueColor }) => {
  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div className="metric-header">
        <h3 className="metric-title">{title}</h3>
        <div className="metric-icon-wrapper">
          {icon}
        </div>
      </div>
      <div>
        <div className={`metric-value ${valueColor}`}>{value}</div>
        {subtitle && <p className="metric-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
};

export default MetricCard;
