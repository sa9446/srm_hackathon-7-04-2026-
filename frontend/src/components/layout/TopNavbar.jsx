import React from 'react';
import { BadgeCheck, User } from 'lucide-react';

const TopNavbar = () => {
  return (
    <header className="top-navbar">
      <div className="navbar-user-info">
        <h2>Welcome back, Alex</h2>
        <p>Here's your gig activity for today.</p>
      </div>

      <div className="navbar-actions">
        <div className="verified-badge">
          <BadgeCheck size={16} />
          <span>Verified</span>
        </div>

        <div className="user-avatar">
          <User size={20} />
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '10px',
            height: '10px',
            backgroundColor: '#34d399',
            borderRadius: '50%',
            border: '2px solid #0f172a'
          }}></div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
