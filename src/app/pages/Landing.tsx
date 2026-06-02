import { Link, useNavigate } from 'react-router';
import { ArrowUpRight, BookOpen, Bookmark, Clock3, Globe2, Search, ShieldCheck, Sparkles, Star, Users, ChevronRight } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORY_COLORS } from '../data/mockData';
import { useEffect, useMemo } from 'react';

const HERO_IMG = 'https://images.unsplash.com/photo-1764406807567-a24faaaad034?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsaWJyYXJ5JTIwaW50ZXJpb3IlMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzc2NzY1ODg3fDA&ixlib=rb-4.1.0&q=80&w=1080';
const LOGO_IMG = '/icons/LibraryTogether-removebg-preview.png';

const FEATURES = [
  { icon: <Search size={22} className="text-blue-600" />, title: 'Cari Buku Mudah', desc: 'Temukan ribuan buku dengan sistem pencarian cerdas berdasarkan judul, pengarang, atau kategori.' },
  { icon: <Bookmark size={22} className="text-blue-600" />, title: 'Pinjam Online', desc: 'Ajukan peminjaman buku secara online tanpa harus mengantri di perpustakaan.' },
  { icon: <Clock3 size={22} className="text-blue-600" />, title: 'Lacak Status', desc: 'Pantau status peminjaman buku Anda secara real-time dari mana saja.' },
  { icon: <Sparkles size={22} className="text-blue-600" />, title: 'Akses Aman', desc: 'Sistem keamanan berlapis dengan autentikasi berbasis peran untuk setiap pengguna.' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Daftar Akun', desc: 'Buat akun gratis sebagai anggota perpustakaan digital kami.' },
  { step: '02', title: 'Cari Buku', desc: 'Jelajahi katalog ribuan buku dari berbagai kategori dan genre.' },
  { step: '03', title: 'Ajukan Pinjam', desc: 'Klik tombol "Pinjam" dan tunggu persetujuan petugas perpustakaan.' },
  { step: '04', title: 'Nikmati Membaca', desc: 'Ambil buku di perpustakaan dan kembalikan tepat waktu.' },
];

export function Landing() {
  const { books, users, loans } = useLibrary();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const randomBooks = useMemo(() => {
    if (books.length === 0) return [];
    return [...books].sort(() => 0.5 - Math.random()).slice(0, Math.min(6, books.length));
  }, [books]);
  const categories = [...new Set(books.map(b => b.category))].slice(0, 8);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={LOGO_IMG} alt="LibraryTogether Logo" className="w-9 h-9 object-contain shadow-sm" />
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.2rem', color: '#1e293b' }} className="dark:text-white">
              LibraryTogether
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Fitur</a>
            <a href="#katalog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Katalog</a>
            <a href="#cara-kerja" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Cara Kerja</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" style={{ fontWeight: 500 }}>
              Masuk
            </Link>
            <Link to="/register" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm" style={{ fontWeight: 500 }}>
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="Library" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-xs mb-6" style={{ fontWeight: 600 }}>
              <Globe2 size={13} /> Akses Koleksi Buku Populer
            </div>
            <h1 className="text-white mb-4 leading-tight" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3.2rem)' }}>
              Temukan Dunia Baru <span className="text-blue-400">Melalui Buku</span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Akses ribuan koleksi buku terbaik dari berbagai genre. Pinjam, baca, dan kembalikan — semuanya mudah dengan sistem perpustakaan digital kami.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg" style={{ fontWeight: 600 }}>
                Mulai Sekarang <ArrowUpRight size={16} />
              </Link>
              <Link to="/login" className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm" style={{ fontWeight: 500 }}>
                Sudah Punya Akun <ChevronRight size={16} />
              </Link>
            </div>
          </div>
          {/* Stats */}
          <div className="hidden md:grid grid-cols-2 gap-4">
            {[
              { label: 'Koleksi Buku', value: books.length + '+', icon: <BookOpen size={20} className="text-blue-400" /> },
              { label: 'Anggota Aktif', value: users.filter(u => u.role === 'user').length + '+', icon: <Users size={20} className="text-green-400" /> },
              { label: 'Peminjaman', value: loans.length + '+', icon: <Bookmark size={20} className="text-purple-400" /> },
              { label: 'Kategori', value: categories.length + '+', icon: <ShieldCheck size={20} className="text-orange-400" /> },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
                <div className="mb-2">{stat.icon}</div>
                <p className="text-white" style={{ fontWeight: 700, fontSize: '1.75rem', lineHeight: 1.2 }}>{stat.value}</p>
                <p className="text-slate-300 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section id="buku" className="py-16 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm mb-2" style={{ fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Buku Populer
              </p>
              <h2 className="text-slate-800 dark:text-white" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
                Koleksi Buku Langsung di Halaman Utama
              </h2>
            </div>
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline" style={{ fontWeight: 500 }}>
              Lihat Selengkapnya <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {randomBooks.slice(0, 4).map(book => {
              const gradient = CATEGORY_COLORS[book.category] || 'from-slate-500 to-slate-700';
              return (
                <div key={book.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-200 group">
                  <div className={`h-48 bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
                    {book.cover ? (
                      <img 
                        src={book.cover} 
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-center text-white w-full h-full flex flex-col items-center justify-center">
                        <div className="w-14 h-14 bg-white/15 rounded-3xl backdrop-blur flex items-center justify-center mx-auto mb-2">
                          <span className="text-xl font-black tracking-tight">{book.title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}</span>
                        </div>
                        <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full">{book.category}</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur px-2 py-1 rounded-full hover:bg-black/60 transition-colors">
                      <Star size={10} className="text-amber-300 fill-amber-300" />
                      <span className="text-white text-xs font-semibold">{book.rating}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-slate-900 dark:text-white mb-2 font-semibold text-sm line-clamp-2">{book.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">{book.author}</p>
                    <Link to="/login" className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors">
                      Pinjam Sekarang <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-blue-600 dark:text-blue-400 text-sm mb-2" style={{ fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Mengapa Pilih Kami</p>
            <h2 className="text-slate-800 dark:text-white" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
              Fitur Unggulan Perpustakaan
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white dark:bg-slate-700 rounded-2xl p-6 border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-slate-800 dark:text-white mb-2" style={{ fontWeight: 600, fontSize: '0.95rem' }}>{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Books */}
      <section id="katalog" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-8">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm mb-2" style={{ fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Rekomendasi Buku</p>
              <h2 className="text-slate-800 dark:text-white" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
                Pilihan Acak dari Koleksi Kami
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 max-w-2xl">Setiap kali kamu kembali, sistem akan menampilkan beberapa pilihan buku acak langsung dari database perpustakaan.</p>
            </div>
            <Link to="/login" className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline" style={{ fontWeight: 500 }}>
              Lihat Semua <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {randomBooks.map(book => {
              const gradient = CATEGORY_COLORS[book.category] || 'from-slate-500 to-slate-700';
              return (
                <div key={book.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
                  <div className={`h-56 bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
                    {book.cover ? (
                      <img 
                        src={book.cover} 
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-center text-white w-full h-full flex flex-col items-center justify-center">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.3rem' }}>{book.title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}</span>
                        </div>
                        <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full">{book.category}</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/40 backdrop-blur px-2 py-1 rounded-full hover:bg-black/60 transition-colors">
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                      <span className="text-white text-xs" style={{ fontWeight: 600 }}>{book.rating}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-slate-800 dark:text-white line-clamp-1 mb-1" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: '0.9rem' }}>{book.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{book.author}</p>
                    <Link to="/register" className="block w-full text-center py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors" style={{ fontWeight: 500 }}>
                      Pinjam Sekarang
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-slate-800 dark:text-white" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 'clamp(1.3rem, 3vw, 1.8rem)' }}>
              Jelajahi Berdasarkan Kategori
            </h2>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map(cat => {
              const gradient = CATEGORY_COLORS[cat] || 'from-slate-500 to-slate-700';
              return (
                <Link key={cat} to="/register" className={`px-5 py-2.5 rounded-full text-sm text-white bg-gradient-to-r ${gradient} hover:opacity-90 hover:shadow-md transition-all`} style={{ fontWeight: 500 }}>
                  {cat}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="cara-kerja" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-blue-600 dark:text-blue-400 text-sm mb-2" style={{ fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Cara Mudah</p>
            <h2 className="text-slate-800 dark:text-white" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
              Bagaimana Cara Kerjanya?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="text-center relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-1/2 w-full h-px bg-gradient-to-r from-blue-300 to-transparent dark:from-blue-700" />
                )}
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 relative z-10" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  {step.step}
                </div>
                <h3 className="text-slate-800 dark:text-white mb-2" style={{ fontWeight: 600 }}>{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-white mb-4" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
            Siap Mulai Membaca?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">Bergabunglah dengan ribuan pembaca dan akses koleksi buku terlengkap sekarang juga.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="px-8 py-3.5 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors shadow-lg" style={{ fontWeight: 600 }}>
              Daftar Gratis Sekarang
            </Link>
            <Link to="/login" className="px-8 py-3.5 bg-blue-500/30 border border-white/30 text-white rounded-xl hover:bg-blue-500/50 transition-colors" style={{ fontWeight: 500 }}>
              Sudah Punya Akun
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={LOGO_IMG} alt="LibraryTogether Logo" className="w-8 h-8 object-contain" />
              <span className="text-white" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>LibraryTogether</span>
            </div>
            <p className="text-slate-400 text-sm text-center">© 2026 LibraryTogether. Dibuat dengan ❤️ untuk para pembaca Indonesia.</p>
            <div className="flex gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Kebijakan</a>
              <a href="#" className="hover:text-white transition-colors">Tentang</a>
              <a href="#" className="hover:text-white transition-colors">Kontak</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}