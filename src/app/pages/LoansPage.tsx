import { useState, useMemo } from 'react';
import {
  Search, CheckCircle, XCircle, RotateCcw,
  BookMarked, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { CATEGORY_COLORS } from '../data/mockData';
import type { Loan, LoanStatus } from '../types';

const ITEMS_PER_PAGE = 10;

const TABS: { key: LoanStatus | 'all'; label: string; color: string }[] = [
  { key: 'all', label: 'Semua', color: 'text-slate-600' },
  { key: 'pending', label: 'Menunggu', color: 'text-amber-600' },
  { key: 'approved', label: 'Dipinjam', color: 'text-blue-600' },
  { key: 'returned', label: 'Dikembalikan', color: 'text-green-600' },
  { key: 'rejected', label: 'Ditolak', color: 'text-red-600' },
];

export function LoansPage() {
  const { currentUser } = useAuth();
  const { loans, approveLoan, rejectLoan, returnLoan } = useLibrary();

  const [activeTab, setActiveTab] = useState<LoanStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rejectNote, setRejectNote] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectLoanTarget, setRejectLoanTarget] = useState<Loan | null>(null);
  const [returnConfirm, setReturnConfirm] = useState<Loan | null>(null);
  const [approveConfirm, setApproveConfirm] = useState<Loan | null>(null);

  const isManager = currentUser?.role === 'admin' || currentUser?.role === 'petugas';

  // Filter loans based on role
  const baseLoans = isManager
    ? loans
    : loans.filter(l => l.userId === currentUser?.id);

  const filteredLoans = useMemo(() => {
    return baseLoans.filter(loan => {
      const matchTab = activeTab === 'all' || loan.status === activeTab;
      const matchSearch = !search ||
        loan.bookTitle.toLowerCase().includes(search.toLowerCase()) ||
        loan.userName.toLowerCase().includes(search.toLowerCase()) ||
        loan.userEmail.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [baseLoans, activeTab, search]);

  const totalPages = Math.ceil(filteredLoans.length / ITEMS_PER_PAGE);
  const paginatedLoans = filteredLoans.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const counts: Record<string, number> = {
    all: baseLoans.length,
    pending: baseLoans.filter(l => l.status === 'pending').length,
    approved: baseLoans.filter(l => l.status === 'approved').length,
    returned: baseLoans.filter(l => l.status === 'returned').length,
    rejected: baseLoans.filter(l => l.status === 'rejected').length,
  };

  const handleApprove = (loan: Loan) => setApproveConfirm(loan);
  const confirmApprove = () => {
    if (!approveConfirm) return;
    approveLoan(approveConfirm.id);
    toast.success(`Peminjaman "${approveConfirm.bookTitle}" berhasil disetujui!`);
    setApproveConfirm(null);
  };

  const handleReject = (loan: Loan) => { setRejectLoanTarget(loan); setRejectNote(''); setRejectModalOpen(true); };
  const confirmReject = () => {
    if (!rejectLoanTarget) return;
    rejectLoan(rejectLoanTarget.id, rejectNote || 'Ditolak oleh petugas');
    toast.success(`Peminjaman "${rejectLoanTarget.bookTitle}" ditolak.`);
    setRejectModalOpen(false);
    setRejectLoanTarget(null);
  };

  const handleReturn = (loan: Loan) => setReturnConfirm(loan);
  const confirmReturn = () => {
    if (!returnConfirm) return;
    returnLoan(returnConfirm.id);
    toast.success(`Buku "${returnConfirm.bookTitle}" berhasil dikembalikan!`);
    setReturnConfirm(null);
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-slate-800 dark:text-white" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.4rem' }}>
          {isManager ? 'Manajemen Peminjaman' : 'Peminjaman Saya'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{baseLoans.length} total transaksi</p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-700">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(1); }}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/30'
              }`}
              style={{ fontWeight: activeTab === tab.key ? 600 : 400 }}
            >
              {tab.label}
              {counts[tab.key] > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`} style={{ fontWeight: 600 }}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={isManager ? 'Cari judul buku atau nama anggota...' : 'Cari judul buku...'}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="text-left px-5 py-3 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>Buku</th>
                {isManager && <th className="text-left px-5 py-3 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell" style={{ fontWeight: 600 }}>Anggota</th>}
                <th className="text-left px-5 py-3 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell" style={{ fontWeight: 600 }}>Tgl. Ajukan</th>
                <th className="text-left px-5 py-3 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell" style={{ fontWeight: 600 }}>Tenggat</th>
                <th className="text-left px-5 py-3 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>Status</th>
                {isManager && <th className="text-right px-5 py-3 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {paginatedLoans.length === 0 ? (
                <tr>
                  <td colSpan={isManager ? 6 : 4} className="text-center py-12 text-slate-400">
                    <BookMarked size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Tidak ada data peminjaman</p>
                  </td>
                </tr>
              ) : paginatedLoans.map(loan => (
                <tr key={loan.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${isOverdue(loan.dueDate) && loan.status === 'approved' ? 'bg-red-50/30 dark:bg-red-900/5' : ''}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-12 rounded-lg bg-gradient-to-br ${CATEGORY_COLORS[loan.bookCategory] || 'from-slate-400 to-slate-600'} flex items-center justify-center text-white text-xs flex-shrink-0`} style={{ fontWeight: 700 }}>
                        {loan.bookTitle[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1" style={{ fontWeight: 600 }}>{loan.bookTitle}</p>
                        <p className="text-xs text-slate-400 line-clamp-1">{loan.bookAuthor}</p>
                        {isOverdue(loan.dueDate) && loan.status === 'approved' && (
                          <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5" style={{ fontWeight: 500 }}>
                            <AlertCircle size={10} /> Terlambat!
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  {isManager && (
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-sm text-slate-700 dark:text-slate-300" style={{ fontWeight: 500 }}>{loan.userName}</p>
                      <p className="text-xs text-slate-400">{loan.userEmail}</p>
                    </td>
                  )}
                  <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">{loan.requestDate}</td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    {loan.dueDate ? (
                      <span className={`text-sm ${isOverdue(loan.dueDate) && loan.status === 'approved' ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`} style={{ fontWeight: isOverdue(loan.dueDate) ? 600 : 400 }}>
                        {loan.dueDate}
                      </span>
                    ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <div>
                      <Badge status={loan.status} />
                      {loan.notes && loan.status === 'rejected' && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{loan.notes}</p>
                      )}
                    </div>
                  </td>
                  {isManager && (
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {loan.status === 'pending' && (
                          <>
                            <button onClick={() => handleApprove(loan)} title="Setujui" className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors" style={{ fontWeight: 500 }}>
                              <CheckCircle size={13} /> Setujui
                            </button>
                            <button onClick={() => handleReject(loan)} title="Tolak" className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors" style={{ fontWeight: 500 }}>
                              <XCircle size={13} /> Tolak
                            </button>
                          </>
                        )}
                        {loan.status === 'approved' && (
                          <button onClick={() => handleReturn(loan)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors" style={{ fontWeight: 500 }}>
                            <RotateCcw size={13} /> Kembalikan
                          </button>
                        )}
                        {(loan.status === 'returned' || loan.status === 'rejected') && (
                          <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} totalItems={filteredLoans.length} itemsPerPage={ITEMS_PER_PAGE} />

      {/* Confirm Approve */}
      <ConfirmDialog
        isOpen={!!approveConfirm}
        title="Setujui Peminjaman"
        message={`Setujui peminjaman buku "${approveConfirm?.bookTitle}" oleh ${approveConfirm?.userName}? Tenggat waktu otomatis 14 hari.`}
        confirmLabel="Ya, Setujui"
        onConfirm={confirmApprove}
        onCancel={() => setApproveConfirm(null)}
        variant="info"
      />

      {/* Reject Modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Tolak Peminjaman" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Tolak peminjaman buku <span className="text-slate-800 dark:text-white" style={{ fontWeight: 600 }}>"{rejectLoanTarget?.bookTitle}"</span>?
          </p>
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1.5 font-medium">Alasan penolakan (opsional)</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Masukkan alasan penolakan..."
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setRejectModalOpen(false)} className="flex-1 py-2.5 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-lg transition-colors" style={{ fontWeight: 500 }}>Batal</button>
            <button onClick={confirmReject} className="flex-1 py-2.5 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors" style={{ fontWeight: 500 }}>Tolak</button>
          </div>
        </div>
      </Modal>

      {/* Confirm Return */}
      <ConfirmDialog
        isOpen={!!returnConfirm}
        title="Konfirmasi Pengembalian"
        message={`Tandai buku "${returnConfirm?.bookTitle}" telah dikembalikan oleh ${returnConfirm?.userName}?`}
        confirmLabel="Ya, Kembalikan"
        onConfirm={confirmReturn}
        onCancel={() => setReturnConfirm(null)}
        variant="info"
      />
    </div>
  );
}
