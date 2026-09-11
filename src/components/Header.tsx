import React, { useState } from 'react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenCreateQR: () => void;
  onOpenPrintReport: () => void;
  onToggleMobileSidebar: () => void;
  unreadAlertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenCreateQR,
  onOpenPrintReport,
  onToggleMobileSidebar,
  unreadAlertCount,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 'notif-1',
      title: 'Lensa Objektif Rusak!',
      desc: 'BIO-MIC-03 memerlukan tiket perbaikan segera (Kelas XI IPA 1).',
      time: '15 mnt lalu',
      type: 'danger',
    },
    {
      id: 'notif-2',
      title: 'Jurnal Masuk - Kimia',
      desc: 'Pak Anton Wijaya submit jurnal Standarisasi NaOH.',
      time: '45 mnt lalu',
      type: 'info',
    },
    {
      id: 'notif-3',
      title: 'Peringatan Stok Reagen',
      desc: 'HCl 0.1M dan Fenolftalein di Lab Kimia tersisa < 20%.',
      time: '1 jam lalu',
      type: 'warning',
    },
  ];

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-30 flex items-center justify-between px-4 sm:px-6 border-b border-[#E2E8F0]">
      {/* Left side: Hamburger (on mobile) & Search bar & Semester badge */}
      <div className="flex items-center gap-3 sm:gap-6 flex-1 max-w-2xl">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Buka Menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        <div className="relative w-full max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode reagen, alat, atau jurnal..."
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-[#F8FAFC] text-[#131b2e] text-sm border border-[#E2E8F0] focus:outline-none focus:border-[#00685f] focus:ring-2 focus:ring-[#00685f]/15 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f2f3ff] border border-slate-200/50">
          <span className="material-symbols-outlined text-[#00687a] text-[16px]">date_range</span>
          <span className="text-xs font-semibold text-slate-700">Semester Ganjil 2026/2027</span>
        </div>
      </div>

      {/* Right side: Action Buttons, Notifications, System status */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          id="btn-create-qr"
          onClick={onOpenCreateQR}
          className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl bg-[#00685f] hover:bg-[#008378] text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-98"
        >
          <span className="material-symbols-outlined text-[18px]">qr_code</span>
          <span>+ Buat Jurnal QR</span>
        </button>

        <button
          id="btn-print-report"
          onClick={onOpenPrintReport}
          className="hidden sm:flex h-10 px-4 rounded-xl border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#131b2e] text-sm font-semibold items-center gap-1.5 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">print</span>
          <span>Cetak Laporan</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            id="btn-notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[#F8FAFC] text-slate-600 relative transition-colors border border-transparent hover:border-slate-200"
            aria-label="Lihat Notifikasi"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadAlertCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#E11D48] ring-2 ring-white"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#131b2e]">
                    Pemberitahuan Lab
                  </span>
                  <span className="px-2 py-0.5 text-xs font-semibold bg-[#FFF1F2] text-[#E11D48] rounded-full">
                    {unreadAlertCount} Baru
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Tutup
                </button>
              </div>

              <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl text-left text-xs transition-colors ${
                      n.type === 'danger'
                        ? 'bg-[#FFF1F2]/60 border border-rose-100'
                        : n.type === 'warning'
                        ? 'bg-[#FFFBEB]/70 border border-amber-100'
                        : 'bg-[#F0F9FF]/70 border border-sky-100'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                    </div>
                    <p className="mt-1 text-slate-600 leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:block h-6 w-px bg-slate-200"></div>

        {/* System Ready Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse"></span>
          <span className="text-xs font-bold text-[#059669]">System Ready</span>
        </div>
      </div>
    </header>
  );
};
