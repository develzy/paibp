"use client";

import { useStore } from "@/store/useStore";
import { Users, School, TrendingUp, CheckCircle, BarChart3, PieChart, Filter, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export function Dashboard() {
  const store = useStore();
  const [mounted, setMounted] = useState(false);
  const [motivation, setMotivation] = useState("Memulai hari dengan niat yang tulus adalah kunci keberkahan dalam mengajar.");
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchMotivation();
  }, []);

  const fetchMotivation = async () => {
    setLoadingAi(true);
    try {
      const prompt = "Berikan 1 kalimat motivasi singkat dan sangat bijak untuk guru PAI (Pendidikan Agama Islam) yang sedang lelah mengajar. Kalimat harus menyejukkan hati dan menguatkan niat. Jawab HANYA 1 kalimat tanpa tanda kutip.";
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.result) setMotivation(data.result);
    } catch (err) {
      console.error("Failed to fetch motivation", err);
    } finally {
      setLoadingAi(false);
    }
  };

  if (!mounted) return null;

  const semester = store.activeSemester;

  const filteredClasses = store.classes.filter(c => c.year === store.activeYear);
  const classIds = new Set(filteredClasses.map(c => c.id));
  const activeStudents = store.students.filter(s => classIds.has(s.classId));

  const totalStudents = activeStudents.length;
  const totalClasses = filteredClasses.length;

  const getWeeklyAvg = (studentId: string, classId: string) => {
    const sem1 = store.weeklyScores.find((x) => x.studentId === studentId && x.classId === classId && x.semester === 1);
    const sem2 = store.weeklyScores.find((x) => x.studentId === studentId && x.classId === classId && x.semester === 2);
    
    let sum = 0, cnt = 0;
    if (sem1) {
      for (let i = 1; i <= 5; i++) {
        const v = sem1['m' + i];
        if (v !== '' && v !== undefined && v !== null) { sum += +v; cnt++; }
      }
    }
    if (sem2) {
      for (let i = 6; i <= 10; i++) {
        const v = sem2['m' + i];
        if (v !== '' && v !== undefined && v !== null) { sum += +v; cnt++; }
      }
    }
    return cnt > 0 ? sum / cnt : null;
  };

  const studentScores = activeStudents.map((s) => {
    const avgW = getWeeklyAvg(s.id, s.classId);
    const sas = store.sasScores.find((x) => x.studentId === s.id && x.classId === s.classId && x.semester === semester);
    
    if (avgW === null || !sas || sas.score === '' || sas.score === undefined) return null;
    return { id: s.id, name: s.name, classId: s.classId, score: (avgW + +sas.score) / 2 };
  }).filter((s) => s !== null && s.score > 0) as any[];

  const avgScore = studentScores.length ? (studentScores.reduce((a, b) => a + b.score, 0) / studentScores.length).toFixed(1) : 0;
  const tuntas = studentScores.filter((s) => s.score >= 75).length;
  const pct = studentScores.length ? Math.round((tuntas / studentScores.length) * 100) : 0;

  const ranges = [
    { l: 'Sangat Baik (90-100)', min: 90, max: 100, c: 'bg-emerald-500' },
    { l: 'Baik (80-89)', min: 80, max: 89, c: 'bg-blue-500' },
    { l: 'Cukup (75-79)', min: 75, max: 79, c: 'bg-amber-500' },
    { l: 'Kurang (<75)', min: 0, max: 74, c: 'bg-rose-500' }
  ];

  const maxBar = Math.max(...ranges.map(r => studentScores.filter(s => s.score >= r.min && s.score <= r.max).length), 1);
  const maxStudents = Math.max(...filteredClasses.map(c => activeStudents.filter(s => s.classId === c.id).length), 1);

  return (
    <div className="w-full max-w-6xl fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white font-serif">Selamat Datang Kembali, Guru PAIBP!</h2>
          <p className="text-sm text-gray-500 mt-1">Pantau perkembangan akademik siswa Anda secara real-time.</p>
        </div>
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          Live Analysis Mode: <span className="text-primary-500">Active</span>
        </div>
      </div>

      {/* AI Motivation Section */}
      <div className="mb-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-emerald-500/10 dark:from-primary-500/5 dark:to-emerald-500/5 rounded-3xl -z-10"></div>
        <div className="glass rounded-3xl p-6 border border-primary-100/50 dark:border-primary-900/20 shadow-sm flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 group-hover:rotate-6 transition-transform">
            <Sparkles size={32} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em]">Daily Motivation</span>
              <div className="h-px w-8 bg-primary-200 dark:bg-primary-800"></div>
            </div>
            <p className={`text-sm md:text-base font-medium text-gray-700 dark:text-gray-200 italic leading-relaxed transition-opacity duration-500 ${loadingAi ? 'opacity-50' : 'opacity-100'}`}>
              "{motivation}"
            </p>
            <p className="mt-3 text-[10px] font-bold text-gray-400 dark:text-gray-500">By Develzy.AI</p>
          </div>
          <button 
            onClick={fetchMotivation}
            disabled={loadingAi}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-400 hover:text-primary-500 transition shadow-sm"
          >
            <TrendingUp size={18} className={loadingAi ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Total Siswa" value={totalStudents} bg="bg-emerald-50 dark:bg-emerald-900/20" iconColor="text-emerald-600 dark:text-emerald-400" />
        <StatCard icon={School} label="Total Kelas" value={totalClasses} bg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-600 dark:text-blue-400" />
        <StatCard icon={TrendingUp} label="Rata-rata" value={avgScore} bg="bg-violet-50 dark:bg-violet-900/20" iconColor="text-violet-600 dark:text-violet-400" />
        <StatCard icon={CheckCircle} label="Ketuntasan" value={pct + '%'} bg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-600 dark:text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
          <h3 className="font-semibold mb-6 text-gray-900 dark:text-white text-sm flex items-center gap-2 font-serif">
            <BarChart3 size={17} className="text-primary-600" /> Distribusi Nilai & Sampel Siswa
          </h3>
          <div className="space-y-6">
            {ranges.map((r, idx) => {
              const studentsInRange = studentScores.filter(s => s.score >= r.min && s.score <= r.max);
              const count = studentsInRange.length;
              const w = Math.max((count / maxBar) * 100, 2);
              
              const sampleNames: string[] = [];
              filteredClasses.forEach(c => {
                const classStudents = studentsInRange.filter(s => s.classId === c.id).slice(0, 2);
                classStudents.forEach(s => sampleNames.push(`${s.name} (${c.name.split(' ')[1] || c.name})`));
              });

              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${r.c}`}></div>
                      <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">{r.l.split(' (')[0]}</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">{count} Siswa</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-800/50 rounded-full h-2 overflow-hidden">
                    <div className={`h-full ${r.c} transition-all duration-1000`} style={{ width: `${w}%` }}></div>
                  </div>
                  {sampleNames.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {sampleNames.map((name, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 rounded-md border border-gray-200/50 dark:border-slate-700/50 italic">
                          {name}
                        </span>
                      ))}
                      {count > sampleNames.length && (
                        <span className="text-[9px] text-gray-400 px-1 py-0.5">...+{count - sampleNames.length} lainnya</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
          <h3 className="font-semibold mb-6 text-gray-900 dark:text-white text-sm flex items-center gap-2 font-serif">
            <PieChart size={17} className="text-primary-600" /> Siswa per Kelas
          </h3>
          <div className="space-y-4">
            {filteredClasses.map((c, idx) => {
              const count = activeStudents.filter(s => s.classId === c.id).length;
              const w = Math.max((count / maxStudents) * 100, 4);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{c.name}</span>
                    <span className="text-[10px] font-bold text-gray-400">{count} Siswa</span>
                  </div>
                  <div className="flex-1 bg-gray-100 dark:bg-slate-800/50 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-1000" style={{ width: `${w}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, bg, iconColor }: any) {
  return (
    <div className="stat-card glass rounded-2xl p-4 shadow-sm border border-white/20 dark:border-slate-800/50">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shadow-inner`}>
          <Icon size={18} className={iconColor} />
        </div>
        <div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tight">{label}</p>
          <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
