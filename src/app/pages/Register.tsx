import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { BookOpen, Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!form.name.trim()) return 'Nama lengkap wajib diisi.';
    if (!form.email.includes('@')) return 'Format email tidak valid.';
    if (form.password.length < 6) return 'Password minimal 6 karakter.';
    if (form.password !== form.confirm) return 'Konfirmasi password tidak cocok.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    const result = await register(form.name, form.email, form.password, form.phone);
    setLoading(false);
    if (result.success) {
      toast.success(result.message);
      navigate('/login');
    } else {
      setError(result.message);
    }
  };

  const set = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  const inputClass = "w-full py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  const pwStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const pwColors = ['bg-slate-200', 'bg-red-500', 'bg-amber-500', 'bg-green-500'];
  const pwLabels = ['', 'Lemah', 'Sedang', 'Kuat'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-7 text-center">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center mx-auto mb-3 shadow-md">
              <img
                src="/icons/LibraryTogether-removebg-preview.png"
                alt="LibraryTogether Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-white" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.3rem' }}>
              Daftar Anggota Baru
            </h1>
            <p className="text-blue-100 text-sm mt-1">Bergabunglah dengan komunitas pembaca kami</p>
          </div>

          <div className="p-7">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1.5" style={{ fontWeight: 500 }}>Nama Lengkap *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Nama lengkap Anda" value={form.name} onChange={e => set('name', e.target.value)} className={`${inputClass} pl-10 pr-4`} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1.5" style={{ fontWeight: 500 }}>Alamat Email *</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" placeholder="nama@email.com" value={form.email} onChange={e => set('email', e.target.value)} className={`${inputClass} pl-10 pr-4`} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1.5" style={{ fontWeight: 500 }}>No. Telepon (opsional)</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="tel" placeholder="08xxxxxxxxxx" value={form.phone} onChange={e => set('phone', e.target.value)} className={`${inputClass} pl-10 pr-4`} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1.5" style={{ fontWeight: 500 }}>Password *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={showPw ? 'text' : 'password'} placeholder="Minimal 6 karakter" value={form.password} onChange={e => set('password', e.target.value)} className={`${inputClass} pl-10 pr-10`} />
                  <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= pwStrength ? pwColors[pwStrength] : 'bg-slate-200'}`} />
                      ))}
                    </div>
                    <p className={`text-xs ${pwStrength === 3 ? 'text-green-600' : pwStrength === 2 ? 'text-amber-600' : 'text-red-600'}`} style={{ fontWeight: 500 }}>
                      {pwLabels[pwStrength]}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1.5" style={{ fontWeight: 500 }}>Konfirmasi Password *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="password" placeholder="Ulangi password" value={form.confirm} onChange={e => set('confirm', e.target.value)} className={`${inputClass} pl-10 pr-10`} />
                  {form.confirm && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {form.password === form.confirm ? <CheckCircle size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-red-400" />}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input type="checkbox" required className="mt-1 accent-blue-600" id="agree" />
                <label htmlFor="agree" className="text-xs text-slate-500 dark:text-slate-400">
                  Saya menyetujui <a href="#" className="text-blue-600 hover:underline">syarat & ketentuan</a> serta{' '}
                  <a href="#" className="text-blue-600 hover:underline">kebijakan privasi</a> perpustakaan.
                </label>
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm" style={{ fontWeight: 600 }}>
                {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline" style={{ fontWeight: 500 }}>
                Masuk di sini
              </Link>
            </p>
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
