import React, { useState, useEffect } from 'react';
import { Navigation, Clock } from 'lucide-react';

const RideControl = ({ onStatusChange }) => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const toggleRide = () => {
    const newState = !isActive;
    setIsActive(newState);
    onStatusChange(newState);
    if (!newState) setSeconds(0);
  };

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="glass-panel ride-control-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
      
      <div className={`ride-icon-wrapper ${isActive ? 'active' : ''}`}>
        <Navigation size={48} />
      </div>

      <h2 className="ride-title">
        {isActive ? 'Ride Active' : 'Ready to Work?'}
      </h2>
      
      {isActive ? (
        <div className="ride-timer">
          <Clock size={20} />
          <span>{formatTime(seconds)}</span>
        </div>
      ) : (
        <p className="ride-subtitle">Start your session to begin tracking earnings and score.</p>
      )}

      <button
        onClick={toggleRide}
        className={isActive ? 'btn-danger' : 'btn-primary'}
      >
        {isActive ? 'End Ride' : 'Start Ride'}
      </button>
    </div>
  );
};

export default RideControl;
