import React from 'react';
import { Shield, BookOpen, GraduationCap, Users, Banknote, Library, UtensilsCrossed, Car, Wrench, UserCog } from 'lucide-react';

export default function RoleBadge({ role }) {
  switch (role) {
    case 'Admin':
      return (
        <span className="badge badge-admin">
          <Shield size={12} /> Admin
        </span>
      );
    case 'Teacher':
      return (
        <span className="badge badge-teacher">
          <BookOpen size={12} /> Teacher
        </span>
      );
    case 'Student':
      return (
        <span className="badge badge-student">
          <GraduationCap size={12} /> Student
        </span>
      );
    case 'Parent':
      return (
        <span className="badge badge-parent">
          <Users size={12} /> Parent
        </span>
      );
    case 'Cashier':
      return (
        <span className="badge badge-cashier">
          <Banknote size={12} /> Cashier
        </span>
      );
    case 'Librarian':
    case 'Library Staff':
      return (
        <span className="badge badge-librarian">
          <Library size={12} /> {role === 'Library Staff' ? 'Library Staff' : 'Librarian'}
        </span>
      );
    case 'Canteen':
    case 'Canteen Staff':
      return (
        <span className="badge badge-canteen">
          <UtensilsCrossed size={12} /> Canteen Staff
        </span>
      );
    case 'Driver':
      return (
        <span className="badge" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', borderColor: 'rgba(59,130,246,0.3)' }}>
          <Car size={12} /> Driver
        </span>
      );
    case 'Watchman':
      return (
        <span className="badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', borderColor: 'rgba(245,158,11,0.3)' }}>
          <Shield size={12} /> Watchman
        </span>
      );
    case 'Attender':
    case 'Attendant':
      return (
        <span className="badge" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', borderColor: 'rgba(139,92,246,0.3)' }}>
          <UserCog size={12} /> {role}
        </span>
      );
    case 'Lab Technician':
      return (
        <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', borderColor: 'rgba(16,185,129,0.3)' }}>
          <Wrench size={12} /> Lab Technician
        </span>
      );
    default:
      return <span className="badge">{role}</span>;
  }
}
