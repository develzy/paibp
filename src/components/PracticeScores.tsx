"use client";

import { useStore } from "@/store/useStore";
import { Download, Upload, AlertCircle, X, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";

export function PracticeScores() {
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

  const handleScoreChange = (studentId: string, category: string, val: string) => {
    store.setPracticeScores((prev) => {
      let exists = false;
      const next = prev.map(pr => {
        if (pr.studentId === studentId && pr.classId === classId) {
          exists = true;
          return { ...pr, [category]: val };
        }
        return pr;
      });
      if (!exists) {
        next.push({
          studentId,
          classId,
          wudhu: category === 'wudhu' ? val : '',
          quran: category === 'quran' ? val : '',
          sholat: category === 'sholat' ? val : '',
          tayamum: category === 'tayamum' ? val : ''
        } as any);
      }
      return next;
    });
  };

  const calcAverage = (pr: any) => {
    if (!pr) return '-';
    let sum = 0, count = 0;
    ['wudhu', 'quran', 'sholat', 'tayamum'].forEach(cat => {
      if (pr[cat] && !isNaN(Number(pr[cat]))) {
        sum += Number(pr[cat]);
        count++;
      }
    });
    return count > 0 ? (sum / count).toFixed(1) : '-';
  };

  const downloadTemplate = () => {
    const data = students.map(s => ({
      'NIS': s.nis,
      'Nama': s.name,
      'Wudhu': '',
      'Al-Quran': '',
      'Sholat': '',
      'Tayamum': ''
    }));
    if (data.length === 0) data.push({ 'NIS': '', 'Nama': 'Contoh Siswa', 'Wudhu': '', 'Al-Quran': '', 'Sholat': '', 'Tayamum': '' } as any);
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Praktik');
    XLSX.writeFile(wb, 'template_praktik_simple.xlsx');
  };

  const exportPractice = () => {
    const data = students.map(s => {
      const pr = store.practiceScores.find(x => x.studentId === s.id && x.classId === classId) || {} as any;
      return {
        'NIS': s.nis,
        'Nama': s.name,
        'Wudhu': pr.wudhu || '',
        'Al-Quran': pr.quran || '',
        'Sholat': pr.sholat || '',
        'Tayamum': pr.tayamum || '',
        'Rata-rata': calcAverage(pr)
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Praktik');
    XLSX.writeFile(wb, 'data_praktik_kelas6.xlsx');
  };

  const importPractice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'array' });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        let count = 0;
        
        store.setPracticeScores((prev) => {
          const next = [...prev];
          data.forEach((row: any) => {
            const student = students.find(s => s.nis === String(row['NIS']) || s.name === row['Nama']);
            if (student) {
              const existingIndex = next.findIndex(p => p.studentId === student.id && p.classId === classId);
              const newData = {
                studentId: student.id,
                classId,
                wudhu: row['Wudhu'] || '',
                quran: row['Al-Quran'] || '',
                sholat: row['Sholat'] || '',
                tayamum: row['Tayamum'] || ''
              };
              
              if (existingIndex >= 0) {
                next[existingIndex] = { ...next[existingIndex], ...newData } as any;
              } else {
                next.push(newData as any);
              }
              count++;
            }
          });
          return next;
        });
        
        if (count > 0) toast.success(`${count} data praktik berhasil diimport`);
        else toast.error('Tidak ada data valid untuk diimport');
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
                <Upload size={18} className="text-amber-500" /> Import Penilaian Praktik
              </h3>
              <button onClick={() => setShowImport(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">
                Silakan unduh template Excel terlebih dahulu, isi nilai praktik, lalu unggah kembali.
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={downloadTemplate} className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors border border-blue-200 dark:border-slate-700">
                  <FileSpreadsheet size={18} /> Download Template Excel
                </button>
                <div className="relative">
                  <input type="file" accept=".xlsx,.xls" onChange={(e) => { importPractice(e); setShowImport(false); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
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
        <div className="glass rounded-2xl p-4 mb-4 shadow-sm bg-amber-50/60 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/20">
        <div className="flex gap-2 items-start">
          <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <p className="font-semibold mb-0.5 text-xs">Penilaian Praktik — Kelas 6</p>
            <p className="text-xs text-amber-700 dark:text-amber-300">Isi nilai praktik untuk {kelas6?.name || 'Kelas 6'} secara langsung.</p>
          </div>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-2 justify-center">
        <button onClick={exportPractice} className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium flex items-center gap-1.5 shadow-sm transition text-sm">
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
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 transition text-sm shadow-sm" 
          />
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden shadow-sm w-full">
        {!classId ? (
          <p className="p-6 text-center text-gray-400 text-sm">Belum ada kelas 6</p>
        ) : students.length === 0 ? (
          <p className="p-6 text-center text-gray-400 text-sm">Belum ada siswa di kelas 6</p>
        ) : (
          <>
            <div className="overflow-x-auto overflow-y-auto scrollbar-hide" style={{ maxHeight: '60vh' }}>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-700 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-left min-w-[150px] font-semibold text-xs sticky left-0 bg-gray-50 dark:bg-slate-700">Nama Siswa</th>
                    <th className="p-3 font-semibold text-xs text-center">Wudhu</th>
                    <th className="p-3 font-semibold text-xs text-center">Al-Qur'an</th>
                    <th className="p-3 font-semibold text-xs text-center">Sholat</th>
                    <th className="p-3 font-semibold text-xs text-center">Tayamum</th>
                    <th className="p-3 font-semibold text-xs text-center">Rata-rata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {students.map(s => {
                    const pr = store.practiceScores.find(x => x.studentId === s.id && x.classId === classId) || {} as any;
                    return (
                      <tr key={s.id} className="dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                        <td className="p-3 font-medium text-xs sticky left-0 bg-white dark:bg-slate-800">{s.name}</td>
                        <td className="p-2 text-center align-middle">
                          <input type="number" min="0" max="100" value={pr.wudhu || ''} onChange={e => handleScoreChange(s.id, 'wudhu', e.target.value)} className="w-16 px-2 py-1.5 text-center text-xs rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-amber-500 transition" />
                        </td>
                        <td className="p-2 text-center align-middle">
                          <input type="number" min="0" max="100" value={pr.quran || ''} onChange={e => handleScoreChange(s.id, 'quran', e.target.value)} className="w-16 px-2 py-1.5 text-center text-xs rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-amber-500 transition" />
                        </td>
                        <td className="p-2 text-center align-middle">
                          <input type="number" min="0" max="100" value={pr.sholat || ''} onChange={e => handleScoreChange(s.id, 'sholat', e.target.value)} className="w-16 px-2 py-1.5 text-center text-xs rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-amber-500 transition" />
                        </td>
                        <td className="p-2 text-center align-middle">
                          <input type="number" min="0" max="100" value={pr.tayamum || ''} onChange={e => handleScoreChange(s.id, 'tayamum', e.target.value)} className="w-16 px-2 py-1.5 text-center text-xs rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-amber-500 transition" />
                        </td>
                        <td className="p-3 text-center font-bold text-amber-600 dark:text-amber-400 text-xs">
                          {calcAverage(pr)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
}
