import { NavLink } from 'react-router';
import {
  LayoutDashboard, BookOpen, Users, ClipboardList, User, BookMarked,
  ChevronRight, Library
} from 'lucide-react';
import type { UserRole } from '../../types';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  role: UserRole;
  open: boolean;
  onClose?: () => void;
  pendingCount?: number;
}

const ADMIN_NAV: NavItem[] = [
  { to: '/app/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/app/books', label: 'Manajemen Buku', icon: <BookOpen size={18} /> },
  { to: '/app/users', label: 'Manajemen Pengguna', icon: <Users size={18} /> },
  { to: '/app/loans', label: 'Manajemen Peminjaman', icon: <ClipboardList size={18} /> },
];

const PETUGAS_NAV: NavItem[] = [
  { to: '/app/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/app/books', label: 'Manajemen Buku', icon: <BookOpen size={18} /> },
  { to: '/app/loans', label: 'Kelola Peminjaman', icon: <ClipboardList size={18} /> },
];

const USER_NAV: NavItem[] = [
  { to: '/app/dashboard', label: 'Beranda', icon: <LayoutDashboard size={18} /> },
  { to: '/app/books', label: 'Katalog Buku', icon: <Library size={18} /> },
  { to: '/app/loans', label: 'Peminjaman Saya', icon: <BookMarked size={18} /> },
  { to: '/app/profile', label: 'Profil Saya', icon: <User size={18} /> },
];

const NAV_MAP: Record<UserRole, NavItem[]> = {
  admin: ADMIN_NAV,
  petugas: PETUGAS_NAV,
  user: USER_NAV,
};

const ROLE_DISPLAY: Record<UserRole, { label: string; color: string }> = {
  admin: { label: 'Administrator', color: 'text-red-500' },
  petugas: { label: 'Petugas Perpustakaan', color: 'text-blue-500' },
  user: { label: 'Anggota Perpustakaan', color: 'text-green-500' },
};

export function Sidebar({ role, open, onClose, pendingCount }: SidebarProps) {
  const navItems = NAV_MAP[role] || USER_NAV;
  const roleInfo = ROLE_DISPLAY[role];

  const navItemsWithBadge = navItems.map(item => {
    if (item.label === 'Kelola Peminjaman' || item.label === 'Manajemen Peminjaman') {
      return { ...item, badge: pendingCount };
    }
    return item;
  });

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] z-30
          w-64 bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-700
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:h-auto lg:min-h-[calc(100vh-4rem)]
        `}
      >
        {/* Role Banner */}
        <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 shadow-sm shadow-green-400" />
            <span className={`text-xs ${roleInfo.color}`} style={{ fontWeight: 600 }}>{roleInfo.label}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="text-xs text-slate-400 dark:text-slate-500 px-3 mb-3 uppercase tracking-wider" style={{ fontWeight: 600 }}>Menu Utama</p>
          {navItemsWithBadge.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative
                ${isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />
                  )}
                  <span className={isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors'}>
                    {item.icon}
                  </span>
                  <span className="text-sm flex-1" style={{ fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="w-5 h-5 bg-orange-500 text-white rounded-full text-xs flex items-center justify-center" style={{ fontWeight: 700 }}>
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  ) : (
                    <ChevronRight size={14} className={`${isActive ? 'text-blue-400' : 'text-slate-300 opacity-0 group-hover:opacity-100'} transition-opacity`} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 px-2">
            <BookOpen size={16} className="text-blue-500" />
            <div>
              <p className="text-xs text-slate-700 dark:text-slate-300" style={{ fontWeight: 600 }}>Perpustakaan Digital</p>
              <p className="text-xs text-slate-400">v1.0.0 © 2026</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
