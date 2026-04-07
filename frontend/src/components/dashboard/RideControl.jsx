import React, { useState, useEffect } from 'react';
import { Navigation, Clock, Gauge, Route, MapPin } from 'lucide-react';
import { useLocationTracking } from '../../hooks/useLocationTracking';

const RideControl = ({ onStatusChange }) => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds]   = useState(0);

  const { location, speed, distance, error: locError, start: startLoc, stop: stopLoc, reset: resetLoc } = useLocationTracking();

  // Session timer
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  const toggleRide = async () => {
    const newState = !isActive;
    setIsActive(newState);
    onStatusChange(newState);

    if (newState) {
      resetLoc();
      await startLoc();
    } else {
      setSeconds(0);
      await stopLoc();
    }
  };

  const formatTime = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const speedColor = speed > 80 ? '#ef4444' : speed > 40 ? '#fbbf24' : '#34d399';

  return (
    <div className="glass-panel ride-control-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className={`ride-icon-wrapper ${isActive ? 'active' : ''}`}>
        <Navigation size={48} />
      </div>

      <h2 className="ride-title">{isActive ? 'Ride Active' : 'Ready to Work?'}</h2>

      {isActive ? (
        <>
          {/* Timer */}
          <div className="ride-timer">
            <Clock size={18} />
            <span>{formatTime(seconds)}</span>
          </div>

          {/* Live stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '12px 0', width: '100%' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
                <Gauge size={14} style={{ color: speedColor }} />
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Speed</span>
              </div>
              <p style={{ fontSize: '22px', fontWeight: 700, color: speedColor, margin: 0 }}>{speed}</p>
              <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>km/h</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
                <Route size={14} style={{ color: '#60a5fa' }} />
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Distance</span>
              </div>
              <p style={{ fontSize: '22px', fontWeight: 700, color: '#60a5fa', margin: 0 }}>{distance}</p>
              <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>km</p>
            </div>
          </div>

          {/* GPS status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <MapPin size={12} style={{ color: location ? '#34d399' : '#94a3b8' }} />
            <span style={{ fontSize: '11px', color: location ? '#34d399' : '#94a3b8' }}>
              {locError ? locError : location ? `GPS locked (±${Math.round(location.accuracy)}m)` : 'Acquiring GPS...'}
            </span>
          </div>
        </>
      ) : (
        <p className="ride-subtitle">Start your session to track speed, distance, and earnings.</p>
      )}

      <button onClick={toggleRide} className={isActive ? 'btn-danger' : 'btn-primary'}>
        {isActive ? 'End Ride' : 'Start Ride'}
      </button>
    </div>
  );
};

export default RideControl;
