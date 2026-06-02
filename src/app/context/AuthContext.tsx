import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthUser } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? '';

interface AuthContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (data: Partial<AuthUser>) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY_AUTH = 'perpus_auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedAuth = localStorage.getItem(STORAGE_KEY_AUTH);
    if (storedAuth) {
      try {
        const user = JSON.parse(storedAuth) as AuthUser;
        setCurrentUser(user);
      } catch {
        localStorage.removeItem(STORAGE_KEY_AUTH);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.error || 'Login failed' };

      const authUser: AuthUser = {
        id: data.user._id || data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        phone: data.user.phone || '',
        address: data.user.address || '',
        memberSince: data.user.memberSince,
        status: data.user.status,
        avatar: data.user.avatar,
        totalLoans: data.user.totalLoans || 0,
      };
      setCurrentUser(authUser);
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(authUser));
      return { success: true, message: data.message || `Selamat datang, ${authUser.name}!` };
    } catch {
      return { success: false, message: 'Gagal terhubung ke server.' };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, phone?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.error || 'Registration failed' };
      return { success: true, message: data.message || 'Registrasi berhasil! Silakan login.' };
    } catch {
      return { success: false, message: 'Gagal terhubung ke server.' };
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_AUTH);
  }, []);

  const updateProfile = useCallback(async (data: Partial<AuthUser>) => {
    if (!currentUser) return { success: false, message: 'Pengguna tidak ditemukan.' };

    try {
      const res = await fetch(`${API_URL}/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) return { success: false, message: result.error || 'Gagal memperbarui profil.' };

      const updated = { ...currentUser, ...data };
      setCurrentUser(updated);
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(updated));
      return { success: true, message: 'Profil berhasil diperbarui!' };
    } catch {
      return { success: false, message: 'Gagal terhubung ke server.' };
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated: !!currentUser, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
