"use client";

import { useStore, ClassData, StudentData, WeeklyScore, SASScore, PracticeScore, ASAJScore } from "@/store/useStore";
import { Download, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import React, { useState, useMemo } from "react";
import { ConfirmModal } from "./ConfirmModal";
import * as XLSX from "xlsx";

export function Recap() {
  const store = useStore();
  const [classId, setClassId] = useState<string>("");
  const semester = store.activeSemester;
  const [search, setSearch] = useState<string>("");
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'name', direction: 'asc' });

  const filteredClasses = store.classes.filter((c: ClassData) => c.year === store.activeYear);
  const isValidClass = filteredClasses.some((c: ClassData) => c.id === classId);
  const students = isValidClass ? store.students.filter((s: StudentData) => s.classId === classId) : [];
  const cls = store.classes.find((c: ClassData) => c.id === classId);
  const isKelas6 = cls?.name.includes('6');

  const getWeeklyAvg = (studentId: string, clsId: string) => {
    const sem1 = store.weeklyScores.find((x: WeeklyScore) => x.studentId === studentId && x.classId === clsId && x.semester === 1);
    const sem2 = store.weeklyScores.find((x: WeeklyScore) => x.studentId === studentId && x.classId === clsId && x.semester === 2);
    
    let sum = 0, cnt = 0;
    // Semester 1 (M1 - M5)
    if (sem1) {
      for (let i = 1; i <= 5; i++) {
        const v = sem1['m' + i];
        if (v !== '' && v !== undefined && v !== null) { sum += +v; cnt++; }
      }
    }
    // Semester 2 (M6 - M10)
    if (sem2) {
      for (let i = 6; i <= 10; i++) {
        const v = sem2['m' + i];
        if (v !== '' && v !== undefined && v !== null) { sum += +v; cnt++; }
      }
    }
    
    return cnt > 0 ? sum / cnt : null;
  };

  const getPred = (v: number) => (v >= 90 ? 'A' : v >= 80 ? 'B' : v >= 75 ? 'C' : 'D');

  const getPracticeVal = (pr: PracticeScore | undefined, cat: string) => {
    const val = pr?.[cat];
    if (val === undefined || val === null || val === '') return '-';
    return Number(val).toFixed(1);
  };

  const calcFinalPractice = (pr: PracticeScore) => {
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

  const calcASAJ = (a: ASAJScore | undefined) => {
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
    return students.map((s: StudentData) => {
      const avgW = getWeeklyAvg(s.id, classId);
      const pr = store.practiceScores.find((x: PracticeScore) => x.studentId === s.id && x.classId === classId);
      const praktik = pr ? calcFinalPractice(pr) : '-';
      const sasData = store.sasScores.find((x: SASScore) => x.studentId === s.id && x.classId === classId && x.semester === semester);
      const tes = sasData?.tes ? Number(sasData.tes) : null;
      
      const w1 = store.weeklyScores.find((x: WeeklyScore) => x.studentId === s.id && x.classId === classId && x.semester === 1) || {} as any;
      const w2 = store.weeklyScores.find((x: WeeklyScore) => x.studentId === s.id && x.classId === classId && x.semester === 2) || {} as any;
      
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
      const asaj = isKelas6 ? calcASAJ(store.asajScores.find((x: ASAJScore) => x.studentId === s.id)) : '-';
      
      const rowData: any = {
        id: s.id,
        name: s.name,
        avgW: avgW !== null ? avgW.toFixed(1) : '-',
        ...mScores,
        nonTes: praktik,
        tes: tes !== null ? tes.toFixed(1) : '-',
        naSas: naSas !== null ? naSas.toFixed(1) : '-',
        raport: raportValue !== null ? raportValue.toFixed(1) : '-',
        asaj
      };

      return rowData;
    }).filter((r: any) => !search || r.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a: any, b: any) => {
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
    const data = rows.map((r: any, i: number) => {
      const base: any = {
        'No': i + 1,
        'Nama Siswa': r.name,
      };
      for (let j = 1; j <= 10; j++) base['Sumatif ' + j] = r['m' + j];
      base['NA Sumatif Lingkup Materi'] = r.avgW;
      base['Non Tes'] = r.nonTes;
      base['Nilai Tes SAS'] = r.tes;
      base['NA Sumatif Akhir Semester'] = r.naSas;
      base['Nilai Rapor'] = r.raport;
      base['Predikat'] = r.raport !== '-' ? getPred(+r.raport) : '-';
      base['Status'] = r.raport !== '-' ? (+r.raport >= 75 ? 'Tuntas' : 'Remidi') : '-';
      
      if (isKelas6) {
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
          <select value={classId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setClassId(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none transition text-sm">
            <option value="">Pilih Kelas</option>
            {filteredClasses.map((c: ClassData) => <option key={c.id} value={c.id}>{c.name}</option>)}
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} 
            placeholder="Cari nama atau NIS siswa..." 
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition text-sm shadow-sm" 
          />
        </div>
      )}

      <div className="glass rounded-2xl p-5 mb-4 dark:text-gray-300 shadow-sm border border-gray-100 dark:border-slate-700">
        <h4 className="font-bold text-sm text-gray-800 dark:text-white mb-3 flex items-center gap-2">
          <div className="w-1 h-4 bg-primary-500 rounded-full"></div>
          Penjelasan Penilaian (Assessment Guide):
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-bold text-primary-600 dark:text-primary-400 min-w-[100px]">Nilai Rapor</span>
              <span className="text-gray-500">: (NA Sumatif + NA SAS) ÷ 2</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-primary-600 dark:text-primary-400 min-w-[100px]">NA Sumatif</span>
              <span className="text-gray-500">: Rata-rata Nilai Sumatif Lingkup Materi (Wajib)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-primary-600 dark:text-primary-400 min-w-[100px]">NA SAS</span>
              <span className="text-gray-500">: {isKelas6 ? "(Non Tes + Tes) ÷ 2" : "Nilai Tes (Tanpa Non-Tes)"}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 min-w-[100px]">Predikat</span>
              <span className="text-gray-500">: A (90-100), B (80-89), C (75-79), D (&lt;75)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 min-w-[100px]">Status</span>
              <span className="text-gray-500">: Tuntas jika Nilai Rapor ≥ 75</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-x-auto shadow-sm w-full">
        {!isValidClass ? (
          <p className="p-6 text-center text-gray-400 text-sm">Pilih kelas</p>
        ) : students.length === 0 ? (
          <p className="p-6 text-center text-gray-400 text-sm">Belum ada siswa</p>
        ) : (
          <table className="w-full text-[10px] border-collapse">
            <thead className="sticky top-0 z-20 bg-white dark:bg-slate-800 shadow-sm text-center">
              <tr className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                <th rowSpan={3} className="p-1 border-r border-gray-200 dark:border-slate-600 w-8 sticky top-0 bg-gray-50 dark:bg-slate-700 z-30">No</th>
                <th rowSpan={3} onClick={() => requestSort('name')} className="p-2 text-left font-semibold text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition sticky left-0 top-0 bg-gray-50 dark:bg-slate-700 z-30 min-w-[150px] border-r border-gray-200 dark:border-slate-600">
                  <div className="flex items-center gap-1.5">Nama {getSortIcon('name')}</div>
                </th>
                <th colSpan={11} className="p-2 font-bold border-r border-gray-200 dark:border-slate-600 bg-emerald-50/80 dark:bg-emerald-900/20 text-[11px]">Sumatif Akhir Lingkup Materi (Wajib)</th>
                <th colSpan={3} className="p-2 font-bold border-r border-gray-200 dark:border-slate-600 bg-blue-50/80 dark:bg-blue-900/20 text-[11px]">Sumatif Akhir Semester (Tidak Wajib)</th>
                <th rowSpan={3} className="p-2 font-bold border-r border-gray-200 dark:border-slate-600 bg-primary-50/50 text-primary-700 dark:text-primary-300 text-xs">Nilai Rapor</th>
                {isKelas6 && <th rowSpan={3} className="p-2 border-r border-gray-200 dark:border-slate-600">ASAJ</th>}
                <th rowSpan={3} className="p-2 border-r border-gray-200 dark:border-slate-600">Predikat</th>
                <th rowSpan={3} className="p-2">Status</th>
              </tr>
              <tr className="border-b border-gray-200 dark:border-slate-600 bg-gray-50/30">
                {Array.from({ length: 10 }).map((_, i) => (
                  <th key={i} className="p-1 border-r border-gray-200 dark:border-slate-600 font-bold">Sumatif {i + 1}</th>
                ))}
                <th rowSpan={2} className="p-1 font-bold border-r border-gray-200 dark:border-slate-600 bg-emerald-100/50 dark:bg-emerald-800/30">NA Sumatif Lingkup Materi</th>
                <th className="p-1 border-r border-gray-200 dark:border-slate-600 font-bold">Non Tes</th>
                <th className="p-1 border-r border-gray-200 dark:border-slate-600 font-bold">Tes</th>
                <th rowSpan={2} className="p-1 font-bold border-r border-gray-200 dark:border-slate-600 bg-blue-100/50 dark:bg-blue-800/30">NA Sumatif Akhir Semester</th>
              </tr>
              <tr className="border-b border-gray-200 dark:border-slate-600 bg-gray-50/10">
                {materialNames.map((m: string, i: number) => (
                  <th key={i} className="p-1 border-r border-gray-200 dark:border-slate-600 font-normal text-[8px] leading-tight max-w-[70px] italic">{m}</th>
                ))}
                <th className="p-1 border-r border-gray-200 dark:border-slate-600">(Praktik)</th>
                <th className="p-1 border-r border-gray-200 dark:border-slate-600">(Tulis)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-center">
              {rows.map((r: any, i: number) => (
                <tr key={i} className="dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition border-b border-gray-100 dark:border-slate-800">
                  <td className="p-1 border-r border-gray-100 dark:border-slate-800">{i + 1}</td>
                  <td className="p-1 text-left font-medium border-r border-gray-100 dark:border-slate-800 sticky left-0 bg-white dark:bg-slate-800 z-10">{r.name}</td>
                  {Array.from({ length: 10 }).map((_, j) => (
                    <td key={j} className="p-1 border-r border-gray-100 dark:border-slate-800">{r['m' + (j + 1)]}</td>
                  ))}
                  <td className="p-1 font-bold border-r border-gray-100 dark:border-slate-800 bg-emerald-50/30 dark:bg-emerald-900/10">{r.avgW}</td>
                  <td className="p-1 border-r border-gray-100 dark:border-slate-800">{r.nonTes}</td>
                  <td className="p-1 border-r border-gray-100 dark:border-slate-800">{r.tes}</td>
                  <td className="p-1 font-bold border-r border-gray-100 dark:border-slate-800 bg-blue-50/30 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400">{r.naSas}</td>
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
