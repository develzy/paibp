"use client";

import { useStore } from "@/store/useStore";
import { getProfile } from "@/lib/data";
import { Download, Printer, Package } from "lucide-react";
import { useState } from "react";
import { ConfirmModal } from "./ConfirmModal";
import { toast } from "react-hot-toast";

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

    // Auto-Description Logic
    let autoDesc = "";
    if (raport === null) {
      autoDesc = "Data nilai belum lengkap untuk dilakukan evaluasi capaian kompetensi.";
    } else if (raport >= 90) {
      autoDesc = `Ananda ${student?.name} menunjukkan penguasaan kompetensi yang sangat baik dalam memahami materi PAI dan Budi Pekerti serta mampu mempraktikkan ajaran agama dengan sangat istiqomah di lingkungan sekolah.`;
    } else if (raport >= 80) {
      autoDesc = `Ananda ${student?.name} menunjukkan penguasaan kompetensi yang baik dalam memahami materi PAI dan Budi Pekerti serta cukup aktif dalam kegiatan praktik keagamaan dan pembiasaan akhlak mulia.`;
    } else if (raport >= 75) {
      autoDesc = `Ananda ${student?.name} menunjukkan penguasaan kompetensi yang cukup dalam memahami materi PAI dan Budi Pekerti, namun memerlukan sedikit bimbingan dalam konsistensi praktik ibadah harian.`;
    } else {
      autoDesc = `Ananda ${student?.name} memerlukan bimbingan lebih lanjut dalam memahami materi dasar PAI dan Budi Pekerti serta perlu penguatan intensif dalam pembiasaan praktik ibadah dan akhlak harian.`;
    }

    return {
      avgSem1, avgSem2, avgW, sas, raport, praktik, asaj, isK6,
      desc: autoDesc
    };
  };

  const exportReportClass = () => {
    if (!classId) return alert('Pilih kelas terlebih dahulu');
    let htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:20px;background:#f5f5f5}.page{max-width:800px;margin:20px auto;background:white;border:1px solid #e0e0e0;padding:30px;page-break-after:always;border-radius:6px}.header{text-align:center;margin-bottom:25px;border-bottom:2px solid #059669;padding-bottom:15px}.header h2{margin:0;color:#111;font-size:18px}.header p{margin:3px 0;color:#888;font-size:11px}.info{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;font-size:12px}.info p{margin:2px 0}.info strong{color:#111}.info span{color:#888}table{width:100%;border-collapse:collapse;margin-bottom:15px}thead{background:#f0fdf4}th{padding:8px;text-align:left;font-weight:600;font-size:11px;border-bottom:2px solid #059669}td{padding:6px;border-bottom:1px solid #eee;font-size:11px}.highlight{background:#f0fdf4;font-weight:bold}.status{margin:12px 0;padding:10px;background:#f9f9f9;border-left:3px solid #059669;border-radius:3px;font-size:11px}.footer{text-align:right;margin-top:25px;font-size:11px}.signature{margin-top:35px;font-weight:bold}.logo-text{font-size:9px;color:#aaa;text-align:center;margin-bottom:10px}</style></head><body>`;
    let htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:20px;background:#f5f5f5}.page{max-width:800px;margin:20px auto;background:white;border:1px solid #e0e0e0;padding:30px;page-break-after:always;border-radius:6px;position:relative;overflow:hidden}.watermark{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-45deg);color:rgba(0,0,0,0.03);font-size:40px;font-weight:900;pointer-events:none;white-space:nowrap}.header{text-align:center;margin-bottom:25px;border-bottom:2px solid #059669;padding-bottom:15px}.header h2{margin:0;color:#111;font-size:18px}.header p{margin:3px 0;color:#888;font-size:11px}.info{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;font-size:12px}.info p{margin:2px 0}.info strong{color:#111}.info span{color:#888}table{width:100%;border-collapse:collapse;margin-bottom:15px}thead{background:#f0fdf4}th{padding:8px;text-align:left;font-weight:600;font-size:11px;border-bottom:2px solid #059669}td{padding:6px;border-bottom:1px solid #eee;font-size:11px}.highlight{background:#f0fdf4;font-weight:bold}.status{margin:12px 0;padding:10px;background:#f9f9f9;border-left:3px solid #059669;border-radius:3px;font-size:11px}.footer{text-align:right;margin-top:25px;font-size:11px}.signature{margin-top:35px;font-weight:bold}.logo-text{font-size:9px;color:#aaa;text-align:center;margin-bottom:10px}@media print{.no-print{display:none}}</style></head><body>`;
    
    students.forEach(st => {
      const data = getReportData(st.id);
      htmlContent += `<div class=\"page\"><div class=\"watermark\">PAIBP ASSESSMENT</div><p class=\"logo-text\">DEVELZY — Smart Assessment</p><div class=\"header\"><h2>RAPORT DIGITAL PAIBP</h2><p>${profile.school || 'Sekolah'} — ${cls?.year || ''} (Semester ${semester})</p></div><div class=\"info\"><p><span>Nama:</span> <strong>${st.name}</strong></p><p><span>NIS:</span> <strong>${st.nis}</strong></p><p><span>Kelas:</span> <strong>${cls?.name}</strong></p></div><table><thead><tr><th>Komponen</th><th>Nilai</th><th>Predikat</th></tr></thead><tbody><tr><td>Rata-rata Semester 1</td><td>${data.avgSem1}</td><td>${data.avgSem1 !== '-' ? getPred(+data.avgSem1) : '-'}</td></tr><tr><td>Rata-rata Semester 2</td><td>${data.avgSem2}</td><td>${data.avgSem2 !== '-' ? getPred(+data.avgSem2) : '-'}</td></tr><tr><td>Mingguan (Sem ${semester})</td><td>${data.avgW?.toFixed(1) || '-'}</td><td>${data.avgW ? getPred(data.avgW) : '-'}</td></tr><tr><td>SAS ${semester}</td><td>${data.sas || '-'}</td><td>${data.sas ? getPred(+data.sas) : '-'}</td></tr><tr class=\"highlight\"><td>Raport Sem ${semester}</td><td>${data.raport?.toFixed(1) || '-'}</td><td>${data.raport ? getPred(+data.raport) : '-'}</td></tr><tr><td>Praktik</td><td>${data.praktik}</td><td>${data.praktik !== '-' ? getPred(+data.praktik) : '-'}</td></tr>${data.isK6 ? `<tr><td>ASAJ</td><td>${data.asaj}</td><td>${data.asaj !== '-' ? getPred(+data.asaj) : '-'}</td></tr>` : ''}</tbody></table><div class=\"status\"><p><strong>${data.raport ? (+data.raport >= 75 ? 'TUNTAS' : 'BELUM TUNTAS') : '-'}</strong></p><p>${data.desc}</p></div><div class=\"footer\"><p>Guru PAIBP,</p><div class=\"signature\">${profile.name}</div><p>${profile.nip ? 'NIP: ' + profile.nip : ''}</p></div></div>`;
    });
    
    htmlContent += `</body></html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.onload = () => win.print();
    }
  };

  const exportSingleReport = () => {
    window.print();
  };

  const renderCard = () => {
    if (!s || !cls) return null;
    const data = getReportData(s.id);
    return (
      <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-sm border-t-[6px] border-primary-600 p-8 lg:p-12 max-w-[850px] mx-auto text-slate-800 dark:text-slate-100 font-sans print:shadow-none print:border-none print:p-0 relative overflow-hidden">
        {/* Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 text-slate-900/[0.03] dark:text-white/[0.02] font-black text-4xl lg:text-5xl pointer-events-none z-0 whitespace-nowrap text-center">
          Aplikasi PAIBP Assessment<br/>Smart System v4.0
        </div>
        
        {/* Header Formal */}
        <div className="relative z-10">
          <div className="text-center border-b-2 border-double border-slate-200 dark:border-slate-700 pb-6 mb-8">
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">SDN KALISALAK 01</h1>
            <p className="text-[10px] uppercase tracking-[3px] text-slate-500 dark:text-gray-400 font-bold">Dinas Pendidikan dan Kebudayaan Kabupaten Banyumas</p>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-lg font-bold underline decoration-2 underline-offset-4 text-slate-900 dark:text-white">LAPORAN HASIL BELAJAR PESERTA DIDIK</h2>
          </div>

          {/* Info Peserta Didik */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-xl border border-slate-100 dark:border-slate-700 text-sm">
            <div className="space-y-2">
              <div className="flex"><span className="w-24 text-slate-500 font-medium">Nama Siswa</span><span className="font-bold">: {s.name}</span></div>
              <div className="flex"><span className="w-24 text-slate-500 font-medium">NIS / NISN</span><span className="font-bold">: {s.nis} / {s.nisn || '-'}</span></div>
            </div>
            <div className="space-y-2">
              <div className="flex"><span className="w-32 text-slate-500 font-medium">Kelas</span><span className="font-bold">: {cls.name}</span></div>
              <div className="flex"><span className="w-32 text-slate-500 font-medium">Semester</span><span className="font-bold">: {semester} ({semester === 1 ? 'Ganjil' : 'Genap'})</span></div>
              <div className="flex"><span className="w-32 text-slate-500 font-medium">Tahun Ajaran</span><span className="font-bold">: {cls.year}</span></div>
            </div>
          </div>

          {/* Tabel Nilai */}
          <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-lg mb-8 bg-white/50 dark:bg-transparent">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <th className="p-4 text-left border-b border-slate-200 dark:border-slate-700 font-bold">NO</th>
                  <th className="p-4 text-left border-b border-slate-200 dark:border-slate-700 font-bold uppercase tracking-wider">Komponen Penilaian</th>
                  <th className="p-4 text-center border-b border-slate-200 dark:border-slate-700 font-bold">NILAI</th>
                  <th className="p-4 text-center border-b border-slate-200 dark:border-slate-700 font-bold">PREDIKAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                <tr><td className="p-4">1</td><td className="p-4">Rata-rata Nilai Semester 1</td><td className="p-4 text-center font-bold">{data.avgSem1}</td><td className="p-4 text-center">{data.avgSem1 !== '-' ? getPred(+data.avgSem1) : '-'}</td></tr>
                <tr><td className="p-4">2</td><td className="p-4">Rata-rata Nilai Semester 2</td><td className="p-4 text-center font-bold">{data.avgSem2}</td><td className="p-4 text-center">{data.avgSem2 !== '-' ? getPred(+data.avgSem2) : '-'}</td></tr>
                <tr><td className="p-4">3</td><td className="p-4">Nilai Harian (Mingguan)</td><td className="p-4 text-center font-bold">{data.avgW?.toFixed(1) || '-'}</td><td className="p-4 text-center">{data.avgW ? getPred(data.avgW) : '-'}</td></tr>
                <tr><td className="p-4">4</td><td className="p-4">Sumatif Akhir Semester (SAS)</td><td className="p-4 text-center font-bold">{data.sas || '-'}</td><td className="p-4 text-center">{data.sas ? getPred(+data.sas) : '-'}</td></tr>
                <tr className="bg-primary-50/30 dark:bg-primary-900/10"><td className="p-4 font-bold text-primary-700 dark:text-primary-400">5</td><td className="p-4 font-bold text-primary-700 dark:text-primary-400">NILAI AKHIR RAPORT</td><td className="p-4 text-center font-extrabold text-primary-700 dark:text-primary-400">{data.raport?.toFixed(1) || '-'}</td><td className="p-4 text-center font-bold text-primary-700 dark:text-primary-400">{data.raport ? getPred(+data.raport) : '-'}</td></tr>
                <tr><td className="p-4">6</td><td className="p-4">Penilaian Praktik Keagamaan</td><td className="p-4 text-center font-bold">{data.praktik}</td><td className="p-4 text-center">{data.praktik !== '-' ? getPred(+data.praktik) : '-'}</td></tr>
                {data.isK6 && <tr><td className="p-4">7</td><td className="p-4">Asesmen Sumatif Akhir Jenjang</td><td className="p-4 text-center font-bold">{data.asaj}</td><td className="p-4 text-center">{data.asaj !== '-' ? getPred(+data.asaj) : '-'}</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Deskripsi */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-12 bg-white/50 dark:bg-transparent">
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-700">Capaian Kompetensi (Deskripsi)</div>
            <div className="p-4 text-sm leading-relaxed italic text-slate-600 dark:text-slate-300">
              "{data.desc}"
            </div>
          </div>

          {/* Tanda Tangan */}
          <div className="grid grid-cols-3 gap-4 text-sm text-center">
            <div className="flex flex-col justify-between h-32">
              <p>Orang Tua/Wali,</p>
              <div className="mt-16 border-b border-slate-400 w-3/4 mx-auto"></div>
            </div>
            <div className="flex flex-col justify-between h-32">
              <p>&nbsp;</p>
              <p className="font-medium">Mengetahui,<br/>Kepala Sekolah</p>
              <div className="mt-8">
                <p className="font-bold underline uppercase">{profile.school_head || '........................'}</p>
                <p className="text-[10px] text-slate-500">NIP. {profile.school_head_nip || '........................'}</p>
              </div>
            </div>
            <div className="flex flex-col justify-between h-32">
              <p>Kalisalak, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-medium">Guru PAIBP</p>
              <div className="mt-8">
                <p className="font-bold underline uppercase">{profile.name}</p>
                <p className="text-[10px] text-slate-500">NIP. {profile.nip || '........................'}</p>
              </div>
            </div>
          </div>
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
