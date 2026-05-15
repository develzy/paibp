"use client";

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, School, Calendar, FileText, 
  Hand, Award, GraduationCap, BarChart3, Printer, 
  Settings, LogOut, Menu, Moon, Sun, ChevronDown, 
  User, Bell, Search, Wifi, WifiOff, ChevronRight
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getCurrentAcademicYear } from '@/lib/data';
import { getApiUrl } from '@/lib/api';
import DB from '../lib/db';

const PAGES = [
  {id:'dashboard', icon: LayoutDashboard, label:'Dashboard'},
  {id:'classes', icon: School, label:'Kelola Kelas'},
  {id:'students', icon: Users, label:'Biodata Siswa', parent: 'data_siswa'},
  {id:'attendance', icon: Calendar, label:'Absensi & Catatan', parent: 'data_siswa'},
  {id:'weekly', icon: Calendar, label:'Nilai Sumatif'},
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
import { AttendanceNotes } from "@/components/AttendanceNotes";
import { WeeklyScores } from "@/components/WeeklyScores";
import { SASScores } from "@/components/SASScores";
import { PracticeScores } from "@/components/PracticeScores";
import { ASAJ } from "@/components/ASAJ";
import { Recap } from "@/components/Recap";
import { Report } from "@/components/Report";
import { Alumni } from "@/components/Alumni";
import { Profile } from "@/components/Profile";
import CloudSync from "@/components/CloudSync";

export default function MainApp({ session, setSession }: { session: any, setSession: any }) {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isDataSiswaOpen, setIsDataSiswaOpen] = useState(false);
  
  const store = useStore();
  const availableYears = Array.from(new Set([getCurrentAcademicYear(), ...store.classes.map(c => c.year)])).sort().reverse();
  
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    setIsOnline(navigator.onLine);

    if (activePage === 'students' || activePage === 'attendance') {
      setIsDataSiswaOpen(true);
    }
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const fetchCloud = async () => {
      try {
        const res = await fetch(getApiUrl('/api/sync'));
        const cloudData = await res.json();
        if (cloudData && !cloudData.error) {
          if (cloudData.classes) store.setClasses(() => cloudData.classes);
          if (cloudData.students) store.setStudents(() => cloudData.students);
          if (cloudData.weekly) store.setWeeklyScores(() => cloudData.weekly);
          if (cloudData.sas) store.setSASScores(() => cloudData.sas);
          if (cloudData.practice) store.setPracticeScores(() => cloudData.practice);
          if (cloudData.asaj) store.setASAJScores(() => cloudData.asaj);
          if (cloudData.attendance) store.setAttendanceNotes(() => cloudData.attendance);
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
  }, [activePage]);

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
      case 'attendance': return <AttendanceNotes />;
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
      <style jsx global>{`
        @media print {
          .no-print, header, aside, .dropdown-menu, button, select, input {
            display: none !important;
          }
          main {
            margin-left: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          .lg\\:ml-64 {
            margin-left: 0 !important;
          }
          .bg-slate-50, .dark\\:bg-slate-950 {
            background: white !important;
          }
          .glass {
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
        }
      `}</style>
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-b border-gray-200/50 dark:border-slate-800/50 w-full shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between px-4 lg:px-8 py-3.5 w-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition text-gray-600 dark:text-gray-300">
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-3 group cursor-pointer">
              <img src="./logo.png" alt="Logo PAI" className="w-10 h-10 rounded-lg shadow-sm transform group-hover:rotate-6 transition-transform object-cover bg-white mix-blend-multiply dark:mix-blend-normal dark:border dark:border-slate-700" />
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
              
              <button onClick={() => navigate('dashboard')} className={`sidebar-item flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-xl border border-transparent transition-all ${activePage === 'dashboard' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800'}`}>
                <LayoutDashboard size={18} /> Dashboard
              </button>
              
              <button onClick={() => navigate('classes')} className={`sidebar-item flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-xl border border-transparent transition-all ${activePage === 'classes' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800'}`}>
                <School size={18} /> Kelola Kelas
              </button>

              <div className="mt-1">
                <button 
                  onClick={() => setIsDataSiswaOpen(!isDataSiswaOpen)} 
                  className={`sidebar-item flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-xl border border-transparent transition-all ${isDataSiswaOpen ? 'bg-gray-100/50 dark:bg-slate-800/50 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800'}`}
                >
                  <div className="flex items-center gap-3">
                    <Users size={18} /> Data Siswa
                  </div>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isDataSiswaOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDataSiswaOpen && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-gray-100 dark:border-slate-800 pl-2 overflow-hidden animate-in slide-in-from-top-2 duration-300">
                    {PAGES.filter(p => (p as any).parent === 'data_siswa').map(p => (
                      <button key={p.id} onClick={() => navigate(p.id)} className={`sidebar-item flex items-center gap-3 w-full px-3 py-2 text-xs font-semibold rounded-lg transition-all ${activePage === p.id ? 'bg-primary-500 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-800 hover:text-primary-500'}`}>
                        <p.icon size={14} /> {p.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {PAGES.filter(p => !['dashboard', 'classes', 'recap', 'report'].includes(p.id) && !(p as any).parent).map(p => (
                <button key={p.id} onClick={() => navigate(p.id)} className={`sidebar-item flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-xl border border-transparent transition-all ${activePage === p.id ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm hover:border-gray-200 dark:hover:border-slate-700'}`}>
                  <p.icon size={18} className={activePage === p.id ? 'text-white' : 'text-gray-400 group-hover:text-primary-500'} /> {p.label}
                </button>
              ))}
              
              <div className="my-3"></div>
              <p className="px-3 mb-1.5 text-[10px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase">Laporan</p>
              {PAGES.filter(p => ['recap', 'report'].includes(p.id)).map(p => (
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
