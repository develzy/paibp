"use client";

import { useStore } from "@/store/useStore";
import { useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { Search, Save, Info, Sparkles, Loader2 } from "lucide-react";

export function AttendanceNotes() {
  const store = useStore();
  const [classId, setClassId] = useState("");
  const [semester, setSemester] = useState<number>(1);
  const [search, setSearch] = useState("");
  const [loadingAi, setLoadingAi] = useState<string | null>(null);

  const filteredClasses = store.classes.filter(c => c.year === store.activeYear);
  const isValidClass = filteredClasses.some(c => c.id === classId);
  
  const students = useMemo(() => {
    if (!isValidClass) return [];
    return store.students.filter(s => 
      s.classId === classId && 
      (!search || s.name.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search))
    );
  }, [isValidClass, store.students, classId, search]);

  const callGemini = async (studentName: string, s: number, i: number, a: number) => {
    const prompt = `Anda adalah seorang wali kelas di sekolah dasar (SD) di Indonesia. 
    Buatkan 1 kalimat saran/catatan wali kelas yang bijak, sopan, dan memotivasi untuk raport siswa bernama "${studentName}".
    Data ketidakhadiran: Sakit: ${s}, Izin: ${i}, Alpa: ${a}.
    Berikan jawaban HANYA berupa 1 kalimat saran saja tanpa awalan apapun.`;

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      return data.result || "Tingkatkan prestasimu dan pertahankan semangat belajarmu.";
    } catch (err) {
      console.error(err);
      return "Tingkatkan prestasimu dan pertahankan semangat belajarmu.";
    }
  };

  const handleAiGenerate = async (studentId: string, studentName: string, s: any, i: any, a: any) => {
    setLoadingAi(studentId);
    const suggestion = await callGemini(studentName, Number(s || 0), Number(i || 0), Number(a || 0));
    handleUpdate(studentId, 'notes', suggestion);
    setLoadingAi(null);
  };

  const generateAllAi = async () => {
    if (!confirm('Ingin men-generate saran untuk SEMUA siswa menggunakan AI Gemini?')) return;
    
    toast.loading('Sedang men-generate saran AI...', { id: 'ai-gen' });
    for (const st of students) {
      const note = store.attendanceNotes.find(n => n.studentId === st.id && n.classId === classId && n.semester === semester) || { s: 0, i: 0, a: 0, notes: '' };
      if (!note.notes || note.notes.trim() === '') {
        const suggestion = await callGemini(st.name, Number(note.s || 0), Number(note.i || 0), Number(note.a || 0));
        handleUpdate(st.id, 'notes', suggestion);
      }
    }
    toast.success('Saran AI berhasil di-generate!', { id: 'ai-gen' });
  };

  const handleUpdate = (studentId: string, field: 's' | 'i' | 'a' | 'notes', val: string) => {
    store.setAttendanceNotes((prev) => {
      let exists = false;
      const next = prev.map(item => {
        if (item.studentId === studentId && item.classId === classId && item.semester === semester) {
          exists = true;
          return { ...item, [field]: field === 'notes' ? val : (val !== '' ? Number(val) : '') };
        }
        return item;
      });
      if (!exists) {
        next.push({
          studentId,
          classId,
          semester,
          s: field === 's' ? Number(val) : '',
          i: field === 'i' ? Number(val) : '',
          a: field === 'a' ? Number(val) : '',
          notes: field === 'notes' ? val : ''
        });
      }
      return next;
    });
  };

  return (
    <div className="w-full max-w-6xl fade-in">
      <div className="glass rounded-2xl p-4 mb-6 shadow-sm bg-blue-50/60 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20">
        <div className="flex gap-2 items-start">
          <Info size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-semibold mb-0.5 text-xs">Absensi & Catatan Wali Kelas (AI Integrated)</p>
            <p className="text-xs text-blue-700 dark:text-blue-300">Gunakan AI Gemini untuk membuat saran raport yang lebih personal dan bervariasi.</p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 justify-center">
        <div>
          <select 
            value={classId} 
            onChange={(e) => setClassId(e.target.value)} 
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none transition text-sm shadow-sm"
          >
            <option value="">Pilih Kelas</option>
            {filteredClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <select 
            value={semester} 
            onChange={(e) => setSemester(Number(e.target.value))} 
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none transition text-sm shadow-sm"
          >
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
        </div>
        {isValidClass && (
          <button 
            onClick={generateAllAi}
            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-emerald-500 hover:from-primary-600 hover:to-emerald-600 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 active:scale-95"
          >
            <Sparkles size={14} /> Generate Semua via Gemini AI
          </button>
        )}
      </div>

      {isValidClass && (
        <div className="mb-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Cari nama atau NIS siswa..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition text-sm shadow-sm" 
          />
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden shadow-sm w-full">
        {!classId ? (
          <p className="p-10 text-center text-gray-400 text-sm">Pilih kelas untuk mulai mengisi absensi dan catatan.</p>
        ) : students.length === 0 ? (
          <p className="p-10 text-center text-gray-400 text-sm">Tidak ada siswa ditemukan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-700 sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-left font-semibold text-xs min-w-[200px]">Nama Peserta Didik</th>
                  <th className="p-3 font-semibold text-xs text-center w-20">Sakit (S)</th>
                  <th className="p-3 font-semibold text-xs text-center w-20">Izin (I)</th>
                  <th className="p-3 font-semibold text-xs text-center w-20">Alpa (A)</th>
                  <th className="p-3 font-semibold text-xs text-left min-w-[300px]">Saran-saran / Catatan Wali Kelas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {students.map(s => {
                  const note = store.attendanceNotes.find(n => n.studentId === s.id && n.classId === classId && n.semester === semester) || { s: '', i: '', a: '', notes: '' };
                  return (
                    <tr key={s.id} className="dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                      <td className="p-3 font-medium text-xs">{s.name}</td>
                      <td className="p-2 text-center">
                        <input 
                          type="number" min="0"
                          value={note.s ?? ''} 
                          onChange={(e) => handleUpdate(s.id, 's', e.target.value)} 
                          className="w-16 px-2 py-1.5 text-center text-xs rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary-500 transition" 
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input 
                          type="number" min="0"
                          value={note.i ?? ''} 
                          onChange={(e) => handleUpdate(s.id, 'i', e.target.value)} 
                          className="w-16 px-2 py-1.5 text-center text-xs rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary-500 transition" 
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input 
                          type="number" min="0"
                          value={note.a ?? ''} 
                          onChange={(e) => handleUpdate(s.id, 'a', e.target.value)} 
                          className="w-16 px-2 py-1.5 text-center text-xs rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary-500 transition" 
                        />
                      </td>
                      <td className="p-2">
                        <div className="relative group">
                          <textarea 
                            rows={2}
                            value={note.notes ?? ''} 
                            onChange={(e) => handleUpdate(s.id, 'notes', e.target.value)} 
                            placeholder="Ketik saran untuk raport..."
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary-500 transition resize-none pr-10"
                          />
                          <button 
                            onClick={() => handleAiGenerate(s.id, s.name, note.s, note.i, note.a)}
                            disabled={loadingAi === s.id}
                            className="absolute right-2 top-2 p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all active:scale-90"
                            title="Generate via Gemini AI"
                          >
                            {loadingAi === s.id ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {isValidClass && (
        <div className="mt-6 flex justify-end">
          <button 
            onClick={() => toast.success('Data absensi & catatan tersimpan otomatis!')}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:scale-105 transition-all"
          >
            <Save size={18} /> Simpan Semua Data
          </button>
        </div>
      )}
    </div>
  );
}
