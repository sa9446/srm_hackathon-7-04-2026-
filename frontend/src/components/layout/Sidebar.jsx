import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, PiggyBank, ShieldCheck, Settings } from 'lucide-react';

const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'History',   icon: History,         path: '/history'   },
  { label: 'Loans',     icon: PiggyBank,       path: '/loans'     },
  { label: 'Insurance', icon: ShieldCheck,     path: '/insurance' },
  { label: 'Settings',  icon: Settings,        path: '/settings'  },
];

const Sidebar = () => {
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="sidebar sidebar-hidden">
      <div className="sidebar-header">
        <h1 className="brand-text">Gig-Sentry</h1>
      </div>
      <nav className="sidebar-nav">
        {NAV.map(({ label, icon: Icon, path }) => (
          <button
            key={path}
            className={`nav-item ${pathname === path ? 'active' : ''}`}
            onClick={() => navigate(path)}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
