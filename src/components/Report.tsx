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
    const cls = store.classes.find(c => c.id === classId);
    
    let htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Raport Kelas ${cls?.name}</title><style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Lora:wght@700&display=swap');
      body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background: white; }
      .page { width: 210mm; min-height: 297mm; padding: 15mm; margin: 0 auto; background: white; position: relative; page-break-after: always; box-sizing: border-box; border-top: 8px solid #059669; }
      .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); color: rgba(0,0,0,0.03); font-size: 35px; font-weight: 900; pointer-events: none; white-space: nowrap; text-align: center; z-index: 0; }
      .content { position: relative; z-index: 10; }
      .header { text-align: center; margin-bottom: 25px; border-bottom: 2px double #e2e8f0; padding-bottom: 15px; }
      .school-name { font-family: 'Lora', serif; font-size: 22px; font-weight: bold; color: #064e3b; margin: 0; text-transform: uppercase; }
      .school-info { font-size: 10px; color: #64748b; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px; }
      .report-title { font-size: 14px; font-weight: 700; margin: 15px 0; text-decoration: underline; text-underline-offset: 3px; text-align: center; }
      .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; font-size: 12px; border: 1px solid #f1f5f9; padding: 12px; border-radius: 8px; background: #f8fafc; }
      .info-row { display: flex; margin-bottom: 3px; }
      .info-label { width: 90px; color: #64748b; }
      .info-value { font-weight: 700; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
      th { background: #f8fafc; padding: 8px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #475569; font-weight: 700; }
      td { padding: 8px; border-bottom: 1px solid #f1f5f9; }
      .val-cell { font-weight: 700; text-align: center; }
      .pred-cell { text-align: center; }
      .highlight-row { background: #f0fdf4; font-weight: bold; }
      .description-box { margin: 15px 0; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }
      .desc-header { background: #f8fafc; padding: 6px 10px; font-weight: 700; font-size: 10px; border-bottom: 1px solid #e2e8f0; }
      .desc-body { padding: 10px; font-size: 11px; line-height: 1.4; font-style: italic; }
      .signature-area { display: grid; grid-template-columns: 1fr 1.2fr 1fr; gap: 10px; margin-top: 30px; font-size: 11px; text-align: center; }
      .sig-box { display: flex; flex-direction: column; justify-content: space-between; min-height: 80px; }
      .sig-name { font-weight: 700; text-decoration: underline; }
      @media print { body { background: white; } .no-print { display: none; } }
    </style></head><body>`;
    
    students.forEach(st => {
      const data = getReportData(st.id);
      htmlContent += `
      <div class="page">
        <div class="watermark">Aplikasi PAIBP Assessment<br/>Smart System v4.0</div>
        <div class="content">
          <div class="header">
            <h1 class="school-name">SDN KALISALAK 01</h1>
            <p class="school-info">Dinas Pendidikan dan Kebudayaan Kabupaten Banyumas</p>
          </div>
          <div class="report-title">LAPORAN HASIL BELAJAR PESERTA DIDIK</div>
          <div class="student-info">
            <div>
              <div class="info-row"><span class="info-label">Nama Siswa</span><span class="info-value">: ${st.name}</span></div>
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
              <tr><th style="width:40px;">NO</th><th>ASPEK PENILAIAN</th><th style="text-align:center;">NILAI</th><th style="text-align:center;">PREDIKAT</th></tr>
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
            <div class="sig-box"><p>Orang Tua/Wali,</p><div style="margin-top: 35px; border-bottom: 1px solid #111; width: 80%; margin: 0 auto;"></div></div>
            <div class="sig-box"><p>Mengetahui,<br/>Kepala Sekolah</p><div style="margin-top: 25px;"><p class="sig-name">${profile.school_head || '........................'}</p><p style="font-size:9px;">NIP. ${profile.school_head_nip || '........................'}</p></div></div>
            <div class="sig-box"><p>Kalisalak, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p><p>Guru PAIBP</p><div style="margin-top: 25px;"><p class="sig-name">${profile.name}</p><p style="font-size:9px;">NIP. ${profile.nip || '........................'}</p></div></div>
          </div>
        </div>
      </div>`;
    });
    
    htmlContent += `</body></html>`;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for assets to load then trigger print
      printWindow.onload = function() {
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          // We don't close immediately to let the user finish the save dialog
        }, 300);
      };
    }
  };

  const exportSingleReport = () => {
    const element = document.getElementById('report-card-capture');
    if (!element) return toast.error('Gagal menemukan data raport');
    
    const st = store.students.find(x => x.id === studentId);
    
    // Load html2pdf dynamically if not exists
    const runExport = () => {
      const opt = {
        margin: 10,
        filename: `Raport_${st?.name || 'Siswa'}_${cls?.name || ''}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      // @ts-ignore
      window.html2pdf().set(opt).from(element).save();
    };

    // @ts-ignore
    if (window.html2pdf) {
      runExport();
    } else {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.onload = runExport;
      document.head.appendChild(script);
      toast.success('Menyiapkan mesin PDF...');
    }
  };

  const renderCard = () => {
    if (!s || !cls) return null;
    const data = getReportData(s.id);
    return (
      <div id="report-card-capture" className="bg-white dark:bg-slate-900 shadow-2xl rounded-sm border-t-[6px] border-primary-600 p-8 lg:p-12 max-w-[850px] mx-auto text-slate-800 dark:text-slate-100 font-sans print:shadow-none print:border-none print:p-0 relative overflow-hidden">
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
