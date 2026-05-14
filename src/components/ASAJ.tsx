"use client";

import { useStore } from "@/store/useStore";
import { Download, Upload, X, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";

export function ASAJ() {
  const store = useStore();
  const filteredClasses = store.classes.filter(c => c.year === store.activeYear);
  const kelas6 = filteredClasses.find(c => c.name.includes('6'));
  const classId = kelas6?.id || '';
  const [showImport, setShowImport] = useState(false);
  const [search, setSearch] = useState("");
  const students = store.students.filter(s => 
    s.classId === classId && 
    (!search || s.name.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search))
  );

  const handleScoreChange = (studentId: string, field: 'pg' | 'essay', val: string) => {
    store.setASAJScores((prev) => {
      let exists = false;
      const next = prev.map(a => {
        if (a.studentId === studentId) {
          exists = true;
          return { ...a, [field]: val ? Number(val) : '' };
        }
        return a;
      });
      if (!exists) {
        next.push({ studentId, pg: '', essay: '', [field]: val ? Number(val) : '' });
      }
      return next;
    });
  };

  const calcASAJ = (a: any) => {
    if (a.pg === '' || a.pg === undefined || a.essay === '' || a.essay === undefined) return { total: '-', nilai: '-' };
    const total = +a.pg + +a.essay;
    const nilai = ((total / 50) * 100).toFixed(1);
    return { total, nilai };
  };

  const getPred = (v: number) => (v >= 90 ? 'A' : v >= 80 ? 'B' : v >= 75 ? 'C' : 'D');

  const exportASAJ = () => {
    if (!kelas6) return toast.error('Belum ada kelas 6');
    const data = students.map(s => {
      const a = store.asajScores.find(x => x.studentId === s.id) || { pg: '', essay: '' };
      const hasil = calcASAJ(a);
      return {
        'Nama': s.name, 'NIS': s.nis, 'Skor PG': a.pg || '-', 'Skor Uraian': a.essay || '-',
        'Total Skor': hasil.total, 'Nilai': hasil.nilai, 'Predikat': hasil.nilai !== '-' ? getPred(+hasil.nilai) : '-'
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ASAJ');
    XLSX.writeFile(wb, `asaj_${kelas6.name}.xlsx`);
  };

  const downloadTemplate = () => {
    if (!kelas6) return toast.error('Belum ada kelas 6');
    const data = students.map(s => ({
      'Nama': s.name, 'NIS': s.nis, 'Skor PG': '', 'Skor Uraian': ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template ASAJ');
    XLSX.writeFile(wb, `template_asaj_${kelas6.name}.xlsx`);
  };

  const importASAJ = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!kelas6) {
      toast.error('Belum ada kelas 6');
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
        store.setASAJScores((prev) => {
          let next = [...prev];
          data.forEach((row: any) => {
            const student = students.find(s => s.nis === String(row['NIS'] || '') || s.name === row['Nama']);
            if (student) {
              const pg = row['Skor PG'];
              const essay = row['Skor Uraian'];
              let updated = false;
              
              const existingIndex = next.findIndex(a => a.studentId === student.id);
              let a = existingIndex >= 0 ? { ...next[existingIndex] } : { studentId: student.id, pg: '', essay: '' } as any;
              
              if (pg !== undefined && pg !== '-' && pg !== '') { a.pg = Number(pg); updated = true; }
              if (essay !== undefined && essay !== '-' && essay !== '') { a.essay = Number(essay); updated = true; }
              
              if (updated) {
                if (existingIndex >= 0) next[existingIndex] = a;
                else next.push(a);
                count++;
              }
            }
          });
          return next;
        });
        
        if (count > 0) toast.success(`${count} data nilai ASAJ berhasil diimport`);
        else toast.error('Tidak ada data nilai ASAJ yang valid untuk diimport');
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
                <Upload size={18} className="text-amber-500" /> Import Nilai ASAJ
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
                  <input type="file" accept=".xlsx,.xls" onChange={(e) => { importASAJ(e); setShowImport(false); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
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
        <button onClick={exportASAJ} className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium flex items-center gap-1.5 shadow-sm transition text-sm">
          <Download size={15} /> Export
        </button>
        <button onClick={() => setShowImport(true)} className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium flex items-center gap-1.5 shadow-sm transition text-sm">
          <Upload size={15} /> Import
        </button>
      </div>

      {classId && (
        <div className="mb-3">
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Cari nama atau NIS siswa..." 
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition text-sm shadow-sm" 
          />
        </div>
      )}

      <div className="mb-4 p-4 bg-blue-50/60 dark:bg-blue-900/10 rounded-xl text-sm dark:text-gray-300 border border-blue-100 dark:border-blue-800/20">
        <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1.5 text-xs">Pedoman Penilaian ASAJ Kelas 6:</p>
        <ul className="space-y-0.5 text-blue-700 dark:text-blue-200 ml-3 text-xs">
          <li>• PG: 35 soal × 1 = 35 | Uraian: 5 soal × 3 = 15</li>
          <li>• Skor Maks = 50 | Nilai = (PG + Uraian) ÷ 50 × 100</li>
        </ul>
      </div>

      <div className="glass rounded-2xl overflow-x-auto overflow-y-auto scrollbar-hide shadow-sm w-full" style={{ maxHeight: '60vh' }}>
        {!classId ? (
          <p className="p-6 text-center text-gray-400 text-sm">Belum ada kelas 6</p>
        ) : students.length === 0 ? (
          <p className="p-6 text-center text-gray-400 text-sm">Belum ada siswa di kelas 6</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="p-3 text-left font-semibold text-xs">Nama</th>
                <th className="p-3 text-xs font-semibold text-center">PG (0-35)</th>
                <th className="p-3 text-xs font-semibold text-center">Uraian (0-15)</th>
                <th className="p-3 font-semibold text-xs text-center">Total</th>
                <th className="p-3 font-semibold text-xs text-center">Nilai</th>
                <th className="p-3 font-semibold text-xs text-center">Predikat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {students.map(s => {
                const a = store.asajScores.find(x => x.studentId === s.id) || { pg: '', essay: '' } as any;
                const hasil = calcASAJ(a);
                return (
                  <tr key={s.id} className="dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                    <td className="p-3 font-medium text-xs">{s.name}</td>
                    <td className="p-2 text-center align-middle">
                      <input 
                        type="number" min="0" max="35" value={a.pg} 
                        onChange={(e) => handleScoreChange(s.id, 'pg', e.target.value)} 
                        className="score-input rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white py-1 outline-none focus:ring-1 focus:ring-primary-500" 
                      />
                    </td>
                    <td className="p-2 text-center align-middle">
                      <input 
                        type="number" min="0" max="15" value={a.essay} 
                        onChange={(e) => handleScoreChange(s.id, 'essay', e.target.value)} 
                        className="score-input rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white py-1 outline-none focus:ring-1 focus:ring-primary-500" 
                      />
                    </td>
                    <td className="p-2 text-center font-bold text-xs">{hasil.total || '-'}</td>
                    <td className="p-2 text-center font-bold text-primary-600">{hasil.nilai}</td>
                    <td className="p-2 text-center text-xs">{hasil.nilai !== '-' ? getPred(+hasil.nilai) : '-'}</td>
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
