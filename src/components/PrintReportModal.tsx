import React from 'react';
import { JournalEntry, IncidentItem, LabRoom } from '../types';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  journals: JournalEntry[];
  incidents: IncidentItem[];
  rooms: LabRoom[];
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  journals,
  incidents,
  rooms,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 backdrop-blur-xs p-4 animate-in fade-in duration-200 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:w-full print:p-0">
        {/* Actions bar (hidden in print) */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00685f] text-[24px]">print</span>
            <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#131b2e]">
              Cetak Rekapitulasi Laporan Harian
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#00685f] hover:bg-[#008378] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Cetak Sekarang
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Official Printable Report Document */}
        <div className="print-content text-slate-800 text-xs">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
            <h1 className="font-['Plus_Jakarta_Sans'] text-base font-extrabold uppercase tracking-wide text-slate-900">
              PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA
            </h1>
            <h2 className="font-['Plus_Jakarta_Sans'] text-sm font-bold uppercase text-slate-800">
              SMA NEGERI 1 EDULAB - UNIT LABORATORIUM SAINS
            </h2>
            <p className="text-[11px] text-slate-600 mt-1">
              Jl. Pendidikan Sains No. 12, EduLab City • Telp: (021) 7890-1234 • Email: lab@edulab.sch.id
            </p>
          </div>

          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200 text-xs">
            <div>
              <span className="font-bold">Dokumen:</span> Rekapitulasi Operasional Harian Bab 10 &amp; Bab 43
            </div>
            <div>
              <span className="font-bold">Tanggal Cetak:</span> {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
            </div>
          </div>

          {/* Section 1: Ringkasan Bilik Lab */}
          <div className="mb-5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
              1. Status Bilik Laboratorium Aktif
            </h4>
            <table className="w-full border-collapse border border-slate-300 text-left">
              <thead>
                <tr className="bg-slate-100 font-bold">
                  <th className="border border-slate-300 p-2">Kode Bilik</th>
                  <th className="border border-slate-300 p-2">Nama Laboratorium</th>
                  <th className="border border-slate-300 p-2">Status Saat Ini</th>
                  <th className="border border-slate-300 p-2">Kelas / Agenda Terpasang</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id} className="border-b border-slate-200">
                    <td className="border border-slate-300 p-2 font-mono font-semibold">{room.code}</td>
                    <td className="border border-slate-300 p-2">{room.name}</td>
                    <td className="border border-slate-300 p-2 font-semibold">
                      {room.status} ({room.statusDetail})
                    </td>
                    <td className="border border-slate-300 p-2">{room.className} - {room.topic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 2: Jurnal Praktikum */}
          <div className="mb-5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
              2. Rekapitulasi Jurnal Praktikum ({journals.length} Sesi)
            </h4>
            <table className="w-full border-collapse border border-slate-300 text-left">
              <thead>
                <tr className="bg-slate-100 font-bold">
                  <th className="border border-slate-300 p-2">No Jurnal</th>
                  <th className="border border-slate-300 p-2">Lab</th>
                  <th className="border border-slate-300 p-2">Guru Pengampu</th>
                  <th className="border border-slate-300 p-2">Kelas &amp; Materi</th>
                  <th className="border border-slate-300 p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {journals.map((j) => (
                  <tr key={j.id}>
                    <td className="border border-slate-300 p-2 font-mono">{j.code}</td>
                    <td className="border border-slate-300 p-2 font-semibold">{j.labCode}</td>
                    <td className="border border-slate-300 p-2">{j.teacherName}</td>
                    <td className="border border-slate-300 p-2">{j.className} - {j.topic}</td>
                    <td className="border border-slate-300 p-2 font-bold">{j.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Insiden & Kerusakan Alat */}
          <div className="mb-6">
            <h4 className="font-bold text-xs uppercase tracking-wider text-rose-700 mb-2">
              3. Buku Kerusakan Alat &amp; Insiden (Bab 43)
            </h4>
            <table className="w-full border-collapse border border-slate-300 text-left">
              <thead>
                <tr className="bg-slate-100 font-bold">
                  <th className="border border-slate-300 p-2">Kode Alat</th>
                  <th className="border border-slate-300 p-2">Deskripsi Kerusakan</th>
                  <th className="border border-slate-300 p-2">Pelapor</th>
                  <th className="border border-slate-300 p-2">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((i) => (
                  <tr key={i.id}>
                    <td className="border border-slate-300 p-2 font-mono font-bold text-rose-600">{i.assetCode}</td>
                    <td className="border border-slate-300 p-2">
                      <span className="font-semibold block">{i.title}</span>
                      <span className="text-[10px] text-slate-500">{i.description}</span>
                    </td>
                    <td className="border border-slate-300 p-2">{i.reporter} ({i.className})</td>
                    <td className="border border-slate-300 p-2">{i.actionLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-300 text-center">
            <div>
              <p className="text-slate-600">Mengetahui,</p>
              <p className="font-semibold text-slate-800 mt-1">Wakil Kepala Sekolah Bid. Kurikulum</p>
              <div className="h-16"></div>
              <p className="font-bold underline text-slate-900">Dr. H. Ahmad Fauzi, M.Pd</p>
              <p className="text-[10px] text-slate-500">NIP. 19740512 199903 1 002</p>
            </div>
            <div>
              <p className="text-slate-600">EduLab, {new Date().toLocaleDateString('id-ID')}</p>
              <p className="font-semibold text-slate-800 mt-1">Kepala Laboratorium</p>
              <div className="h-16"></div>
              <p className="font-bold underline text-slate-900">Dra. Sri Wahyuni</p>
              <p className="text-[10px] text-slate-500">NIP. 19680820 199412 2 001</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
