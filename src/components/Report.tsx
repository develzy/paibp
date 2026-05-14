"use client";

import { useStore } from "@/store/useStore";
import { getProfile } from "@/lib/data";
import { Download, Printer, Package } from "lucide-react";
import { useState } from "react";
import { ConfirmModal } from "./ConfirmModal";

export function Report() {
  const store = useStore();
  const [classId, setClassId] = useState("");
  const [semester, setSemester] = useState<number>(1);
  const [studentId, setStudentId] = useState("");
  const [search, setSearch] = useState("");
  const [alertData, setAlertData] = useState<{ title: string, message: string } | null>(null);

  const filteredClasses = store.classes.filter(c => c.year === store.activeYear);
  const isValidClass = filteredClasses.some(c => c.id === classId);
  const students = isValidClass 
    ? store.students.filter(s => 
        s.classId === classId && 
        (!search || s.name.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search))
      ) 
    : [];
  const s = store.students.find(x => x.id === studentId);
  const cls = store.classes.find(c => c.id === classId);
  const profile = getProfile();

  const getWeeklyAvg = (sid: string, cid: string, semId?: number) => {
    const sems = store.weeklyScores.filter(x => x.studentId === sid && x.classId === cid && (semId ? x.semester === semId : x.semester === semester));
    if (!sems.length) return null;
    let sum = 0, count = 0;
    sems.forEach(sem => {
      const nw = sem.weeks || 20;
      for (let i = 1; i <= nw; i++) {
        const v = sem['m' + i];
        if (v !== '' && v !== undefined && v !== null) { sum += +v; count++; }
      }
    });
    return count > 0 ? sum / count : null;
  };

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
    const sh = getPracticeVal(pr, 'sholat');
    const t = getPracticeVal(pr, 'tayamum');
    if ([w, q, sh, t].includes('-')) return '-';
    return ((+w * 0.25) + (+q * 0.25) + (+sh * 0.35) + (+t * 0.15)).toFixed(1);
  };

  const getPred = (v: number) => (v >= 90 ? 'A' : v >= 80 ? 'B' : v >= 75 ? 'C' : 'D');

  const getReportData = (sid: string) => {
    const student = store.students.find(x => x.id === sid);
    const avgW = getWeeklyAvg(sid, classId);
    const sas = store.sasScores.find(x => x.studentId === sid && x.classId === classId && x.semester === semester)?.score || '';
    const raport = avgW !== null && sas !== '' ? ((avgW + +sas) / 2) : null;
    const pr = store.practiceScores.find(x => x.studentId === sid && x.classId === classId);
    const praktik = pr ? calcFinalPractice(pr) : '-';
    const isK6 = cls?.name.includes('6');
    const asajData = isK6 ? (() => {
      const a = store.asajScores.find(x => x.studentId === sid);
      if (!a) return { nilai: '-' };
      if (a.pg === '' || a.essay === '') return { nilai: '-' };
      return { nilai: (((+a.pg + +a.essay) / 50) * 100).toFixed(1) };
    })() : { nilai: '-' };
    const asaj = asajData.nilai;

    const sem1 = store.weeklyScores.find(x => x.studentId === sid && x.classId === classId && x.semester === 1);
    const sem2 = store.weeklyScores.find(x => x.studentId === sid && x.classId === classId && x.semester === 2);
    
    function semAvg(sem: any) {
      if (!sem) return '-';
      const nw = sem.weeks || 20;
      let sum = 0, cnt = 0;
      for (let i = 1; i <= nw; i++) {
        const v = sem['m' + i];
        if (v !== '' && v !== undefined && v !== null) { sum += +v; cnt++; }
      }
      return cnt > 0 ? (sum / cnt).toFixed(1) : '-';
    }
    
    const avgSem1 = semAvg(sem1);
    const avgSem2 = semAvg(sem2);
    
    const curAvg = semester === 1 ? avgSem1 : avgSem2;

    let desc = '';
    if (raport !== null) {
      if (+raport >= 90) desc = `${student?.name} menunjukkan penguasaan yang sangat baik dalam pembelajaran PAIBP.`;
      else if (+raport >= 80) desc = `${student?.name} menunjukkan penguasaan yang baik dalam pembelajaran PAIBP.`;
      else if (+raport >= 75) desc = `${student?.name} menunjukkan penguasaan yang cukup. Perlu peningkatan.`;
      else desc = `${student?.name} perlu bimbingan lebih lanjut dalam pembelajaran PAIBP.`;
    }

    return { avgW, sas, raport, praktik, asaj, isK6, avgSem1, avgSem2, desc };
  };

  const exportReportClass = () => {
    if (!classId) return alert('Pilih kelas terlebih dahulu');
    let htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:20px;background:#f5f5f5}.page{max-width:800px;margin:20px auto;background:white;border:1px solid #e0e0e0;padding:30px;page-break-after:always;border-radius:6px}.header{text-align:center;margin-bottom:25px;border-bottom:2px solid #059669;padding-bottom:15px}.header h2{margin:0;color:#111;font-size:18px}.header p{margin:3px 0;color:#888;font-size:11px}.info{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;font-size:12px}.info p{margin:2px 0}.info strong{color:#111}.info span{color:#888}table{width:100%;border-collapse:collapse;margin-bottom:15px}thead{background:#f0fdf4}th{padding:8px;text-align:left;font-weight:600;font-size:11px;border-bottom:2px solid #059669}td{padding:6px;border-bottom:1px solid #eee;font-size:11px}.highlight{background:#f0fdf4;font-weight:bold}.status{margin:12px 0;padding:10px;background:#f9f9f9;border-left:3px solid #059669;border-radius:3px;font-size:11px}.footer{text-align:right;margin-top:25px;font-size:11px}.signature{margin-top:35px;font-weight:bold}.logo-text{font-size:9px;color:#aaa;text-align:center;margin-bottom:10px}</style></head><body>`;
    
    students.forEach(st => {
      const data = getReportData(st.id);
      htmlContent += `<div class="page"><p class="logo-text">DEVELZY — Smart Assessment</p><div class="header"><h2>RAPORT DIGITAL PAIBP</h2><p>${profile.school || 'Sekolah'} — ${cls?.year || ''} (Semester ${semester})</p></div><div class="info"><p><span>Nama:</span> <strong>${st.name}</strong></p><p><span>NIS:</span> <strong>${st.nis}</strong></p><p><span>Kelas:</span> <strong>${cls?.name}</strong></p></div><table><thead><tr><th>Komponen</th><th>Nilai</th><th>Predikat</th></tr></thead><tbody><tr><td>Rata-rata Semester 1</td><td>${data.avgSem1}</td><td>${data.avgSem1 !== '-' ? getPred(+data.avgSem1) : '-'}</td></tr><tr><td>Rata-rata Semester 2</td><td>${data.avgSem2}</td><td>${data.avgSem2 !== '-' ? getPred(+data.avgSem2) : '-'}</td></tr><tr><td>Mingguan (Sem ${semester})</td><td>${data.avgW?.toFixed(1) || '-'}</td><td>${data.avgW ? getPred(data.avgW) : '-'}</td></tr><tr><td>SAS ${semester}</td><td>${data.sas || '-'}</td><td>${data.sas ? getPred(+data.sas) : '-'}</td></tr><tr class="highlight"><td>Raport Sem ${semester}</td><td>${data.raport?.toFixed(1) || '-'}</td><td>${data.raport ? getPred(+data.raport) : '-'}</td></tr><tr><td>Praktik</td><td>${data.praktik}</td><td>${data.praktik !== '-' ? getPred(+data.praktik) : '-'}</td></tr>${data.isK6 ? `<tr><td>ASAJ</td><td>${data.asaj}</td><td>${data.asaj !== '-' ? getPred(+data.asaj) : '-'}</td></tr>` : ''}</tbody></table><div class="status"><p><strong>${data.raport ? (+data.raport >= 75 ? 'TUNTAS' : 'BELUM TUNTAS') : '-'}</strong></p><p>${data.desc}</p></div><div class="footer"><p>Guru PAIBP,</p><div class="signature">${profile.name}</div><p>${profile.nip ? 'NIP: ' + profile.nip : ''}</p></div></div>`;
    });
    
    htmlContent += `</body></html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raport_${cls?.name}_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSingleReport = () => {
    if (!studentId || !cls) return toast.error('Pilih siswa terlebih dahulu');
    const st = store.students.find(x => x.id === studentId);
    if (!st) return;
    const data = getReportData(st.id);
    
    let htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:20px;background:#f5f5f5}.page{max-width:800px;margin:20px auto;background:white;border:1px solid #e0e0e0;padding:30px;border-radius:6px}.header{text-align:center;margin-bottom:25px;border-bottom:2px solid #059669;padding-bottom:15px}.header h2{margin:0;color:#111;font-size:18px}.header p{margin:3px 0;color:#888;font-size:11px}.info{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;font-size:12px}.info p{margin:2px 0}.info strong{color:#111}table{width:100%;border-collapse:collapse;margin-bottom:15px}th{padding:8px;text-align:left;font-size:11px;border-bottom:2px solid #059669}td{padding:6px;border-bottom:1px solid #eee;font-size:11px}.highlight{background:#f0fdf4;font-weight:bold}.status{margin:12px 0;padding:10px;background:#f9f9f9;border-left:3px solid #059669;border-radius:3px;font-size:11px}.footer{text-align:right;margin-top:25px;font-size:11px}.signature{margin-top:35px;font-weight:bold}</style></head><body>`;
    
    htmlContent += `<div class="page"><div class="header"><h2>RAPORT DIGITAL PAIBP</h2><p>${profile.school || 'Sekolah'} — ${cls?.year || ''} (Semester ${semester})</p></div><div class="info"><p>Nama: <strong>${st.name}</strong></p><p>NIS: <strong>${st.nis}</strong></p><p>Kelas: <strong>${cls?.name}</strong></p></div><table><thead><tr><th>Komponen</th><th>Nilai</th><th>Predikat</th></tr></thead><tbody><tr><td>Rata-rata Semester 1</td><td>${data.avgSem1}</td><td>${data.avgSem1 !== '-' ? getPred(+data.avgSem1) : '-'}</td></tr><tr><td>Rata-rata Semester 2</td><td>${data.avgSem2}</td><td>${data.avgSem2 !== '-' ? getPred(+data.avgSem2) : '-'}</td></tr><tr><td>Mingguan (Sem ${semester})</td><td>${data.avgW?.toFixed(1) || '-'}</td><td>${data.avgW ? getPred(data.avgW) : '-'}</td></tr><tr><td>SAS ${semester}</td><td>${data.sas || '-'}</td><td>${data.sas ? getPred(+data.sas) : '-'}</td></tr><tr class="highlight"><td>Raport Sem ${semester}</td><td>${data.raport?.toFixed(1) || '-'}</td><td>${data.raport ? getPred(+data.raport) : '-'}</td></tr><tr><td>Praktik</td><td>${data.praktik}</td><td>${data.praktik !== '-' ? getPred(+data.praktik) : '-'}</td></tr>${data.isK6 ? `<tr><td>ASAJ</td><td>${data.asaj}</td><td>${data.asaj !== '-' ? getPred(+data.asaj) : '-'}</td></tr>` : ''}</tbody></table><div class="status"><p><strong>${data.raport ? (+data.raport >= 75 ? 'TUNTAS' : 'BELUM TUNTAS') : '-'}</strong></p><p>${data.desc}</p></div><div class="footer"><p>Guru PAIBP,</p><div class="signature">${profile.name}</div><p>${profile.nip ? 'NIP: ' + profile.nip : ''}</p></div></div>`;
    htmlContent += `</body></html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raport_${st.name}_sem${semester}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderCard = () => {
    if (!s || !cls) return null;
    const data = getReportData(s.id);

    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-lg max-w-2xl mx-auto border border-gray-100 dark:border-slate-700">
        <div className="text-center mb-6 border-b pb-5 dark:border-slate-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white font-serif">RAPORT DIGITAL PAIBP</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{profile.school || 'Sekolah'} — Tahun Ajaran {cls?.year}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-6 text-sm dark:text-gray-200">
          <p className="text-xs"><span className="text-gray-500">Nama:</span> <strong>{s.name}</strong></p>
          <p className="text-xs"><span className="text-gray-500">NIS:</span> <strong>{s.nis}</strong></p>
          <p className="text-xs"><span className="text-gray-500">Kelas:</span> <strong>{cls.name}</strong></p>
        </div>
        <table className="w-full text-sm mb-6 border border-gray-200 dark:border-slate-600 rounded-xl overflow-hidden">
          <thead className="bg-primary-50 dark:bg-primary-900/20">
            <tr>
              <th className="p-2.5 text-left font-semibold text-xs text-primary-900 dark:text-primary-100">Komponen</th>
              <th className="p-2.5 font-semibold text-xs text-primary-900 dark:text-primary-100">Nilai</th>
              <th className="p-2.5 font-semibold text-xs text-primary-900 dark:text-primary-100">Predikat</th>
            </tr>
          </thead>
          <tbody className="dark:text-gray-200 text-xs">
            <tr className="border-t border-gray-100 dark:border-slate-700"><td className="p-2.5 text-gray-500">Rata-rata Semester 1</td><td className="p-2.5 text-center">{data.avgSem1}</td><td className="p-2.5 text-center">{data.avgSem1 !== '-' ? getPred(+data.avgSem1) : '-'}</td></tr>
            <tr className="border-t border-gray-100 dark:border-slate-700"><td className="p-2.5 text-gray-500">Rata-rata Semester 2</td><td className="p-2.5 text-center">{data.avgSem2}</td><td className="p-2.5 text-center">{data.avgSem2 !== '-' ? getPred(+data.avgSem2) : '-'}</td></tr>
            <tr className="border-t border-gray-100 dark:border-slate-700 font-medium"><td className="p-2.5">Rata-rata Mingguan (Sem {semester})</td><td className="p-2.5 text-center">{data.avgW?.toFixed(1) || '-'}</td><td className="p-2.5 text-center">{data.avgW ? getPred(data.avgW) : '-'}</td></tr>
            <tr className="border-t border-gray-100 dark:border-slate-700 font-medium"><td className="p-2.5">Nilai SAS {semester}</td><td className="p-2.5 text-center">{data.sas || '-'}</td><td className="p-2.5 text-center">{data.sas ? getPred(+data.sas) : '-'}</td></tr>
            <tr className="border-t border-gray-100 dark:border-slate-700 font-bold bg-primary-50/50 dark:bg-primary-900/10"><td className="p-2.5">Nilai Raport Sem {semester}</td><td className="p-2.5 text-center">{data.raport?.toFixed(1) || '-'}</td><td className="p-2.5 text-center">{data.raport ? getPred(+data.raport) : '-'}</td></tr>
            <tr className="border-t border-gray-100 dark:border-slate-700"><td className="p-2.5">Nilai Praktik</td><td className="p-2.5 text-center">{data.praktik}</td><td className="p-2.5 text-center">{data.praktik !== '-' ? getPred(+data.praktik) : '-'}</td></tr>
            {data.isK6 && <tr className="border-t border-gray-100 dark:border-slate-700"><td className="p-2.5">Nilai ASAJ</td><td className="p-2.5 text-center">{data.asaj}</td><td className="p-2.5 text-center">{data.asaj !== '-' ? getPred(+data.asaj) : '-'}</td></tr>}
          </tbody>
        </table>
        <div className="mb-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Status: <strong className={data.raport && +data.raport >= 75 ? 'text-primary-600' : 'text-red-500'}>{data.raport ? (+data.raport >= 75 ? 'TUNTAS' : 'BELUM TUNTAS') : '-'}</strong></p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{data.desc}</p>
        </div>
        <div className="text-right mt-6 pt-4 border-t dark:border-slate-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Guru PAIBP,</p>
          <p className="text-sm font-bold text-gray-800 dark:text-white mt-8 font-serif">{profile.name}</p>
          <p className="text-[11px] text-gray-400">{profile.nip ? 'NIP: ' + profile.nip : ''}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl fade-in">
      <div className="flex flex-wrap gap-2 mb-4 no-print justify-center">
        <select value={classId} onChange={(e) => { setClassId(e.target.value); setStudentId(""); setSearch(""); }} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none transition text-sm">
          <option value="">Pilih Kelas</option>
          {filteredClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        
        <div>
          <select value={semester} onChange={(e) => setSemester(Number(e.target.value))} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none transition text-sm">
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
        </div>
        
        {isValidClass && (
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Cari nama/NIS..." 
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition text-sm w-32" 
          />
        )}

        <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white outline-none transition text-sm max-w-[200px]">
          <option value="">Pilih Siswa</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button onClick={exportSingleReport} className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium flex items-center gap-1.5 shadow-sm transition text-sm">
          <Download size={15} /> Export
        </button>
        <button onClick={exportReportClass} className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium flex items-center gap-1.5 shadow-sm transition text-sm">
          <Package size={15} /> Export Kelas
        </button>
        <button onClick={() => window.print()} className="px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-xl font-medium flex items-center gap-1.5 shadow-sm transition text-sm">
          <Printer size={15} /> Print
        </button>
      </div>

      <div className="w-full">
        {renderCard()}
      </div>

      <ConfirmModal 
        isOpen={!!alertData}
        onClose={() => setAlertData(null)}
        onConfirm={() => setAlertData(null)}
        title={alertData?.title || ''}
        message={alertData?.message || ''}
        confirmText="Dimengerti"
        showCancel={false}
        variant="primary"
      />
    </div>
  );
}
