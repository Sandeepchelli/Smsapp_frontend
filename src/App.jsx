import React from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';
import CashierDashboard from './pages/CashierDashboard';
import LibrarianDashboard from './pages/LibrarianDashboard';
import CanteenDashboard from './pages/CanteenDashboard';
import StaffDashboard from './pages/StaffDashboard';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        color: 'var(--text-muted)'
      }}>
        Initializing EduSphere...
      </div>
    );
  }

  // 1. If not authenticated, display the STRICT common login page
  if (!user) {
    return <LoginPage />;
  }

  // 2. AUTOMATIC ROLE DETECTION:
  // Render the specific dashboard based on user.role returned directly from the backend
  const renderRoleDashboard = () => {
    switch (user.role) {
      case 'Admin':
        return <AdminDashboard />;
      case 'Teacher':
        return <TeacherDashboard />;
      case 'Student':
        return <StudentDashboard />;
      case 'Parent':
        return <ParentDashboard />;
      case 'Cashier':
        return <CashierDashboard />;
      case 'Librarian':
      case 'Library Staff':
        return <LibrarianDashboard />;
      case 'Canteen':
      case 'Canteen Staff':
        return <CanteenDashboard />;
      case 'Driver':
      case 'Watchman':
      case 'Attender':
      case 'Attendant':
      case 'Lab Technician':
      case 'OfficeStaff':
      case 'Cleaner':
      case 'Other':
        return <StaffDashboard />;
      default:
        return (
          <div className="main-content" style={{ textAlign: 'center', paddingTop: '80px' }}>
            <h2>Unrecognized Role: {user.role}</h2>
            <p style={{ color: 'var(--text-muted)' }}>Please contact the system administrator.</p>
          </div>
        );
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      {renderRoleDashboard()}
    </div>
  );
}
