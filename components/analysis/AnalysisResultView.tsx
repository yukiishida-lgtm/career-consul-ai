'use client';

import type { AnalysisResult } from '@/types';

interface ItemProps {
  title: string;
  basis: string;
  color: string;
}

function AnalysisItem({ title, basis, color }: ItemProps) {
  return (
    <div className={`rounded-xl p-3 ${color}`}>
      <p className="text-sm font-semibold text-slate-800 mb-1">{title}</p>
      <p className="text-xs text-slate-500 leading-relaxed">根拠：{basis}</p>
    </div>
  );
}

interface SectionProps {
  title: string;
  emoji: string;
  items: { title: string; basis: string }[];
  color: string;
}

function Section({ title, emoji, items, color }: SectionProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">
        {emoji} {title}
      </h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <AnalysisItem key={i} {...item} color={color} />
        ))}
      </div>
    </div>
  );
}

export function AnalysisResultView({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-2xl p-4 text-sm text-blue-700">
        ⚡ 分析結果はエピソード入力に基づいて自動生成されています。エピソードを増やすほど精度が上がります。
      </div>
      <Section title="強み" emoji="💪" items={result.strengths} color="bg-blue-50" />
      <Section title="弱み・課題" emoji="🔍" items={result.weaknesses} color="bg-amber-50" />
      <Section title="価値観" emoji="🌟" items={result.values} color="bg-violet-50" />
      <Section title="モチベーション源" emoji="🔥" items={result.motivationSources} color="bg-emerald-50" />
      <Section title="ストレス要因" emoji="⚡" items={result.stressFactors} color="bg-red-50" />
      <Section title="思考パターン" emoji="🧠" items={result.thinkingPatterns} color="bg-slate-50" />
    </div>
  );
}
