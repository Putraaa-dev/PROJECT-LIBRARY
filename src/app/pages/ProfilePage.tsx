import { useState, useRef } from 'react';
import { Mail, Phone, MapPin, Calendar, Edit, Save, X, Lock, Eye, EyeOff, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { Badge } from '../components/ui/Badge';
import { CATEGORY_COLORS } from '../data/mockData';

export function ProfilePage() {
  const { currentUser, updateProfile } = useAuth();
  const { loans } = useLibrary();
  const [editing, setEditing] = useState(false);
  const [changePw, setChangePw] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
  });
  const [avatarPreview, setAvatarPreview] = useState(currentUser?.avatar || '');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const API_URL = import.meta.env.VITE_API_URL ?? '';

  if (!currentUser) return null;

  const myLoans = loans.filter(l => l.userId === currentUser.id);
  const activeLoans = myLoans.filter(l => l.status === 'approved');
  const pendingLoans = myLoans.filter(l => l.status === 'pending');
  const returnedLoans = myLoans.filter(l => l.status === 'returned');

  const ROLE_LABELS: Record<string, string> = {
    admin: 'Administrator',
    petugas: 'Petugas Perpustakaan',
    user: 'Anggota Perpustakaan',
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Nama tidak boleh kosong.'); return; }
    const result = await updateProfile({ ...form, avatar: avatarPreview });
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    setEditing(false);
    toast.success(result.message);
  };

  const handleAvatarUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleChangePw = async () => {
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) {
      toast.error('Semua kolom password wajib diisi.');
      return;
    }
    if (pwForm.newPw.length < 6) { toast.error('Password baru minimal 6 karakter.'); return; }
    if (pwForm.newPw !== pwForm.confirm) { toast.error('Konfirmasi password tidak cocok.'); return; }

    try {
      const loginRes = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email, password: pwForm.current }),
      });
      if (!loginRes.ok) {
        toast.error('Password saat ini salah.');
        return;
      }

      const updateRes = await fetch(`${API_URL}/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwForm.newPw }),
      });

      if (!updateRes.ok) {
        const data = await updateRes.json();
        toast.error(data.error || 'Gagal memperbarui password.');
        return;
      }

      setPwForm({ current: '', newPw: '', confirm: '' });
      setChangePw(false);
      toast.success('Password berhasil diubah!');
    } catch {
      toast.error('Gagal terhubung ke server.');
    }
  };

  const initials = currentUser.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const inputClass = "w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all";

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 pb-10 sm:px-6">
      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="bg-white dark:bg-slate-800 rounded-[30px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-blue-600 to-sky-500" />
          <div className="px-6 pb-6 pt-20 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative -mt-16 w-28 h-28 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-slate-200 dark:bg-slate-700">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Foto Profil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.75rem' }}>
                      {initials}
                    </div>
                  )}
                  {editing && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 rounded-full bg-white/90 p-2 text-slate-700 shadow-sm hover:bg-white"
                    >
                      <Camera size={16} />
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleAvatarUpload(e.target.files?.[0] ?? null)} />
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Profil Anggota</p>
                  <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">{currentUser.name}</h1>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{ROLE_LABELS[currentUser.role]}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {!editing ? (
                  <button onClick={() => { setEditing(true); setForm({ name: currentUser.name, phone: currentUser.phone, address: currentUser.address }); }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                    <Edit size={14} /> Edit Profil
                  </button>
                ) : (
                  <>
                    <button onClick={() => setEditing(false)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                      <X size={14} /> Batal
                    </button>
                    <button onClick={handleSave}
                      className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                      <Save size={14} /> Simpan
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {editing ? (
                <div className="grid gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Nama Lengkap</label>
                    <input className={inputClass} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">No. Telepon</label>
                    <input className={inputClass} placeholder="08xxxxxxxxxx" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Alamat</label>
                    <textarea className={inputClass + ' min-h-[96px] resize-none'} placeholder="Alamat lengkap" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
                  </div>
                </div>
              ) : (
                <div className="grid gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge status={currentUser.role} />
                    <Badge status={currentUser.status} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { icon: <Mail size={16} />, label: 'Email', value: currentUser.email },
                      { icon: <Phone size={16} />, label: 'Telepon', value: currentUser.phone || 'Belum diisi' },
                      { icon: <MapPin size={16} />, label: 'Alamat', value: currentUser.address || 'Belum diisi' },
                      { icon: <Calendar size={16} />, label: 'Bergabung', value: currentUser.memberSince },
                    ].map(item => (
                      <div key={item.label} className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 p-4">
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">{item.label}</p>
                        <p className="text-sm text-slate-800 dark:text-slate-100 font-medium">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Ringkasan Akun</h2>
            <div className="grid gap-3">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">Status Keanggotaan</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{currentUser.status}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">Peran</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{ROLE_LABELS[currentUser.role]}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white break-all">{currentUser.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Statistik Peminjaman</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { label: 'Dipinjam', value: activeLoans.length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30' },
                { label: 'Menunggu', value: pendingLoans.length, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30' },
                { label: 'Dikembalikan', value: returnedLoans.length, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-3xl border p-4 text-center`}>
                  <p className={`${s.color} text-3xl font-semibold leading-none`}>{s.value}</p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <button
            onClick={() => setChangePw(p => !p)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <Lock size={18} className="text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Ubah Password</p>
                <p className="text-xs text-slate-400">Perbarui keamanan akun Anda</p>
              </div>
            </div>
            <span className="text-slate-400">{changePw ? '▲' : '▼'}</span>
          </button>

          {changePw && (
            <div className="px-6 pb-6 border-t border-slate-200 dark:border-slate-700 pt-4">
              <div className="space-y-4">
                {[
                  { label: 'Password Saat Ini', key: 'current', placeholder: 'Password lama' },
                  { label: 'Password Baru', key: 'newPw', placeholder: 'Min. 6 karakter' },
                  { label: 'Konfirmasi Password Baru', key: 'confirm', placeholder: 'Ulangi password baru' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">{field.label}</label>
                    <div className="relative">
                      <input
                        type={showPw ? 'text' : 'password'}
                        placeholder={field.placeholder}
                        className={inputClass + ' pr-10'}
                        value={pwForm[field.key as keyof typeof pwForm]}
                        onChange={e => setPwForm(p => ({ ...p, [field.key]: e.target.value }))}
                      />
                      {field.key === 'newPw' && (
                        <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                          {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button onClick={() => { setChangePw(false); setPwForm({ current: '', newPw: '', confirm: '' }); }}
                    className="flex-1 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                    Batal
                  </button>
                  <button onClick={handleChangePw}
                    className="flex-1 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                    Ubah Password
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {myLoans.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Riwayat Peminjaman</h3>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {myLoans.slice(0, 6).map(loan => (
                <div key={loan.id} className="flex items-center gap-3 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className={`w-11 h-11 rounded-3xl bg-gradient-to-br ${CATEGORY_COLORS[loan.bookCategory] || 'from-slate-400 to-slate-600'} flex items-center justify-center text-white text-sm font-semibold`}>
                    {loan.bookTitle[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{loan.bookTitle}</p>
                    <p className="text-xs text-slate-400">{loan.requestDate}</p>
                  </div>
                  <Badge status={loan.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
