"use client";

import { useStore } from "@/store/useStore";
import { Download, Upload, X, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";

export function SASScores() {
  const store = useStore();
  const [classId, setClassId] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [search, setSearch] = useState("");

  const filteredClasses = store.classes.filter(c => c.year === store.activeYear);
  const isValidClass = filteredClasses.some(c => c.id === classId);
  const students = isValidClass 
    ? store.students.filter(s => 
        s.classId === classId && 
        (!search || s.name.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search))
      ) 
    : [];

  const getWeeklyAvg = (studentId: string, clsId: string) => {
    const sems = store.weeklyScores.filter((x) => x.studentId === studentId && x.classId === clsId);
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

  const getPred = (v: number) => (v >= 90 ? 'A' : v >= 80 ? 'B' : v >= 75 ? 'C' : 'D');

  const handleScoreChange = (studentId: string, val: string) => {
    store.setSASScores((prev) => {
      let exists = false;
      const next = prev.map(s => {
        if (s.studentId === studentId && s.classId === classId) {
          exists = true;
          return { ...s, score: val ? Number(val) : '' };
        }
        return s;
      });
      if (!exists) {
        next.push({ studentId, classId, score: val ? Number(val) : '' });
      }
      return next;
    });
  };

  const exportSAS = () => {
    if (!classId) return toast.error('Pilih kelas terlebih dahulu');
    const cls = store.classes.find(c => c.id === classId);
    const data = students.map(s => {
      const sc = store.sasScores.find(x => x.studentId === s.id && x.classId === classId) || { score: '' };
      const avgW = getWeeklyAvg(s.id, classId);
      const raport = avgW !== null && sc.score !== '' && sc.score !== undefined ? ((avgW + +sc.score) / 2).toFixed(1) : '-';
      return {
        'Nama': s.name, 'NIS': s.nis, 'Nilai SAS': sc.score || '-', 'Nilai Raport': raport,
        'Predikat': raport !== '-' ? getPred(+raport) : '-',
        'Status': raport !== '-' ? (+raport >= 75 ? 'Tuntas' : 'Belum Tuntas') : '-'
      };
    });
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Nilai SAS');
    XLSX.writeFile(wb, `nilai_sas_${cls?.name}.xlsx`);
  };

  const downloadTemplate = () => {
    if (!classId) return toast.error('Pilih kelas terlebih dahulu');
    const cls = store.classes.find(c => c.id === classId);
    const data = students.map(s => ({
      'Nama': s.name, 'NIS': s.nis, 'Nilai SAS': ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template SAS');
    XLSX.writeFile(wb, `template_sas_${cls?.name}.xlsx`);
  };

  const importSAS = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        store.setSASScores((prev) => {
          let next = [...prev];
          data.forEach((row: any) => {
            const student = students.find(s => s.nis === String(row['NIS'] || '') || s.name === row['Nama']);
            if (student) {
              const val = row['Nilai SAS'];
              if (val !== undefined && val !== '-' && val !== '') {
                const existingIndex = next.findIndex(s => s.studentId === student.id && s.classId === classId);
                if (existingIndex >= 0) {
                  next[existingIndex] = { ...next[existingIndex], score: Number(val) };
                } else {
                  next.push({ studentId: student.id, classId, score: Number(val) });
                }
                count++;
              }
            }
          });
          return next;
        });
        
        if (count > 0) toast.success(`${count} data nilai SAS berhasil diimport`);
        else toast.error('Tidak ada data nilai SAS yang valid untuk diimport');
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
        <select value={classId} onChange={(e) => setClassId(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none transition text-sm">
          <option value="">Pilih Kelas</option>
          {filteredClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={exportSAS} className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium flex items-center gap-1.5 shadow-sm transition text-sm">
          <Download size={15} /> Export
        </button>
        <button onClick={() => setShowImport(true)} className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium flex items-center gap-1.5 shadow-sm transition text-sm">
          <Upload size={15} /> Import
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

      <div className="glass rounded-2xl overflow-x-auto overflow-y-auto scrollbar-hide shadow-sm w-full">
        {!isValidClass ? (
          <p className="p-6 text-center text-gray-400 text-sm">Pilih kelas untuk melihat nilai</p>
        ) : students.length === 0 ? (
          <p className="p-6 text-center text-gray-400 text-sm">Belum ada siswa di kelas ini</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="p-3 text-left font-semibold text-xs">Nama</th>
                <th className="p-3 font-semibold text-xs text-center">Nilai SAS</th>
                <th className="p-3 font-semibold text-xs text-center">Nilai Raport</th>
                <th className="p-3 font-semibold text-xs text-center">Predikat</th>
                <th className="p-3 font-semibold text-xs text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {students.map(s => {
                const sc = store.sasScores.find(x => x.studentId === s.id && x.classId === classId) || { score: '' };
                const avgW = getWeeklyAvg(s.id, classId);
                const raport = avgW !== null && sc.score !== '' && sc.score !== undefined ? ((avgW + +sc.score) / 2).toFixed(1) : '-';
                const pred = raport !== '-' ? getPred(+raport) : '-';
                const status = raport !== '-' ? (+raport >= 75 ? <span className="text-primary-600 font-medium">Tuntas</span> : <span className="text-red-500 font-medium">Belum Tuntas</span>) : '-';

                return (
                  <tr key={s.id} className="dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                    <td className="p-3 font-medium text-sm">{s.name}</td>
                    <td className="p-3 text-center">
                      <input 
                        type="number" min="0" max="100" 
                        value={sc.score} 
                        onChange={(e) => handleScoreChange(s.id, e.target.value)} 
                        className="score-input rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white py-1 outline-none focus:ring-2 focus:ring-primary-500" 
                      />
                    </td>
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
    </>
  );
}
