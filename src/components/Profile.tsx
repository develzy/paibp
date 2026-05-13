"use client";

import { getProfile, saveProfile } from "@/lib/data";
import { User, Download, Upload, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

export function Profile() {
  const p = getProfile();
  const [name, setName] = useState(p.name || 'Guru PAIBP');
  const [nip, setNip] = useState(p.nip || '');
  const [school, setSchool] = useState(p.school || '');
  const [subject, setSubject] = useState(p.subject || 'Pendidikan Agama Islam dan Budi Pekerti');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile({ name: name.trim() || 'Guru PAIBP', nip: nip.trim(), school: school.trim(), subject: subject.trim() });
    toast.success("Profil berhasil disimpan!");
  };

  const handleBackup = () => {
    try {
      const allData: Record<string, string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('paibp_') || key === 'paibp_store')) {
          allData[key] = localStorage.getItem(key);
        }
      }
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allData));
      const a = document.createElement('a');
      a.setAttribute("href", dataStr);
      a.setAttribute("download", `paibp_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Backup data berhasil diunduh");
    } catch (err) {
      toast.error("Gagal melakukan backup data");
    }
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        let restoredCount = 0;
        for (const key in data) {
          if (data[key] !== null) {
            localStorage.setItem(key, data[key]);
            restoredCount++;
          }
        }
        if (restoredCount > 0) {
          toast.success("Restore data berhasil! Halaman akan dimuat ulang...");
          setTimeout(() => window.location.reload(), 1500);
        } else {
          toast.error("File backup kosong atau tidak valid");
        }
      } catch (err) {
        toast.error("Format file backup tidak valid!");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-2xl w-full fade-in space-y-6">
      <div className="glass rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-slate-700">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <User size={32} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-serif">{name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{subject}</p>
          </div>
        </div>
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Lengkap</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">NIP</label>
            <input value={nip} onChange={e => setNip(e.target.value)} placeholder="Masukkan NIP" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Sekolah</label>
            <input value={school} onChange={e => setSchool(e.target.value)} placeholder="Masukkan nama sekolah" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mata Pelajaran</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition text-sm" />
          </div>
          <button type="submit" className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl transition shadow-lg shadow-primary-500/20 text-sm">
            Simpan Perubahan
          </button>
        </form>
      </div>

      <div className="glass rounded-2xl p-6 md:p-8 shadow-sm border border-red-100 dark:border-red-900/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-500 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Backup & Restore Data</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Seluruh nilai, kelas, dan data siswa tersimpan di dalam memori browser lokal (Local Storage) PC/Laptop ini. Segera lakukan backup secara berkala agar aman apabila Anda membersihkan history / pindah device.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <button type="button" onClick={handleBackup} className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl font-medium text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm">
            <Download size={16} className="text-blue-500" /> Download Backup (.json)
          </button>
          <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl font-medium text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition shadow-sm cursor-pointer">
            <Upload size={16} className="text-amber-500" /> Restore Backup
            <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}
