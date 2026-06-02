import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  BookOpen, Bell, Search, Sun, Moon, Menu, X, ChevronDown,
  User, LogOut, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'sonner';

interface NavbarProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  petugas: 'Petugas',
  user: 'Anggota',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  petugas: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  user: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};

const LOGO_IMG = '/icons/LibraryTogether-removebg-preview.png';

export function Navbar({ onToggleSidebar, sidebarOpen }: NavbarProps) {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    toast.success('Berhasil logout. Sampai jumpa!');
    navigate('/login');
    setDropdownOpen(false);
  };

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <nav className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center h-16 px-4 gap-3">
        {/* Sidebar Toggle (authenticated) */}
        {isAuthenticated && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}

        {/* Logo */}
        <Link to={isAuthenticated ? '/app/dashboard' : '/'} className="flex items-center gap-2 min-w-max">
          <img
            src={LOGO_IMG}
            alt="LibraryTogether Logo"
            className="w-10 h-10 object-contain"
          />
          <span className="hidden sm:block" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 600, color: isDark ? '#f1f5f9' : '#1e293b' }}>
            LibraryTogether
          </span>
        </Link>

        {/* Search (authenticated) */}
        {isAuthenticated && (
          <div className="flex-1 max-w-md mx-auto hidden md:block">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari buku, pengarang..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/app/books?search=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchQuery('');
                  }
                }}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
            title={isDark ? 'Mode Terang' : 'Mode Gelap'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                    {initials}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-tight" style={{ fontWeight: 500 }}>{currentUser?.name}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${ROLE_COLORS[currentUser?.role || 'user']}`} style={{ fontWeight: 500 }}>
                      {ROLE_LABELS[currentUser?.role || 'user']}
                    </span>
                  </div>
                  <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg z-50 py-1.5 overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-sm text-slate-800 dark:text-slate-200" style={{ fontWeight: 600 }}>{currentUser?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser?.email}</p>
                      </div>
                      <Link
                        to="/app/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <User size={15} className="text-slate-400" /> Profil Saya
                      </Link>
                      {currentUser?.role === 'admin' && (
                        <Link
                          to="/app/users"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Shield size={15} className="text-slate-400" /> Kelola Pengguna
                        </Link>
                      )}
                      <div className="border-t border-slate-100 dark:border-slate-700 mt-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut size={15} /> Keluar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" style={{ fontWeight: 500 }}>
                Masuk
              </Link>
              <Link to="/register" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm" style={{ fontWeight: 500 }}>
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
