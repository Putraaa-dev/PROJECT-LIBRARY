import { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Shield, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Pagination } from '../components/ui/Pagination';
import type { User as UserType, UserRole, UserStatus } from '../types';

type UserForm = {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  role: UserRole;
  status: UserStatus;
};

const ITEMS_PER_PAGE = 10;

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [ 
  { value: 'admin', label: 'Administrator' },
  { value: 'petugas', label: 'Petugas' },
  { value: 'user', label: 'Anggota' },
];

const EMPTY_FORM: UserForm = { name: '', email: '', password: '', phone: '', address: '', role: 'user', status: 'active' };

export function UsersPage() {
  const { currentUser } = useAuth();
  const { users, addUser, updateUser, deleteUser, loans } = useLibrary();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserType | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (currentUser?.role !== 'admin') {
    return (
      <div className="text-center py-20">
        <Shield size={48} className="mx-auto mb-3 text-slate-300" />
        <p className="text-slate-500" style={{ fontWeight: 500 }}>Akses ditolak. Halaman ini khusus untuk Administrator.</p>
      </div>
    );
  }

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.includes(search);
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const openAdd = () => { setEditUser(null); setForm(EMPTY_FORM); setErrors({}); setFormOpen(true); };
  const openEdit = (u: UserType) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, password: u.password, phone: u.phone, address: u.address, role: u.role, status: u.status });
    setErrors({});
    setFormOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nama wajib diisi';
    if (!form.email.includes('@')) e.email = 'Email tidak valid';
    if (!editUser && form.password.length < 6) e.password = 'Password minimal 6 karakter';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (editUser) {
      updateUser(editUser.id, { name: form.name, email: form.email, phone: form.phone, address: form.address, role: form.role, status: form.status, ...(form.password ? { password: form.password } : {}) });
      toast.success('Data pengguna berhasil diperbarui!');
    } else {
      addUser({ name: form.name, email: form.email, password: form.password, phone: form.phone, address: form.address, role: form.role, status: form.status });
      toast.success('Pengguna baru berhasil ditambahkan!');
    }
    setFormOpen(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const ok = await deleteUser(deleteTarget.id);
    if (ok) toast.success(`Pengguna "${deleteTarget.name}" berhasil dihapus.`);
    else toast.error('Tidak dapat menghapus pengguna yang memiliki peminjaman aktif.');
    setDeleteTarget(null);
  };

  const getUserLoanCount = (userId: string) => loans.filter(l => l.userId === userId).length;

  const inputClass = "w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    petugas: users.filter(u => u.role === 'petugas').length,
    user: users.filter(u => u.role === 'user').length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-slate-800 dark:text-white" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.4rem' }}>
            Manajemen Pengguna
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{users.length} pengguna terdaftar</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm" style={{ fontWeight: 500 }}>
          <Plus size={16} /> Tambah Pengguna
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Admin', value: stats.admin, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Petugas', value: stats.petugas, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Anggota', value: stats.user, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-transparent`}>
            <p className={`${s.color}`} style={{ fontWeight: 700, fontSize: '1.5rem' }}>{s.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Cari nama, email, nomor telepon..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            className="py-2.5 px-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Role</option>
            {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                {['Pengguna', 'Kontak', 'Role', 'Status', 'Peminjaman', 'Bergabung', 'Aksi'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {paginatedUsers.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">
                  <Users size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Tidak ada pengguna ditemukan</p>
                </td></tr>
              ) : paginatedUsers.map(user => (
                <tr key={user.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${user.id === currentUser?.id ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs flex-shrink-0" style={{ fontWeight: 700 }}>
                        {user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-slate-700 dark:text-slate-300" style={{ fontWeight: 500 }}>
                          {user.name}
                          {user.id === currentUser?.id && <span className="ml-1 text-xs text-blue-500">(Anda)</span>}
                        </p>
                        <p className="text-xs text-slate-400 truncate max-w-32">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">{user.phone || '-'}</td>
                  <td className="px-5 py-3.5"><Badge status={user.role} /></td>
                  <td className="px-5 py-3.5"><Badge status={user.status} /></td>
                  <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">{getUserLoanCount(user.id)}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">{user.memberSince}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(user)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <Edit size={15} />
                      </button>
                      {user.id !== currentUser?.id && (
                        <button onClick={() => setDeleteTarget(user)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} totalItems={filteredUsers.length} itemsPerPage={ITEMS_PER_PAGE} />

      {/* Form Modal */}
      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1.5 font-medium">Nama Lengkap *</label>
              <input className={inputClass} placeholder="Nama lengkap" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1.5 font-medium">Email *</label>
              <input type="email" className={inputClass} placeholder="nama@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1.5 font-medium">{editUser ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password *'}</label>
              <input type="password" className={inputClass} placeholder="Min. 6 karakter" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1.5 font-medium">No. Telepon</label>
              <input className={inputClass} placeholder="08xxxxxxxxxx" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1.5 font-medium">Role</label>
              <select className={inputClass} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as UserRole }))}>
                {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1.5 font-medium">Status</label>
              <select className={inputClass} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as 'active' | 'inactive' }))}>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1.5 font-medium">Alamat</label>
              <input className={inputClass} placeholder="Alamat lengkap" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setFormOpen(false)} className="flex-1 py-2.5 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors" style={{ fontWeight: 500 }}>Batal</button>
            <button type="submit" className="flex-1 py-2.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-sm" style={{ fontWeight: 500 }}>{editUser ? 'Simpan' : 'Tambah'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Pengguna"
        message={`Hapus pengguna "${deleteTarget?.name}"? Data tidak dapat dipulihkan.`}
        confirmLabel="Ya, Hapus"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
