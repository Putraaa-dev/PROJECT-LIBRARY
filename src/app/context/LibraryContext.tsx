import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Book, User, Loan } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? '';

interface LibraryContextType {
  books: Book[];
  users: User[];
  loans: Loan[];
  refresh: () => Promise<void>;
  addBook: (book: Omit<Book, 'id' | 'addedAt'>) => Promise<boolean>;
  updateBook: (id: string, data: Partial<Book>) => Promise<boolean>;
  deleteBook: (id: string) => Promise<boolean>;
  addUser: (user: Omit<User, 'id' | 'memberSince' | 'totalLoans'>) => Promise<boolean>;
  updateUser: (id: string, data: Partial<User>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  requestLoan: (userId: string, userName: string, userEmail: string, bookId: string) => Promise<{ success: boolean; message: string }>;
  approveLoan: (loanId: string) => Promise<boolean>;
  rejectLoan: (loanId: string, notes?: string) => Promise<boolean>;
  returnLoan: (loanId: string) => Promise<boolean>;
  getUserLoans: (userId: string) => Loan[];
}

const LibraryContext = createContext<LibraryContextType | null>(null);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);

  const refresh = useCallback(async () => {
    try {
      const [bRes, uRes, lRes] = await Promise.all([
        fetch(`${API_URL}/api/books`),
        fetch(`${API_URL}/api/users`),
        fetch(`${API_URL}/api/loans`),
      ]);
      if (bRes.ok) {
        const b = await bRes.json();
        setBooks(b.map((x: any) => ({ ...x, id: x._id || x.id })));
      }
      if (uRes.ok) {
        const u = await uRes.json();
        setUsers(u.map((x: any) => ({ ...x, id: x._id || x.id })));
      }
      if (lRes.ok) {
        const l = await lRes.json();
        setLoans(l.map((x: any) => ({ ...x, id: x._id || x.id })));
      }
    } catch (err) {
      console.error('Refresh error:', err);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addBook = useCallback(async (book: Omit<Book, 'id' | 'addedAt'>) => {
    try {
      const res = await fetch(`${API_URL}/api/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book),
      });
      if (res.ok) { refresh(); return true; }
      return false;
    } catch { return false; }
  }, [refresh]);

  const updateBook = useCallback(async (id: string, data: Partial<Book>) => {
    try {
      const res = await fetch(`${API_URL}/api/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) { refresh(); return true; }
      return false;
    } catch { return false; }
  }, [refresh]);

  const deleteBook = useCallback(async (id: string) => {
    try {
      const active = loans.filter(l => l.bookId === id && (l.status === 'approved' || l.status === 'pending'));
      if (active.length > 0) return false;
      const res = await fetch(`${API_URL}/api/books/${id}`, { method: 'DELETE' });
      if (res.ok) { refresh(); return true; }
      return false;
    } catch { return false; }
  }, [refresh, loans]);

  const addUser = useCallback(async (user: Omit<User, 'id' | 'memberSince' | 'totalLoans'>) => {
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (res.ok) { refresh(); return true; }
      return false;
    } catch { return false; }
  }, [refresh]);

  const updateUser = useCallback(async (id: string, data: Partial<User>) => {
    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) { refresh(); return true; }
      return false;
    } catch { return false; }
  }, [refresh]);

  const deleteUser = useCallback(async (id: string) => {
    try {
      const active = loans.filter(l => l.userId === id && (l.status === 'approved' || l.status === 'pending'));
      if (active.length > 0) return false;
      const res = await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) { refresh(); return true; }
      return false;
    } catch { return false; }
  }, [refresh, loans]);

  const requestLoan = useCallback(async (userId: string, userName: string, userEmail: string, bookId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request', userId, userName, userEmail, bookId }),
      });
      const data = await res.json();
      if (res.ok) { refresh(); return { success: true, message: 'Pengajuan peminjaman berhasil! Menunggu persetujuan petugas.' }; }
      return { success: false, message: data.error || 'Gagal mengajukan peminjaman.' };
    } catch {
      return { success: false, message: 'Gagal terhubung ke server.' };
    }
  }, [refresh]);

  const approveLoan = useCallback(async (loanId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', loanId }),
      });
      if (res.ok) { refresh(); return true; }
      return false;
    } catch { return false; }
  }, [refresh]);

  const rejectLoan = useCallback(async (loanId: string, notes?: string) => {
    try {
      const res = await fetch(`${API_URL}/api/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', loanId, notes }),
      });
      if (res.ok) { refresh(); return true; }
      return false;
    } catch { return false; }
  }, [refresh]);

  const returnLoan = useCallback(async (loanId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'return', loanId }),
      });
      if (res.ok) { refresh(); return true; }
      return false;
    } catch { return false; }
  }, [refresh]);

  const getUserLoans = useCallback((userId: string): Loan[] => {
    return loans.filter(l => l.userId === userId);
  }, [loans]);

  return (
    <LibraryContext.Provider value={{ books, users, loans, refresh, addBook, updateBook, deleteBook, addUser, updateUser, deleteUser, requestLoan, approveLoan, rejectLoan, returnLoan, getUserLoans }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
}
