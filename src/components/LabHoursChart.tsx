import React, { useState } from 'react';
import { DayAllocation } from '../types';

interface LabHoursChartProps {
  allocations: DayAllocation[];
}

export const LabHoursChart: React.FC<LabHoursChartProps> = ({ allocations }) => {
  const [hoveredDay, setHoveredDay] = useState<DayAllocation | null>(null);

  // SVG coordinates calculations
  const chartHeight = 120;
  const maxHours = 12;

  const getBarHeight = (hours: number) => {
    return (hours / maxHours) * 85;
  };

  const getBarY = (hours: number) => {
    return 100 - getBarHeight(hours);
  };

  const xPositions = [40, 150, 260, 370, 480];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E2E8F0]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#00687a] text-[20px]">
            bar_chart
          </span>
          <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#131b2e]">
            Sebaran Alokasi Jam Laboratorium (Pekan Ini)
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">Total 46 Jam Praktikum</span>
      </div>

      {/* SVG Bar Chart */}
      <div className="w-full relative">
        <svg
          className="w-full h-36 select-none"
          preserveAspectRatio="none"
          viewBox="0 0 600 130"
        >
          {/* Grid lines */}
          <line x1="0" y1="100" x2="600" y2="100" stroke="#E2E8F0" strokeDasharray="4" />
          <line x1="0" y1="60" x2="600" y2="60" stroke="#E2E8F0" strokeDasharray="4" />
          <line x1="0" y1="20" x2="600" y2="20" stroke="#E2E8F0" strokeDasharray="4" />

          {allocations.map((item, index) => {
            const x = xPositions[index] || 40 + index * 110;
            const barHeight = getBarHeight(item.hours);
            const barY = getBarY(item.hours);
            const isToday = item.isToday;

            return (
              <g
                key={item.day}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredDay(item)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {/* Background hover target */}
                <rect
                  x={x - 15}
                  y={10}
                  width="60"
                  height="110"
                  fill="transparent"
                  className="hover:fill-slate-50/70 transition-colors"
                />

                {/* Bar */}
                <rect
                  x={x}
                  y={barY}
                  width="30"
                  height={barHeight}
                  rx="4"
                  fill={isToday ? '#00687a' : '#00685f'}
                  opacity={isToday ? 1 : 0.85}
                  className="transition-all hover:opacity-100 hover:scale-y-102 origin-bottom"
                />

                {/* Day label */}
                <text
                  x={x + 15}
                  y="118"
                  textAnchor="middle"
                  fontFamily="Inter"
                  fontSize="12"
                  fontWeight={isToday ? '700' : '500'}
                  fill={isToday ? '#00687a' : '#64748B'}
                >
                  {item.day}
                </text>

                {/* Hours value */}
                <text
                  x={x + 15}
                  y={barY - 7}
                  textAnchor="middle"
                  fontFamily="Inter"
                  fontSize="12"
                  fontWeight="700"
                  fill={isToday ? '#00687a' : '#00685f'}
                >
                  {item.hours}j
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip display */}
        {hoveredDay && (
          <div className="absolute top-2 right-4 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg pointer-events-none animate-in fade-in duration-150">
            <span className="font-bold text-[#89f5e7]">{hoveredDay.day}: </span>
            <span>{hoveredDay.hours} Jam Praktikum ({hoveredDay.details})</span>
          </div>
        )}
      </div>
    </div>
  );
};
