import { Star, BookOpen, User, Calendar } from 'lucide-react';
import type { Book } from '../../types';
import { CATEGORY_COLORS } from '../../data/mockData';

interface BookCardProps {
  book: Book;
  onBorrow?: (book: Book) => void;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
  showActions?: 'borrow' | 'manage' | 'none';
  isBorrowed?: boolean;
}

export function BookCard({ book, onBorrow, onEdit, onDelete, showActions = 'none', isBorrowed }: BookCardProps) {
  const gradient = CATEGORY_COLORS[book.category] || 'from-slate-500 to-slate-700';
  const initials = book.title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col group">
      {/* Cover */}
      <div className={`relative h-48 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
        {book.cover ? (
          <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
              <span style={{ fontSize: '1.5rem', fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>{initials}</span>
            </div>
            <p className="text-xs text-white/70 px-4 line-clamp-2">{book.title}</p>
          </div>
        )}
        {/* Available badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs ${book.available > 0 ? 'bg-green-500/90' : 'bg-red-500/90'} text-white backdrop-blur-sm`} style={{ fontWeight: 600 }}>
          {book.available > 0 ? `${book.available} tersedia` : 'Habis'}
        </div>
        {/* Category */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-white text-xs">
          {book.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug mb-1" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: '0.95rem' }}>
          {book.title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
          <User size={12} className="flex-shrink-0" /> {book.author}
        </p>
        <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mb-3">
          <span className="flex items-center gap-1"><Calendar size={11} /> {book.year > 0 ? book.year : 'Kuno'}</span>
          <span className="flex items-center gap-1"><BookOpen size={11} /> {book.pages} hal.</span>
          <span className="flex items-center gap-1 ml-auto">
            <Star size={11} className="text-amber-400 fill-amber-400" /> {book.rating}
          </span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 flex-1 mb-3">{book.description}</p>

        {/* Actions */}
        {showActions === 'borrow' && (
          <button
            onClick={() => onBorrow?.(book)}
            disabled={book.available <= 0 || isBorrowed}
            className={`w-full py-2 rounded-lg text-sm transition-colors ${
              book.available <= 0 || isBorrowed
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
            }`}
            style={{ fontWeight: 500 }}
          >
            {isBorrowed ? 'Sudah Dipinjam' : book.available <= 0 ? 'Tidak Tersedia' : 'Pinjam Buku'}
          </button>
        )}
        {showActions === 'manage' && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit?.(book)}
              className="flex-1 py-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
              style={{ fontWeight: 500 }}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete?.(book)}
              className="flex-1 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
              style={{ fontWeight: 500 }}
            >
              Hapus
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
