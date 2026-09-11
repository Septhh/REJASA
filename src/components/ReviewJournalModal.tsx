import React, { useState, useEffect } from 'react';
import { JournalEntry, JournalStatus } from '../types';

interface ReviewJournalModalProps {
  isOpen: boolean;
  journal: JournalEntry | null;
  onClose: () => void;
  onUpdateStatus: (journalId: string, newStatus: JournalStatus, reviewNotes: string) => void;
}

export const ReviewJournalModal: React.FC<ReviewJournalModalProps> = ({
  isOpen,
  journal,
  onClose,
  onUpdateStatus,
}) => {
  const [sopPresence, setSopPresence] = useState(true);
  const [sopReagents, setSopReagents] = useState(true);
  const [sopWaste, setSopWaste] = useState(true);
  const [sopCleanliness, setSopCleanliness] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (journal) {
      setNotes(journal.notes || '');
      setSopPresence(true);
      setSopReagents(journal.status !== 'NEEDS_CORRECTION');
      setSopWaste(true);
      setSopCleanliness(true);
    }
  }, [journal]);

  if (!isOpen || !journal) return null;

  const handleApprove = () => {
    onUpdateStatus(journal.id, 'REVIEWED', notes);
    onClose();
  };

  const handleReject = () => {
    onUpdateStatus(journal.id, 'NEEDS_CORRECTION', notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00685f]/10 text-[#00685f] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#131b2e]">
                Verifikasi &amp; Review Jurnal
              </h3>
              <span className="font-mono text-xs font-bold text-[#00685f]">
                {journal.code}
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

        {/* Journal Summary Box */}
        <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200 mb-4 text-xs space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-bold text-sm text-[#131b2e] block">{journal.topic}</span>
              <span className="text-slate-500 font-mono">{journal.labName} ({journal.labCode})</span>
            </div>
            <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-200 text-slate-800">
              {journal.className}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-slate-600">
            <div>Guru: <span className="font-semibold text-slate-900">{journal.teacherName}</span></div>
            <div>Siswa: <span className="font-semibold text-slate-900">{journal.studentsCount} orang</span></div>
            <div>Waktu: <span className="font-semibold text-slate-900">{journal.session} • {journal.time}</span></div>
            <div>Status: <span className="font-semibold text-[#00685f]">{journal.status}</span></div>
          </div>

          {journal.incidentReported && (
            <div className="mt-2 p-2 rounded-lg bg-[#FFF1F2] border border-rose-200 text-[#E11D48] flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <span>Terlampir insiden alat terkait: <strong>{journal.incidentReported}</strong></span>
            </div>
          )}
        </div>

        {/* SOP Compliance Checklist */}
        <div className="mb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
            Audit Kepatuhan SOP Bab 10 &amp; Bab 24
          </h4>
          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer border border-slate-200/70">
              <input
                type="checkbox"
                checked={sopPresence}
                onChange={(e) => setSopPresence(e.target.checked)}
                className="w-4 h-4 rounded text-[#00685f] focus:ring-[#00685f]"
              />
              <span className="text-slate-700">Presensi siswa lengkap &amp; kepatuhan APD (Jas lab/Kacamata)</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer border border-slate-200/70">
              <input
                type="checkbox"
                checked={sopReagents}
                onChange={(e) => setSopReagents(e.target.checked)}
                className="w-4 h-4 rounded text-[#00685f] focus:ring-[#00685f]"
              />
              <span className="text-slate-700">Pencatatan reagen &amp; alat praktikum habis pakai sesuai</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer border border-slate-200/70">
              <input
                type="checkbox"
                checked={sopWaste}
                onChange={(e) => setSopWaste(e.target.checked)}
                className="w-4 h-4 rounded text-[#00685f] focus:ring-[#00685f]"
              />
              <span className="text-slate-700">Penetralan limbah sisa bahan kimia &amp; pembuangan aman</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer border border-slate-200/70">
              <input
                type="checkbox"
                checked={sopCleanliness}
                onChange={(e) => setSopCleanliness(e.target.checked)}
                className="w-4 h-4 rounded text-[#00685f] focus:ring-[#00685f]"
              />
              <span className="text-slate-700">Kebersihan meja kerja, wastafel, dan penutupan kran/gas selesai</span>
            </label>
          </div>
        </div>

        {/* Laboran Notes */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-[#131b2e] mb-1">
            Catatan Verifikasi / Instruksi Perbaikan
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Tambahkan catatan khusus untuk guru pengampu..."
            className="w-full p-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#131b2e] focus:ring-2 focus:ring-[#00685f] focus:outline-none"
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleReject}
            className="px-3.5 py-2 rounded-xl bg-[#FFF1F2] hover:bg-rose-100 text-[#E11D48] text-xs font-bold border border-rose-200 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">cancel</span>
            Minta Koreksi
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleApprove}
              className="px-4 py-2 rounded-xl bg-[#00685f] hover:bg-[#008378] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Verifikasi &amp; Setujui
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
