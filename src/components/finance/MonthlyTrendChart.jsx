import React, { useState } from 'react';

const COLOR_INCOME = '#008300';
const COLOR_EXPENSE = '#e34948';

const formatBaht = (n) => Math.round(n).toLocaleString('th-TH');
const formatCompact = (n) => (n >= 1000 ? `${Math.round(n / 1000)}k` : formatBaht(n));

const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const monthLabel = (ym) => {
  const [y, m] = ym.split('-').map(Number);
  const buddhistYear = (y + 543) % 100;
  return `${THAI_MONTHS[m - 1]} ${buddhistYear}`;
};

// Grouped bar chart: income (green) vs expense (red) per month, trailing 6 months.
const MonthlyTrendChart = ({ data }) => {
  const [hovered, setHovered] = useState(null);

  if (!data || data.length === 0) return null;

  const width = 640;
  const height = 240;
  const padLeft = 44;
  const padRight = 12;
  const padTop = 28;
  const padBottom = 34;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const maxVal = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]));
  const chartMax = maxVal * 1.15;

  const groupW = plotW / data.length;
  const barW = groupW * 0.32;
  const barGap = 4;

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  const yFor = (v) => padTop + plotH - (v / chartMax) * plotH;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="กราฟรายรับรายจ่ายรายเดือน">
        {/* Gridlines + axis labels */}
        {gridLines.map((g) => {
          const y = yFor(chartMax * g);
          return (
            <g key={g}>
              <line x1={padLeft} x2={width - padRight} y1={y} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <text x={padLeft - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#94a3b8">
                {formatCompact(chartMax * g)}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const groupX = padLeft + i * groupW;
          const centerX = groupX + groupW / 2;
          const incomeX = centerX - barGap / 2 - barW;
          const expenseX = centerX + barGap / 2;
          const incomeY = yFor(d.income);
          const expenseY = yFor(d.expense);
          const baseline = yFor(0);
          const isHovered = hovered === i;

          return (
            <g key={d.month}>
              {/* hover hit target, bigger than the bars */}
              <rect
                x={groupX}
                y={padTop}
                width={groupW}
                height={plotH}
                fill={isHovered ? '#f8fafc' : 'transparent'}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />

              <rect x={incomeX} y={incomeY} width={barW} height={Math.max(0, baseline - incomeY)} rx="3" fill={COLOR_INCOME} opacity={isHovered ? 1 : 0.9} />
              <rect x={expenseX} y={expenseY} width={barW} height={Math.max(0, baseline - expenseY)} rx="3" fill={COLOR_EXPENSE} opacity={isHovered ? 1 : 0.9} />

              {isHovered && (
                <>
                  <text x={incomeX + barW / 2} y={incomeY - 6} textAnchor="middle" fontSize="10" fontWeight="bold" fill={COLOR_INCOME}>
                    {formatBaht(d.income)}
                  </text>
                  <text x={expenseX + barW / 2} y={expenseY - 6} textAnchor="middle" fontSize="10" fontWeight="bold" fill={COLOR_EXPENSE}>
                    {formatBaht(d.expense)}
                  </text>
                </>
              )}

              <text x={centerX} y={height - padBottom + 16} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight={isHovered ? 'bold' : 'normal'}>
                {monthLabel(d.month)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-2 text-xs font-bold text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COLOR_INCOME }} /> รายรับ</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COLOR_EXPENSE }} /> รายจ่าย</span>
      </div>
    </div>
  );
};

export default MonthlyTrendChart;
