"use client";

import { useStore } from "@/store/useStore";
import { Plus, Download, Upload, Trash2, X, Check, FileSpreadsheet, Edit, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import { ConfirmModal } from "./ConfirmModal";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";

export function Students() {
  const store = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nis, setNis] = useState("");
  const [nisn, setNisn] = useState("");
  const [name, setName] = useState("");
  const [classId, setClassId] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [deleteData, setDeleteData] = useState<{ id: string, name: string } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const addStudent = () => {
    if (!nis || !name) return toast.error('NIS dan Nama wajib diisi');
    if (!classId) return toast.error('Pilih kelas terlebih dahulu');
    if (editingId) {
      store.setStudents((prev) => prev.map(s => s.id === editingId ? { ...s, nis: nis.trim(), nisn: nisn.trim(), name: name.trim(), classId } : s));
      toast.success('Data siswa berhasil diupdate');
    } else {
      store.setStudents((prev) => [...prev, { id: Date.now().toString(), nis: nis.trim(), nisn: nisn.trim(), name: name.trim(), classId }]);
      toast.success('Siswa berhasil ditambahkan');
    }
    setNis(""); setNisn(""); setName(""); setShowAdd(false); setEditingId(null);
  };

  const handleEdit = (s: any) => {
    setEditingId(s.id);
    setNis(s.nis);
    setNisn(s.nisn || '');
    setName(s.name);
    setClassId(s.classId);
    setShowAdd(true);
  };

  const confirmDelete = (id: string, stName: string) => {
    setDeleteData({ id, name: stName });
  };

  const performDelete = () => {
    if (!deleteData) return;
    const { id } = deleteData;
    store.setStudents((prev) => prev.filter(s => s.id !== id));
    store.setWeeklyScores((prev) => prev.filter(w => w.studentId !== id));
    store.setSASScores((prev) => prev.filter(s => s.studentId !== id));
    store.setPracticeScores((prev) => prev.filter(p => p.studentId !== id));
    store.setASAJScores((prev) => prev.filter(a => a.studentId !== id));
    toast.success('Data siswa berhasil dihapus');
  };

  const exportStudents = () => {
    const data = filtered.map(s => ({
      'NIS': s.nis,
      'NISN': s.nisn || '',
      'Nama': s.name,
      'Kelas': filteredClasses.find(c => c.id === s.classId)?.name || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Siswa');
    XLSX.writeFile(wb, 'data_siswa.xlsx');
  };

  const downloadTemplate = () => {
    const data = [{ 'NIS': '', 'NISN': '', 'Nama': '', 'Kelas': 'Contoh: Kelas 1' }];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Siswa');
    XLSX.writeFile(wb, 'template_siswa.xlsx');
  };

  const importStudents = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target?.result, { type: 'array' });
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      const imported = data.map((row: any, idx) => {
        const cls = filteredClasses.find(c => c.name === row['Kelas']);
        return {
          id: Date.now().toString() + idx,
          nis: String(row['NIS'] || ''),
          nisn: String(row['NISN'] || ''),
          name: row['Nama'] || '',
          classId: cls?.id || ''
        };
      }).filter(s => s.nis && s.name && s.classId);
      store.setStudents((prev) => [...prev, ...imported]);
      toast.success(`${imported.length} siswa berhasil diimport`);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const filteredClasses = store.classes.filter(c => c.year === store.activeYear);

  let filtered = store.students.filter(s => {
    const c = store.classes.find(x => x.id === s.classId);
    return c && c.year === store.activeYear && 
      (!search || s.name.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search) || (s.nisn && s.nisn.includes(search))) &&
      (!filterClass || s.classId === filterClass);
  });

  if (sortConfig) {
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key as keyof typeof a] || '';
      let bValue = b[sortConfig.key as keyof typeof b] || '';
      
      if (sortConfig.key === 'classId') {
        aValue = store.classes.find(c => c.id === a.classId)?.name || '';
        bValue = store.classes.find(c => c.id === b.classId)?.name || '';
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key === columnKey) {
      return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="inline ml-1 text-primary-500" /> : <ChevronDown size={14} className="inline ml-1 text-primary-500" />;
    }
    return <ChevronDown size={14} className="inline ml-1 opacity-20 group-hover:opacity-100 transition-opacity" />;
  };

  return (
    <>
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm fade-in" style={{ position: 'fixed' }}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-slate-700">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Upload size={18} className="text-amber-500" /> Import Data Siswa
              </h3>
              <button onClick={() => setShowImport(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">
                Silakan unduh template Excel terlebih dahulu, isi data siswa, lalu unggah kembali file tersebut.
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={downloadTemplate} className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors border border-blue-200 dark:border-slate-700">
                  <FileSpreadsheet size={18} /> Download Template Excel
                </button>
                <div className="relative">
                  <input type="file" accept=".xlsx,.xls" onChange={(e) => { importStudents(e); setShowImport(false); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
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
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
        <button onClick={() => setShowAdd(!showAdd)} className="px-3 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-medium flex items-center gap-1.5 shadow-sm transition text-sm">
          <Plus size={15} /> Tambah Siswa
        </button>
        <button onClick={exportStudents} className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium flex items-center gap-1.5 shadow-sm transition text-sm">
          <Download size={15} /> Export
        </button>
        <button onClick={() => setShowImport(true)} className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium flex items-center gap-1.5 shadow-sm transition text-sm">
          <Upload size={15} /> Import
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm fade-in" style={{ position: 'fixed' }}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {editingId ? <Edit size={18} className="text-blue-500" /> : <Plus size={18} className="text-primary-500" />} 
                {editingId ? 'Edit Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button onClick={() => { setShowAdd(false); setEditingId(null); setNis(""); setNisn(""); setName(""); }} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">NIS <span className="text-red-500">*</span></label>
                  <input value={nis} onChange={e => setNis(e.target.value)} placeholder="Masukkan NIS" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">NISN</label>
                  <input value={nisn} onChange={e => setNisn(e.target.value)} placeholder="Masukkan NISN (Opsional)" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Nama Siswa <span className="text-red-500">*</span></label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Masukkan Nama Lengkap" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Kelas <span className="text-red-500">*</span></label>
                  <select value={classId} onChange={e => setClassId(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none transition text-sm">
                    <option value="">Pilih Kelas</option>
                    {filteredClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2 border-t border-gray-100 dark:border-slate-700">
                <button onClick={() => { setShowAdd(false); setEditingId(null); setNis(""); setNisn(""); setName(""); }} className="px-4 py-2.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition text-sm">
                  Batal
                </button>
                <button onClick={addStudent} className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold flex items-center gap-2 shadow-sm transition text-sm">
                  <Check size={16} /> Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-3 flex gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari NIS, NISN, atau Nama Siswa..." className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 flex-1 transition text-sm" />
        <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none transition text-sm">
          <option value="">Semua Kelas</option>
          {filteredClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="glass rounded-2xl overflow-x-auto shadow-sm w-full max-h-[60vh]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-20 bg-white dark:bg-slate-800 shadow-sm">
            <tr className="bg-gray-50 dark:bg-slate-700/50 text-left">
              <th onClick={() => handleSort('nis')} className="p-3 font-semibold text-gray-600 dark:text-gray-300 text-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600 transition group select-none">
                <div className="flex items-center">NIS <SortIcon columnKey="nis" /></div>
              </th>
              <th onClick={() => handleSort('name')} className="p-3 font-semibold text-gray-600 dark:text-gray-300 text-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600 transition group select-none">
                <div className="flex items-center">NAMA SISWA <SortIcon columnKey="name" /></div>
              </th>
              <th onClick={() => handleSort('nisn')} className="p-3 font-semibold text-gray-600 dark:text-gray-300 text-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600 transition group select-none">
                <div className="flex items-center">NISN <SortIcon columnKey="nisn" /></div>
              </th>
              <th onClick={() => handleSort('classId')} className="p-3 font-semibold text-gray-600 dark:text-gray-300 text-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600 transition group select-none">
                <div className="flex items-center">KELAS <SortIcon columnKey="classId" /></div>
              </th>
              <th className="p-3 font-semibold text-gray-600 dark:text-gray-300 text-xs">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {filtered.map(s => {
              const cn = store.classes.find(c => c.id === s.classId)?.name || '-';
              return (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 dark:text-gray-200 transition">
                  <td className="p-3 text-sm">{s.nis}</td>
                  <td className="p-3 font-medium text-sm">{s.name}</td>
                  <td className="p-3 text-sm">{s.nisn || '-'}</td>
                  <td className="p-3 text-sm">{cn}</td>
                  <td className="p-3 flex gap-1">
                    <button onClick={() => handleEdit(s)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition">
                      <Edit size={15} />
                    </button>
                    <button onClick={() => confirmDelete(s.id, s.name)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
        Menampilkan {filtered.length} dari {store.students.length} siswa
      </div>
      </div>
      <ConfirmModal 
        isOpen={!!deleteData}
        onClose={() => setDeleteData(null)}
        onConfirm={performDelete}
        title="Hapus Data Siswa?"
        message={`Apakah Anda yakin ingin menghapus siswa "${deleteData?.name}"? Seluruh nilai yang berkaitan dengan siswa ini juga akan terhapus selamanya.`}
        confirmText="Ya, Hapus Siswa"
      />
    </>
  );
}
