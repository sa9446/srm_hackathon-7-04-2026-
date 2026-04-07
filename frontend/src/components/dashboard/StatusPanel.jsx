import React, { useState, useEffect } from 'react';
import { Activity, Wifi, MapPin } from 'lucide-react';

const StatusPanel = ({ isTracking }) => {
  const [time, setTime] = useState('just now');

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 className="chart-title" style={{ margin: 0 }}>Real-Time Status</h3>
      
      <div className="status-list">
        <div className="status-item">
          <div className="status-left">
            <div className="status-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>
              <Wifi size={16} />
            </div>
            <span>System Status</span>
          </div>
          <span className="status-val" style={{ color: '#34d399' }}>Live</span>
        </div>

        <div className="status-item">
          <div className="status-left">
            <div className="status-icon" style={{ backgroundColor: isTracking ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)', color: isTracking ? '#60a5fa' : '#94a3b8' }}>
              <MapPin size={16} />
            </div>
            <span>Tracking</span>
          </div>
          <span className="status-val" style={{ color: isTracking ? '#60a5fa' : '#94a3b8' }}>
            {isTracking ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="status-item">
          <div className="status-left">
            <div className="status-icon" style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)', color: '#22d3ee' }}>
              <Activity size={16} />
            </div>
            <span>Last Updated</span>
          </div>
          <span className="status-val" style={{ fontWeight: 'normal', color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>{time}</span>
        </div>
      </div>
    </div>
  );
};

export default StatusPanel;
