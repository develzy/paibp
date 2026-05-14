"use client";

import { useStore } from "@/store/useStore";
import { Download, Upload, X, FileSpreadsheet, Scale, ChevronUp, ChevronDown, ArrowUpDown, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { ConfirmModal } from "./ConfirmModal";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";

export function SASScores() {
  const store = useStore();
  const [classId, setClassId] = useState("");
  const [semester, setSemester] = useState<number>(1);
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
        } else if (sortConfig.key === 'score') {
          const scA = store.sasScores.find(x => x.studentId === a.id && x.classId === classId && x.semester === semester)?.score || 0;
          const scB = store.sasScores.find(x => x.studentId === b.id && x.classId === classId && x.semester === semester)?.score || 0;
          valA = Number(scA);
          valB = Number(scB);
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return base;
  }, [isValidClass, store.students, store.sasScores, classId, search, sortConfig, semester]);

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

  const handleScoreChange = (studentId: string, field: 'pg' | 'isian' | 'uraian', val: string) => {
    store.setSASScores((prev) => {
      let exists = false;
      const next = prev.map(s => {
        if (s.studentId === studentId && s.classId === classId && s.semester === semester) {
          exists = true;
          const updated = { ...s, [field]: val ? Number(val) : '' };
          const pg = Number(updated.pg || 0);
          const isian = Number(updated.isian || 0);
          const uraian = Number(updated.uraian || 0);
          const total = pg + isian + uraian;
          updated.score = ((total / 50) * 100).toFixed(1);
          return updated;
        }
        return s;
      });
      if (!exists) {
        const newItem: any = { studentId, classId, semester, [field]: val ? Number(val) : '', score: '' };
        const pg = Number(newItem.pg || 0);
        const isian = Number(newItem.isian || 0);
        const uraian = Number(newItem.uraian || 0);
        const total = pg + isian + uraian;
        newItem.score = ((total / 50) * 100).toFixed(1);
        next.push(newItem);
      }
      return next;
    });
  };

  const deleteScores = () => {
    store.setSASScores((prev) => prev.filter(s => !(s.classId === classId && s.semester === semester)));
    toast.success(`Semua nilai SAS berhasil dihapus`);
  };

  const exportSAS = () => {
    if (!classId) return toast.error('Pilih kelas terlebih dahulu');
    const cls = store.classes.find(c => c.id === classId);
    const data = students.map(s => {
      const sc = store.sasScores.find(x => x.studentId === s.id && x.classId === classId && x.semester === semester) || {} as any;
      const avgW = getWeeklyAvg(s.id, classId);
      const raport = avgW !== null && sc.score !== '' && sc.score !== undefined ? ((avgW + +sc.score) / 2).toFixed(1) : '-';
      return {
        'Nama': s.name, 'NIS': s.nis, 'PG': sc.pg || '-', 'Isian': sc.isian || '-', 'Uraian': sc.uraian || '-',
        'NA SAS': sc.score || '-', 'Mingguan': avgW?.toFixed(1) || '-', 'Raport': raport
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Nilai SAS');
    XLSX.writeFile(wb, `nilai_sas_${cls?.name}_sem${semester}.xlsx`);
  };

  const downloadTemplate = () => {
    if (!classId) return toast.error('Pilih kelas terlebih dahulu');
    const cls = store.classes.find(c => c.id === classId);
    const data = students.map(s => ({ 'Nama': s.name, 'NIS': s.nis, 'PG': '', 'Isian': '', 'Uraian': '' }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template SAS');
    XLSX.writeFile(wb, `template_sas_${cls?.name}_sem${semester}.xlsx`);
  };

  const importSAS = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!classId) { toast.error('Pilih kelas terlebih dahulu'); e.target.value = ''; return; }
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'array' });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        let count = 0;
        store.setSASScores((prev) => {
          let next = [...prev];
          data.forEach((row: any) => {
            const student = students.find(s => s.nis === String(row['NIS'] || '') || s.name === row['Nama']);
            if (student) {
              const existingIndex = next.findIndex(s => s.studentId === student.id && s.classId === classId && s.semester === semester);
              let s = existingIndex >= 0 ? { ...next[existingIndex] } : { studentId: student.id, classId, semester, pg: '', isian: '', uraian: '', score: '' } as any;
              let updated = false;
              if (row['PG'] !== undefined && row['PG'] !== '-') { s.pg = Number(row['PG']); updated = true; }
              if (row['Isian'] !== undefined && row['Isian'] !== '-') { s.isian = Number(row['Isian']); updated = true; }
              if (row['Uraian'] !== undefined && row['Uraian'] !== '-') { s.uraian = Number(row['Uraian']); updated = true; }
              if (updated) {
                const total = Number(s.pg || 0) + Number(s.isian || 0) + Number(s.uraian || 0);
                s.score = ((total / 50) * 100).toFixed(1);
                if (existingIndex >= 0) next[existingIndex] = s;
                else next.push(s);
                count++;
              }
            }
          });
          return next;
        });
        if (count > 0) toast.success(`${count} data nilai SAS berhasil diimport`);
      } catch (err) { toast.error('Gagal membaca file Excel'); }
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
                <Upload size={18} className="text-amber-500" /> Import Nilai SAS
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
                  <input type="file" accept=".xlsx,.xls" onChange={(e) => { importSAS(e); setShowImport(false); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
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
        <div className="mb-4 flex flex-wrap gap-2 justify-center">
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
        <button onClick={exportSAS} className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium flex items-center gap-1.5 shadow-sm transition text-sm">
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
        <>
          <div className="mb-3">
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Cari nama atau NIS siswa..." 
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition text-sm shadow-sm" 
            />
          </div>

          <div className="mb-4 p-4 bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/30 rounded-2xl">
            <h4 className="text-xs font-bold text-primary-800 dark:text-primary-300 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <Scale size={14} /> Pedoman Penilaian SAS:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-primary-100/50 dark:border-primary-800/20">
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">I. Pilihan Ganda</p>
                <p className="text-xs font-bold text-gray-900 dark:text-white">15 Soal &times; 1 = 15</p>
              </div>
              <div className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-primary-100/50 dark:border-primary-800/20">
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">II. Isian Singkat</p>
                <p className="text-xs font-bold text-gray-900 dark:text-white">10 Soal &times; 2 = 20</p>
              </div>
              <div className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/50 border border-primary-100/50 dark:border-primary-800/20">
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">III. Uraian</p>
                <p className="text-xs font-bold text-gray-900 dark:text-white">5 Soal &times; 3 = 15</p>
              </div>
              <div className="p-2 rounded-lg bg-primary-600 text-white shadow-md shadow-primary-500/20">
                <p className="text-[10px] font-bold text-primary-100 uppercase mb-1">Skor Maksimal</p>
                <p className="text-sm font-black">50</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-primary-100 dark:border-primary-800/30 flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded text-[10px] font-bold">RUMUS NA</div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 italic">NA = (Jumlah Skor / 50) &times; 100</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded text-[10px] font-bold">CONTOH</div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Skor 42 &rarr; (42 / 50) &times; 100 = <span className="font-bold text-emerald-600 dark:text-emerald-400">84</span></p>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="glass rounded-2xl overflow-x-auto overflow-y-auto scrollbar-hide shadow-sm w-full">
        {!isValidClass ? (
          <p className="p-6 text-center text-gray-400 text-sm">Pilih kelas untuk melihat nilai</p>
        ) : students.length === 0 ? (
          <p className="p-6 text-center text-gray-400 text-sm">Belum ada siswa di kelas ini</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-700 sticky top-0 z-10">
              <tr>
                <th onClick={() => requestSort('name')} className="p-3 text-left font-semibold text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors group">
                  <div className="flex items-center gap-1.5">
                    Nama {getSortIcon('name')}
                  </div>
                </th>
                <th className="p-3 font-semibold text-xs text-center bg-blue-50/30 dark:bg-blue-900/10">PG (0-15)</th>
                <th className="p-3 font-semibold text-xs text-center bg-blue-50/30 dark:bg-blue-900/10">Isian (0-20)</th>
                <th className="p-3 font-semibold text-xs text-center bg-blue-50/30 dark:bg-blue-900/10">Uraian (0-15)</th>
                <th onClick={() => requestSort('score')} className="p-3 font-semibold text-xs text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors group bg-primary-50/20">
                  <div className="flex items-center justify-center gap-1.5">
                    NA SAS {getSortIcon('score')}
                  </div>
                </th>
                <th className="p-3 font-semibold text-xs text-center">Nilai Raport</th>
                <th className="p-3 font-semibold text-xs text-center">Predikat</th>
                <th className="p-3 font-semibold text-xs text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {students.map(s => {
                const sc = store.sasScores.find(x => x.studentId === s.id && x.classId === classId && x.semester === semester) || { pg: '', isian: '', uraian: '', score: '' };
                const avgW = getWeeklyAvg(s.id, classId);
                const raport = avgW !== null && sc.score !== '' && sc.score !== undefined ? ((avgW + +sc.score) / 2).toFixed(1) : '-';
                const pred = raport !== '-' ? getPred(+raport) : '-';
                const status = raport !== '-' ? (+raport >= 75 ? <span className="text-primary-600 font-medium">Tuntas</span> : <span className="text-red-500 font-medium">Belum Tuntas</span>) : '-';

                return (
                  <tr key={s.id} className="dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                    <td className="p-3 font-medium text-sm">{s.name}</td>
                    <td className="p-3 text-center">
                      <input 
                        type="number" min="0" max="15" 
                        value={sc.pg || ''} 
                        onChange={(e) => handleScoreChange(s.id, 'pg', e.target.value)} 
                        className="w-16 px-2 py-1 text-center rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" 
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input 
                        type="number" min="0" max="20" 
                        value={sc.isian || ''} 
                        onChange={(e) => handleScoreChange(s.id, 'isian', e.target.value)} 
                        className="w-16 px-2 py-1 text-center rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" 
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input 
                        type="number" min="0" max="15" 
                        value={sc.uraian || ''} 
                        onChange={(e) => handleScoreChange(s.id, 'uraian', e.target.value)} 
                        className="w-16 px-2 py-1 text-center rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" 
                      />
                    </td>
                    <td className="p-3 text-center font-bold text-primary-600 dark:text-primary-400">{sc.score || '0'}</td>
                    <td className="p-3 text-center font-bold">{raport}</td>
                    <td className="p-3 text-center">{pred}</td>
                    <td className="p-3 text-center">{status}</td>
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
        title="Hapus Nilai SAS?"
        message={`Apakah Anda yakin ingin menghapus semua nilai SAS di ${store.classes.find(c => c.id === classId)?.name} (Semester ${semester})?`}
        confirmText="Ya, Hapus Semua"
      />
    </>
  );
}
