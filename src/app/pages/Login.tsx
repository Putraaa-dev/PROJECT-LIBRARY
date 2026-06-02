import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { BookOpen, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/app/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Email dan password wajib diisi.'); return; }
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      toast.success(result.message);
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-center">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg mx-auto mb-3">
              <img
                src="/icons/LibraryTogether-removebg-preview.png"
                alt="LibraryTogether Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-white" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.4rem' }}>
              Selamat Datang
            </h1>
            <p className="text-blue-100 text-sm mt-1">Masuk ke akun perpustakaan Anda</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1.5" style={{ fontWeight: 500 }}>Alamat Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1.5" style={{ fontWeight: 500 }}>Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm mt-2"
                style={{ fontWeight: 600 }}
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            <div className="mt-6 text-sm text-slate-500 dark:text-slate-400 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4 text-center">
              <p className="text-sm">
                Belum punya akun?{' '}
                <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline" style={{ fontWeight: 500 }}>
                  Daftar Sekarang
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center mt-4">
          <Link to="/" className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            ← Kembali ke Beranda
          </Link>
        </p>
      </div>
    </div>
  );
}
