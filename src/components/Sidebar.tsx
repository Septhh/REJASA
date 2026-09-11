import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      badge: 'Live',
      badgeType: 'live',
    },
    {
      id: 'jurnal-laboratorium',
      label: 'Arsip Jurnal',
      icon: 'menu_book',
      badge: `${pendingCount} Pending`,
      badgeType: 'warning',
    },
    {
      id: 'review-jurnal',
      label: 'Review Jurnal',
      icon: 'assignment_turned_in',
    },
    {
      id: 'lab-qr-core',
      label: 'Akses & QR',
      icon: 'qr_code_scanner',
    },
    {
      id: 'inventaris-alat',
      label: 'Kategori Jurnal',
      icon: 'science',
    },
    {
      id: 'audit-laporan',
      label: 'Audit & Laporan',
      icon: 'verified_user',
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="main-sidebar"
        className={`fixed left-0 top-0 h-screen w-64 bg-[#0F172A] text-slate-100 z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand header */}
          <div className="p-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <img
                alt="REJASA Logo"
                className="h-8 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida/AEtjO1WCeLzecpV83AZgHYUqqdEO5ksiJ0DyEzOvu4qp-HRmltyJ-K4aPmcz1HnS_FqaHQY7tapwSw9zGea61BSpyj9UGtN3gXr97a_cvkf095haTFbNHsvljFVUAYisd_JjGJ2c39JvOtv86wxRaoFhZqhfgWYCZcunDK8t4YtmcUdyIMVQLFUtZaF6TFr7TH27sclzbMB-HH440BF4kjYU27ZBGvk1qd6XPAwFQbrJ0htMb0BhH2a8Rb587_2Z"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-white tracking-tight leading-none truncate">
                  REJASA
                </span>
                <span className="text-xs text-slate-400 truncate mt-1">
                  Rapid Access Journal
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white"
                aria-label="Tutup navigasi"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>

          {/* Node sync status banner */}
          <div className="px-4 py-2">
            <div className="px-3 py-1.5 flex items-center justify-between rounded-xl bg-slate-800/80 mb-2 border border-slate-700/50">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-medium text-slate-300">REJASA Central</span>
              </div>
              <span className="text-[11px] font-semibold tracking-wider text-[#89f5e7] bg-[#89f5e7]/10 px-1.5 py-0.5 rounded">
                ONLINE
              </span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-3 space-y-1 mt-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-[#008378] text-[#f4fffc] font-semibold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span className="text-sm tracking-tight">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        item.badgeType === 'live'
                          ? 'bg-[#00685f] text-white'
                          : 'bg-[#FFFBEB] text-[#D97706]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile card at bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3 p-1">
            <img
              alt="Dra. Sri Wahyuni"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-[#008378]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqwMGHd0e2BBHG0zv2r-__fQpbt5Mb0O23OLbMHlMKALIUayzdLDLF77ZD2zaNBdzQeGl6mFJ9xBm0ibZsMKbHkmP794SwIeMCS2jy5URcNIgWzu16Pjf6QtAtfDGhBU_m_r3R9i2oUTvddviRNYagrVfW4o2kG89dS9Cz10wBwALA_pyUgsCQk2lHa8o6Ykk0P_u1wMkVyH4OWCYAE3q3yTYU59bYazwzrlv1i7EtYPXJY8MAi-HlZw"
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm text-white font-semibold truncate leading-tight">
                Dra. Sri Wahyuni
              </span>
              <span className="text-xs text-slate-400 truncate">
                Administrator REJASA
              </span>
              <span className="text-[11px] text-[#89f5e7] truncate mt-0.5 font-medium">
                SMAN 3 Salatiga
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
