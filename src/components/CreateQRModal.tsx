import React, { useState } from 'react';
import { LabCode } from '../types';

interface CreateQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSession: (sessionData: {
    labCode: LabCode;
    className: string;
    teacherName: string;
    topic: string;
    session: string;
  }) => void;
}

export const CreateQRModal: React.FC<CreateQRModalProps> = ({
  isOpen,
  onClose,
  onCreateSession,
}) => {
  const [labCode, setLabCode] = useState<LabCode>('BIO');
  const [className, setClassName] = useState('XI IPA 2');
  const [teacherName, setTeacherName] = useState('Pak Anton Wijaya, M.Sc');
  const [topic, setTopic] = useState('Analisis Morfologi Tumbuhan Monokotil');
  const [session, setSession] = useState('Jam ke 5-6 (10:15 - 11:45 WIB)');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const token = `SLMS-QR-${labCode}-${Date.now().toString().slice(-6)}`;
    setGeneratedToken(token);
    onCreateSession({
      labCode,
      className,
      teacherName,
      topic,
      session,
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(
      `https://edulab.sch.id/lab/checkin?token=${generatedToken}`
    );
    alert('Tautan Check-In Guru berhasil disalin ke clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00685f]/10 text-[#00685f] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#131b2e]">
                Buat Kode QR Sesi Laboratorium
              </h3>
              <span className="text-xs text-slate-500">
                Otentikasi check-in guru &amp; auto-generate jurnal
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

        {generatedToken ? (
          <div className="text-center py-4 flex flex-col items-center">
            {/* Display Simulated High Precision QR Code */}
            <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-[#00685f] shadow-md mb-4 flex flex-col items-center">
              <div className="w-44 h-44 bg-[#F8FAFC] rounded-xl p-3 border border-slate-200 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Outer positioning patterns */}
                  <rect x="5" y="5" width="25" height="25" fill="#00685f" rx="3" />
                  <rect x="9" y="9" width="17" height="17" fill="white" rx="2" />
                  <rect x="13" y="13" width="9" height="9" fill="#00685f" />

                  <rect x="70" y="5" width="25" height="25" fill="#00685f" rx="3" />
                  <rect x="74" y="9" width="17" height="17" fill="white" rx="2" />
                  <rect x="78" y="13" width="9" height="9" fill="#00685f" />

                  <rect x="5" y="70" width="25" height="25" fill="#00685f" rx="3" />
                  <rect x="9" y="74" width="17" height="17" fill="white" rx="2" />
                  <rect x="13" y="78" width="9" height="9" fill="#00685f" />

                  {/* QR Matrix details */}
                  <rect x="35" y="10" width="6" height="6" fill="#131b2e" />
                  <rect x="45" y="12" width="8" height="5" fill="#131b2e" />
                  <rect x="58" y="8" width="6" height="7" fill="#131b2e" />
                  <rect x="12" y="36" width="7" height="7" fill="#131b2e" />
                  <rect x="25" y="42" width="6" height="5" fill="#131b2e" />
                  <rect x="36" y="32" width="8" height="8" fill="#00685f" />
                  <rect x="48" y="40" width="7" height="6" fill="#131b2e" />
                  <rect x="62" y="35" width="6" height="9" fill="#131b2e" />
                  <rect x="74" y="40" width="9" height="6" fill="#131b2e" />
                  <rect x="88" y="45" width="6" height="7" fill="#131b2e" />
                  <rect x="36" y="50" width="9" height="6" fill="#131b2e" />
                  <rect x="50" y="52" width="6" height="8" fill="#00685f" />
                  <rect x="60" y="55" width="8" height="5" fill="#131b2e" />
                  <rect x="35" y="65" width="7" height="7" fill="#131b2e" />
                  <rect x="48" y="72" width="8" height="6" fill="#131b2e" />
                  <rect x="65" y="70" width="7" height="8" fill="#131b2e" />
                  <rect x="78" y="75" width="8" height="6" fill="#00685f" />
                  <rect x="88" y="80" width="6" height="6" fill="#131b2e" />
                </svg>
              </div>
              <span className="font-mono text-xs font-bold text-[#00685f] mt-2">
                {generatedToken}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl w-full text-xs text-left mb-4 border border-slate-200">
              <div className="font-semibold text-slate-900">{topic}</div>
              <div className="text-slate-600 mt-0.5">
                Bilik: <span className="font-bold text-[#00685f]">LAB {labCode}</span> • Kelas: {className}
              </div>
              <div className="text-slate-500 mt-0.5">{teacherName} • {session}</div>
            </div>

            <div className="flex gap-2 w-full">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                Salin Tautan Guru
              </button>
              <button
                onClick={() => {
                  setGeneratedToken(null);
                  onClose();
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-[#00685f] text-white text-xs font-bold hover:bg-[#008378]"
              >
                Selesai &amp; Tutup
              </button>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleGenerate}>
            <div>
              <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                Pilih Bilik Laboratorium
              </label>
              <select
                value={labCode}
                onChange={(e) => setLabCode(e.target.value as LabCode)}
                className="w-full h-10 px-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#131b2e] focus:ring-2 focus:ring-[#00685f] focus:outline-none"
              >
                <option value="BIO">BIO • Lab Biologi Terpadu</option>
                <option value="FIS">FIS • Lab Fisika Modern</option>
                <option value="KIM">KIM • Lab Kimia Anorganik</option>
                <option value="COM">COM • Lab Komputer Sains</option>
                <option value="BSM">BSM • Smartclass &amp; Bahasa</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                  Kelas Siswa
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#131b2e] focus:ring-2 focus:ring-[#00685f] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                  Waktu / Sesi
                </label>
                <input
                  type="text"
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#131b2e] focus:ring-2 focus:ring-[#00685f] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                Guru Pengampu
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#131b2e] focus:ring-2 focus:ring-[#00685f] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                Materi / Topik Praktikum
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Contoh: Titrasi Larutan Asam Basa"
                className="w-full h-10 px-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs sm:text-sm text-[#131b2e] focus:ring-2 focus:ring-[#00685f] focus:outline-none"
                required
              />
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
                Terbitkan QR Check-In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
