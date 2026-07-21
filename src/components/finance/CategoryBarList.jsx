import React from 'react';

// Validated categorical slots (blue, green, magenta, yellow) — safe for up to
// 4 series; anything beyond that folds into "อื่นๆ" (gray, non-categorical).
const SLOT_COLORS = ['#2a78d6', '#008300', '#e87ba4', '#eda100'];
const OTHER_COLOR = '#94a3b8';

const formatBaht = (n) => Math.round(n).toLocaleString('th-TH');

// Ranked horizontal bar list for a category breakdown (income or expense).
// `data` must already be sorted descending by amount (backend does this).
const CategoryBarList = ({ title, data, emptyText = 'ไม่มีข้อมูลในช่วงนี้' }) => {
  const rows = (() => {
    if (!data || data.length === 0) return [];
    if (data.length <= 4) return data.map((d, i) => ({ ...d, color: SLOT_COLORS[i] }));

    const top = data.slice(0, 4).map((d, i) => ({ ...d, color: SLOT_COLORS[i] }));
    const rest = data.slice(4);
    const otherAmount = rest.reduce((sum, d) => sum + d.amount, 0);
    const otherPercent = rest.reduce((sum, d) => sum + d.percent, 0);
    return [...top, { category: 'อื่นๆ', amount: otherAmount, percent: otherPercent, color: OTHER_COLOR }];
  })();

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <h4 className="font-bold text-slate-700 mb-4">{title}</h4>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-400 italic py-6 text-center">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.category}>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-bold text-slate-700">{row.category}</span>
                <span className="text-xs text-slate-400">
                  ฿{formatBaht(row.amount)} <span className="font-bold text-slate-500">({row.percent.toFixed(0)}%)</span>
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, row.percent)}%`, background: row.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryBarList;
