"use client";

import { useStore } from "@/store/useStore";
import { Download, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { useState, useMemo } from "react";
import { ConfirmModal } from "./ConfirmModal";
import * as XLSX from "xlsx";

export function Recap() {
  const store = useStore();
  const [classId, setClassId] = useState("");
  const semester = store.activeSemester;
  const [search, setSearch] = useState("");
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'name', direction: 'asc' });

  const filteredClasses = store.classes.filter(c => c.year === store.activeYear);
  const isValidClass = filteredClasses.some(c => c.id === classId);
  const students = isValidClass ? store.students.filter(s => s.classId === classId) : [];
  const cls = store.classes.find(c => c.id === classId);
  const isKelas6 = cls?.name.includes('6');

  const getWeeklyAvg = (studentId: string, clsId: string) => {
    const sem1 = store.weeklyScores.find(x => x.studentId === studentId && x.classId === clsId && x.semester === 1);
    const sem2 = store.weeklyScores.find(x => x.studentId === studentId && x.classId === clsId && x.semester === 2);
    
    function semAvg(sem: any) {
      if (!sem) return null;
      const start = semester === 1 ? 1 : 6;
      const end = semester === 1 ? 5 : 10;
      let sum = 0, cnt = 0;
      for (let i = start; i <= end; i++) {
        const v = sem['m' + i];
        if (v !== '' && v !== undefined && v !== null) { sum += +v; cnt++; }
      }
      return cnt > 0 ? sum / cnt : null;
    }
    
    return semAvg(semester === 1 ? sem1 : sem2);
  };

  const getPred = (v: number) => (v >= 90 ? 'A' : v >= 80 ? 'B' : v >= 75 ? 'C' : 'D');

  const getPracticeVal = (pr: any, cat: string) => {
    const val = pr?.[cat];
    if (val === undefined || val === null || val === '') return '-';
    return Number(val).toFixed(1);
  };

  const calcFinalPractice = (pr: any) => {
    const w = getPracticeVal(pr, 'wudhu');
    const q = getPracticeVal(pr, 'quran');
    const s = getPracticeVal(pr, 'sholat');
    const t = getPracticeVal(pr, 'tayamum');
    let sum = 0, count = 0;
    if (w !== '-') { sum += +w; count++; }
    if (q !== '-') { sum += +q; count++; }
    if (s !== '-') { sum += +s; count++; }
    if (t !== '-') { sum += +t; count++; }
    return count > 0 ? (sum / count).toFixed(1) : '-';
  };

  const calcASAJ = (a: any) => {
    if (!a) return '-';
    if (a.pg === '' || a.essay === '') return '-';
    return (((+a.pg + +a.essay) / 50) * 100).toFixed(1);
  };

  const defaultBabNames = [
    "Al-Qur'an & Hadis",
    "Allah Maha Segalanya",
    "Hidup Damai Memaafkan",
    "Hukum Halal & Haram",
    "Jasa Khulafaurrasyidin",
    "Surah Al-A'la",
    "Indahnya Ketetapan Allah",
    "Peduli Lingkungan",
    "Mengamalkan Puasa Sunah",
    "Khalifah Usman & Ali"
  ];

  const materialNames = cls?.babNames || defaultBabNames;

  const rows = useMemo(() => {
    return students.map(s => {
      const avgW = getWeeklyAvg(s.id, classId);
      const pr = store.practiceScores.find(x => x.studentId === s.id && x.classId === classId);
      const praktik = pr ? calcFinalPractice(pr) : '-';
      const sasData = store.sasScores.find(x => x.studentId === s.id && x.classId === classId && x.semester === semester);
      const tes = sasData?.tes ? Number(sasData.tes) : null;
      
      const w1 = store.weeklyScores.find(x => x.studentId === s.id && x.classId === classId && x.semester === 1) || {} as any;
      const w2 = store.weeklyScores.find(x => x.studentId === s.id && x.classId === classId && x.semester === 2) || {} as any;
      
      const mScores: any = {};
      for (let i = 1; i <= 5; i++) mScores['m'+i] = w1['m'+i] ?? '-';
      for (let i = 6; i <= 10; i++) mScores['m'+i] = w2['m'+i] ?? '-';

      let naSas: number | null = null;
      if (tes !== null) {
        if (isKelas6 && praktik !== '-') {
          naSas = (tes + +praktik) / 2;
        } else {
          naSas = tes;
        }
      }

      const raportValue = avgW !== null && naSas !== null ? (avgW + naSas) / 2 : null;
      const asaj = isKelas6 ? calcASAJ(store.asajScores.find(x => x.studentId === s.id)) : '-';

      return {
        id: s.id,
        name: s.name,
        avgW: avgW !== null ? avgW.toFixed(1) : '-',
        ...mScores,
        praktik,
        tes: tes !== null ? tes.toFixed(1) : '-',
        naSas: naSas !== null ? naSas.toFixed(1) : '-',
        raport: raportValue !== null ? raportValue.toFixed(1) : '-',
        asaj
      };
    }).filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (!sortConfig.key || !sortConfig.direction) return 0;
      let valA: any = a[sortConfig.key as keyof typeof a];
      let valB: any = b[sortConfig.key as keyof typeof b];
      
      if (valA === '-') valA = -1;
      if (valB === '-') valB = -1;
      
      if (typeof valA === 'string' && isNaN(Number(valA))) valA = valA.toLowerCase();
      else valA = Number(valA);
      
      if (typeof valB === 'string' && isNaN(Number(valB))) valB = valB.toLowerCase();
      else valB = Number(valB);

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [students, classId, semester, search, sortConfig, store.weeklyScores, store.practiceScores, store.sasScores, store.asajScores]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={12} className="text-gray-300" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={12} className="text-primary-500" /> : <ChevronDown size={12} className="text-primary-500" />;
  };

  const exportRecap = () => {
    if (!classId) return setAlertMsg('Pilih kelas terlebih dahulu');
    const data = rows.map((r, i) => {
      const base: any = {
        'No': i + 1,
        'Nama Siswa': r.name,
      };
      for (let j = 1; j <= 10; j++) base['Sumatif ' + j] = r['m' + j];
      base['NA Sumatif'] = r.avgW;
      base['Nilai Tes SAS'] = r.tes;
      base['NA SAS'] = r.naSas;
      base['Nilai Rapor'] = r.raport;
      base['Predikat'] = r.raport !== '-' ? getPred(+r.raport) : '-';
      
      if (isKelas6) {
        base['Praktik'] = r.praktik;
        base['ASAJ'] = r.asaj;
      }
      return base;
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Nilai');
    XLSX.writeFile(wb, `rekap_nilai_${cls?.name}_sem${semester}.xlsx`);
  };

  return (
    <div className="w-full max-w-6xl fade-in">
      <div className="mb-4 flex flex-wrap gap-2 items-end justify-center">
        <div>
          <select value={classId} onChange={(e) => setClassId(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none transition text-sm">
            <option value="">Pilih Kelas</option>
            {filteredClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button onClick={exportRecap} className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium flex items-center gap-1.5 shadow-sm transition text-sm">
          <Download size={15} /> Export
        </button>
      </div>

      {isValidClass && (
        <div className="mb-3">
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Cari nama atau NIS siswa..." 
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition text-sm shadow-sm" 
          />
        </div>
      )}

      <div className="glass rounded-2xl p-4 mb-4 dark:text-gray-300 shadow-sm">
        <h4 className="font-semibold text-xs text-gray-800 dark:text-white mb-1.5 font-serif">Penjelasan Penilaian:</h4>
        <div className="text-[11px] space-y-0.5 text-gray-500 dark:text-gray-400">
          <p><strong>Nilai Rapor:</strong> (NA Sumatif + NA SAS) ÷ 2</p>
          <p><strong>NA SAS:</strong> {isKelas6 ? "(Nilai Praktik + Nilai Tes) ÷ 2" : "Nilai Tes SAS"}</p>
          <p><strong>Predikat:</strong> A (90-100), B (80-89), C (75-79), D (&lt;75) &nbsp;|&nbsp; <strong>Tuntas:</strong> ≥ 75</p>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-x-auto shadow-sm w-full">
        {!isValidClass ? (
          <p className="p-6 text-center text-gray-400 text-sm">Pilih kelas</p>
        ) : students.length === 0 ? (
          <p className="p-6 text-center text-gray-400 text-sm">Belum ada siswa</p>
        ) : (
          <table className="w-full text-[10px] border-collapse">
            <thead className="bg-gray-50 dark:bg-slate-700 sticky top-0 z-10 text-center">
              <tr className="border-b border-gray-200 dark:border-slate-600">
                <th rowSpan={3} className="p-1 border-r border-gray-200 dark:border-slate-600 w-8">No</th>
                <th rowSpan={3} className="p-2 text-left border-r border-gray-200 dark:border-slate-600 min-w-[150px]">Nama Siswa</th>
                <th colSpan={11} className="p-1 font-bold border-r border-gray-200 dark:border-slate-600 bg-emerald-50/50 dark:bg-emerald-900/10">Sumatif Akhir Lingkup Materi (Wajib)</th>
                {isKelas6 && <th rowSpan={3} className="p-1 border-r border-gray-200 dark:border-slate-600 text-[9px]">Nilai Praktik</th>}
                <th colSpan={2} className="p-1 font-bold border-r border-gray-200 dark:border-slate-600 bg-blue-50/50 dark:bg-blue-900/10">SAS (Sumatif Akhir Semester)</th>
                <th rowSpan={3} className="p-1 border-r border-gray-200 dark:border-slate-600 bg-primary-50/30 text-primary-700 dark:text-primary-300">Nilai Rapor</th>
                {isKelas6 && <th rowSpan={3} className="p-1 border-r border-gray-200 dark:border-slate-600">ASAJ</th>}
                <th rowSpan={3} className="p-1 border-r border-gray-200 dark:border-slate-600">Predikat</th>
                <th rowSpan={3} className="p-1">Status</th>
              </tr>
              <tr className="border-b border-gray-200 dark:border-slate-600 bg-gray-50/30">
                {Array.from({ length: 10 }).map((_, i) => (
                  <th key={i} className="p-1 border-r border-gray-200 dark:border-slate-600">Sumatif {i + 1}</th>
                ))}
                <th rowSpan={2} className="p-1 font-bold border-r border-gray-200 dark:border-slate-600 bg-emerald-100/50 dark:bg-emerald-800/30">NA Sumatif</th>
                <th className="p-1 border-r border-gray-200 dark:border-slate-600">Tes</th>
                <th className="p-1 border-r border-gray-200 dark:border-slate-600">NA SAS</th>
              </tr>
              <tr className="border-b border-gray-200 dark:border-slate-600 bg-gray-50/10">
                {materialNames.map((m, i) => (
                  <th key={i} className="p-1 border-r border-gray-200 dark:border-slate-600 font-normal text-[8px] leading-tight max-w-[60px]">{m}</th>
                ))}
                <th className="p-1 border-r border-gray-200 dark:border-slate-600">(Tes)</th>
                <th className="p-1 border-r border-gray-200 dark:border-slate-600">(Akhir)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-center">
              {rows.map((r, i) => (
                <tr key={i} className="dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition border-b border-gray-100 dark:border-slate-800">
                  <td className="p-1 border-r border-gray-100 dark:border-slate-800">{i + 1}</td>
                  <td className="p-1 text-left font-medium border-r border-gray-100 dark:border-slate-800">{r.name}</td>
                  {Array.from({ length: 10 }).map((_, j) => (
                    <td key={j} className="p-1 border-r border-gray-100 dark:border-slate-800">{r['m' + (j + 1)]}</td>
                  ))}
                  <td className="p-1 font-bold border-r border-gray-100 dark:border-slate-800 bg-emerald-50/30 dark:bg-emerald-900/10">{r.avgW}</td>
                  {isKelas6 && <td className="p-1 border-r border-gray-100 dark:border-slate-800">{r.praktik}</td>}
                  <td className="p-1 border-r border-gray-100 dark:border-slate-800">{r.tes}</td>
                  <td className="p-1 font-bold border-r border-gray-100 dark:border-slate-800 text-blue-600 dark:text-blue-400">{r.naSas}</td>
                  <td className="p-1 font-black border-r border-gray-100 dark:border-slate-800 text-primary-600 dark:text-primary-400">{r.raport}</td>
                  {isKelas6 && <td className="p-1 border-r border-gray-100 dark:border-slate-800">{r.asaj}</td>}
                  <td className="p-1 font-bold border-r border-gray-100 dark:border-slate-800">{r.raport !== '-' ? getPred(+r.raport) : '-'}</td>
                  <td className="p-1">{r.raport !== '-' ? (+r.raport >= 75 ? <span className="text-emerald-600 font-bold">Tuntas</span> : <span className="text-rose-500 font-bold">Remidi</span>) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal 
        isOpen={!!alertMsg}
        onClose={() => setAlertMsg(null)}
        onConfirm={() => setAlertMsg(null)}
        title="Peringatan"
        message={alertMsg || ''}
        confirmText="Dimengerti"
        showCancel={false}
        variant="warning"
      />
    </div>
  );
}
