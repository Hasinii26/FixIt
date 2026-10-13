import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';

const MainApp = () => {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#090e1a',
        color: '#ffffff',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px', color: '#14b8a6', letterSpacing: '-0.02em' }}>
            FixIt System
          </div>
          <div style={{ fontSize: '0.86rem', color: '#94a3b8' }}>
            Verifying secure session token...
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    if (authView === 'register') {
      return <Register onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <Login onSwitchToRegister={() => setAuthView('register')} />;
  }

  // Determine topbar titles based on role
  const getHeaderInfo = () => {
    switch (user.role) {
      case 'admin':
        return {
          title: activeTab === 'staff-team' ? 'Maintenance Staff Directory' : 'Campus Maintenance Administration',
          subtitle: 'Dispatch complaints, assign technicians, and track campus facility operations.'
        };
      case 'staff':
        return {
          title: 'Technician Work Order Console',
          subtitle: 'Manage and resolve your assigned campus maintenance jobs.'
        };
      case 'user':
      default:
        return {
          title: activeTab === 'new-complaint' ? 'Lodge Maintenance Request' : 'Student & Resident Service Portal',
          subtitle: 'Submit and track facility complaints with real-time resolution updates.'
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="app-layout">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      
      <div className="main-wrapper">
        <Topbar 
          title={headerInfo.title} 
          subtitle={headerInfo.subtitle} 
          onToggleMobileMenu={() => setMobileOpen(!mobileOpen)}
        />
        
        <main className="content-body">
          {user.role === 'admin' && (
            <AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
          )}

          {user.role === 'staff' && (
            <StaffDashboard />
          )}

          {user.role === 'user' && (
            <UserDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
          )}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
