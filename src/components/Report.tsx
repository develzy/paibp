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
    a.download = `Raport_Kelas_${cls?.name}_${cls?.year.replace('/', '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSingleReport = () => {
    if (!studentId || !cls) return toast.error('Pilih siswa terlebih dahulu');
    const st = store.students.find(x => x.id === studentId);
    if (!st) return;
    const data = getReportData(st.id);
    
    let htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Raport - ${st.name}</title><style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Lora:wght@700&display=swap');
      body { font-family: 'Inter', sans-serif; margin: 0; padding: 40px; background: #f0f2f5; color: #1e293b; }
      .page { max-width: 800px; margin: 0 auto; background: white; padding: 60px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border-radius: 4px; position: relative; border-top: 8px solid #059669; }
      .header { text-align: center; margin-bottom: 40px; border-bottom: 2px double #e2e8f0; padding-bottom: 20px; }
      .school-name { font-family: 'Lora', serif; font-size: 24px; font-weight: bold; color: #064e3b; margin: 0; letter-spacing: 0.5px; text-transform: uppercase; }
      .school-info { font-size: 11px; color: #64748b; margin: 5px 0 0; text-transform: uppercase; letter-spacing: 1px; }
      .report-title { font-size: 16px; font-weight: 700; margin: 25px 0; text-decoration: underline; text-underline-offset: 4px; color: #1e293b; }
      .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 35px; font-size: 13px; border: 1px solid #f1f5f9; padding: 20px; border-radius: 8px; background: #f8fafc; }
      .info-row { display: flex; margin-bottom: 6px; }
      .info-label { width: 100px; color: #64748b; font-weight: 500; }
      .info-value { font-weight: 700; color: #0f172a; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
      th { background: #f8fafc; padding: 12px 15px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #475569; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
      td { padding: 12px 15px; border-bottom: 1px solid #f1f5f9; }
      .val-cell { font-weight: 700; text-align: center; }
      .pred-cell { text-align: center; font-weight: 600; }
      .highlight-row { background: #f0fdf4; }
      .highlight-row td { color: #065f46; font-weight: 800; border-bottom: 2px solid #10b981; }
      .description-box { margin: 30px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
      .desc-header { background: #f8fafc; padding: 10px 15px; font-weight: 700; font-size: 12px; border-bottom: 1px solid #e2e8f0; color: #475569; }
      .desc-body { padding: 15px; font-size: 13px; line-height: 1.6; color: #334155; font-style: italic; }
      .signature-area { display: grid; grid-template-columns: 1fr 1.5fr 1fr; gap: 20px; margin-top: 60px; font-size: 13px; text-align: center; }
      .sig-box { display: flex; flex-direction: column; justify-content: space-between; min-height: 120px; }
      .sig-name { font-weight: 700; text-decoration: underline; margin-bottom: 2px; }
      .sig-nip { font-size: 11px; color: #64748b; }
      @media print { body { background: white; padding: 0; } .page { box-shadow: none; border: none; padding: 0; } }
    </style></head><body>`;
    
    htmlContent += `<div class="page">
      <div class="header">
        <h1 class="school-name">SDN KALISALAK 01</h1>
        <p class="school-info">Kecamatan Kebasen — Kabupaten Banyumas</p>
      </div>
      <div style="text-align:center;"><h2 class="report-title">LAPORAN HASIL BELAJAR PESERTA DIDIK</h2></div>
      <div class="student-info">
        <div>
          <div class="info-row"><span class="info-label">Nama</span><span class="info-value">: ${st.name}</span></div>
          <div class="info-row"><span class="info-label">NIS / NISN</span><span class="info-value">: ${st.nis} / ${st.nisn || '-'}</span></div>
        </div>
        <div>
          <div class="info-row"><span class="info-label">Kelas</span><span class="info-value">: ${cls?.name}</span></div>
          <div class="info-row"><span class="info-label">Semester</span><span class="info-value">: ${semester} (${semester === 1 ? 'Ganjil' : 'Genap'})</span></div>
          <div class="info-row"><span class="info-label">Thn Ajaran</span><span class="info-value">: ${cls?.year}</span></div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:50px;">NO</th>
            <th>ASPEK PENILAIAN</th>
            <th style="text-align:center; width:80px;">NILAI</th>
            <th style="text-align:center; width:100px;">PREDIKAT</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>1</td><td>Rata-rata Nilai Semester 1</td><td class="val-cell">${data.avgSem1}</td><td class="pred-cell">${data.avgSem1 !== '-' ? getPred(+data.avgSem1) : '-'}</td></tr>
          <tr><td>2</td><td>Rata-rata Nilai Semester 2</td><td class="val-cell">${data.avgSem2}</td><td class="pred-cell">${data.avgSem2 !== '-' ? getPred(+data.avgSem2) : '-'}</td></tr>
          <tr><td>3</td><td>Nilai Harian (Mingguan)</td><td class="val-cell">${data.avgW?.toFixed(1) || '-'}</td><td class="pred-cell">${data.avgW ? getPred(data.avgW) : '-'}</td></tr>
          <tr><td>4</td><td>Sumatif Akhir Semester (SAS)</td><td class="val-cell">${data.sas || '-'}</td><td class="pred-cell">${data.sas ? getPred(+data.sas) : '-'}</td></tr>
          <tr class="highlight-row"><td>5</td><td>NILAI AKHIR RAPORT</td><td class="val-cell">${data.raport?.toFixed(1) || '-'}</td><td class="pred-cell">${data.raport ? getPred(+data.raport) : '-'}</td></tr>
          <tr><td>6</td><td>Penilaian Praktik Keagamaan</td><td class="val-cell">${data.praktik}</td><td class="pred-cell">${data.praktik !== '-' ? getPred(+data.praktik) : '-'}</td></tr>
          ${data.isK6 ? `<tr><td>7</td><td>Asesmen Sumatif Akhir Jenjang</td><td class="val-cell">${data.asaj}</td><td class="pred-cell">${data.asaj !== '-' ? getPred(+data.asaj) : '-'}</td></tr>` : ''}
        </tbody>
      </table>
      <div class="description-box">
        <div class="desc-header">CAPAIAN KOMPETENSI (DESKRIPSI)</div>
        <div class="desc-body">${data.desc}</div>
      </div>
      <div class="signature-area">
        <div class="sig-box">
          <p>Orang Tua/Wali,</p>
          <div style="margin-top: 60px; border-bottom: 1px solid #111; width: 80%; margin-left: auto; margin-right: auto;"></div>
        </div>
        <div class="sig-box">
          <p>&nbsp;</p>
          <p>Mengetahui,<br/>Kepala Sekolah</p>
          <div style="margin-top: 40px;">
            <p class="sig-name">${profile.school_head || '................................'}</p>
            <p class="sig-nip">${profile.school_head_nip ? 'NIP. ' + profile.school_head_nip : 'NIP. ................................'}</p>
          </div>
        </div>
        <div class="sig-box">
          <p>Kalisalak, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p>Guru PAIBP</p>
          <div style="margin-top: 40px;">
            <p class="sig-name">${profile.name}</p>
            <p class="sig-nip">${profile.nip ? 'NIP. ' + profile.nip : 'NIP. ................................'}</p>
          </div>
        </div>
      </div>
    </div>`;
    
    htmlContent += `</body></html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Raport_${st.name}_${cls?.name}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderCard = () => {
    if (!s || !cls) return null;
    const data = getReportData(s.id);
    return (
      <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-sm border-t-[6px] border-primary-600 p-8 lg:p-12 max-w-[850px] mx-auto text-slate-800 dark:text-slate-100 font-sans print:shadow-none print:border-none print:p-0">
        {/* Header Formal */}
        <div className="text-center border-b-2 border-double border-slate-200 dark:border-slate-700 pb-6 mb-8">
          <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">SDN KALISALAK 01</h1>
          <p className="text-[10px] uppercase tracking-[3px] text-slate-500 dark:text-gray-400 font-bold">Dinas Pendidikan dan Kebudayaan Kabupaten Banyumas</p>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-lg font-bold underline decoration-2 underline-offset-4 text-slate-900 dark:text-white">LAPORAN HASIL BELAJAR PESERTA DIDIK</h2>
        </div>

        {/* Info Peserta Didik */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700 text-sm">
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
        <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-lg mb-8">
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
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-12">
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
