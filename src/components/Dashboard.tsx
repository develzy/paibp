"use client";

import { useStore } from "@/store/useStore";
import { Users, School, TrendingUp, CheckCircle, BarChart3, PieChart, Filter } from "lucide-react";
import { useEffect, useState } from "react";

export function Dashboard() {
  const store = useStore();
  const [mounted, setMounted] = useState(false);
  const [semester, setSemester] = useState<number>(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filteredClasses = store.classes.filter(c => c.year === store.activeYear);
  const classIds = new Set(filteredClasses.map(c => c.id));
  const activeStudents = store.students.filter(s => classIds.has(s.classId));

  const totalStudents = activeStudents.length;
  const totalClasses = filteredClasses.length;

  const getWeeklyAvg = (studentId: string, classId: string, semId: number) => {
    const semData = store.weeklyScores.find((x) => x.studentId === studentId && x.classId === classId && x.semester === semId);
    if (!semData) return null;
    
    let totalSum = 0, totalCount = 0;
    const nw = semData.weeks || 20;
    for (let i = 1; i <= nw; i++) {
      const v = semData['m' + i];
      if (v !== '' && v !== undefined && v !== null) {
        totalSum += +v;
        totalCount++;
      }
    }
    return totalCount > 0 ? totalSum / totalCount : null;
  };

  const studentScores = activeStudents.map((s) => {
    const avgW = getWeeklyAvg(s.id, s.classId, semester);
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
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm">
            <Filter size={16} className="text-primary-500" />
            <select 
              value={semester} 
              onChange={(e) => setSemester(Number(e.target.value))}
              className="bg-transparent text-sm font-bold outline-none dark:text-white"
            >
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
            </select>
          </div>
        </div>
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          Live Analysis Mode: <span className="text-primary-500">Active</span>
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
            <BarChart3 size={17} className="text-primary-600" /> Distribusi Nilai & Sampel Siswa (Smt {semester})
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
