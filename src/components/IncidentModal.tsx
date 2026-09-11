import React, { useState, useEffect } from 'react';
import { IncidentItem } from '../types';

interface IncidentModalProps {
  isOpen: boolean;
  incident: IncidentItem | null;
  onClose: () => void;
  onSubmitDisposition: (incidentId: string, dispositionData: { action: string; urgency: string; notes: string }) => void;
}

export const IncidentModal: React.FC<IncidentModalProps> = ({
  isOpen,
  incident,
  onClose,
  onSubmitDisposition,
}) => {
  const [action, setAction] = useState('service');
  const [urgency, setUrgency] = useState('medium');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (incident) {
      if (incident.actionType === 'scrap') {
        setAction('write-off');
      } else {
        setAction('service');
      }
      setNotes('');
      setUrgency('medium');
    }
  }, [incident]);

  if (!isOpen || !incident) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitDisposition(incident.id, { action, urgency, notes });
    onClose();
  };

  return (
    <div
      id="incident-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div
        id="incident-modal-panel"
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF1F2] text-[#E11D48] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">build</span>
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#131b2e]">
                Form Disposisi Masalah Alat
              </h3>
              <span className="font-mono text-xs text-[#E11D48] font-bold">
                KODE ALAT: {incident.assetCode}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Short Incident Context */}
        <div className="p-3 bg-slate-50 rounded-xl mb-4 border border-slate-200/60 text-xs">
          <div className="flex justify-between font-semibold text-slate-800">
            <span>{incident.title}</span>
            <span className="text-slate-500 font-normal">{incident.time}</span>
          </div>
          <p className="text-slate-600 mt-1">{incident.description}</p>
          <div className="mt-2 text-[11px] text-slate-500">
            Pelapor: <span className="font-semibold text-slate-700">{incident.reporter}</span> ({incident.className})
          </div>
        </div>

        {/* Form Body */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-[#131b2e] mb-1.5">
              Tindakan Laboran
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#131b2e] focus:ring-2 focus:ring-[#00685f] focus:outline-none"
            >
              <option value="service">Kirim Servis Internal Teknisi Sekolah</option>
              <option value="vendor">Klaim Garansi Vendor Eksternal</option>
              <option value="write-off">Afkir &amp; Hapus dari Inventaris (Scrap)</option>
              <option value="replacement">Penggantian oleh Siswa / Kelompok Belajar</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#131b2e] mb-1.5">
              Tingkat Urgensi Praktikum
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label
                className={`flex items-center justify-center p-2.5 rounded-xl border cursor-pointer text-xs font-semibold transition-colors ${
                  urgency === 'low'
                    ? 'bg-[#f2f3ff] border-[#00687a] text-[#00687a]'
                    : 'bg-[#F8FAFC] border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="urgency"
                  value="low"
                  checked={urgency === 'low'}
                  onChange={() => setUrgency('low')}
                  className="sr-only"
                />
                Rendah
              </label>

              <label
                className={`flex items-center justify-center p-2.5 rounded-xl border cursor-pointer text-xs font-semibold transition-colors ${
                  urgency === 'medium'
                    ? 'bg-[#e2e7ff] border-[#00685f] text-[#00685f]'
                    : 'bg-[#F8FAFC] border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="urgency"
                  value="medium"
                  checked={urgency === 'medium'}
                  onChange={() => setUrgency('medium')}
                  className="sr-only"
                />
                Sedang
              </label>

              <label
                className={`flex items-center justify-center p-2.5 rounded-xl border cursor-pointer text-xs font-semibold transition-colors ${
                  urgency === 'critical'
                    ? 'bg-[#FFF1F2] border-[#E11D48] text-[#E11D48]'
                    : 'bg-[#F8FAFC] border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="urgency"
                  value="critical"
                  checked={urgency === 'critical'}
                  onChange={() => setUrgency('critical')}
                  className="sr-only"
                />
                Kritis Segera
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#131b2e] mb-1.5">
              Catatan Verifikasi Fisik Laboran
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Deskripsikan kondisi kerusakan fisik alat dan estimasi biaya perbaikan jika ada..."
              className="w-full p-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#131b2e] focus:ring-2 focus:ring-[#00685f] focus:outline-none"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 text-[#131b2e] text-xs font-semibold border border-slate-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#00685f] hover:bg-[#008378] text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-98"
            >
              Terbitkan Tiket &amp; Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
