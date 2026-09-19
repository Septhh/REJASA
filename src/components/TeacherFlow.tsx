import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

type Props = { token: string; onExit?: () => void };

export const TeacherFlow: React.FC<Props> = ({ token, onExit }) => {
  const [lab, setLab] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [user, setUser] = useState(null);
  const [journals, setJournals] = useState([]);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [step, setStep] = useState<'lab'|'login'|'schedule'|'form'|'mine'>('lab');
  const [code, setCode] = useState('');
  const [form, setForm] = useState({scheduleId:'',date:new Date().toISOString().slice(0,10),time:'',className:'',subject:'',activity:'',notes:'',studentsCount:0});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLab = async () => {
    setLoading(true); setError('');
    try {
      const result = await api.qr(token);
      setLab(result.lab);
    } catch (e) { setError('QR tidak valid atau sudah tidak aktif.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadLab(); }, [token]);

  useEffect(() => {
    if (!lab || !user) return;
    api.schedule(lab.id, form.date).then(r => setSchedule(r.schedules || [])).catch(()=>setSchedule([]));
    api.myJournals().then(r => setJournals(r.journals || [])).catch(()=>setJournals([]));
  }, [lab, user, form.date]);

  const activeSchedule = useMemo(() => schedule.find(s => s.id===form.scheduleId), [schedule,form.scheduleId]);

  const login = async () => {
    setError('');
    try {
      const result = await api.login(code);
      if (result.user.role !== 'GURU') throw new Error('FORBIDDEN');
      setUser(result.user); setStep('schedule');
    } catch { setError('Kode guru tidak valid atau akun bukan role GURU.'); }
  };

  const submit = async () => {
    setError('');
    try {
      const result = await api.createJournal({
        labId: lab.id, scheduleId: form.scheduleId || null, date: form.date, time: form.time || (activeSchedule ? `${activeSchedule.start_time}–${activeSchedule.end_time}` : ''),
        className: form.className, subject: form.subject, activity: form.activity, notes: form.notes, studentsCount: Number(form.studentsCount)||0
      });
      setJournals(v => [result.journal,...v]); setSelectedJournal(result.journal); setStep('mine');
      setForm(v=>({...v,className:'',subject:'',activity:'',notes:'',studentsCount:0}));
    } catch { setError('Jurnal gagal disimpan. Periksa koneksi API dan data jadwal.'); }
  };

  const openReviews = async (journal) => {
    setSelectedJournal(journal);
    try { const r=await api.reviews(journal.id); setReviews(r.reviews || []); } catch { setReviews([]); }
  };

  const saveCorrection = async () => {
    if (!selectedJournal) return;
    try {
      const updated=await api.updateJournal(selectedJournal.id, selectedJournal);
      setSelectedJournal(updated.journal);
      setJournals(v=>v.map(j=>j.id===updated.journal.id?updated.journal:j));
    } catch { setError('Jurnal tidak dapat diedit pada status saat ini.'); }
  };

  const resubmit = async () => {
    if (!selectedJournal) return;
    try {
      const updated=await api.resubmit(selectedJournal.id);
      setSelectedJournal(updated.journal);
      setJournals(v=>v.map(j=>j.id===updated.journal.id?updated.journal:j));
      const r=await api.reviews(selectedJournal.id); setReviews(r.reviews || []);
    } catch { setError('Resubmit gagal.'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Memuat laboratorium…</div>;
  if (error && !lab) return <div className="min-h-screen flex items-center justify-center p-6"><div className="bg-white border border-rose-200 rounded-2xl p-6 text-sm text-rose-700">{error}</div></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#131b2e] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div><div className="text-xs uppercase tracking-widest font-bold text-[#00685f]">REJASA • Teacher Flow</div><h1 className="text-2xl font-extrabold mt-1">{lab?.name}</h1><p className="text-sm text-slate-500">{lab?.code} • SMAN 3 Salatiga</p></div>
          {onExit && <button onClick={onExit} className="px-3 py-2 rounded-xl bg-white border text-xs font-semibold">Keluar</button>}
        </div>
        {error && <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">{error}</div>}

        {!user && step==='lab' && <section className="bg-white rounded-2xl border p-6 shadow-sm"><h2 className="font-bold text-lg">Laboratorium teridentifikasi</h2><p className="text-sm text-slate-600 mt-2">Guru akan diarahkan ke login sebelum mengisi jurnal.</p><button onClick={()=>setStep('login')} className="mt-5 px-4 py-2 rounded-xl bg-[#00685f] text-white text-sm font-bold">Lanjut ke Login</button></section>}

        {!user && step==='login' && <section className="bg-white rounded-2xl border p-6 shadow-sm max-w-md"><h2 className="font-bold text-lg">Login Guru</h2><p className="text-sm text-slate-500 mt-1">Masukkan kode guru yang diberikan sekolah.</p><input value={code} onChange={e=>setCode(e.target.value)} placeholder="Contoh: ML" className="mt-4 w-full h-10 px-3 rounded-xl border bg-slate-50 uppercase" /><button onClick={login} className="mt-3 w-full px-4 py-2 rounded-xl bg-[#00685f] text-white text-sm font-bold">Masuk</button></section>}

        {user && step==='schedule' && <section className="bg-white rounded-2xl border p-6 shadow-sm"><div className="flex justify-between gap-4"><div><h2 className="font-bold text-lg">Jadwal Penggunaan</h2><p className="text-sm text-slate-500 mt-1">Guru: {user.name} • {lab.name}</p></div><button onClick={()=>setStep('mine')} className="text-xs font-bold text-[#00685f]">Jurnal Saya</button></div><div className="grid gap-3 mt-5">{schedule.length===0 ? <div className="p-4 rounded-xl bg-slate-50 text-sm text-slate-500">Tidak ada jadwal pada tanggal {form.date}.</div> : schedule.map(s=><button key={s.id} onClick={()=>{setForm(v=>({...v,scheduleId:s.id,time:`${s.start_time}–${s.end_time}`,className:s.class_name,activity:s.activity}));setStep('form')}} className="text-left p-4 rounded-xl border hover:border-[#00685f] hover:bg-[#F8FAFC]"><div className="font-bold">{s.start_time}–{s.end_time} • {s.class_name}</div><div className="text-sm text-slate-600 mt-1">{s.activity}</div></button>)}</div></section>}

        {user && step==='form' && <section className="bg-white rounded-2xl border p-6 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-bold text-lg">Form Jurnal</h2><button onClick={()=>setStep('schedule')} className="text-xs text-slate-500">Kembali ke jadwal</button></div><div className="grid sm:grid-cols-2 gap-3 mt-5">{[['Tanggal','date'],['Jam','time'],['Kelas','className'],['Mata Pelajaran','subject']].map(([label,key])=><label key={key} className="text-xs font-semibold">{label}<input value={form[key]} onChange={e=>setForm(v=>({...v,[key]:e.target.value}))} className="mt-1 w-full h-10 px-3 rounded-xl border bg-slate-50" /></label>)}</div><label className="block text-xs font-semibold mt-3">Kegiatan<textarea value={form.activity} onChange={e=>setForm(v=>({...v,activity:e.target.value}))} className="mt-1 w-full p-3 rounded-xl border bg-slate-50" rows={3}/></label><label className="block text-xs font-semibold mt-3">Catatan<textarea value={form.notes} onChange={e=>setForm(v=>({...v,notes:e.target.value}))} className="mt-1 w-full p-3 rounded-xl border bg-slate-50" rows={3}/></label><label className="block text-xs font-semibold mt-3">Jumlah siswa<input type="number" min="0" value={form.studentsCount} onChange={e=>setForm(v=>({...v,studentsCount:e.target.value}))} className="mt-1 w-full h-10 px-3 rounded-xl border bg-slate-50" /></label><button onClick={submit} className="mt-5 px-5 py-2 rounded-xl bg-[#00685f] text-white text-sm font-bold">Submit Jurnal</button></section>}

        {user && step==='mine' && <section className="bg-white rounded-2xl border p-6 shadow-sm"><div className="flex justify-between"><div><h2 className="font-bold text-lg">Jurnal Saya</h2><p className="text-sm text-slate-500 mt-1">Hanya jurnal milik akun guru yang sedang login.</p></div><button onClick={()=>setStep('schedule')} className="text-xs font-bold text-[#00685f]">Buat Jurnal</button></div><div className="space-y-3 mt-5">{journals.length===0 ? <div className="p-4 rounded-xl bg-slate-50 text-sm text-slate-500">Belum ada jurnal.</div> : journals.map(j=><div key={j.id} className="border rounded-xl p-4"><div className="flex justify-between gap-3"><div><div className="font-mono text-xs font-bold text-[#00685f]">{j.code}</div><div className="font-bold mt-1">{j.activity || j.subject}</div><div className="text-xs text-slate-500 mt-1">{j.date} • {j.time} • {j.className}</div></div><span className="text-xs font-bold">{j.status}</span></div><p className="text-sm text-slate-600 mt-3">{j.notes || 'Tidak ada catatan.'}</p><button onClick={()=>openReviews(j)} className="mt-3 text-xs font-bold text-[#00685f]">Detail & Review History</button>{selectedJournal?.id===j.id && <div className="mt-3 pt-3 border-t text-xs"><div className="font-bold mb-2">Review History</div>{reviews.length===0?<div className="text-slate-500">Belum ada review.</div>:reviews.map(r=><div key={r.id} className="py-2"><div className="font-semibold">{r.status} • {r.reviewer_name}</div><div className="text-slate-500">{r.notes}</div></div>)}{j.status==='NEEDS_CORRECTION' && <><textarea value={selectedJournal.notes||''} onChange={e=>setSelectedJournal({...selectedJournal,notes:e.target.value})} className="w-full p-2 rounded-lg border mt-2" rows={3}/><div className="flex gap-2 mt-2"><button onClick={saveCorrection} className="px-3 py-1.5 rounded-lg bg-slate-900 text-white">Simpan Koreksi</button><button onClick={resubmit} className="px-3 py-1.5 rounded-lg bg-[#00685f] text-white">Resubmit</button></div></>}</div>}</div>)}</div></section>}
      </div>
    </div>
  );
};
