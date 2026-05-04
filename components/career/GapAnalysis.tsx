'use client';

import type { GapItem } from '@/types';

function GapBar({ item }: { item: GapItem }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-700">{item.label}</span>
        <div className="flex gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            現在 {item.current}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
            理想 {item.ideal}
          </span>
        </div>
      </div>
      <div className="relative">
        {/* Ideal bar (background) */}
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-200 rounded-full"
            style={{ width: `${item.ideal}%` }}
          />
        </div>
        {/* Current bar (overlay) */}
        <div
          className="h-3 bg-blue-500 rounded-full absolute top-0 left-0"
          style={{ width: `${item.current}%` }}
        />
      </div>
      <div className="flex justify-end mt-1">
        <span className="text-xs text-amber-600 font-medium">
          ギャップ: {item.ideal - item.current}pt
        </span>
      </div>
    </div>
  );
}

export function GapAnalysis({ gaps }: { gaps: GapItem[] }) {
  const totalCurrent = Math.round(gaps.reduce((s, g) => s + g.current, 0) / gaps.length);
  const totalIdeal = Math.round(gaps.reduce((s, g) => s + g.ideal, 0) / gaps.length);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-slate-800">ギャップ分析</h2>
          <div className="text-right">
            <p className="text-xs text-slate-500">総合スコア</p>
            <p className="text-lg font-bold text-blue-600">{totalCurrent}<span className="text-slate-400 text-sm font-normal">/{totalIdeal}</span></p>
          </div>
        </div>
        {gaps.map((item) => (
          <GapBar key={item.label} item={item} />
        ))}
      </div>

      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">💡 AIアドバイス</h3>
        <p className="text-sm text-amber-700 leading-relaxed">
          人脈・実績・市場理解のギャップが大きい傾向があります。まず「人脈」を広げることで、他の項目も連鎖的に改善できる可能性があります。
          社外コミュニティへの参加や、LinkedInの活用から始めてみましょう。
        </p>
      </div>
    </div>
  );
}
