import React, { useState } from 'react';
import QRCode from 'qrcode';
import { api } from '../api';
import { LabCode } from '../types';

interface CreateQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSession?: (data: { labCode: LabCode }) => void;
}

const labs: Array<{ code: LabCode; id: string; name: string }> = [
  { code:'BIO', id:'lab-bio', name:'Lab Biologi Terpadu' },
  { code:'FIS', id:'lab-fis', name:'Lab Fisika Modern' },
  { code:'KIM', id:'lab-kim', name:'Lab Kimia Anorganik' },
  { code:'COM', id:'lab-com', name:'Lab Komputer Sains' },
  { code:'BSM', id:'lab-bsm', name:'Smartclass & Bahasa' },
];

export const CreateQRModal: React.FC<CreateQRModalProps> = ({ isOpen, onClose }) => {
  const [labCode,setLabCode]=useState<LabCode>('BIO');
  const [adminCode,setAdminCode]=useState('');
  const [generated,setGenerated]=useState<{token:string;url:string;image:string;name:string}|null>(null);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);

  if (!isOpen) return null;

  const handleGenerate=async(e:React.FormEvent)=>{
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const lab=labs.find(x=>x.code===labCode)!;
      const me=await api.me();
      if (!me.user) await api.login(adminCode);
      const who=await api.me();
      if (who.user?.role!=='ADMIN') throw new Error('FORBIDDEN');
      const result=await api.createQr(lab.id);
      const url=`${window.location.origin}/?qr=${encodeURIComponent(result.token)}`;
      const image=await QRCode.toDataURL(url,{width:360,margin:2});
      setGenerated({token:result.token,url,image,name:lab.name});
    } catch (err:any) {
      setError(err?.status===401 ? 'Masukkan kode ADMIN yang valid.' : 'QR gagal dibuat. Pastikan server API aktif.');
    } finally { setLoading(false); }
  };

  const copy=async()=>{ if(!generated)return; await navigator.clipboard?.writeText(generated.url); };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-xs p-4">
    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between pb-4 mb-4 border-b">
        <div><h3 className="font-bold text-lg">Buat QR Laboratorium</h3><p className="text-xs text-slate-500 mt-1">QR hanya mengidentifikasi laboratorium dan membuka Teacher Flow.</p></div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100"><span className="material-symbols-outlined">close</span></button>
      </div>
      {generated ? <div className="text-center">
        <img src={generated.image} alt={`QR ${generated.name}`} className="w-64 h-64 mx-auto border rounded-xl" />
        <div className="font-bold mt-3">{generated.name}</div>
        <div className="font-mono text-[11px] text-slate-500 break-all mt-1">{generated.token}</div>
        <div className="flex gap-2 mt-4"><button onClick={copy} className="flex-1 px-3 py-2 rounded-xl border text-xs font-semibold">Salin Tautan</button><button onClick={()=>{setGenerated(null);setAdminCode('');onClose();}} className="flex-1 px-3 py-2 rounded-xl bg-[#00685f] text-white text-xs font-bold">Selesai</button></div>
      </div> : <form onSubmit={handleGenerate} className="space-y-4">
        <label className="block text-xs font-semibold">Laboratorium
          <select value={labCode} onChange={e=>setLabCode(e.target.value as LabCode)} className="mt-1 w-full h-10 px-3 rounded-xl border bg-slate-50">
            {labs.map(l=><option key={l.code} value={l.code}>{l.code} • {l.name}</option>)}
          </select>
        </label>
        <label className="block text-xs font-semibold">Kode ADMIN
          <input value={adminCode} onChange={e=>setAdminCode(e.target.value)} placeholder="ADMIN" className="mt-1 w-full h-10 px-3 rounded-xl border bg-slate-50 uppercase" required />
        </label>
        {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">{error}</div>}
        <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border text-xs font-semibold">Batal</button><button disabled={loading} className="px-5 py-2 rounded-xl bg-[#00685f] text-white text-xs font-bold">{loading?'Membuat…':'Terbitkan QR'}</button></div>
      </form>}
    </div>
  </div>;
};
