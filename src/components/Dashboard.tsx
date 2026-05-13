"use client";

import { useStore } from "@/store/useStore";
import { Users, School, TrendingUp, CheckCircle, BarChart3, PieChart } from "lucide-react";
import { useEffect, useState } from "react";

export function Dashboard() {
  const store = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filteredClasses = store.classes.filter(c => c.year === store.activeYear);
  const classIds = new Set(filteredClasses.map(c => c.id));
  const activeStudents = store.students.filter(s => classIds.has(s.classId));

  const totalStudents = activeStudents.length;
  const totalClasses = filteredClasses.length;

  const getWeeklyAvg = (studentId: string, classId: string) => {
    const sems = store.weeklyScores.filter((x) => x.studentId === studentId && x.classId === classId);
    if (!sems.length) return null;
    let totalSum = 0, totalCount = 0;
    sems.forEach((sem) => {
      const nw = sem.weeks || 20;
      for (let i = 1; i <= nw; i++) {
        const v = sem['m' + i];
        if (v !== '' && v !== undefined && v !== null) {
          totalSum += +v;
          totalCount++;
        }
      }
    });
    return totalCount > 0 ? totalSum / totalCount : null;
  };

  const allScores = activeStudents.map((s) => {
    const avgW = getWeeklyAvg(s.id, s.classId);
    const sas = store.sasScores.find((x) => x.studentId === s.id && x.classId === s.classId);
    if (avgW === null || !sas || sas.score === '' || sas.score === undefined) return null;
    return (avgW + +sas.score) / 2;
  }).filter((s) => s !== null && s > 0) as number[];

  const avgScore = allScores.length ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1) : 0;
  const tuntas = allScores.filter((s) => s >= 75).length;
  const pct = allScores.length ? Math.round((tuntas / allScores.length) * 100) : 0;

  const ranges = [
    { l: 'Sangat Baik (90-100)', min: 90, max: 100, c: 'bg-gradient-to-r from-emerald-400 to-emerald-600' },
    { l: 'Baik (80-89)', min: 80, max: 89, c: 'bg-gradient-to-r from-blue-400 to-blue-600' },
    { l: 'Cukup (75-79)', min: 75, max: 79, c: 'bg-gradient-to-r from-amber-400 to-amber-600' },
    { l: 'Kurang (<75)', min: 0, max: 74, c: 'bg-gradient-to-r from-rose-400 to-rose-600' }
  ];

  const maxBar = Math.max(...ranges.map(r => allScores.filter(s => s >= r.min && s <= r.max).length), 1);
  const maxStudents = Math.max(...filteredClasses.map(c => activeStudents.filter(s => s.classId === c.id).length), 1);

  return (
    <div className="w-full max-w-6xl fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Total Siswa" value={totalStudents} bg="bg-emerald-50 dark:bg-emerald-900/20" iconColor="text-emerald-600 dark:text-emerald-400" />
        <StatCard icon={School} label="Total Kelas" value={totalClasses} bg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-600 dark:text-blue-400" />
        <StatCard icon={TrendingUp} label="Rata-rata" value={avgScore} bg="bg-violet-50 dark:bg-violet-900/20" iconColor="text-violet-600 dark:text-violet-400" />
        <StatCard icon={CheckCircle} label="Ketuntasan" value={pct + '%'} bg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-600 dark:text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-white text-sm flex items-center gap-2 font-serif">
            <BarChart3 size={17} className="text-primary-600" /> Distribusi Nilai
          </h3>
          <div className="space-y-3.5 mt-2">
            {ranges.map((r, idx) => {
              const count = allScores.filter(s => s >= r.min && s <= r.max).length;
              const w = Math.max((count / maxBar) * 100, 5);
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-32 flex flex-col">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{r.l.split(' ')[0]} {r.l.split(' ')[1] === 'Baik' ? 'Baik' : ''}</span>
                    <span className="text-[10px] text-gray-500">{r.l.split(' ').pop()}</span>
                  </div>
                  <div className="flex-1 bg-gray-100 dark:bg-slate-700/50 rounded-full h-5 overflow-hidden border border-gray-200/50 dark:border-slate-700/50">
                    <div className={`h-full ${r.c} rounded-full flex items-center justify-end pr-2.5 transition-all shadow-inner`} style={{ width: `${w}%` }}>
                      <span className="text-[10px] text-white font-bold drop-shadow-sm">{count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-white text-sm flex items-center gap-2 font-serif">
            <PieChart size={17} className="text-primary-600" /> Siswa per Kelas
          </h3>
          <div className="space-y-2.5">
            {filteredClasses.map((c, idx) => {
              const count = activeStudents.filter(s => s.classId === c.id).length;
              const w = Math.max((count / maxStudents) * 100, 4);
              return (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-8">{c.name}</span>
                  <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-end pr-2 transition-all" style={{ width: `${w}%` }}>
                      <span className="text-[10px] text-white font-bold">{count}</span>
                    </div>
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
    <div className="stat-card glass rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
          <Icon size={18} className={iconColor} />
        </div>
        <div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{label}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
