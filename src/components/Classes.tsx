"use client";

import { useStore, ClassData } from "@/store/useStore";
import { Plus, Download, Upload, Edit, Trash2, X, FileSpreadsheet, BookOpen, Save } from "lucide-react";
import { useState } from "react";
import { ConfirmModal } from "./ConfirmModal";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";

export function Classes() {
  const store = useStore();
  const [name, setName] = useState("");
  const [year, setYear] = useState(store.activeYear);
  const [showImport, setShowImport] = useState(false);
  const [deleteData, setDeleteData] = useState<{ id: string, name: string } | null>(null);
  const [editingBabClass, setEditingBabClass] = useState<ClassData | null>(null);
  const [tempBabNames, setTempBabNames] = useState<string[]>(Array(10).fill(""));
  
  const filteredClasses = store.classes.filter(c => c.year === store.activeYear);

  const addClass = () => {
    if (!name.trim()) return toast.error('Nama kelas wajib diisi');
    store.setClasses((prev) => [...prev, { id: Date.now().toString(), name: name.trim(), year: year.trim() }]);
    setName("");
  };

  const confirmDeleteClass = (id: string, clsName: string) => {
    setDeleteData({ id, name: clsName });
  };

  const performDelete = () => {
    if (!deleteData) return;
    const { id } = deleteData;
    store.setClasses((prev) => prev.filter(c => c.id !== id));
    toast.success('Kelas berhasil dihapus');
  };

  const openBabModal = (cls: ClassData) => {
    setEditingBabClass(cls);
    setTempBabNames(cls.babNames || Array(10).fill(""));
  };

  const saveBabNames = () => {
    if (!editingBabClass) return;
    store.setClasses(prev => prev.map(c => 
      c.id === editingBabClass.id ? { ...c, babNames: tempBabNames } : c
    ));
    setEditingBabClass(null);
    toast.success('Nama bab berhasil disimpan');
  };

  const exportClasses = () => {
    const data = store.classes.map((c) => ({ 'Kelas': c.name, 'Tahun Ajaran': c.year }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kelas');
    XLSX.writeFile(wb, 'data_kelas.xlsx');
  };

  const downloadTemplate = () => {
    const data = [{ 'Kelas': '', 'Tahun Ajaran': '' }];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Kelas');
    XLSX.writeFile(wb, 'template_kelas.xlsx');
  };

  const importClasses = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target?.result, { type: 'array' });
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      const imported = data.map((row: any, idx) => ({
        id: Date.now().toString() + idx,
        name: row['Kelas'] || '',
        year: row['Tahun Ajaran'] || ''
      })).filter(c => c.name);
      store.setClasses((prev) => [...prev, ...imported]);
      toast.success(`${imported.length} kelas berhasil diimport`);
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
                <Upload size={18} className="text-amber-500" /> Import Data Kelas
              </h3>
              <button onClick={() => setShowImport(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">
                Silakan unduh template Excel terlebih dahulu, isi data kelas, lalu unggah kembali file tersebut.
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={downloadTemplate} className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors border border-blue-200 dark:border-slate-700">
                  <FileSpreadsheet size={18} /> Download Template Excel
                </button>
                <div className="relative">
                  <input type="file" accept=".xlsx,.xls" onChange={(e) => { importClasses(e); setShowImport(false); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20">
                    <Upload size={18} /> Pilih File & Import
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingBabClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm fade-in" style={{ position: 'fixed' }}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-slate-700 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen size={18} className="text-primary-500" /> Konfigurasi Nama Bab/Materi
                </h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Kelas: {editingBabClass.name}</p>
              </div>
              <button onClick={() => setEditingBabClass(null)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              {tempBabNames.map((bab, i) => (
                <div key={i} className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Bab / Sumatif {i + 1} {i < 5 ? '(Sem 1)' : '(Sem 2)'}
                  </label>
                  <input 
                    value={bab}
                    onChange={(e) => {
                      const next = [...tempBabNames];
                      next[i] = e.target.value;
                      setTempBabNames(next);
                    }}
                    placeholder={`Masukkan nama materi ${i + 1}...`}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition text-xs"
                  />
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-gray-100 dark:border-slate-700 bg-gray-50/30 dark:bg-slate-800/30 flex justify-end">
              <button 
                onClick={saveBabNames}
                className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
              >
                <Save size={18} /> Simpan Nama Bab
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl fade-in">
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        <input 
          value={name} onChange={(e) => setName(e.target.value)} 
          placeholder="Nama Kelas (cth: 6B)" 
          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition text-sm" 
        />
        <input 
          value={year} onChange={(e) => setYear(e.target.value)} 
          placeholder="Tahun Ajaran" 
          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition text-sm" 
        />
        <button onClick={addClass} className="px-3 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-medium flex items-center gap-1.5 shadow-sm transition text-sm">
          <Plus size={15} /> Tambah
        </button>
        <button onClick={exportClasses} className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium flex items-center gap-1.5 shadow-sm transition text-sm">
          <Download size={15} /> Export
        </button>
        <button onClick={() => setShowImport(true)} className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium flex items-center gap-1.5 shadow-sm transition text-sm">
          <Upload size={15} /> Import
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden shadow-sm w-full max-h-[60vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-20 bg-white dark:bg-slate-800 shadow-sm">
            <tr className="bg-gray-50 dark:bg-slate-700/50 text-left">
              <th className="p-3 font-semibold text-gray-600 dark:text-gray-300 text-xs">Kelas</th>
              <th className="p-3 font-semibold text-gray-600 dark:text-gray-300 text-xs">Tahun Ajaran</th>
              <th className="p-3 font-semibold text-gray-600 dark:text-gray-300 text-xs">Siswa</th>
              <th className="p-3 font-semibold text-gray-600 dark:text-gray-300 text-xs">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {filteredClasses.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">Belum ada kelas untuk tahun ajaran {store.activeYear}.</td>
              </tr>
            ) : (
              filteredClasses.map((c) => {
                const count = store.students.filter(s => s.classId === c.id).length;
                return (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 dark:text-gray-200 transition">
                    <td className="p-3 font-medium text-sm">{c.name}</td>
                    <td className="p-3 text-sm">{c.year}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
                        {count}
                      </span>
                    </td>
                    <td className="p-3 flex gap-1">
                      <button onClick={() => openBabModal(c)} className="p-1.5 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition" title="Konfigurasi Bab">
                        <BookOpen size={15} />
                      </button>
                      <button onClick={() => { setName(c.name); setYear(c.year); store.setClasses(p => p.filter(x => x.id !== c.id)); }} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition">
                        <Edit size={15} />
                      </button>
                      <button onClick={() => confirmDeleteClass(c.id, c.name)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
      <ConfirmModal 
        isOpen={!!deleteData}
        onClose={() => setDeleteData(null)}
        onConfirm={performDelete}
        title="Hapus Kelas?"
        message={`Apakah Anda yakin ingin menghapus kelas "${deleteData?.name}"? Seluruh data siswa dan nilai di kelas ini akan terhapus selamanya.`}
        confirmText="Ya, Hapus Semua"
      />
    </>
  );
}
