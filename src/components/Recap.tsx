"use client";

import { useStore } from "@/store/useStore";
import { Download, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { useState, useMemo } from "react";
import * as XLSX from "xlsx";

export function Recap() {
  const store = useStore();
  const [classId, setClassId] = useState("");
  const [semester, setSemester] = useState<number>(1);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'name', direction: 'asc' });

  const filteredClasses = store.classes.filter(c => c.year === store.activeYear);
  const isValidClass = filteredClasses.some(c => c.id === classId);
  const students = isValidClass ? store.students.filter(s => s.classId === classId) : [];
  const isKelas6 = filteredClasses.find(c => c.id === classId)?.name.includes('6');

  const getWeeklyAvg = (studentId: string, clsId: string) => {
    const sems = store.weeklyScores.filter((x) => x.studentId === studentId && x.classId === clsId && x.semester === semester);
    if (!sems.length) return null;
    let totalSum = 0, totalCount = 0;
    sems.forEach((sem) => {
      const nw = sem.weeks || 20;
      for (let i = 1; i <= nw; i++) {
        const v = sem['m' + i];
        if (v !== '' && v !== undefined && v !== null) { totalSum += +v; totalCount++; }
      }
    });
    return totalCount > 0 ? totalSum / totalCount : null;
  };

  const getPred = (v: number) => (v >= 90 ? 'A' : v >= 80 ? 'B' : v >= 75 ? 'C' : 'D');

  const getPracticeVal = (pr: any, cat: string) => {
    const val = pr[cat];
    if (val === undefined || val === null || val === '') return '-';
    // Fallback if old data is object
    if (typeof val === 'object') {
      const vals = Object.values(val).filter(v => v !== '') as number[];
      return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '-';
    }
    return Number(val).toFixed(1);
  };

  const calcFinalPractice = (pr: any) => {
    const w = getPracticeVal(pr, 'wudhu');
    const q = getPracticeVal(pr, 'quran');
    const s = getPracticeVal(pr, 'sholat');
    const t = getPracticeVal(pr, 'tayamum');
    if ([w, q, s, t].includes('-')) return '-';
    // Using equal weights for simplicity if preferred, but keeping original weights:
    return ((+w * 0.25) + (+q * 0.25) + (+s * 0.35) + (+t * 0.15)).toFixed(1);
  };

  const calcASAJ = (a: any) => {
    if (a.pg === '' || a.pg === undefined || a.essay === '' || a.essay === undefined) return { total: '-', nilai: '-' };
    const total = +a.pg + +a.essay;
    const nilai = ((total / 50) * 100).toFixed(1);
    return { total, nilai };
  };

  const rows = useMemo(() => {
    if (!isValidClass) return [];
    
    let base = students.map(s => {
      const avgW = getWeeklyAvg(s.id, classId);
      const sas = store.sasScores.find(x => x.studentId === s.id && x.classId === classId && x.semester === semester)?.score || '';
      const raport = avgW !== null && sas !== '' ? ((avgW + +sas) / 2) : null;
      const pr = store.practiceScores.find(x => x.studentId === s.id && x.classId === classId);
      const praktik = pr ? calcFinalPractice(pr) : '-';
      const asaj = isKelas6 ? (() => {
        const a = store.asajScores.find(x => x.studentId === s.id);
        return a ? calcASAJ(a).nilai : '-';
      })() : '-';

      return {
        name: s.name,
        avgW: avgW?.toFixed(1) || '-',
        sas: sas || '-',
        raport: raport?.toFixed(1) || '-',
        praktik, asaj, raportNum: raport,
        sasNum: sas !== '' ? Number(sas) : -1,
        nis: s.nis
      };
    }).filter(r => 
      !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.nis.includes(search)
    );

    if (sortConfig.key && sortConfig.direction) {
      base.sort((a, b) => {
        let valA: any, valB: any;
        
        if (sortConfig.key === 'name') {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else if (sortConfig.key === 'sas') {
          valA = a.sasNum;
          valB = b.sasNum;
        } else if (sortConfig.key === 'raport') {
          valA = a.raportNum || 0;
          valB = b.raportNum || 0;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return base;
  }, [students, classId, isValidClass, store.sasScores, store.weeklyScores, store.practiceScores, store.asajScores, search, sortConfig, isKelas6]);

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
    if (!classId) return alert('Pilih kelas terlebih dahulu');
    const cls = store.classes.find(c => c.id === classId);
    const exportData = rows.map((r, idx) => {
      const row: any = {
        '#': idx + 1, 'Nama': r.name, 'Mingguan': r.avgW, 'SAS': r.sas, 'Raport': r.raport, 'Praktik': r.praktik
      };
      if (isKelas6) row['ASAJ'] = r.asaj;
      row['Predikat'] = r.raport !== '-' ? getPred(+r.raport) : '-';
      row['Status'] = r.raport !== '-' ? (+r.raport >= 75 ? 'Tuntas' : 'Belum Tuntas') : '-';
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
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
        <div>
          <select value={semester} onChange={(e) => setSemester(Number(e.target.value))} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none transition text-sm">
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
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
          <p><strong>Raport:</strong> (Mingguan + SAS) ÷ 2 &nbsp;|&nbsp; <strong>Praktik:</strong> Wudhu 25%, Qur'an 25%, Sholat 35%, Tayamum 15%</p>
          <p><strong>Predikat:</strong> A (90-100), B (80-89), C (75-79), D (&lt;75) &nbsp;|&nbsp; <strong>Tuntas:</strong> ≥ 75</p>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-x-auto shadow-sm w-full">
        {!isValidClass ? (
          <p className="p-6 text-center text-gray-400 text-sm">Pilih kelas</p>
        ) : students.length === 0 ? (
          <p className="p-6 text-center text-gray-400 text-sm">Belum ada siswa</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-700 sticky top-0 z-10">
              <tr>
                <th className="p-2 font-semibold text-xs">#</th>
                <th onClick={() => requestSort('name')} className="p-2 text-left font-semibold text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                  <div className="flex items-center gap-1.5">
                    Nama {getSortIcon('name')}
                  </div>
                </th>
                <th className="p-2 font-semibold text-xs text-center">Mingguan</th>
                <th onClick={() => requestSort('sas')} className="p-2 font-semibold text-xs text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                  <div className="flex items-center justify-center gap-1.5">
                    SAS {getSortIcon('sas')}
                  </div>
                </th>
                <th onClick={() => requestSort('raport')} className="p-2 font-semibold text-xs text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors bg-primary-50/20">
                  <div className="flex items-center justify-center gap-1.5">
                    Raport {getSortIcon('raport')}
                  </div>
                </th>
                <th className="p-2 font-semibold text-xs text-center">Praktik</th>
                {isKelas6 && <th className="p-2 font-semibold text-xs">ASAJ</th>}
                <th className="p-2 font-semibold text-xs text-center">Predikat</th>
                <th className="p-2 font-semibold text-xs text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {rows.map((r, i) => (
                <tr key={i} className="dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                  <td className="p-2 text-center text-xs">{i + 1}</td>
                  <td className="p-2 font-medium text-xs">{r.name}</td>
                  <td className="p-2 text-center text-xs">{r.avgW}</td>
                  <td className="p-2 text-center text-xs">{r.sas}</td>
                  <td className="p-2 text-center font-bold text-xs">{r.raport}</td>
                  <td className="p-2 text-center text-xs">{r.praktik}</td>
                  {isKelas6 && <td className="p-2 text-center text-xs">{r.asaj}</td>}
                  <td className="p-2 text-center text-xs">{r.raport !== '-' ? getPred(+r.raport) : '-'}</td>
                  <td className="p-2 text-center text-xs">{r.raport !== '-' ? (+r.raport >= 75 ? <span className="text-primary-600 font-medium">Tuntas</span> : <span className="text-red-500 font-medium">Belum Tuntas</span>) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
