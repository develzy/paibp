"use client";

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, School, Users, Calendar, FileText, Hand, Award, BarChart3, Printer, Settings, LogOut, Moon, Sun, User, Menu, ChevronDown, Info, Star, Target, Lock, Scale, Download, Shield, Wifi, WifiOff, GraduationCap 
} from 'lucide-react';
import { DB, getProfile, seedDummyData, class1Students, class2Students, class3Students, class4Students, class5Students, class6Students, getCurrentAcademicYear } from '@/lib/data';
import { useStore } from '@/store/useStore';

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const store = useStore();

  
  useEffect(() => {
    setIsClient(true);
    seedDummyData();
    const storedSession = DB.getObj('session');
    if (storedSession) setSession(storedSession);
    
    // Check dark mode
    const storedDark = localStorage.getItem('paibp_dark');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (storedDark === 'true' || (storedDark === null && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const store = useStore.getState();
    if (store.classes.length === 0) {
      store.setClasses(() => DB.get('classes'));
      store.setStudents(() => DB.get('students'));
      store.setWeeklyScores(() => DB.get('weekly'));
      store.setSASScores(() => DB.get('sas'));
      store.setPracticeScores(() => DB.get('practice'));
      store.setASAJScores(() => DB.get('asaj'));
    } else {
      // Migrate class names if they contain A/B/C like '1A', '2B'
      const needsMigration = store.classes.some(c => /^[1-6][A-Z]?$/i.test(c.name));
      if (needsMigration) {
        store.setClasses(prev => prev.map(c => {
          if (/^[1-6][A-Z]?$/i.test(c.name)) {
            return { ...c, name: 'Kelas ' + c.name[0] };
          }
          return c;
        }));
      }
      
      // Migrate NISN for existing students
      const needsNisnMigration = store.students.some(s => !s.nisn && class1Students.some((cs: any) => cs.nis === s.nis));
      if (needsNisnMigration) {
        store.setStudents(prev => prev.map(s => {
          if (!s.nisn) {
            const found = class1Students.find((cs: any) => cs.nis === s.nis);
            if (found && found.nisn) {
              return { ...s, nisn: found.nisn };
            }
          }
          return s;
        }));
      }

      // Migrate Class 2 students if not exist
      if (!localStorage.getItem('paibp_migrated_c2_v2')) {
        const c2 = store.classes.find(c => c.name === 'Kelas 2' && c.year === getCurrentAcademicYear());
        if (c2) {
          const newStudents: any[] = [];
          class2Students.forEach((cs, idx) => {
            if (!store.students.some(s => s.nis === cs.nis && s.classId === c2.id)) {
              newStudents.push({
                id: `s2_${Date.now()}_${idx}`,
                nis: cs.nis,
                nisn: cs.nisn || '',
                name: cs.name,
                classId: c2.id
              });
            }
          });
          if (newStudents.length > 0) {
            store.setStudents(prev => [...prev, ...newStudents]);
          }
        }
        localStorage.setItem('paibp_migrated_c2_v2', 'true');
      }

      // Migrate Class 3 students if not exist
      if (!localStorage.getItem('paibp_migrated_c3_v2')) {
        const c3 = store.classes.find(c => c.name === 'Kelas 3' && c.year === getCurrentAcademicYear());
        if (c3) {
          const newStudents: any[] = [];
          class3Students.forEach((cs, idx) => {
            if (!store.students.some(s => s.nis === cs.nis && s.classId === c3.id)) {
              newStudents.push({
                id: `s3_${Date.now()}_${idx}`,
                nis: cs.nis,
                nisn: cs.nisn || '',
                name: cs.name,
                classId: c3.id
              });
            }
          });
          if (newStudents.length > 0) {
            store.setStudents(prev => [...prev, ...newStudents]);
          }
        }
        localStorage.setItem('paibp_migrated_c3_v2', 'true');
      }

      // Migrate Class 4 students if not exist
      if (!localStorage.getItem('paibp_migrated_c4_v2')) {
        const c4 = store.classes.find(c => c.name === 'Kelas 4' && c.year === getCurrentAcademicYear());
        if (c4) {
          const newStudents: any[] = [];
          class4Students.forEach((cs, idx) => {
            if (!store.students.some(s => s.nis === cs.nis && s.classId === c4.id)) {
              newStudents.push({
                id: `s4_${Date.now()}_${idx}`,
                nis: cs.nis,
                nisn: cs.nisn || '',
                name: cs.name,
                classId: c4.id
              });
            }
          });
          if (newStudents.length > 0) {
            store.setStudents(prev => [...prev, ...newStudents]);
          }
        }
        localStorage.setItem('paibp_migrated_c4_v2', 'true');
      }

      // Migrate Class 5 students if not exist
      if (!localStorage.getItem('paibp_migrated_c5_v2')) {
        const c5 = store.classes.find(c => c.name === 'Kelas 5' && c.year === getCurrentAcademicYear());
        if (c5) {
          const newStudents: any[] = [];
          class5Students.forEach((cs, idx) => {
            if (!store.students.some(s => s.nis === cs.nis && s.classId === c5.id)) {
              newStudents.push({
                id: `s5_${Date.now()}_${idx}`,
                nis: cs.nis,
                nisn: cs.nisn || '',
                name: cs.name,
                classId: c5.id
              });
            }
          });
          if (newStudents.length > 0) {
            store.setStudents(prev => [...prev, ...newStudents]);
          }
        }
        localStorage.setItem('paibp_migrated_c5_v2', 'true');
      }

      // Migrate Class 6 students if not exist
      if (!localStorage.getItem('paibp_migrated_c6_v2')) {
        const c6 = store.classes.find(c => c.name === 'Kelas 6' && c.year === getCurrentAcademicYear());
        if (c6) {
          const newStudents: any[] = [];
          class6Students.forEach((cs, idx) => {
            if (!store.students.some(s => s.nis === cs.nis && s.classId === c6.id)) {
              newStudents.push({
                id: `s6_${Date.now()}_${idx}`,
                nis: cs.nis,
                nisn: cs.nisn || '',
                name: cs.name,
                classId: c6.id
              });
            }
          });
          if (newStudents.length > 0) {
            store.setStudents(prev => [...prev, ...newStudents]);
          }
        }
        localStorage.setItem('paibp_migrated_c6_v2', 'true');
      }

      // Auto-Promotion Logic
      const currentYear = getCurrentAcademicYear();
      const allYears = Array.from(new Set(store.classes.map(c => c.year))).sort();
      const lastYear = allYears[allYears.length - 1];
      const hasCurrentYearClasses = store.classes.some(c => c.year === currentYear);

      if (!hasCurrentYearClasses && lastYear && lastYear !== currentYear) {
        const newClasses: any[] = [];
        for (let i = 1; i <= 6; i++) {
          newClasses.push({ id: `c${i}_${currentYear.replace('/', '')}`, name: `Kelas ${i}`, year: currentYear });
        }
        
        const newStudents: any[] = [];
        const lastYearClasses = store.classes.filter(c => c.year === lastYear);
        
        store.students.forEach(student => {
          const oldClass = lastYearClasses.find(c => c.id === student.classId);
          if (oldClass) {
            const gradeMatch = oldClass.name.match(/Kelas (\d)/i);
            if (gradeMatch) {
              const grade = parseInt(gradeMatch[1]);
              if (grade >= 1 && grade <= 5) {
                const nextGrade = grade + 1;
                const nextClass = newClasses.find(c => c.name === `Kelas ${nextGrade}`);
                if (nextClass) {
                  newStudents.push({
                    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
                    nis: student.nis,
                    nisn: student.nisn || '',
                    name: student.name,
                    classId: nextClass.id
                  });
                }
              }
            }
          }
        });
        
        store.setClasses(prev => [...prev, ...newClasses]);
        store.setStudents(prev => [...prev, ...newStudents]);
        store.setActiveYear(currentYear);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      const result = await res.json();

      if (result.success) {
        const userSession = result.user;
        DB.setObj('session', userSession);
        setSession(userSession);
        setLoginError(false);

        // Fetch Cloud Data after login
        const cloudDataRes = await fetch('/api/sync');
        const cloudData = await cloudDataRes.json();
        
        if (cloudData && !cloudData.error) {
          if (cloudData.classes) store.setClasses(() => cloudData.classes);
          if (cloudData.students) store.setStudents(() => cloudData.students);
          if (cloudData.weekly) store.setWeeklyScores(() => cloudData.weekly);
          if (cloudData.sas) store.setSASScores(() => cloudData.sas);
          if (cloudData.practice) store.setPracticeScores(() => cloudData.practice);
          if (cloudData.asaj) store.setASAJScores(() => cloudData.asaj);
        }
      } else {
        setLoginError(true);
        setTimeout(() => setLoginError(false), 3000);
      }
    } catch (err) {
      setLoginError(true);
    }
  };

  if (!isClient) return null;

  if (!session) {
    return (
      <div id="login-screen" style={{ zoom: '80%' }} className="flex flex-col items-center justify-center min-h-screen p-4 lg:p-12 bg-slate-50 dark:bg-slate-950 fade-in relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-400/20 dark:bg-primary-900/20 blur-3xl filter"></div>
          <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-emerald-400/20 dark:bg-emerald-900/20 blur-3xl filter"></div>
        </div>

        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10">
          {/* Left Side: Information */}
          <div className="order-2 lg:order-1 flex flex-col h-full">
            <div className="hidden lg:block space-y-1 mb-6">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                Kelola Penilaian <span className="text-primary-500">Lebih Cerdas.</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md leading-relaxed">
                Sistem manajemen nilai digital yang dirancang khusus untuk efisiensi administrasi guru di era modern.
              </p>
            </div>
            
            <div className="space-y-3">
              {[
                {
                  id: 1,
                  title: 'Fitur & Keunggulan',
                  icon: Shield,
                  content: (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 gap-1.5">
                        {[
                          { t: 'Otomatisasi Nilai', d: 'Perhitungan rata-rata Mingguan, SAS, & Praktik otomatis.' },
                          { t: 'Manajemen Siswa', d: 'Database lengkap Kelas 1-6 dengan NIS & NISN.' },
                          { t: 'Raport Instan', d: 'Generasi Raport Digital siap cetak format profesional.' },
                          { t: 'PWA Ready', d: 'Aplikasi dapat diinstal & diakses secara offline.' },
                          { t: 'Data Privacy', d: 'Data tersimpan lokal di browser (LocalStorage).' }
                        ].map((item, i) => (
                          <div key={i} className="flex gap-2.5 p-1.5 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700/50">
                            <div className="w-4 h-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-[9px] font-bold text-primary-600 shrink-0">{i+1}</div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-800 dark:text-gray-200">{item.t}</p>
                              <p className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight">{item.d}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                },
                {
                  id: 2,
                  title: 'Cara Kerja Sistem',
                  icon: Target,
                  content: (
                    <div className="space-y-1.5">
                      {[
                        { t: 'Offline-First Architecture', d: 'Berjalan sepenuhnya di browser tanpa perlu server pusat.' },
                        { t: 'Local Storage Persistence', d: 'Data disimpan permanen di memori lokal browser perangkat.' },
                        { t: 'Real-time Calculation', d: 'Algoritma menghitung bobot nilai (50:50) secara instan.' },
                        { t: 'XLSX Processing Engine', d: 'Mengolah ribuan baris data Excel secara lokal & cepat.' }
                      ].map((item, i) => (
                        <div key={i} className="p-2 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/20">
                          <p className="text-[10px] font-bold text-blue-900 dark:text-blue-300 mb-0.5">{item.t}</p>
                          <p className="text-[9px] text-blue-700 dark:text-blue-400 leading-tight">{item.d}</p>
                        </div>
                      ))}
                    </div>
                  )
                },
                {
                  id: 3,
                  title: 'Panduan Penggunaan',
                  icon: Star,
                  content: (
                    <div className="space-y-1.5">
                      {[
                        { s: '1', t: 'Kelola Kelas', d: 'Daftarkan kelas & tahun ajaran.' },
                        { s: '2', t: 'Input Siswa', d: 'Tambah siswa atau Import Excel.' },
                        { s: '3', t: 'Pengisian Nilai', d: 'Isi Nilai Mingguan & SAS rutin.' },
                        { s: '4', t: 'Penilaian Praktik', d: 'Lengkapi skor praktik keagamaan.' },
                        { s: '5', t: 'Cetak Laporan', d: 'Lihat Rekap atau cetak Raport.' }
                      ].map((item, i) => (
                        <div key={i} className="flex gap-2 items-start">
                          <div className="w-4 h-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-[9px] font-bold text-primary-600 shrink-0 mt-0.5">{item.s}</div>
                          <div className="flex-1 p-2 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800">
                            <p className="text-[10px] font-bold text-gray-800 dark:text-gray-200">{item.t}</p>
                            <p className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight">{item.d}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                },
                {
                  id: 4,
                  title: 'Keamanan & Pemeliharaan',
                  icon: Lock,
                  content: (
                    <div className="space-y-2">
                      <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/20 mb-1">
                        <p className="text-[9px] text-red-800 dark:text-red-300 leading-tight font-medium">
                          <strong>PENTING:</strong> Selalu lakukan <strong>Backup</strong> via menu Profil setiap hari!
                        </p>
                      </div>
                      {[
                        { t: 'Penyimpanan Lokal', d: 'Data terikat pada browser & perangkat ini.' },
                        { t: 'Backup Manual', d: 'Unduh cadangan data via menu Profil.' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800">
                          <div className="w-1 h-1 rounded-full bg-red-500"></div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-800 dark:text-gray-200">{item.t}</p>
                            <p className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight">{item.d}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                },
                {
                  id: 5,
                  title: 'Kontak Bantuan',
                  icon: Info,
                  content: (
                    <div className="p-2 text-center">
                      <p className="text-[10px] text-gray-600 dark:text-gray-300 mb-2 leading-relaxed">
                        Butuh bantuan teknis? Hubungi via WhatsApp:
                      </p>
                      <a 
                        href="https://wa.me/6285879584257" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full font-bold text-[10px] transition shadow-md"
                      >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        WhatsApp
                      </a>
                    </div>
                  )
                },
                {
                  id: 6,
                  title: 'Profil Pengembang',
                  icon: User,
                  content: (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 border-b dark:border-slate-700 pb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-blue-500 flex items-center justify-center text-white shadow-sm overflow-hidden shrink-0">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-900 dark:text-white leading-tight">DEVELZY — Smart Assessment</p>
                          <p className="text-[9px] text-gray-500 dark:text-gray-400 italic">Guru • Admin • Developer</p>
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-600 dark:text-gray-300 leading-relaxed text-justify italic">
                        "Aplikasi ini dikembangkan oleh Guru PAI & Admin <strong>SDN 01 Kalisalak</strong> untuk mendukung digitalisasi pendidikan."
                      </div>
                      <div className="text-[10px] font-bold text-primary-600 dark:text-primary-400 border-l-2 border-primary-500 pl-2 py-0.5">
                        Misi: Efisiensi administrasi tanpa batas.
                      </div>
                    </div>
                  )
                }
              ].map((faq) => (
                <div key={faq.id} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-gray-200/50 dark:border-slate-700/50 rounded-xl overflow-hidden shadow-sm">
                  <button type="button" onClick={() => setActiveAccordion(activeAccordion === faq.id ? null : faq.id)} className="w-full flex items-center justify-between px-4 py-3 text-gray-900 dark:text-white hover:bg-white/40 dark:hover:bg-slate-700/40 transition text-[11px] font-bold">
                    <span className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
                        <faq.icon size={14} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      {faq.title}
                    </span>
                    <ChevronDown size={14} className={`transition-transform text-gray-400 ${activeAccordion === faq.id ? 'rotate-180' : ''}`} />
                  </button>
                  {activeAccordion === faq.id && (
                    <div className="px-4 pb-4 pt-0">
                      {faq.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="order-1 lg:order-2 flex flex-col items-center lg:items-start">
            <div className="glass relative z-10 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl border border-white/50 dark:border-slate-700/50">
              <div className="text-center mb-10">
                <img src="/logo.webp" alt="Logo PAI" className="w-24 h-24 mx-auto rounded-3xl shadow-xl mb-6 object-cover bg-white mix-blend-multiply dark:mix-blend-normal dark:p-1" />
                <h1 className="font-bold text-gray-900 dark:text-white text-2xl tracking-tight">
                  Welcome to <span className="bg-gradient-to-r from-primary-600 to-emerald-400 bg-clip-text text-transparent">PAIBP</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm font-medium">Smart Assessment System v4.0</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold tracking-wide text-gray-600 dark:text-gray-400 mb-2 uppercase">Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition text-sm shadow-sm" 
                      placeholder="Masukkan username" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-wide text-gray-600 dark:text-gray-400 mb-2 uppercase">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-400" />
                    </div>
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition text-sm shadow-sm" 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-2xl transition shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 mt-4">
                  Masuk Sistem <LogOut size={18} className="rotate-180" />
                </button>
                {loginError && <p className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-lg border border-red-100 dark:border-red-900/30 animate-pulse mt-4">Username atau password salah!</p>}
              </form>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center relative z-10 w-full opacity-60">
           <p className="text-xs text-gray-400 dark:text-gray-500 tracking-wide">Crafted by <span className="font-bold text-gray-600 dark:text-gray-300">DEVELZY</span> — SDN 01 KALISALAK</p>
        </div>
      </div>
    );
  }

  return <MainApp session={session} setSession={setSession} />;
}

const PAGES = [
  {id:'dashboard', icon: LayoutDashboard, label:'Dashboard'},
  {id:'classes', icon: School, label:'Kelola Kelas'},
  {id:'students', icon: Users, label:'Kelola Siswa'},
  {id:'weekly', icon: Calendar, label:'Nilai Mingguan'},
  {id:'sas', icon: FileText, label:'Nilai SAS'},
  {id:'practice', icon: Hand, label:'Penilaian Praktik'},
  {id:'asaj', icon: Award, label:'ASAJ Kelas 6'},
  {id:'alumni', icon: GraduationCap, label:'Siswa Lulusan'},
  {id:'recap', icon: BarChart3, label:'Rekap Nilai'},
  {id:'report', icon: Printer, label:'Raport Digital'},
];

import { Dashboard } from "@/components/Dashboard";
import { Classes } from "@/components/Classes";
import { Students } from "@/components/Students";
import { WeeklyScores } from "@/components/WeeklyScores";
import { SASScores } from "@/components/SASScores";
import { PracticeScores } from "@/components/PracticeScores";
import { ASAJ } from "@/components/ASAJ";
import { Recap } from "@/components/Recap";
import { Report } from "@/components/Report";
import { Alumni } from "@/components/Alumni";
import { Profile } from "@/components/Profile";
import CloudSync from "@/components/CloudSync";

function MainApp({ session, setSession }: { session: any, setSession: any }) {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  
  const store = useStore();
  const availableYears = Array.from(new Set([getCurrentAcademicYear(), ...store.classes.map(c => c.year)])).sort().reverse();
  
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial Cloud Fetch
    const fetchCloud = async () => {
      try {
        const res = await fetch('/api/sync');
        const cloudData = await res.json();
        if (cloudData && !cloudData.error) {
          if (cloudData.classes) store.setClasses(() => cloudData.classes);
          if (cloudData.students) store.setStudents(() => cloudData.students);
          if (cloudData.weekly) store.setWeeklyScores(() => cloudData.weekly);
          if (cloudData.sas) store.setSASScores(() => cloudData.sas);
          if (cloudData.practice) store.setPracticeScores(() => cloudData.practice);
          if (cloudData.asaj) store.setASAJScores(() => cloudData.asaj);
        }
      } catch (err) {
        console.error('Initial cloud sync failed', err);
      }
    };
    fetchCloud();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    const dark = document.documentElement.classList.contains('dark');
    setIsDark(dark);
    localStorage.setItem('paibp_dark', String(dark));
  };

  const handleLogout = () => {
    localStorage.removeItem('paibp_session');
    DB.setObj('session', null);
    setSession(null);
  };

  const navigate = (page: string) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'classes': return <Classes />;
      case 'students': return <Students />;
      case 'weekly': return <WeeklyScores />;
      case 'sas': return <SASScores />;
      case 'practice': return <PracticeScores />;
      case 'asaj': return <ASAJ />;
      case 'alumni': return <Alumni />;
      case 'recap': return <Recap />;
      case 'report': return <Report />;
      case 'profile': return <Profile />;
      default: return (
        <>
          <h1 className="text-xl dark:text-white font-bold my-10">UNDER CONSTRUCTION ({activePage})</h1>
          <p className="dark:text-gray-400">Silahkan pilih menu lainnya atau edit komponen ini.</p>
        </>
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors font-sans">
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-b border-gray-200/50 dark:border-slate-800/50 w-full shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between px-4 lg:px-8 py-3.5 w-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition text-gray-600 dark:text-gray-300">
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-3 group cursor-pointer">
              <img src="/logo.webp" alt="Logo PAI" className="w-10 h-10 rounded-lg shadow-sm transform group-hover:rotate-6 transition-transform object-cover bg-white mix-blend-multiply dark:mix-blend-normal dark:border dark:border-slate-700" />
              <div className="hidden sm:block">
                <h1 className="font-bold text-gray-900 dark:text-white text-base tracking-tight leading-tight">
                  <span className="bg-gradient-to-r from-primary-600 to-emerald-400 bg-clip-text text-transparent">PAIBP</span> Assessment
                </h1>
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 tracking-wide uppercase">Smart System v4.0</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={store.activeYear} 
              onChange={(e) => store.setActiveYear(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm font-semibold text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-primary-500 shadow-sm cursor-pointer transition hidden sm:block"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 hidden sm:block"></div>
            
            {/* Online/Offline Status Indicator */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-sm transition-all ${isOnline ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-400' : 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-900/20 dark:border-rose-800/30 dark:text-rose-400'}`}>
              {isOnline ? <Wifi size={14} className="animate-pulse" /> : <WifiOff size={14} />}
              <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            <div className="hidden lg:block">
              <CloudSync />
            </div>

            
            <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 hidden sm:block"></div>
            <button onClick={toggleDark} className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition shadow-sm border border-gray-200/50 dark:border-slate-700/50">
              {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
            </button>
            <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 transition shadow-sm group">
                <div className="w-8 h-8 bg-gradient-to-tr from-primary-50 to-primary-100 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center border border-primary-100 dark:border-slate-600 group-hover:scale-105 transition-transform">
                  <User size={15} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate max-w-[120px] leading-tight">{session.name}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Guru PAIBP</p>
                </div>
                <ChevronDown size={14} className="text-gray-400 ml-1 group-hover:text-primary-500 transition-colors" />
              </button>
              {profileOpen && (
                <div className="dropdown-menu show absolute right-0 top-full mt-3 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 py-2 z-50 overflow-hidden backdrop-blur-xl">
                  <div className="px-4 py-3 border-b border-gray-50 dark:border-slate-800/50 mb-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{session.name}</p>
                    <p className="text-xs text-gray-500">@{session.username}</p>
                  </div>
                  <button onClick={() => { navigate('profile'); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition">
                    <Settings size={17} /> Pengaturan Profil
                  </button>
                  <div className="h-px bg-gray-50 dark:bg-slate-800/50 my-1"></div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition">
                    <LogOut size={17} /> Keluar Sistem
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 w-full max-w-screen-2xl mx-auto">
        <aside className={`w-64 bg-transparent flex flex-col fixed h-[calc(100%-73px)] top-[73px] z-30 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
            <div className="space-y-0.5">
              <p className="px-3 mb-1.5 text-[10px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase">Menu Utama</p>
              {PAGES.slice(0, 7).map(p => (
                <button key={p.id} onClick={() => navigate(p.id)} className={`sidebar-item flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-xl border border-transparent transition-all ${activePage === p.id ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm hover:border-gray-200 dark:hover:border-slate-700'}`}>
                  <p.icon size={18} className={activePage === p.id ? 'text-white' : 'text-gray-400 group-hover:text-primary-500'} /> {p.label}
                </button>
              ))}
              
              <div className="my-3"></div>
              <p className="px-3 mb-1.5 text-[10px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase">Laporan</p>
              {PAGES.slice(7).map(p => (
                <button key={p.id} onClick={() => navigate(p.id)} className={`sidebar-item flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-xl border border-transparent transition-all ${activePage === p.id ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm hover:border-gray-200 dark:hover:border-slate-700'}`}>
                  <p.icon size={18} className={activePage === p.id ? 'text-white' : 'text-gray-400 group-hover:text-primary-500'} /> {p.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <div className="flex-1 lg:ml-64 flex flex-col min-h-0 w-full relative">
          <main className="flex-1 px-4 lg:px-8 py-8 w-full overflow-y-auto flex flex-col items-center">
            <div className="w-full" style={{ zoom: 0.8, maxWidth: '1200px' }}>
              <div className="w-full mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {PAGES.find(p => p.id === activePage)?.label || (activePage === 'profile' ? 'Pengaturan Profil' : '')}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola data dan pantau perkembangan siswa Anda.</p>
                </div>
              </div>
              {renderContent()}
            </div>
            
            {/* FOOTER */}
            <footer className="w-full max-w-6xl mt-auto pt-16 pb-6 text-center text-sm">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-slate-800 to-transparent mb-6"></div>
              <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5">
                © {new Date().getFullYear()} <span className="font-bold text-gray-900 dark:text-white">PAIBP Assessment</span>. Crafted by Develzy
              </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
