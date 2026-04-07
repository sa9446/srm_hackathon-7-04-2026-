import React from 'react';
import { LayoutDashboard, History, PiggyBank, ShieldCheck, Settings } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="sidebar sidebar-hidden">
      <div className="sidebar-header">
        <h1 className="brand-text">Gig-Sentry</h1>
      </div>
      <nav className="sidebar-nav">
        <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
        <NavItem icon={<History size={20} />} label="History" />
        <NavItem icon={<PiggyBank size={20} />} label="Loans" />
        <NavItem icon={<ShieldCheck size={20} />} label="Insurance" />
        <NavItem icon={<Settings size={20} />} label="Settings" />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active }) => (
  <button className={`nav-item ${active ? 'active' : ''}`}>
    {icon}
    <span>{label}</span>
  </button>
);

export default Sidebar;
