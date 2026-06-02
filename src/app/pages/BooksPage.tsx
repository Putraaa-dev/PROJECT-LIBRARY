import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Plus, Search, Filter, LayoutGrid, List, BookOpen, Star, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { BookCard } from '../components/books/BookCard';
import { BookForm } from '../components/books/BookForm';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Pagination } from '../components/ui/Pagination';
import type { Book } from '../types';
import { CATEGORIES, CATEGORY_COLORS } from '../data/mockData';

const ITEMS_PER_PAGE = 12;

export function BooksPage() {
  const { currentUser } = useAuth();
  const { books, addBook, updateBook, deleteBook, requestLoan, loans } = useLibrary();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [borrowTarget, setBorrowTarget] = useState<Book | null>(null);

  useEffect(() => {
    const s = searchParams.get('search');
    if (s) setSearch(s);
  }, [searchParams]);

  const isManager = currentUser?.role === 'admin' || currentUser?.role === 'petugas';

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchSearch = !search || book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase()) ||
        book.isbn.includes(search) ||
        book.publisher.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'all' || book.category === category;
      return matchSearch && matchCategory;
    });
  }, [books, search, category]);

  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = filteredBooks.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleBorrow = (book: Book) => setBorrowTarget(book);

  const confirmBorrow = async () => {
    if (!borrowTarget || !currentUser) return;
    const result = await requestLoan(currentUser.id, currentUser.name, currentUser.email, borrowTarget.id);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
    setBorrowTarget(null);
  };

  const handleDelete = (book: Book) => setDeleteTarget(book);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const ok = await deleteBook(deleteTarget.id);
    if (ok) toast.success(`Buku "${deleteTarget.title}" berhasil dihapus.`);
    else toast.error('Tidak dapat menghapus buku yang sedang dipinjam.');
    setDeleteTarget(null);
  };

  const handleFormSubmit = (data: Omit<Book, 'id' | 'addedAt'>) => {
    if (editBook) {
      updateBook(editBook.id, data);
      toast.success('Buku berhasil diperbarui!');
    } else {
      addBook(data);
      toast.success('Buku baru berhasil ditambahkan!');
    }
    setEditBook(null);
  };

  const getUserBorrowedBookIds = () => {
    if (!currentUser) return new Set<string>();
    return new Set(loans.filter(l => l.userId === currentUser.id && (l.status === 'approved' || l.status === 'pending')).map(l => l.bookId));
  };
  const borrowedIds = getUserBorrowedBookIds();

  const categoryOptions = ['all', ...CATEGORIES.filter(c => books.some(b => b.category === c))];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-slate-800 dark:text-white" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.4rem' }}>
            {isManager ? 'Manajemen Buku' : 'Katalog Buku'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {filteredBooks.length} buku ditemukan
          </p>
        </div>
        {isManager && (
          <button
            onClick={() => { setEditBook(null); setFormOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm"
            style={{ fontWeight: 500 }}
          >
            <Plus size={16} /> Tambah Buku
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari judul, pengarang, ISBN, penerbit..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400 flex-shrink-0" />
            <select
              value={category}
              onChange={e => { setCategory(e.target.value); setPage(1); }}
              className="py-2.5 px-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="all">Semua Kategori</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'}`}>
                <LayoutGrid size={16} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'}`}>
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {categoryOptions.slice(0, 8).map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              className={`px-3 py-1 rounded-full text-xs transition-all ${
                category === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
              style={{ fontWeight: 500 }}
            >
              {cat === 'all' ? 'Semua' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid/List */}
      {paginatedBooks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <BookOpen size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 dark:text-slate-400" style={{ fontWeight: 500 }}>Tidak ada buku ditemukan</p>
          <p className="text-sm text-slate-400 mt-1">Coba ubah filter atau kata pencarian Anda</p>
          {search && (
            <button onClick={() => { setSearch(''); setCategory('all'); }} className="mt-3 text-sm text-blue-600 hover:underline">Hapus filter</button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {paginatedBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              showActions={isManager ? 'manage' : 'borrow'}
              onBorrow={handleBorrow}
              onEdit={book => { setEditBook(book); setFormOpen(true); }}
              onDelete={handleDelete}
              isBorrowed={borrowedIds.has(book.id)}
            />
          ))}
        </div>
      ) : (
        // List view
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="text-left px-5 py-3 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>Buku</th>
                <th className="text-left px-5 py-3 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell" style={{ fontWeight: 600 }}>Kategori</th>
                <th className="text-left px-5 py-3 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell" style={{ fontWeight: 600 }}>Tahun</th>
                <th className="text-left px-5 py-3 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>Stok</th>
                <th className="text-left px-5 py-3 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell" style={{ fontWeight: 600 }}>Rating</th>
                <th className="text-right px-5 py-3 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider" style={{ fontWeight: 600 }}>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {paginatedBooks.map(book => (
                <tr key={book.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-12 rounded-lg bg-gradient-to-br ${CATEGORY_COLORS[book.category] || 'from-slate-400 to-slate-600'} flex items-center justify-center text-white text-xs flex-shrink-0`} style={{ fontWeight: 700 }}>
                        {book.title[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1" style={{ fontWeight: 600 }}>{book.title}</p>
                        <p className="text-xs text-slate-400">{book.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{book.category}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">{book.year > 0 ? book.year : 'Kuno'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${book.available > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`} style={{ fontWeight: 600 }}>
                      {book.available}/{book.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-sm text-slate-500 dark:text-slate-400">{book.rating}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {isManager ? (
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => { setEditBook(book); setFormOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                          <Edit size={15} />
                        </button>
                        <button onClick={() => handleDelete(book)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleBorrow(book)}
                        disabled={book.available <= 0 || borrowedIds.has(book.id)}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${book.available <= 0 || borrowedIds.has(book.id) ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        style={{ fontWeight: 500 }}
                      >
                        {borrowedIds.has(book.id) ? 'Dipinjam' : book.available <= 0 ? 'Habis' : 'Pinjam'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} totalItems={filteredBooks.length} itemsPerPage={ITEMS_PER_PAGE} />

      {/* Modals */}
      <BookForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditBook(null); }}
        onSubmit={handleFormSubmit}
        editBook={editBook}
      />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Buku"
        message={`Apakah Anda yakin ingin menghapus buku "${deleteTarget?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        variant="danger"
      />
      <ConfirmDialog
        isOpen={!!borrowTarget}
        title="Pinjam Buku"
        message={`Ajukan peminjaman "${borrowTarget?.title}" oleh ${currentUser?.name}? Petugas akan memverifikasi permintaan Anda.`}
        confirmLabel="Ajukan Pinjam"
        onConfirm={confirmBorrow}
        onCancel={() => setBorrowTarget(null)}
        variant="info"
      />
    </div>
  );
}
