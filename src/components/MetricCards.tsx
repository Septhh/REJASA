import React from 'react';

interface MetricCardsProps {
  totalJournalsToday: number;
  pendingReviewCount: number;
  activeIncidentsCount: number;
  occupiedLabsCount: number;
  totalLabsCount: number;
  onFilterPending?: () => void;
  onFilterIncidents?: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalJournalsToday,
  pendingReviewCount,
  activeIncidentsCount,
  occupiedLabsCount,
  totalLabsCount,
  onFilterPending,
  onFilterIncidents,
}) => {
  const utilizationPercentage = Math.round((occupiedLabsCount / totalLabsCount) * 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {/* Metric 1: Jurnal Hari Ini */}
      <div
        id="card-metric-journals"
        className="relative bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-[#E2E8F0] overflow-hidden group"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#00685f]"></div>
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Jurnal Hari Ini
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold text-[#131b2e] tracking-tight tabular-nums">
                {totalJournalsToday}
              </span>
              <span className="text-xs text-[#059669] font-semibold flex items-center">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span> +3 vs kemarin
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#008378]/10 flex items-center justify-center text-[#00685f] group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[26px]">menu_book</span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-500">Target harian 14 praktikum</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] text-xs font-bold">
            85% Selesai
          </span>
        </div>
      </div>

      {/* Metric 2: Belum Direview */}
      <div
        id="card-metric-pending"
        onClick={onFilterPending}
        className="relative bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-[#E2E8F0] overflow-hidden group cursor-pointer"
        title="Klik untuk melihat antrean verifikasi"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#D97706]"></div>
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Belum Direview
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold text-[#D97706] tracking-tight tabular-nums">
                {pendingReviewCount}
              </span>
              <span className="text-xs text-slate-500">antrean sesi</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FFFBEB] flex items-center justify-center text-[#D97706] group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[26px]">pending_actions</span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-500">SLA verifikasi &lt; 60 menit</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#D97706] text-xs font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse"></span>
            Tindakan Wajib
          </span>
        </div>
      </div>

      {/* Metric 3: Ada Masalah / Rusak */}
      <div
        id="card-metric-incidents"
        onClick={onFilterIncidents}
        className="relative bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-[#E2E8F0] overflow-hidden group cursor-pointer"
        title="Klik untuk melihat insiden alat"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#E11D48]"></div>
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Ada Masalah / Rusak
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold text-[#E11D48] tracking-tight tabular-nums">
                {activeIncidentsCount}
              </span>
              <span className="text-xs text-[#E11D48] font-semibold">insiden aktif</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FFF1F2] flex items-center justify-center text-[#E11D48] group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[26px]">fmd_bad</span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-[#E11D48] font-medium truncate max-w-[150px]">
            BIO-03 Lens & Tabung KIM
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#FFF1F2] text-[#E11D48] text-xs font-bold">
            Kritis Bab 43
          </span>
        </div>
      </div>

      {/* Metric 4: Lab Terpakai Saat Ini */}
      <div
        id="card-metric-occupancy"
        className="relative bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-[#E2E8F0] overflow-hidden group"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#00687a]"></div>
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Lab Terpakai Saat Ini
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold text-[#131b2e] tracking-tight tabular-nums">
                {occupiedLabsCount}
                <span className="text-xl text-slate-400 font-normal">/{totalLabsCount}</span>
              </span>
              <span className="text-xs text-[#00687a] font-semibold">
                {utilizationPercentage}% Utilisasi
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#00687a]/10 flex items-center justify-center text-[#00687a] group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[26px]">meeting_room</span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-500">FIS, KIM, &amp; BIO Terisi</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#e2e7ff] text-[#00687a] text-xs font-bold">
            {totalLabsCount - occupiedLabsCount} Standby
          </span>
        </div>
      </div>
    </div>
  );
};
