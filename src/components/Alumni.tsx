"use client";

import { useStore } from "@/store/useStore";
import { getProfile } from "@/lib/data";
import { Printer, GraduationCap } from "lucide-react";
import { useState } from "react";

export function Alumni() {
  const store = useStore();
  
  // Cari semua kelas 6 yang BUKAN tahun ajaran aktif saat ini
  const alumniClasses = store.classes.filter(c => c.name.includes("Kelas 6") && c.year !== store.activeYear).sort((a, b) => b.year.localeCompare(a.year));
  const graduatedYears = Array.from(new Set(alumniClasses.map(c => c.year)));
  
  const [selectedYear, setSelectedYear] = useState(graduatedYears[0] || "");
  
  const selectedClass = alumniClasses.find(c => c.year === selectedYear);
  const students = selectedClass ? store.students.filter(s => s.classId === selectedClass.id) : [];

  const getWeeklyAvg = (sid: string, cid: string) => {
    const sems = store.weeklyScores.filter(x => x.studentId === sid && x.classId === cid);
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

  const calcPracticeCat = (pr: any, cat: string) => {
    if (cat === 'sholat') {
      const pVals = Object.values(pr.sholat_p || {}).filter(v => v !== '') as number[];
      const kVals = Object.values(pr.sholat_k || {}).filter(v => v !== '') as number[];
      if (!pVals.length && !kVals.length) return '-';
      const pAvg = pVals.length ? pVals.reduce((a, b) => a + b, 0) / pVals.length : 0;
      const kAvg = kVals.length ? kVals.reduce((a, b) => a + b, 0) / kVals.length : 0;
      return ((pAvg * 0.7) + (kAvg * 0.3)).toFixed(1);
    }
    const vals = Object.values(pr[cat] || {}).filter(v => v !== '') as number[];
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '-';
  };

  const calcFinalPractice = (pr: any) => {
    const w = calcPracticeCat(pr, 'wudhu');
    const q = calcPracticeCat(pr, 'quran');
    const sh = calcPracticeCat(pr, 'sholat');
    const t = calcPracticeCat(pr, 'tayamum');
    if ([w, q, sh, t].includes('-')) return '-';
    return ((+w * 0.25) + (+q * 0.25) + (+sh * 0.35) + (+t * 0.15)).toFixed(1);
  };

  const getPred = (v: number) => (v >= 90 ? 'A' : v >= 80 ? 'B' : v >= 75 ? 'C' : 'D');

  const getReportData = (sid: string) => {
    const student = store.students.find(x => x.id === sid);
    const avgW = getWeeklyAvg(sid, selectedClass?.id || '');
    const sasRec = store.sasScores.find(x => x.studentId === sid && x.classId === selectedClass?.id);
    const prRec = store.practiceScores.find(x => x.studentId === sid && x.classId === selectedClass?.id);
    const sas = sasRec && sasRec.score !== '' ? +sasRec.score : null;
    const praktik = prRec ? calcFinalPractice(prRec) : '-';
    
    // K6 ASAJ
    const asajRec = store.asajScores.find(x => x.studentId === sid);
    let asajVal: any = '-';
    if (asajRec && asajRec.pg !== '' && asajRec.essay !== '') {
      asajVal = ((+asajRec.pg * 0.7) + (+asajRec.essay * 0.3)).toFixed(1);
    }

    let raport: number | null = null;
    if (avgW !== null && sas !== null) raport = (avgW * 0.6) + (sas * 0.4);

    return {
      avgW, sas, raport, praktik, asaj: asajVal,
      desc: raport && raport >= 75 ? `${student?.name} telah mencapai ketuntasan belajar` : `${student?.name} perlu bimbingan khusus`
    };
  };

  const printSingle = (s: any) => {
    const data = getReportData(s.id);
    const profile = getProfile();
    
    const htmlContent = `
      <html><head><title>Surat Kelulusan - ${s.name}</title>
      <style>
        body { font-family: 'Times New Roman', serif; margin: 40px; color: #111; line-height: 1.5; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; }
        .header p { margin: 2px 0; font-size: 14px; }
        .title { text-align: center; font-size: 18px; font-weight: bold; margin: 30px 0; text-decoration: underline; }
        .info table { margin-bottom: 30px; font-size: 15px; }
        .info td { padding: 4px 0; }
        .info td:first-child { width: 150px; }
        table.scores { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
        table.scores th, table.scores td { border: 1px solid #000; padding: 8px; text-align: center; }
        table.scores th { background: #f0f0f0; }
        .status { text-align: center; margin: 40px 0; font-size: 18px; font-weight: bold; padding: 15px; border: 2px dashed #000; }
        .footer { float: right; text-align: center; width: 250px; margin-top: 50px; }
        .signature { height: 80px; }
      </style></head><body>
      <div class="header">
        <h1>SURAT KETERANGAN LULUS PENDIDIKAN AGAMA ISLAM</h1>
        <p>${profile.school}</p>
        <p>Tahun Ajaran ${selectedYear}</p>
      </div>
      <div class="title">SURAT KETERANGAN KELULUSAN</div>
      <div class="info">
        <p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p>
        <table>
          <tr><td>Nama Lengkap</td><td>: <strong>${s.name}</strong></td></tr>
          <tr><td>NIS / NISN</td><td>: ${s.nis} / ${s.nisn || '-'}</td></tr>
        </table>
        <p>Telah menempuh seluruh program pembelajaran Pendidikan Agama Islam dan Budi Pekerti dan memperoleh hasil ujian akhir sebagai berikut:</p>
      </div>
      <table class="scores">
        <thead><tr><th>Komponen</th><th>Nilai Akhir</th><th>Predikat</th></tr></thead>
        <tbody>
          <tr><td>Nilai Rata-rata Harian</td><td>${data.avgW?.toFixed(1) || '-'}</td><td>${data.avgW ? getPred(data.avgW) : '-'}</td></tr>
          <tr><td>Ujian SAS Kelas 6</td><td>${data.sas || '-'}</td><td>${data.sas ? getPred(+data.sas) : '-'}</td></tr>
          <tr><td>Ujian Praktik Ibadah</td><td>${data.praktik}</td><td>${data.praktik !== '-' ? getPred(+data.praktik) : '-'}</td></tr>
          <tr><td>Ujian Tulis ASAJ</td><td>${data.asaj}</td><td>${data.asaj !== '-' ? getPred(+data.asaj) : '-'}</td></tr>
        </tbody>
      </table>
      <div class="status">
        Dinyatakan: LULUS
      </div>
      <div class="footer">
        <p>Guru PAIBP,</p>
        <div class="signature"></div>
        <p><strong>${profile.name}</strong><br>${profile.nip ? 'NIP. ' + profile.nip : ''}</p>
      </div>
      </body></html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(htmlContent);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); win.close(); }, 500);
    }
  };

  if (graduatedYears.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-slate-800 rounded-3xl shadow-sm text-center border border-gray-100 dark:border-slate-700 fade-in">
        <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
          <GraduationCap size={40} className="text-primary-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Belum Ada Data Lulusan</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">Data kelulusan akan otomatis muncul di sini ketika tahun ajaran baru dimulai dan siswa kelas 6 saat ini telah lulus.</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="text-primary-500" /> Data Alumni & Lulusan
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Rekapitulasi kelulusan siswa Kelas 6 dari tahun-tahun sebelumnya.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary-500 shadow-sm w-full sm:w-auto">
            {graduatedYears.map(y => <option key={y} value={y}>Lulusan Tahun {y}</option>)}
          </select>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 text-left border-b border-gray-100 dark:border-slate-700">
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">NIS</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">NAMA LULUSAN</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">TAHUN LULUS</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-center">NILAI AKHIR (ASAJ)</th>
                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50 bg-white dark:bg-slate-800">
              {students.map(s => {
                const data = getReportData(s.id);
                return (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                    <td className="p-4 text-gray-600 dark:text-gray-400">{s.nis}</td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white">{s.name}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">{selectedYear}</td>
                    <td className="p-4 text-center font-mono font-bold text-primary-600 dark:text-primary-400">{data.asaj}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => printSingle(s)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 dark:text-blue-400 rounded-lg font-semibold transition text-xs border border-blue-200 dark:border-blue-800">
                        <Printer size={14} /> Cetak SKL
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {students.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Tidak ada data siswa lulusan pada tahun ajaran ini.</div>
          )}
        </div>
      </div>
    </div>
  );
}
