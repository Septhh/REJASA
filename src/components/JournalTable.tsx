import React, { useState } from 'react';
import { JournalEntry, JournalStatus } from '../types';
import { exportJournalsToCSV } from '../data/labData';

interface JournalTableProps {
  journals: JournalEntry[];
  searchQuery: string;
  onReviewJournal: (journal: JournalEntry) => void;
  onViewAllJournals: () => void;
}

export const JournalTable: React.FC<JournalTableProps> = ({
  journals,
  searchQuery,
  onReviewJournal,
  onViewAllJournals,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | JournalStatus>('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Filter journals based on status and search query
  const filteredJournals = journals.filter((j) => {
    const matchesStatus = statusFilter === 'ALL' || j.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesStatus;
    const matchesQuery =
      j.code.toLowerCase().includes(query) ||
      j.labCode.toLowerCase().includes(query) ||
      j.teacherName.toLowerCase().includes(query) ||
      j.className.toLowerCase().includes(query) ||
      j.topic.toLowerCase().includes(query) ||
      (j.notes && j.notes.toLowerCase().includes(query));
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E2E8F0] flex flex-col">
      {/* Table Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00685f] text-[24px]">
              history_edu
            </span>
            <h2 className="font-['Plus_Jakarta_Sans'] text-lg sm:text-xl font-bold text-[#131b2e]">
              Jurnal Praktikum Terbaru Hari Ini
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar entri form kepatuhan lab sesuai instruksi kurikulum praktikum aktif.
          </p>
        </div>

        {/* Actions: Filter & Export */}
        <div className="flex items-center gap-2 relative">
          <div className="relative">
            <button
              id="btn-filter-status"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] hover:bg-slate-100 text-[#131b2e] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
            >
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
              <span>Filter: {statusFilter === 'ALL' ? 'Semua' : statusFilter}</span>
            </button>

            {/* Filter Dropdown */}
            {showFilterMenu && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20 text-xs">
                <button
                  onClick={() => {
                    setStatusFilter('ALL');
                    setShowFilterMenu(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 ${
                    statusFilter === 'ALL' ? 'font-bold text-[#00685f]' : 'text-slate-700'
                  }`}
                >
                  <span>Semua Status</span>
                  {statusFilter === 'ALL' && <span className="material-symbols-outlined text-[14px]">check</span>}
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('NEEDS_CORRECTION');
                    setShowFilterMenu(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 ${
                    statusFilter === 'NEEDS_CORRECTION' ? 'font-bold text-[#E11D48]' : 'text-slate-700'
                  }`}
                >
                  <span>Needs Correction</span>
                  {statusFilter === 'NEEDS_CORRECTION' && (
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('SUBMITTED');
                    setShowFilterMenu(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 ${
                    statusFilter === 'SUBMITTED' ? 'font-bold text-[#0284C7]' : 'text-slate-700'
                  }`}
                >
                  <span>Submitted</span>
                  {statusFilter === 'SUBMITTED' && (
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('REVIEWED');
                    setShowFilterMenu(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 ${
                    statusFilter === 'REVIEWED' ? 'font-bold text-[#059669]' : 'text-slate-700'
                  }`}
                >
                  <span>Reviewed</span>
                  {statusFilter === 'REVIEWED' && (
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  )}
                </button>
              </div>
            )}
          </div>

          <button
            id="btn-export-csv"
            onClick={() => exportJournalsToCSV(filteredJournals)}
            className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] hover:bg-slate-100 text-[#131b2e] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 active:scale-98"
            title="Download CSV log"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto -mx-6 mt-2">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#F8FAFC] text-slate-500 text-xs font-semibold uppercase tracking-wider border-y border-slate-200">
              <th className="py-3 px-6">No. Jurnal &amp; Sesi</th>
              <th className="py-3 px-4">Lab</th>
              <th className="py-3 px-4">Guru Pengampu</th>
              <th className="py-3 px-4">Kelas &amp; Topik Praktikum</th>
              <th className="py-3 px-4">Status Validasi</th>
              <th className="py-3 px-6 text-right">Aksi Cepat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]/60 text-sm text-[#131b2e]">
            {filteredJournals.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                  Tidak ada data jurnal yang sesuai filter pencarian.
                </td>
              </tr>
            ) : (
              filteredJournals.map((journal) => {
                const isNeedsCorrection = journal.status === 'NEEDS_CORRECTION';
                const isSubmitted = journal.status === 'SUBMITTED';
                const isReviewed = journal.status === 'REVIEWED';

                return (
                  <tr
                    key={journal.id}
                    className="hover:bg-[#F8FAFC]/80 transition-colors group"
                  >
                    {/* No Jurnal & Sesi */}
                    <td className="py-3.5 px-6">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-[#00685f]">
                          {journal.code}
                        </span>
                        <span className="text-xs text-slate-400 mt-0.5">
                          {journal.session} • {journal.time}
                        </span>
                      </div>
                    </td>

                    {/* Lab Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                          journal.labCode === 'BIO'
                            ? 'bg-emerald-100 text-emerald-900'
                            : journal.labCode === 'KIM'
                            ? 'bg-teal-100 text-teal-900'
                            : 'bg-sky-100 text-sky-900'
                        }`}
                      >
                        {journal.labCode}
                      </span>
                    </td>

                    {/* Guru */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-full ${journal.teacherAvatarColor} text-white flex items-center justify-center font-bold text-xs`}
                        >
                          {journal.teacherInitials}
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-[#131b2e]">
                          {journal.teacherName}
                        </span>
                      </div>
                    </td>

                    {/* Kelas & Topik */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col min-w-[180px] max-w-xs">
                        <span className="font-semibold text-xs sm:text-sm text-[#131b2e]">
                          {journal.className}
                        </span>
                        <span className="text-xs text-slate-500 truncate">
                          {journal.topic}
                        </span>
                      </div>
                    </td>

                    {/* Status Validasi */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isNeedsCorrection && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFF1F2] text-[#E11D48] text-xs font-bold border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-ping"></span>
                          NEEDS_CORRECTION
                        </span>
                      )}
                      {isSubmitted && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F0F9FF] text-[#0284C7] text-xs font-bold border border-sky-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]"></span>
                          SUBMITTED
                        </span>
                      )}
                      {isReviewed && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#ECFDF5] text-[#059669] text-xs font-bold border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                          REVIEWED
                        </span>
                      )}
                    </td>

                    {/* Aksi Cepat */}
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      {isNeedsCorrection && (
                        <button
                          onClick={() => onReviewJournal(journal)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#E11D48] text-white text-xs font-semibold hover:bg-rose-700 transition-colors shadow-xs active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            priority_high
                          </span>
                          <span>Review Sekarang</span>
                        </button>
                      )}
                      {isSubmitted && (
                        <button
                          onClick={() => onReviewJournal(journal)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#00685f] hover:bg-[#008378] text-white text-xs font-semibold transition-colors shadow-xs active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            rate_review
                          </span>
                          <span>Verifikasi</span>
                        </button>
                      )}
                      {isReviewed && (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#f2f3ff] text-slate-500 text-xs font-medium border border-slate-200">
                          <span className="material-symbols-outlined text-[16px] text-[#059669]">
                            check
                          </span>
                          <span>Selesai</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="pt-4 mt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="text-xs text-slate-500">
          Menampilkan {filteredJournals.length} dari {journals.length} jurnal tercatat hari ini
        </span>
        <button
          onClick={onViewAllJournals}
          className="text-xs font-bold text-[#00685f] hover:text-[#008378] flex items-center gap-1 transition-colors"
        >
          <span>Buka Seluruh Arsip Jurnal Praktikum</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
