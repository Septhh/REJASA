import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { RoomStatusGrid } from './components/RoomStatusGrid';
import { JournalTable } from './components/JournalTable';
import { LabHoursChart } from './components/LabHoursChart';
import { IncidentHub } from './components/IncidentHub';
import { IncidentModal } from './components/IncidentModal';
import { CreateQRModal } from './components/CreateQRModal';
import { ReviewJournalModal } from './components/ReviewJournalModal';
import { PrintReportModal } from './components/PrintReportModal';
import { InventoryPanel } from './components/InventoryPanel';
import { QRManager } from './components/QRManager';
import type { HeaderNotification } from './components/Header';
import { api } from './lib/api';
import { useAuth } from './lib/auth';
import { addDaysStr, todayWib } from './lib/format';

import {
  INITIAL_ROOMS,
  LAB_MONTHLY_STATS,
  WEEKLY_HOURS_ALLOCATION,
} from './data/labData';

import { LabRoom, JournalEntry, IncidentItem, Lab, QRCodeInfo, InventoryItem } from './types';

export default function App() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Navigation & View state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | 'yesterday' | 'week'>('today');

  // Realtime ticking clock
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      // Format as "Jumat, 11 Sep 2026, 03.37.56 WIB"
      const formatted = now.toLocaleDateString('id-ID', options).replace(/\./g, ':');
      setCurrentTime(`${formatted} WIB`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Main data collections
  const [rooms, setRooms] = useState<LabRoom[]>(INITIAL_ROOMS);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [qrCodes, setQrCodes] = useState<QRCodeInfo[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [qrLabId, setQrLabId] = useState<number | null>(null);
  const [weeklyAllocation] = useState(WEEKLY_HOURS_ALLOCATION);
  const [usageStats] = useState(LAB_MONTHLY_STATS);

  // Modals state
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

  const [isCreateQROpen, setIsCreateQROpen] = useState(false);

  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Memuat data dari API (jurnal & insiden untuk staf; lab, QR, inventaris hanya ADMIN).
  const loadAll = useCallback(async () => {
    try {
      const [j, i] = await Promise.all([
        api.get<{ journals: JournalEntry[] }>('/journals'),
        api.get<{ incidents: IncidentItem[] }>('/incidents'),
      ]);
      setJournals(j.journals);
      setIncidents(i.incidents);
      if (isAdmin) {
        const [l, q, inv] = await Promise.all([
          api.get<{ labs: Lab[] }>('/labs'),
          api.get<{ qrCodes: QRCodeInfo[] }>('/qr'),
          api.get<{ items: InventoryItem[] }>('/inventory'),
        ]);
        setLabs(l.labs);
        setQrCodes(q.qrCodes);
        setInventory(inv.items);
      }
      setLoadError('');
    } catch (e: any) {
      setLoadError(e?.message || 'Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadAll();
    const t = setInterval(loadAll, 30_000);
    return () => clearInterval(t);
  }, [loadAll]);

  // Rentang waktu dashboard (WIB)
  const today = todayWib();
  const inRange = (j: JournalEntry) => {
    const d = j.date ?? today;
    if (selectedTimeRange === 'today') return d === today;
    if (selectedTimeRange === 'yesterday') return d === addDaysStr(today, -1);
    return d >= addDaysStr(today, -6) && d <= today;
  };
  const dashboardJournals = journals.filter(inRange);

  // KPI Calculations
  const totalJournalsToday = dashboardJournals.length;
  const pendingReviewCount = journals.filter(
    (j) => j.status === 'SUBMITTED'
  ).length;
  const activeIncidentsCount = incidents.filter((i) => i.status === 'Open').length;
  const occupiedLabsCount = rooms.filter(
    (r) => r.status === 'Insiden' || r.status === 'Berjalan' || r.status === 'Praktikum'
  ).length;

  // Handlers
  const handleOpenIncidentModal = (incident: IncidentItem) => {
    setSelectedIncident(incident);
    setIsIncidentModalOpen(true);
  };

  const handleOpenIncidentForRoom = (roomCode: string) => {
    const match = incidents.find((i) => i.labCode === roomCode.slice(0, 3) && i.status === 'Open');
    if (match) {
      handleOpenIncidentModal(match);
    } else {
      showToast(`Tidak ada tiket insiden tertunda untuk bilik ${roomCode}.`);
    }
  };

  const handleSubmitDisposition = async (
    incidentId: string,
    data: { action: string; urgency: string; notes: string }
  ) => {
    try {
      const r = await api.patch<{ incident: IncidentItem }>(`/incidents/${incidentId}/disposition`, data);
      setIncidents((prev) => prev.map((item) => (item.id === incidentId ? r.incident : item)));
      showToast(`Tiket penanganan berhasil diterbitkan untuk insiden ${r.incident.assetCode}!`);
    } catch (e: any) {
      showToast(e?.message || 'Gagal memproses tiket insiden.');
    }
  };

  const handleOpenReview = (journal: JournalEntry) => {
    setSelectedJournal(journal);
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (
    journalId: string,
    newStatus: 'REVIEWED' | 'NEEDS_CORRECTION',
    reviewNotes: string,
    sopComplied: boolean
  ) => {
    const r = await api.post<{ journal: JournalEntry }>(`/journals/${journalId}/reviews`, {
      status: newStatus,
      notes: reviewNotes,
      sopComplied,
    });
    setJournals((prev) => prev.map((j) => (j.id === journalId ? r.journal : j)));
    showToast(
      newStatus === 'REVIEWED'
        ? `Jurnal ${r.journal.code} telah diverifikasi & disetujui.`
        : `Jurnal ${r.journal.code} dikembalikan untuk perbaikan guru.`
    );
  };

  const openQRManager = (labId?: number) => {
    setQrLabId(labId ?? null);
    setIsCreateQROpen(true);
  };

  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAll().then(() => {
      setIsRefreshing(false);
      showToast('Data REJASA berhasil disinkronkan.');
    });
  };

  const notifications: HeaderNotification[] = [];
  if (pendingReviewCount > 0)
    notifications.push({
      id: 'n-review',
      title: 'Review Jurnal Diperlukan',
      desc: `${pendingReviewCount} jurnal laboratorium menunggu review.`,
      time: 'Saat ini',
      type: 'info',
    });
  if (activeIncidentsCount > 0)
    notifications.push({
      id: 'n-incident',
      title: 'Insiden Alat Terbuka',
      desc: `${activeIncidentsCount} insiden alat wajib ditindaklanjuti.`,
      time: 'Saat ini',
      type: 'danger',
    });

  if (!user) return null;

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-[#131b2e] flex flex-col antialiased selection:bg-[#00685f]/20 selection:text-[#00685f]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0F172A] text-white text-xs sm:text-sm px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-200">
          <span className="material-symbols-outlined text-[#89f5e7] text-[20px]">
            check_circle
          </span>
          <span className="font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingReviewCount}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        user={user}
        onLogout={logout}
      />

      {/* Main Layout Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Fixed Top Header */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenCreateQR={() => openQRManager()}
          canCreateQR={isAdmin}
          notifications={notifications}
          onOpenPrintReport={() => setIsPrintModalOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          unreadAlertCount={notifications.length}
        />

        {/* Main Content Area */}
        <main className="relative pt-20 px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full max-w-[1600px] mx-auto">
          {/* Dynamic Atmospheric Background Glow */}
          <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-[#00685f]/10 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -right-32 w-[32rem] h-[32rem] rounded-full bg-[#00687a]/5 blur-3xl pointer-events-none" />

          {loadError && (
            <div role="alert" className="relative z-10 mb-4 p-3 rounded-xl bg-[#FFF1F2] border border-rose-200 text-xs text-[#E11D48] flex items-center justify-between">
              <span>{loadError}</span>
              <button onClick={() => loadAll()} className="font-bold underline">Coba lagi</button>
            </div>
          )}
          {loading && <p className="relative z-10 text-xs text-slate-400 mb-4">Memuat data…</p>}

          {/* Tab Content switch */}
          {activeTab === 'dashboard' ? (
            <div className="relative z-10">
              {/* 1. HEADER RINGKASAN OPERASIONAL REAL-TIME */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs uppercase tracking-widest text-[#00685f] font-bold">
                      REJASA • RAPID ACCESS JOURNAL
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] text-xs font-semibold border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-[#059669] animate-ping"></span>
                      NODE SYNC ACTIVE
                    </span>
                  </div>
                  <h1 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-extrabold text-[#131b2e] tracking-tight">
                    Dashboard Laboratorium
                  </h1>
                  <p className="text-xs sm:text-sm text-[#3d4947] flex items-center gap-1.5 mt-1">
                    <span className="material-symbols-outlined text-[16px] text-[#00685f]">
                      verified
                    </span>
                    Sistem jurnal laboratorium digital untuk pencatatan cepat, review, dan pelacakan penggunaan laboratorium SMAN 3 Salatiga.
                  </p>
                </div>

                {/* Quick Action Controls & Clock */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {/* Realtime clock display */}
                  <div className="bg-white px-3.5 py-1.5 rounded-xl shadow-sm border border-[#E2E8F0] flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        Waktu Sistem REJASA
                      </span>
                      <span
                        id="realtime-clock"
                        className="font-mono text-xs sm:text-sm text-[#131b2e] font-bold"
                      >
                        {currentTime || 'Memuat waktu...'}
                      </span>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#00685f]"></div>
                  </div>

                  {/* Time Range Filter pills */}
                  <div className="flex items-center bg-white rounded-xl p-1 shadow-sm border border-[#E2E8F0]">
                    <button
                      onClick={() => setSelectedTimeRange('today')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        selectedTimeRange === 'today'
                          ? 'bg-[#e2e7ff] text-[#131b2e] shadow-2xs'
                          : 'text-slate-600 hover:text-[#131b2e]'
                      }`}
                    >
                      Hari Ini
                    </button>
                    <button
                      onClick={() => setSelectedTimeRange('yesterday')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedTimeRange === 'yesterday'
                          ? 'bg-[#e2e7ff] text-[#131b2e] font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-[#131b2e]'
                      }`}
                    >
                      Kemarin
                    </button>
                    <button
                      onClick={() => setSelectedTimeRange('week')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedTimeRange === 'week'
                          ? 'bg-[#e2e7ff] text-[#131b2e] font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-[#131b2e]'
                      }`}
                    >
                      Pekan Ini
                    </button>
                    <button
                      onClick={() => alert('Pilih rentang tanggal kustom.')}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                      title="Pilih Tanggal Manual"
                    >
                      <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    </button>
                  </div>

                  {/* Refresh Data button */}
                  <button
                    onClick={handleRefresh}
                    className="h-9 sm:h-10 px-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#131b2e] text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm border border-[#E2E8F0] transition-all active:scale-95"
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] text-[#00685f] ${
                        isRefreshing ? 'animate-spin' : ''
                      }`}
                    >
                      sync
                    </span>
                    <span className="hidden sm:inline">Refresh Data</span>
                  </button>
                </div>
              </div>

              {/* 2. EMPAT KARTU METRIK KPI UTAMA */}
              <MetricCards
                totalJournalsToday={totalJournalsToday}
                pendingReviewCount={pendingReviewCount}
                activeIncidentsCount={activeIncidentsCount}
                occupiedLabsCount={occupiedLabsCount}
                totalLabsCount={rooms.length}
                onFilterPending={() => {
                  setActiveTab('jurnal-laboratorium');
                }}
                onFilterIncidents={() => {
                  const firstOpen = incidents.find((i) => i.status === 'Open');
                  if (firstOpen) handleOpenIncidentModal(firstOpen);
                }}
              />

              {/* 3. STATUS REAL-TIME 5 BILIK LABORATORIUM */}
              <RoomStatusGrid
                rooms={rooms}
                onSelectRoom={(room) => {
                  showToast(`Melihat status terkini ${room.name} (${room.code})`);
                }}
                onOpenIncidentForRoom={handleOpenIncidentForRoom}
              />

              {/* 4. DUA KOLOM DATA UTAMA (BENTO SPLIT: DATA TABEL & INCIDENT HUB) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* KOLOM KIRI: TABEL JURNAL PRAKTIKUM & CHART (8 COLS) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  {/* Table Component */}
                  <JournalTable
                    journals={dashboardJournals}
                    searchQuery={searchQuery}
                    onReviewJournal={handleOpenReview}
                    onViewAllJournals={() => setActiveTab('jurnal-laboratorium')}
                  />

                  {/* Inline Bar Chart: Sebaran Alokasi Jam REJASA */}
                  <LabHoursChart allocations={weeklyAllocation} />
                </div>

                {/* KOLOM KANAN: ACTION NEEDED & INCIDENT HUB (4 COLS) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <IncidentHub
                    incidents={incidents}
                    usageStats={usageStats}
                    onOpenDispositionModal={handleOpenIncidentModal}
                    onViewAllIncidents={() => setActiveTab('audit-laporan')}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Subview Pages for Secondary Nav Items */
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#E2E8F0]">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Kembali ke Dashboard"
                  >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                  </button>
                  <div>
                    <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#131b2e]">
                      {activeTab === 'jurnal-laboratorium' && 'Jurnal Laboratorium'}
                      {activeTab === 'review-jurnal' && 'Review Jurnal'}
                      {activeTab === 'lab-qr-core' && 'Akses QR Laboratorium'}
                      {activeTab === 'inventaris-alat' && 'Manajemen Laboratorium'}
                      {activeTab === 'audit-laporan' && 'Audit & Laporan'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      REJASA — Rapid Access Journal SMAN 3 Salatiga
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-4 py-2 rounded-xl bg-[#00685f] text-white text-xs font-semibold hover:bg-[#008378]"
                >
                  Kembali ke Ringkasan Utama
                </button>
              </div>

              {/* View details */}
              {activeTab === 'jurnal-laboratorium' && (
                <JournalTable
                  journals={journals}
                  searchQuery={searchQuery}
                  onReviewJournal={handleOpenReview}
                  onViewAllJournals={() => {}}
                />
              )}

              {activeTab === 'review-jurnal' && (
                <div>
                  <div className="mb-4 p-4 rounded-xl bg-[#FFFBEB] border border-amber-200 text-xs text-amber-800">
                    Berikut adalah jurnal yang membutuhkan review laboran.
                  </div>
                  <JournalTable
                    journals={journals.filter((j) => j.status === 'SUBMITTED')}
                    searchQuery={searchQuery}
                    onReviewJournal={handleOpenReview}
                    onViewAllJournals={() => {}}
                  />
                </div>
              )}

              {activeTab === 'lab-qr-core' && isAdmin && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <h3 className="font-bold text-sm">QR Identitas Laboratorium</h3>
                      <p className="text-xs text-slate-500">
                        Cetak QR untuk ditempel di pintu laboratorium. Guru yang scan akan diarahkan ke alur jurnal; QR tidak berisi data inventaris.
                      </p>
                    </div>
                    <button
                      onClick={() => openQRManager()}
                      className="px-4 py-2 bg-[#00685f] text-white rounded-xl text-xs font-bold"
                    >
                      Kelola QR
                    </button>
                  </div>
                  <QRManager labs={labs} qrCodes={qrCodes} onManage={(id) => openQRManager(id)} />
                </div>
              )}

              {activeTab === 'inventaris-alat' && isAdmin && (
                <div className="space-y-6">
                  <InventoryPanel items={inventory} />
                  <IncidentHub
                    incidents={incidents}
                    usageStats={usageStats}
                    onOpenDispositionModal={handleOpenIncidentModal}
                    onViewAllIncidents={() => {}}
                  />
                </div>
              )}

              {activeTab === 'audit-laporan' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <h3 className="font-bold text-sm">Buku Register Kerusakan Alat (Bab 43)</h3>
                      <p className="text-xs text-slate-500">
                        Catatan kronologis insiden jurnal dan tindakan perbaikan.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsPrintModalOpen(true)}
                      className="px-4 py-2 bg-[#00685f] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">print</span>
                      Cetak Rekap Audit
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-200 rounded-xl">
                      <thead className="bg-slate-100 font-bold text-slate-700">
                        <tr>
                          <th className="p-3">Kode Alat</th>
                          <th className="p-3">Waktu Insiden</th>
                          <th className="p-3">Kerusakan</th>
                          <th className="p-3">Pelapor</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {incidents.map((inc) => (
                          <tr key={inc.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-[#E11D48]">{inc.assetCode}</td>
                            <td className="p-3">{inc.time}</td>
                            <td className="p-3">
                              <span className="font-semibold block">{inc.title}</span>
                              <span className="text-slate-500">{inc.description}</span>
                            </td>
                            <td className="p-3">{inc.reporter} ({inc.className})</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                                {inc.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: Tiket Disposisi Masalah Alat */}
      <IncidentModal
        isOpen={isIncidentModalOpen}
        incident={selectedIncident}
        onClose={() => {
          setIsIncidentModalOpen(false);
          setSelectedIncident(null);
        }}
        onSubmitDisposition={handleSubmitDisposition}
      />

      {/* MODAL 2: QR Laboratorium (ADMIN) */}
      <CreateQRModal
        isOpen={isCreateQROpen}
        onClose={() => setIsCreateQROpen(false)}
        labs={labs}
        initialLabId={qrLabId}
        onChanged={loadAll}
        onToast={showToast}
      />

      {/* MODAL 3: Review & Verifikasi Jurnal */}
      <ReviewJournalModal
        isOpen={isReviewModalOpen}
        journal={selectedJournal}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedJournal(null);
        }}
        onSubmitReview={handleSubmitReview}
      />

      {/* MODAL 4: Cetak Laporan */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        journals={journals}
        incidents={incidents}
        rooms={rooms}
      />
    </div>
  );
}
