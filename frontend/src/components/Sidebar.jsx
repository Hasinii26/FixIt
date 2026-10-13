import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Wrench, 
  LayoutDashboard, 
  PlusCircle, 
  Users, 
  LogOut, 
  ClipboardList, 
  X,
  ShieldCheck,
  HardHat
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {mobileOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setMobileOpen(false)} 
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="brand-logo-icon">
              <Wrench size={20} />
            </div>
            <div>
              <div className="brand-title">
                FixIt <span className="brand-badge">SaaS</span>
              </div>
              <div className="brand-subtitle">Campus Maintenance Hub</div>
            </div>
          </div>
          {mobileOpen && (
            <button 
              className="close-btn" 
              onClick={() => setMobileOpen(false)}
              aria-label="Close Navigation"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Operations Console</div>

          {user?.role === 'user' && (
            <>
              <button
                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleNavClick('dashboard')}
              >
                <ClipboardList size={18} />
                <span>My Complaints</span>
              </button>
              <button
                className={`nav-item ${activeTab === 'new-complaint' ? 'active' : ''}`}
                onClick={() => handleNavClick('new-complaint')}
              >
                <PlusCircle size={18} />
                <span>Lodge Ticket</span>
              </button>
            </>
          )}

          {user?.role === 'staff' && (
            <button
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavClick('dashboard')}
            >
              <HardHat size={18} />
              <span>Assigned Work Orders</span>
            </button>
          )}

          {user?.role === 'admin' && (
            <>
              <button
                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleNavClick('dashboard')}
              >
                <LayoutDashboard size={18} />
                <span>All Campus Tickets</span>
              </button>
              <button
                className={`nav-item ${activeTab === 'staff-team' ? 'active' : ''}`}
                onClick={() => handleNavClick('staff-team')}
              >
                <Users size={18} />
                <span>Maintenance Staff</span>
              </button>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-meta-box">
            <div className="user-avatar-circle">
              {getInitials(user?.name)}
            </div>
            <div className="user-text-info">
              <span className="user-name-label">{user?.name}</span>
              <span className="user-role-label">
                {user?.role} {user?.department ? `• ${user.department}` : ''}
              </span>
            </div>
          </div>
          <button 
            className="logout-icon-btn" 
            onClick={logout} 
            title="Log Out of Portal"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
