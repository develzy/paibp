"use client";

import { useState } from "react";
import { 
  ChevronDown, 
  Info, 
  Zap, 
  Settings, 
  ClipboardCheck, 
  Sparkles, 
  FileText, 
  Database, 
  ShieldCheck, 
  Target, 
  UserCircle2, 
  Heart,
  LayoutGrid,
  RefreshCcw,
  Monitor
} from "lucide-react";

export function About() {
  const [openSection, setOpenSection] = useState<string | null>("tentang");

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  const sections = [
    {
      id: "tentang",
      title: "Tentang Aplikasi",
      icon: Info,
      content: (
        <div className="space-y-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          <p>
            PAIBP Assessment Smart System merupakan aplikasi penilaian digital terpadu yang dirancang untuk membantu Guru Pendidikan Agama Islam & Budi Pekerti dalam mengelola administrasi pembelajaran secara lebih efektif, sistematis, dan profesional.
          </p>
          <p>
            Aplikasi ini mendukung pengelolaan data akademik, penilaian peserta didik, rekapitulasi hasil belajar, hingga penyusunan laporan pendidikan secara digital dalam satu sistem yang terintegrasi. Seluruh fitur dirancang untuk mempermudah proses administrasi pembelajaran dengan tetap mengutamakan efisiensi, akurasi, dan kemudahan penggunaan.
          </p>
          <p>
            PAIBP Assessment Smart System hadir sebagai solusi digital pendidikan yang mendukung transformasi administrasi sekolah menuju sistem kerja yang lebih modern, terstruktur, dan adaptif terhadap perkembangan teknologi pendidikan.
          </p>
        </div>
      )
    },
    {
      id: "akademik",
      title: "Manajemen Akademik Terintegrasi",
      icon: LayoutGrid,
      content: (
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          Sistem menyediakan pengelolaan Tahun Ajaran dan Semester secara terpusat sehingga seluruh data pada setiap modul dapat tersinkronisasi secara otomatis. Pengaturan akademik yang terintegrasi membantu proses administrasi menjadi lebih rapi, konsisten, dan efisien.
        </p>
      )
    },
    {
      id: "materi",
      title: "Konfigurasi Materi Pembelajaran Dinamis",
      icon: Settings,
      content: (
        <div className="space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          <p>
            Guru dapat mengatur dan menyesuaikan lingkup materi atau bab pembelajaran pada setiap kelas sesuai kebutuhan pembelajaran yang diterapkan di sekolah.
          </p>
          <p>
            Nama materi yang telah dikonfigurasi akan digunakan secara otomatis pada tabel penilaian, laporan rekapitulasi, dan dokumen akademik lainnya sehingga mempermudah pengelolaan data pembelajaran secara menyeluruh.
          </p>
        </div>
      )
    },
    {
      id: "penilaian",
      title: "Modul Penilaian Lengkap",
      icon: ClipboardCheck,
      content: (
        <div className="space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          <p>Aplikasi mendukung berbagai jenis penilaian pembelajaran secara komprehensif, antara lain:</p>
          <ul className="list-disc pl-5 space-y-1 text-primary-600 dark:text-primary-400 font-medium">
            <li>Sumatif Lingkup Materi</li>
            <li>Sumatif Akhir Semester (SAS)</li>
            <li>Penilaian Praktik</li>
            <li>Asesmen Sumatif Akhir Jenjang (ASAJ)</li>
            <li>Rekapitulasi Nilai Akhir</li>
          </ul>
          <p>
            Seluruh proses pengolahan nilai dilakukan secara otomatis guna meningkatkan efisiensi kerja serta meminimalkan kesalahan dalam proses perhitungan dan pengelolaan data akademik.
          </p>
        </div>
      )
    },
    {
      id: "ai",
      title: "Integrasi AI untuk Administrasi Pendidikan",
      icon: Sparkles,
      content: (
        <div className="space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          <p>
            PAIBP Assessment Smart System telah terintegrasi dengan sistem AI yang dikembangkan untuk membantu kebutuhan administrasi guru secara lebih efisien dan terarah.
          </p>
          <p>Fitur ini mendukung berbagai kebutuhan administrasi pembelajaran seperti:</p>
          <ul className="list-disc pl-5 space-y-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <li>Penyusunan motivasi harian</li>
            <li>Pembuatan catatan perkembangan peserta didik</li>
            <li>Analisis data kehadiran</li>
            <li>Penyusunan deskripsi raport secara otomatis</li>
          </ul>
          <p>
            Integrasi sistem ini membantu mempercepat proses administrasi tanpa mengurangi kualitas penyusunan laporan pendidikan.
          </p>
        </div>
      )
    },
    {
      id: "raport",
      title: "Raport dan Rekapitulasi Digital",
      icon: FileText,
      content: (
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          Sistem menyediakan fitur pembuatan raport digital dan rekapitulasi nilai secara profesional dalam format siap cetak. Dokumen laporan disusun dengan tampilan yang rapi, terstruktur, dan mendukung kebutuhan administrasi sekolah sehingga mempermudah proses dokumentasi maupun pelaporan akademik.
        </p>
      )
    },
    {
      id: "data",
      title: "Import dan Export Data",
      icon: RefreshCcw,
      content: (
        <div className="space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          <p>Aplikasi mendukung pengelolaan data akademik secara lebih praktis melalui fitur import dan export data. Fitur ini dapat digunakan untuk:</p>
          <ul className="list-disc pl-5 space-y-1 text-blue-600 dark:text-blue-400 font-medium">
            <li>Pengelolaan data peserta didik</li>
            <li>Rekapitulasi nilai</li>
            <li>Backup administrasi akademik</li>
            <li>Pengelolaan laporan pembelajaran</li>
          </ul>
        </div>
      )
    },
    {
      id: "sync",
      title: "Sinkronisasi dan Pengelolaan Data",
      icon: Database,
      content: (
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          Sistem dirancang untuk mendukung pengelolaan data secara terintegrasi sehingga informasi akademik dapat tersusun dengan lebih aman, rapi, dan konsisten. Mekanisme sinkronisasi data membantu pengguna dalam menjaga stabilitas pengelolaan administrasi pembelajaran pada berbagai kondisi penggunaan.
        </p>
      )
    },
    {
      id: "akses",
      title: "Fleksibilitas Akses Sistem",
      icon: Monitor,
      content: (
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          PAIBP Assessment Smart System dikembangkan dengan arsitektur sistem yang mendukung akses secara fleksibel melalui berbagai perangkat dan lingkungan penggunaan. Aplikasi dirancang untuk memberikan pengalaman penggunaan yang stabil, responsif, dan efisien guna menunjang kegiatan administrasi pembelajaran secara optimal.
        </p>
      )
    },
    {
      id: "keamanan",
      title: "Keamanan Sistem",
      icon: ShieldCheck,
      content: (
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          PAIBP Assessment Smart System menerapkan sistem keamanan data yang dirancang untuk menjaga kerahasiaan dan integritas informasi pengguna. Proses autentikasi pengguna dilakukan secara aman dengan pengelolaan akses yang terkontrol guna mendukung keamanan data guru maupun peserta didik.
        </p>
      )
    },
    {
      id: "tujuan",
      title: "Tujuan Pengembangan",
      icon: Target,
      content: (
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          Pengembangan aplikasi ini bertujuan untuk mendukung digitalisasi administrasi pendidikan, khususnya dalam pengelolaan penilaian pembelajaran Pendidikan Agama Islam & Budi Pekerti. Dengan sistem yang terintegrasi, aplikasi diharapkan mampu membantu guru dalam meningkatkan efisiensi kerja, ketepatan administrasi, serta kualitas pengelolaan data akademik di lingkungan sekolah.
        </p>
      )
    },
    {
      id: "developer",
      title: "Informasi Pengembang",
      icon: UserCircle2,
      content: (
        <div className="space-y-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          <p>
            PAIBP Assessment Smart System dikembangkan secara mandiri sebagai bagian dari upaya mendukung digitalisasi administrasi pendidikan, khususnya dalam pengelolaan pembelajaran Pendidikan Agama Islam & Budi Pekerti di lingkungan sekolah dasar.
          </p>
          <p>
            Pengembangan aplikasi ini dilakukan oleh pengajar PAIBP sekaligus tenaga administrasi SDN Kalisalak 01 Kabupaten Tegal, berdasarkan pengalaman langsung dalam pelaksanaan administrasi pembelajaran dan kebutuhan pengelolaan data akademik di lingkungan sekolah.
          </p>
          <p>
            Sistem dirancang untuk membantu meningkatkan efisiensi kerja, ketepatan pengolahan data, serta mendukung transformasi administrasi pendidikan yang lebih modern, terstruktur, dan adaptif terhadap perkembangan teknologi.
          </p>
        </div>
      )
    },
    {
      id: "penutup",
      title: "Penutup",
      icon: Heart,
      content: (
        <p className="text-sm italic text-gray-600 dark:text-gray-300">
          PAIBP Assessment Smart System hadir sebagai solusi digital pendidikan yang membantu Guru Pendidikan Agama Islam & Budi Pekerti dalam mengelola administrasi penilaian secara lebih modern, efektif, sistematis, dan profesional sesuai kebutuhan pendidikan masa kini.
        </p>
      )
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 fade-in">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 font-serif tracking-tight">
          PAIBP Assessment <span className="text-primary-600">Smart System v26.0.9</span>
        </h1>
        <p className="text-sm md:text-base font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] max-w-2xl mx-auto leading-relaxed">
          Sistem Penilaian Digital Terpadu untuk Guru Pendidikan Agama Islam & Budi Pekerti
        </p>
        <div className="w-24 h-1.5 bg-gradient-to-r from-primary-500 to-emerald-500 mx-auto mt-6 rounded-full"></div>
      </div>

      <div className="space-y-3">
        {sections.map((section) => {
          const isOpen = openSection === section.id;
          const Icon = section.icon;

          return (
            <div 
              key={section.id} 
              className={`group transition-all duration-300 border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md ${isOpen ? 'bg-white dark:bg-slate-800 ring-2 ring-primary-500/20 shadow-lg' : 'bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800'}`}
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 md:p-5 text-left transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-primary-500 text-white rotate-6' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 group-hover:scale-110'}`}>
                    <Icon size={20} />
                  </div>
                  <span className={`font-bold transition-colors ${isOpen ? 'text-gray-900 dark:text-white text-lg' : 'text-gray-700 dark:text-gray-300'}`}>
                    {section.title}
                  </span>
                </div>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-500' : 'text-gray-400 group-hover:translate-y-0.5'}`}>
                  <ChevronDown size={20} />
                </div>
              </button>
              
              <div 
                className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
              >
                <div className="px-5 pb-6 pt-1 border-t border-gray-50 dark:border-slate-700/50">
                  <div className="pl-14 pr-4">
                    {section.content}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
        Documentation Version 26.0.9 &copy; 2026 Develzy
      </div>
    </div>
  );
}
