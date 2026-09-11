import React from 'react';
import { LabRoom } from '../types';

interface RoomStatusGridProps {
  rooms: LabRoom[];
  onSelectRoom?: (room: LabRoom) => void;
  onOpenIncidentForRoom?: (roomCode: string) => void;
}

export const RoomStatusGrid: React.FC<RoomStatusGridProps> = ({
  rooms,
  onSelectRoom,
  onOpenIncidentForRoom,
}) => {
  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#00685f] text-[22px]">sensors</span>
          <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#131b2e]">
            Live Status Bilik Laboratorium
          </h2>
          <span className="text-xs text-slate-400 hidden md:inline">
            (Otomatis refresh via QR Check-In Guru)
          </span>
        </div>
        <span className="font-mono text-xs font-semibold text-[#00685f] bg-[#00685f]/10 px-3 py-1 rounded-full w-fit">
          SOP-LAB-019 REV 4
        </span>
      </div>

      {/* 5 Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {rooms.map((room) => {
          const isProblem = room.statusType === 'problem';
          const isSuccess = room.statusType === 'reviewed';
          const isActive = room.statusType === 'active';
          const isStandby = room.statusType === 'standby';

          return (
            <div
              key={room.id}
              id={`room-card-${room.code.toLowerCase()}`}
              onClick={() => onSelectRoom && onSelectRoom(room)}
              className={`bg-white rounded-xl p-4 shadow-sm border border-[#E2E8F0] relative overflow-hidden flex flex-col justify-between group hover:-translate-y-0.5 transition-all ${
                isStandby ? 'opacity-90 hover:opacity-100' : ''
              }`}
            >
              {/* Background atmospheric accent corner */}
              {isProblem && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#E11D48]/5 rounded-bl-full pointer-events-none" />
              )}
              {isSuccess && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#059669]/5 rounded-bl-full pointer-events-none" />
              )}
              {isActive && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00685f]/5 rounded-bl-full pointer-events-none" />
              )}

              <div>
                {/* Room top badges */}
                <div className="flex items-center justify-between mb-2.5">
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${room.badgeBg} ${room.badgeColor}`}
                  >
                    {room.badgeCode}
                  </span>

                  {isProblem && (
                    <span className="flex items-center gap-1 text-xs font-bold text-[#E11D48] px-2 py-0.5 rounded bg-[#FFF1F2]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-ping"></span>
                      Insiden
                    </span>
                  )}
                  {isSuccess && (
                    <span className="flex items-center gap-1 text-xs font-bold text-[#059669] px-2 py-0.5 rounded bg-[#ECFDF5]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                      Berjalan
                    </span>
                  )}
                  {isActive && (
                    <span className="flex items-center gap-1 text-xs font-bold text-[#00685f] px-2 py-0.5 rounded bg-[#89f5e7]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00685f] animate-pulse"></span>
                      Praktikum
                    </span>
                  )}
                  {isStandby && (
                    <span className="text-xs font-bold text-slate-500 px-2 py-0.5 rounded bg-[#e2e7ff]/70">
                      {room.status}
                    </span>
                  )}
                </div>

                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#131b2e] truncate">
                  {room.name}
                </h3>

                {/* Information lines */}
                <div className="mt-2 space-y-1">
                  {room.className && (
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">
                        group
                      </span>
                      <span className="font-semibold text-slate-900 truncate">
                        {room.className}
                      </span>
                    </p>
                  )}
                  {room.topic && (
                    <p className="text-xs text-slate-600 flex items-center gap-1.5 truncate">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">
                        {isStandby ? 'laptop_chromebook' : room.code.includes('FIS') ? 'bolt' : 'science'}
                      </span>
                      <span className="truncate">{room.topic}</span>
                    </p>
                  )}
                  {room.teacher && (
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">
                        {room.teacher.startsWith('Sesi') ? 'schedule' : 'person'}
                      </span>
                      <span className="truncate">{room.teacher}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom footer status strip */}
              <div
                className={`mt-3 pt-2 -mx-4 -mb-4 p-3 rounded-b-xl flex items-center justify-between border-t border-slate-100 ${
                  isProblem
                    ? 'bg-[#FFF1F2]/60 hover:bg-[#FFF1F2] cursor-pointer'
                    : isSuccess
                    ? 'bg-[#ECFDF5]/50'
                    : 'bg-slate-50'
                }`}
                onClick={(e) => {
                  if (isProblem && onOpenIncidentForRoom) {
                    e.stopPropagation();
                    onOpenIncidentForRoom(room.code);
                  }
                }}
              >
                <span
                  className={`text-xs font-semibold truncate flex items-center gap-1 ${
                    isProblem
                      ? 'text-[#E11D48]'
                      : isSuccess
                      ? 'text-[#059669]'
                      : isActive
                      ? 'text-slate-700'
                      : 'text-slate-500 font-medium'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isProblem
                      ? 'warning'
                      : isSuccess
                      ? 'check_circle'
                      : isActive
                      ? 'timer'
                      : room.statusDetailType === 'info' && room.actionLabel === 'Kunci'
                      ? 'verified'
                      : 'lock_clock'}
                  </span>
                  <span className="truncate">{room.statusDetail}</span>
                </span>

                {room.actionLabel ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`${room.actionLabel} dikonfirmasi untuk ${room.name}`);
                    }}
                    className="text-[#00685f] text-xs font-bold hover:underline ml-1"
                  >
                    {room.actionLabel}
                  </button>
                ) : (
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      isProblem
                        ? 'text-[#E11D48]'
                        : isSuccess
                        ? 'text-[#059669]'
                        : 'text-slate-400'
                    }`}
                  >
                    chevron_right
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
