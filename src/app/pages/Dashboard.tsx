import { Link } from 'react-router';
import {
  BookOpen, Users, ClipboardList, CheckCircle, Clock,
  TrendingUp, Star, ArrowRight, AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { MONTHLY_LOAN_DATA, CATEGORY_COLORS } from '../data/mockData';

export function Dashboard() {
  const { currentUser } = useAuth();
  const { books, users, loans } = useLibrary();

  const totalBooks = books.length;
  const totalUsers = users.filter(u => u.role === 'user').length;
  const totalLoans = loans.length;
  const pendingLoans = loans.filter(l => l.status === 'pending');
  const activeLoans = loans.filter(l => l.status === 'approved');
  const returnedLoans = loans.filter(l => l.status === 'returned');
  const lowStockBooks = books.filter(b => b.available === 0).length;
  const recentLoans = [...loans].sort((a, b) => b.requestDate.localeCompare(a.requestDate)).slice(0, 5);

  const userLoans = currentUser ? loans.filter(l => l.userId === currentUser.id) : [];
  const userActiveLoans = userLoans.filter(l => l.status === 'approved');
  const userPendingLoans = userLoans.filter(l => l.status === 'pending');
  const topBooks = books.filter(b => b.available > 0).sort((a, b) => b.rating - a.rating).slice(0, 4);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat Pagi';
    if (h < 17) return 'Selamat Siang';
    return 'Selamat Malam';
  };

  if (currentUser?.role === 'admin') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-slate-800 dark:text-white" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.5rem' }}>
            {greeting()}, {currentUser.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Ringkasan aktivitas perpustakaan hari ini.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Koleksi" value={totalBooks} icon={<BookOpen size={22} />} color="blue" subtitle="buku terdaftar" />
          <StatCard title="Total Anggota" value={totalUsers} icon={<Users size={22} />} color="green" subtitle="pengguna aktif" />
          <StatCard title="Sedang Dipinjam" value={activeLoans.length} icon={<ClipboardList size={22} />} color="purple" subtitle="buku aktif" />
          <StatCard title="Menunggu Approve" value={pendingLoans.length} icon={<Clock size={22} />} color="orange"
            change={pendingLoans.length > 0 ? `${pendingLoans.length} permintaan baru` : 'Tidak ada antrian'}
            changeType={pendingLoans.length > 0 ? 'up' : 'neutral'}
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Telah Dikembalikan" value={returnedLoans.length} icon={<CheckCircle size={22} />} color="cyan" subtitle="total pengembalian" />
          <StatCard title="Stok Habis" value={lowStockBooks} icon={<AlertCircle size={22} />} color="red" subtitle="buku perlu restok" />
          <StatCard title="Total Peminjaman" value={totalLoans} icon={<TrendingUp size={22} />} color="blue" subtitle="sepanjang waktu" />
          <StatCard title="Rating Rata-rata" value={(books.reduce((s, b) => s + b.rating, 0) / books.length || 0).toFixed(1)} icon={<Star size={22} />} color="orange" subtitle="dari 5.0" />
        </div>

        {/* Chart + Recent Loans */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <h3 className="text-slate-700 dark:text-slate-200 mb-4" style={{ fontWeight: 600 }}>Statistik Peminjaman (7 Bulan Terakhir)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={MONTHLY_LOAN_DATA} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="peminjaman" name="Dipinjam" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pengembalian" name="Dikembalikan" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pending */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-700 dark:text-slate-200" style={{ fontWeight: 600 }}>Menunggu Persetujuan</h3>
              <Link to="/app/loans" className="text-xs text-blue-600 dark:text-blue-400 hover:underline" style={{ fontWeight: 500 }}>Lihat semua</Link>
            </div>
            {pendingLoans.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Tidak ada antrian</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingLoans.slice(0, 4).map(loan => (
                  <div key={loan.id} className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1" style={{ fontWeight: 500 }}>{loan.bookTitle}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{loan.userName} · {loan.requestDate}</p>
                  </div>
                ))}
                {pendingLoans.length > 4 && (
                  <Link to="/app/loans" className="block text-center text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2">
                    +{pendingLoans.length - 4} lainnya
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Loans Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-slate-700 dark:text-slate-200" style={{ fontWeight: 600 }}>Aktivitas Peminjaman Terbaru</h3>
            <Link to="/app/loans" className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline" style={{ fontWeight: 500 }}>
              Semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  {['Anggota', 'Buku', 'Tanggal', 'Status'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {recentLoans.map(loan => (
                  <tr key={loan.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-slate-700 dark:text-slate-300" style={{ fontWeight: 500 }}>{loan.userName}</p>
                      <p className="text-xs text-slate-400">{loan.userEmail}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1" style={{ fontWeight: 500 }}>{loan.bookTitle}</p>
                      <p className="text-xs text-slate-400">{loan.bookAuthor}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">{loan.requestDate}</td>
                    <td className="px-5 py-3.5"><Badge status={loan.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser?.role === 'petugas') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-slate-800 dark:text-white" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.5rem' }}>
            {greeting()}, {currentUser.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Kelola perpustakaan dengan mudah dan efisien.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Koleksi" value={totalBooks} icon={<BookOpen size={22} />} color="blue" subtitle="buku tersedia" />
          <StatCard title="Menunggu Approve" value={pendingLoans.length} icon={<Clock size={22} />} color="orange" subtitle="permintaan baru" />
          <StatCard title="Sedang Dipinjam" value={activeLoans.length} icon={<ClipboardList size={22} />} color="purple" subtitle="buku aktif" />
          <StatCard title="Dikembalikan" value={returnedLoans.length} icon={<CheckCircle size={22} />} color="green" subtitle="total selesai" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending Loans */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-slate-700 dark:text-slate-200" style={{ fontWeight: 600 }}>Permintaan Peminjaman</h3>
              <Link to="/app/loans" className="text-xs text-blue-600 hover:underline" style={{ fontWeight: 500 }}>Kelola</Link>
            </div>
            <div className="p-4 space-y-3">
              {pendingLoans.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <CheckCircle size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Semua permintaan sudah diproses</p>
                </div>
              ) : pendingLoans.slice(0, 5).map(loan => (
                <div key={loan.id} className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
                  <div className="w-8 h-8 bg-amber-200 dark:bg-amber-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock size={14} className="text-amber-700 dark:text-amber-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1" style={{ fontWeight: 500 }}>{loan.bookTitle}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{loan.userName} · {loan.requestDate}</p>
                  </div>
                  <Badge status="pending" />
                </div>
              ))}
            </div>
          </div>

          {/* Books Low Stock */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-slate-700 dark:text-slate-200" style={{ fontWeight: 600 }}>Buku Stok Kritis</h3>
              <Link to="/app/books" className="text-xs text-blue-600 hover:underline" style={{ fontWeight: 500 }}>Kelola Buku</Link>
            </div>
            <div className="p-4 space-y-2">
              {books.filter(b => b.available <= 1).slice(0, 5).map(book => (
                <div key={book.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${CATEGORY_COLORS[book.category] || 'from-slate-400 to-slate-600'} flex items-center justify-center text-white text-xs flex-shrink-0`} style={{ fontWeight: 700 }}>
                    {book.title[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1" style={{ fontWeight: 500 }}>{book.title}</p>
                    <p className="text-xs text-slate-400">{book.author}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${book.available === 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-amber-100 text-amber-700'}`} style={{ fontWeight: 600 }}>
                    {book.available} sisa
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // USER DASHBOARD
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
        <p className="text-blue-200 text-sm mb-1">{greeting()}</p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.4rem' }}>
          {currentUser?.name} 📚
        </h1>
        <p className="text-blue-100 text-sm mt-1">Anggota sejak {currentUser?.memberSince} · {userLoans.length} total peminjaman</p>
        <div className="flex gap-4 mt-4">
          <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
            <p style={{ fontWeight: 700, fontSize: '1.4rem' }}>{userActiveLoans.length}</p>
            <p className="text-blue-100 text-xs">Sedang Dipinjam</p>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
            <p style={{ fontWeight: 700, fontSize: '1.4rem' }}>{userPendingLoans.length}</p>
            <p className="text-blue-100 text-xs">Menunggu Approve</p>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
            <p style={{ fontWeight: 700, fontSize: '1.4rem' }}>{userLoans.filter(l => l.status === 'returned').length}</p>
            <p className="text-blue-100 text-xs">Selesai</p>
          </div>
        </div>
      </div>

      {/* Active Loans */}
      {userActiveLoans.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-slate-700 dark:text-slate-200" style={{ fontWeight: 600 }}>Buku yang Sedang Dipinjam</h3>
            <Link to="/app/loans" className="text-xs text-blue-600 hover:underline" style={{ fontWeight: 500 }}>Riwayat</Link>
          </div>
          <div className="p-4 grid sm:grid-cols-2 gap-3">
            {userActiveLoans.map(loan => (
              <div key={loan.id} className="flex gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30">
                <div className={`w-10 h-14 rounded-lg bg-gradient-to-br ${CATEGORY_COLORS[loan.bookCategory] || 'from-slate-400 to-slate-600'} flex items-center justify-center text-white flex-shrink-0`} style={{ fontWeight: 700 }}>
                  {loan.bookTitle[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1" style={{ fontWeight: 600 }}>{loan.bookTitle}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{loan.bookAuthor}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400" style={{ fontWeight: 500 }}>⏰ Kembalikan: {loan.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Books */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-700 dark:text-slate-200" style={{ fontWeight: 600, fontFamily: "'Playfair Display', serif" }}>Rekomendasi untuk Anda</h3>
          <Link to="/app/books" className="text-sm text-blue-600 dark:text-blue-400 hover:underline" style={{ fontWeight: 500 }}>Katalog Lengkap</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topBooks.map(book => {
            const gradient = CATEGORY_COLORS[book.category] || 'from-slate-400 to-slate-600';
            return (
              <Link key={book.id} to="/app/books" className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group">
                <div className={`h-32 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                  <div className="text-white text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto">
                      <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.1rem' }}>{book.title[0]}</span>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1" style={{ fontWeight: 600 }}>{book.title}</p>
                  <p className="text-xs text-slate-400 line-clamp-1">{book.author}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">{book.rating}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
