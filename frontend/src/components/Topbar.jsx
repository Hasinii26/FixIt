import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, Calendar, ShieldCheck } from 'lucide-react';

const Topbar = ({ title, subtitle, onToggleMobileMenu }) => {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button 
          className="mobile-menu-btn" 
          onClick={onToggleMobileMenu} 
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 className="topbar-title">{title}</h1>
          {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-pill">
          <span className="status-dot-pulse" />
          <span>System Live</span>
        </div>

        <div className="topbar-pill" style={{ display: 'none', md: 'flex' }}>
          <Calendar size={14} style={{ color: '#64748b' }} />
          <span>{today}</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
