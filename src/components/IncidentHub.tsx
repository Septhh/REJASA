import React from 'react';
import { IncidentItem, LabUsageStat } from '../types';

interface IncidentHubProps {
  incidents: IncidentItem[];
  usageStats: LabUsageStat[];
  onOpenDispositionModal: (incident: IncidentItem) => void;
  onViewAllIncidents: () => void;
}

export const IncidentHub: React.FC<IncidentHubProps> = ({
  incidents,
  usageStats,
  onOpenDispositionModal,
  onViewAllIncidents,
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Card 1: Laporan Masalah & Insiden Terkini */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E2E8F0] flex flex-col">
        <div className="flex items-center justify-between pb-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48] animate-pulse"></span>
            <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#131b2e]">
              Masalah &amp; Insiden Alat
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#FFF1F2] text-[#E11D48] text-xs font-bold border border-rose-200">
            {incidents.filter((i) => i.status === 'Open').length} Wajib Follow-Up
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Insiden tercatat otomatis saat submit jurnal oleh guru pengampu.
        </p>

        {/* List of Incidents */}
        <div className="space-y-4">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              id={`incident-item-${incident.assetCode.toLowerCase()}`}
              className="p-3.5 rounded-xl bg-[#FFF1F2]/30 border border-rose-100 flex flex-col gap-2 hover:bg-[#FFF1F2]/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <img
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0 shadow-xs border border-rose-200/60"
                  data-alt={incident.photoAlt}
                  src={incident.photoUrl}
                  alt={incident.title}
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#E11D48]">
                      {incident.assetCode}
                    </span>
                    <span className="text-[11px] text-slate-400">{incident.time}</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#131b2e] truncate mt-0.5">
                    {incident.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                    {incident.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-rose-100/60">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">person</span>
                  <span className="truncate max-w-[140px]">
                    {incident.reporter} ({incident.className})
                  </span>
                </span>
                <button
                  onClick={() => onOpenDispositionModal(incident)}
                  className={`px-3 py-1 rounded text-white text-xs font-semibold hover:bg-rose-700 transition-colors shadow-xs active:scale-95 ${
                    incident.actionType === 'repair' ? 'bg-[#E11D48]' : 'bg-[#be123c]'
                  }`}
                >
                  {incident.actionLabel}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Link to Full Log */}
        <div className="mt-5">
          <button
            onClick={onViewAllIncidents}
            className="w-full py-2.5 rounded-xl bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#131b2e] text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-200"
          >
            <span className="material-symbols-outlined text-[18px]">assignment</span>
            <span>Lihat Log Buku Kerusakan Lengkap</span>
          </button>
        </div>
      </div>

      {/* Card 2: Statistik Pemanfaatan Lab Bulan Ini */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E2E8F0] flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#131b2e]">
            Pemanfaatan Lab Bulan Ini
          </h3>
          <span className="font-mono text-xs font-bold text-[#00685f] bg-[#00685f]/10 px-2 py-0.5 rounded">
            SEP 2026
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Perbandingan frekuensi praktikum untuk perencanaan bahan habis pakai.
        </p>

        <div className="space-y-3.5">
          {usageStats.map((stat) => (
            <div key={stat.labName}>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-800 font-semibold">{stat.labName}</span>
                <span
                  className={`font-bold ${
                    stat.color.includes('primary')
                      ? 'text-[#00685f]'
                      : stat.color.includes('secondary')
                      ? 'text-[#00687a]'
                      : 'text-slate-600'
                  }`}
                >
                  {stat.sessions} Sesi ({stat.percentage}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    stat.color.includes('primary')
                      ? 'bg-[#00685f]'
                      : stat.color.includes('secondary')
                      ? 'bg-[#00687a]'
                      : 'bg-slate-400'
                  }`}
                  style={{ width: `${stat.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Notice Card */}
        <div className="mt-5 p-3.5 rounded-xl bg-[#FFFBEB] border border-amber-200 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[#D97706] text-[20px] flex-shrink-0 mt-0.5">
            inventory_2
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#D97706]">Restok Reagen Segera</span>
            <span className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Stok HCl 0.1M dan Indikator Fenolftalein di Lab Kimia tersisa &lt; 20%.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
