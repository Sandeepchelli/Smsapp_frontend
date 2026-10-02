import React from 'react';
import { useAuth } from '../context/AuthContext';
import RoleBadge from './RoleBadge';
import { 
  LayoutDashboard, Users, UserCheck, GraduationCap, BookOpen, 
  Clock, Calendar, Award, Library, UtensilsCrossed, Banknote, 
  Shield, Settings, LogOut, CheckSquare, FileText, User, 
  Layers, PlusCircle, ArrowLeft
} from 'lucide-react';

export default function Sidebar({ activeNav, onSelectNav, badgeCounts = {} }) {
  const { user, logout } = useAuth();
  const role = user?.role;

  const getNavItems = () => {
    switch (role) {
      case 'Admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'students', label: 'Students', icon: GraduationCap, badge: badgeCounts.students },
          { id: 'parents', label: 'Parents', icon: Users },
          { id: 'staff', label: 'College Staff', icon: Users },
          { id: 'teachers', label: 'Teachers', icon: UserCheck },
          { id: 'teacher-attendance', label: 'Teacher Attendance', icon: CheckSquare },
          { id: 'staff-attendance', label: 'Staff Attendance', icon: CheckSquare },
          { id: 'teacher-subjects', label: 'Teacher Subjects', icon: BookOpen },
          { id: 'subjects', label: 'Subjects & Classes', icon: Layers },
          { id: 'timetable', label: 'Timetable Builder', icon: Clock },
          { id: 'attendance', label: 'Attendance Desk', icon: Calendar },
          { id: 'results', label: 'Semester Results', icon: Award },
          { id: 'library', label: 'Central Library', icon: Library },
          { id: 'canteen', label: 'College Canteen', icon: UtensilsCrossed },
          { id: 'fees', label: 'Tuition Fees', icon: Banknote },
          { id: 'users', label: 'User Management', icon: Shield },
          { id: 'profile', label: 'Admin Profile', icon: User },
          { id: 'settings', label: 'System Settings', icon: Settings }
        ];

      case 'Student':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'attendance', label: 'My Attendance', icon: CheckSquare },
          { id: 'results', label: 'My Results', icon: Award },
          { id: 'timetable', label: 'My Timetable', icon: Clock },
          { id: 'library', label: 'Library', icon: Library, badge: badgeCounts.libraryLoans },
          { id: 'canteen', label: 'Canteen & Food', icon: UtensilsCrossed, badge: badgeCounts.cartCount },
          { id: 'fees', label: 'Fees & Ledger', icon: Banknote },
          { id: 'permissions', label: 'Leave / Outing Requests', icon: FileText },
          { id: 'profile', label: 'My Profile', icon: User },
          { id: 'settings', label: 'Settings', icon: Settings }
        ];

      case 'Parent':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'attendance', label: 'Child Attendance', icon: CheckSquare },
          { id: 'results', label: 'Child Results & Grades', icon: Award },
          { id: 'fees', label: 'Fee Receipts', icon: Banknote },
          { id: 'permissions', label: 'Leave Information', icon: FileText },
          { id: 'profile', label: 'Parent Profile', icon: User },
          { id: 'settings', label: 'Settings', icon: Settings }
        ];

      case 'Teacher':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'classes', label: 'My Classes', icon: Layers },
          { id: 'subjects', label: 'My Subjects', icon: BookOpen },
          { id: 'attendance', label: 'Take Attendance', icon: CheckSquare },
          { id: 'results', label: 'Marks & Results', icon: Award },
          { id: 'timetable', label: 'Teaching Timetable', icon: Clock },
          { id: 'permissions', label: 'Leave Approvals', icon: FileText, badge: badgeCounts.pendingPerms },
          { id: 'profile', label: 'Faculty Profile', icon: User },
          { id: 'settings', label: 'Settings', icon: Settings }
        ];

      case 'Librarian':
      case 'Library Staff':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'catalog', label: 'Books Catalog', icon: Library },
          { id: 'add-book', label: 'Add New Book', icon: PlusCircle },
          { id: 'issued', label: 'Issued Books & Loans', icon: Clock, badge: badgeCounts.activeLoans },
          { id: 'returned', label: 'Returned Books', icon: CheckSquare },
          { id: 'students', label: 'Student Records', icon: GraduationCap },
          { id: 'profile', label: 'My Profile', icon: User },
          { id: 'settings', label: 'Settings', icon: Settings }
        ];

      case 'Canteen':
      case 'Canteen Staff':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'menu', label: 'Food Menu', icon: UtensilsCrossed },
          { id: 'add-food', label: 'Add Food Item', icon: PlusCircle },
          { id: 'orders', label: 'Incoming Orders', icon: Clock, badge: badgeCounts.pendingOrders },
          { id: 'management', label: 'Order Management', icon: Layers },
          { id: 'profile', label: 'Staff Profile', icon: User },
          { id: 'settings', label: 'Settings', icon: Settings }
        ];

      case 'Cashier':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'fees', label: 'Fee Collection', icon: Banknote },
          { id: 'history', label: 'Payment Receipts', icon: FileText },
          { id: 'profile', label: 'My Profile', icon: User },
          { id: 'settings', label: 'Settings', icon: Settings }
        ];

      case 'Driver':
      case 'Watchman':
      case 'Attender':
      case 'Attendant':
      case 'Lab Technician':
      case 'OfficeStaff':
      case 'Cleaner':
      case 'Other':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'attendance', label: 'My Attendance', icon: CheckSquare },
          { id: 'profile', label: 'My Profile', icon: User },
          { id: 'settings', label: 'Settings', icon: Settings }
        ];

      default:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'profile', label: 'My Profile', icon: User },
          { id: 'settings', label: 'Settings', icon: Settings }
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand-icon">
          <BookOpen size={22} />
        </div>
        <div>
          <div className="sidebar-brand-title">EduSphere</div>
          <div className="sidebar-brand-subtitle">Smart Campus Management</div>
        </div>
      </div>

      {/* Nav items list */}
      <nav className="sidebar-nav-list">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectNav(item.id)}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span style={{
                  background: '#f59e0b',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  padding: '1px 6px',
                  borderRadius: '99px'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile & Logout footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user-pill">
          <img
            src={user?.profile_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`}
            alt={user?.name}
            className="sidebar-user-avatar"
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <div style={{ marginTop: '2px' }}>
              <RoleBadge role={user?.role} />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem', padding: '8px', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.25)' }}
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
