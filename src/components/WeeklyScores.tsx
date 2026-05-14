"use client";

import { useStore } from "@/store/useStore";
import { Download, Upload, X, FileSpreadsheet, ChevronUp, ChevronDown, ArrowUpDown, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { ConfirmModal } from "./ConfirmModal";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";

export function WeeklyScores() {
  const store = useStore();
  const [classId, setClassId] = useState("");
  const [semester, setSemester] = useState<number>(1);
  const [weeksCount, setWeeksCount] = useState<number>(20);
  const [showImport, setShowImport] = useState(false);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'name', direction: 'asc' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const filteredClasses = store.classes.filter(c => c.year === store.activeYear);
  const isValidClass = filteredClasses.some(c => c.id === classId);
  const students = useMemo(() => {
    if (!isValidClass) return [];
    
    let base = store.students.filter(s => 
      s.classId === classId && 
      (!search || s.name.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search))
    );

    if (sortConfig.key && sortConfig.direction) {
      base.sort((a, b) => {
        let valA: any, valB: any;
        
        if (sortConfig.key === 'name') {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else if (sortConfig.key === 'avg') {
          const wA = store.weeklyScores.find(x => x.studentId === a.id && x.classId === classId && x.semester === semester) || {} as any;
          const wB = store.weeklyScores.find(x => x.studentId === b.id && x.classId === classId && x.semester === semester) || {} as any;
          
          const getAvg = (w: any) => {
            let sum = 0, cnt = 0;
            for (let i = 1; i <= weeksCount; i++) {
              const v = w['m' + i];
              if (v !== '' && v !== undefined && v !== null) { sum += +v; cnt++; }
            }
            return cnt > 0 ? sum / cnt : -1;
          };
          
          valA = getAvg(wA);
          valB = getAvg(wB);
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return base;
  }, [isValidClass, store.students, store.weeklyScores, classId, search, sortConfig, semester, weeksCount]);

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

  const handleWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value);
    setWeeksCount(val);
    if (!classId) return;
    store.setWeeklyScores((prev) => 
      prev.map(w => (w.classId === classId && w.semester === semester) ? { ...w, weeks: val } : w)
    );
  };

  const handleScoreChange = (studentId: string, week: number, val: string) => {
    store.setWeeklyScores((prev) => {
      let exists = false;
      const next = prev.map(w => {
        if (w.studentId === studentId && w.classId === classId && w.semester === semester) {
          exists = true;
          return { ...w, [`m${week}`]: val ? Number(val) : '' };
        }
        return w;
      });
      if (!exists) {
        next.push({ studentId, classId, semester, weeks: weeksCount, [`m${week}`]: val ? Number(val) : '' });
      }
      return next;
    });
  };

  const deleteScores = () => {
    store.setWeeklyScores((prev) => prev.filter(w => !(w.classId === classId && w.semester === semester)));
    toast.success(`Semua nilai mingguan berhasil dihapus`);
  };

  const exportWeekly = () => {
    if (!classId) return toast.error('Pilih kelas terlebih dahulu');
    const cls = store.classes.find(c => c.id === classId);
    
    const data = students.map(s => {
      const w = store.weeklyScores.find(x => x.studentId === s.id && x.classId === classId && x.semester === semester) || {} as any;
      const row: any = { 'Nama': s.name, 'NIS': s.nis };
      let sum = 0, cnt = 0;
      for (let i = 1; i <= weeksCount; i++) {
        const v = w['m' + i];
        row['M' + i] = (v !== '' && v !== undefined && v !== null) ? v : '-';
        if (v !== '' && v !== undefined && v !== null) { sum += +v; cnt++; }
      }
      row['Rata-rata'] = cnt > 0 ? (sum / cnt).toFixed(1) : '-';
      return row;
    });
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Nilai Mingguan');
    XLSX.writeFile(wb, `nilai_mingguan_${cls?.name}_sem${semester}.xlsx`);
  };

  const downloadTemplate = () => {
    if (!classId) return toast.error('Pilih kelas terlebih dahulu');
    const cls = store.classes.find(c => c.id === classId);
    
    const data = students.map(s => {
      const row: any = { 'Nama': s.name, 'NIS': s.nis };
      for (let i = 1; i <= weeksCount; i++) row['M' + i] = '';
      return row;
    });
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Mingguan');
    XLSX.writeFile(wb, `template_mingguan_${cls?.name}_sem${semester}.xlsx`);
  };

  const importWeekly = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!classId) {
      toast.error('Pilih kelas terlebih dahulu');
      e.target.value = '';
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'array' });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        
        let count = 0;
        store.setWeeklyScores((prev) => {
          let next = [...prev];
          data.forEach((row: any) => {
            const student = students.find(s => s.nis === String(row['NIS'] || '') || s.name === row['Nama']);
            if (student) {
              let existingIndex = next.findIndex(w => w.studentId === student.id && w.classId === classId && w.semester === semester);
              let w = existingIndex >= 0 ? { ...next[existingIndex] } : { studentId: student.id, classId, semester, weeks: weeksCount } as any;
              
              let updated = false;
              for (let i = 1; i <= weeksCount; i++) {
                const val = row['M' + i];
                if (val !== undefined && val !== '-' && val !== '') {
                  w[`m${i}`] = Number(val);
                  updated = true;
                }
              }
              
              if (updated) {
                if (existingIndex >= 0) {
                  next[existingIndex] = w;
                } else {
                  next.push(w);
                }
                count++;
              }
            }
          });
          return next;
        });
        
        if (count > 0) toast.success(`${count} data nilai mingguan berhasil diimport`);
        else toast.error('Tidak ada data nilai yang valid untuk diimport');
      } catch (err) {
        toast.error('Gagal membaca file Excel');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  return (
    <>
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm fade-in" style={{ position: 'fixed' }}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-slate-700">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Upload size={18} className="text-amber-500" /> Import Nilai Mingguan
              </h3>
              <button onClick={() => setShowImport(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">
                Silakan unduh template Excel terlebih dahulu, isi nilai siswa, lalu unggah kembali file tersebut.
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={downloadTemplate} className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors border border-blue-200 dark:border-slate-700">
                  <FileSpreadsheet size={18} /> Download Template Excel
                </button>
                <div className="relative">
                  <input type="file" accept=".xlsx,.xls" onChange={(e) => { importWeekly(e); setShowImport(false); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20">
                    <Upload size={18} /> Pilih File & Import
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
        <div>
          <select value={weeksCount} onChange={handleWeekChange} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none transition text-sm">
            <option value="20">20</option>
            <option value="21">21</option>
            <option value="22">22</option>
          </select>
        </div>
        <button onClick={exportWeekly} className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium flex items-center gap-1.5 shadow-sm transition text-sm">
          <Download size={15} /> Export
        </button>
        <button onClick={() => setShowImport(true)} className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium flex items-center gap-1.5 shadow-sm transition text-sm">
          <Upload size={15} /> Import
        </button>
        <button onClick={() => { if(!classId) return toast.error('Pilih kelas dulu'); setIsDeleteModalOpen(true); }} className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium flex items-center gap-1.5 shadow-sm transition text-sm">
          <Trash2 size={15} /> Hapus Data
        </button>
      </div>

      {isValidClass && (
        <div className="mb-3">
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Cari nama atau NIS siswa di kelas ini..." 
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition text-sm shadow-sm" 
          />
        </div>
      )}

      <div className="glass rounded-2xl overflow-x-auto overflow-y-auto scrollbar-hide shadow-sm w-full" style={{ maxHeight: '70vh' }}>
        {!isValidClass ? (
          <p className="p-6 text-center text-gray-400 text-sm">Pilih kelas untuk melihat nilai</p>
        ) : students.length === 0 ? (
          <p className="p-6 text-center text-gray-400 text-sm">Belum ada siswa di kelas ini</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 dark:bg-slate-700 z-10 shadow-sm">
              <tr>
                <th onClick={() => requestSort('name')} className="p-2 text-left min-w-[120px] sticky left-0 bg-gray-50 dark:bg-slate-700 font-semibold text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors group">
                  <div className="flex items-center gap-1.5">
                    Nama {getSortIcon('name')}
                  </div>
                </th>
                {Array.from({ length: weeksCount }).map((_, i) => (
                  <th key={i} className="p-1 text-[10px] min-w-[40px] font-medium text-center">M{i + 1}</th>
                ))}
                <th onClick={() => requestSort('avg')} className="p-2 min-w-[60px] font-semibold text-[10px] text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors bg-primary-50/20">
                  <div className="flex items-center justify-center gap-1.5">
                    Rata-rata {getSortIcon('avg')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {students.map(s => {
                const w = store.weeklyScores.find(x => x.studentId === s.id && x.classId === classId && x.semester === semester) || {} as any;
                let sum = 0, cnt = 0;
                for (let i = 1; i <= weeksCount; i++) {
                  const v = w['m' + i];
                  if (v !== '' && v !== undefined && v !== null) { sum += +v; cnt++; }
                }
                const avg = cnt > 0 ? (sum / cnt).toFixed(1) : '-';

                return (
                  <tr key={s.id} className="dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                    <td className="p-2 font-medium text-xs sticky left-0 bg-white dark:bg-slate-800">{s.name}</td>
                    {Array.from({ length: weeksCount }).map((_, i) => (
                      <td key={i} className="p-0.5 text-center align-middle">
                        <input 
                          type="number" min="0" max="100" 
                          value={w['m' + (i + 1)] ?? ''} 
                          onChange={(e) => handleScoreChange(s.id, i + 1, e.target.value)} 
                          className="w-[38px] text-center mx-auto block rounded-md border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white py-0.5 outline-none focus:ring-1 focus:ring-primary-500 text-[11px]"
                          style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                        />
                      </td>
                    ))}
                    <td className="p-2 text-center font-bold text-primary-600 text-[11px]">{avg}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteScores}
        title="Hapus Nilai Mingguan?"
        message={`Apakah Anda yakin ingin menghapus semua nilai mingguan di ${store.classes.find(c => c.id === classId)?.name} (Semester ${semester})? Data yang sudah dihapus tidak bisa dikembalikan.`}
        confirmText="Ya, Hapus Semua"
      />
    </>
  );
}
