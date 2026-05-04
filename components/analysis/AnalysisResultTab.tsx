'use client';

import { useApp } from '@/context/AppContext';
import { mockAnalysisResult } from '@/lib/mockData';
import type { Episode } from '@/types';

const EPISODE_KEYWORD_MAP: Record<string, string[]> = {
  '調整力': ['リーダー', '文化祭', '調整', 'まとめ'],
  '実行力': ['レギュラー', 'インターン', '部活', 'プロジェクト'],
  '論理思考力': ['分析', 'コンサル', '課題'],
  '完璧主義': ['評価', '不満'],
  '成長・挑戦': ['挑戦', '成長', '新しい'],
  '裁量・自律': ['裁量', '自律'],
};

function findRelatedEpisodes(keyword: string, allEpisodes: Episode[]): Episode[] {
  const kws = EPISODE_KEYWORD_MAP[keyword] ?? keyword.split('').slice(0, 3);
  return allEpisodes.filter((ep) =>
    kws.some((kw) => ep.title.includes(kw))
  );
}

interface Props {
  onJumpToEpisode: (id: string) => void;
}

export function AnalysisResultTab({ onJumpToEpisode }: Props) {
  const { episodes } = useApp();
  const result = mockAnalysisResult;

  const sections = [
    { label: '強み', emoji: '💪', items: result.strengths, color: 'bg-blue-50 border-blue-100' },
    { label: '弱み・課題', emoji: '🔍', items: result.weaknesses, color: 'bg-amber-50 border-amber-100' },
    { label: '価値観', emoji: '🌟', items: result.values, color: 'bg-violet-50 border-violet-100' },
    { label: 'モチベーション源', emoji: '🔥', items: result.motivationSources, color: 'bg-emerald-50 border-emerald-100' },
    { label: 'ストレス要因', emoji: '⚡', items: result.stressFactors, color: 'bg-red-50 border-red-100' },
    { label: '思考パターン', emoji: '🧠', items: result.thinkingPatterns, color: 'bg-slate-50 border-slate-200' },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-20 md:pb-0 bg-slate-50">
      <div className="p-5 max-w-3xl space-y-4">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-700 leading-relaxed">
          ⚡ 分析結果はエピソード情報をもとに生成されています。深掘りを増やすほど精度が向上します。
        </div>

        {sections.map(({ label, emoji, items, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 mb-3">{emoji} {label}</h3>
            <div className="space-y-3">
              {items.map((item, i) => {
                const related = findRelatedEpisodes(item.title, episodes);
                return (
                  <div key={i} className={`rounded-xl p-3 border ${color}`}>
                    <p className="text-sm font-semibold text-slate-800 mb-1">{item.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed mb-2">根拠：{item.basis}</p>
                    {related.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-600">根拠エピソード：</p>
                        {related.map((ep) => (
                          <button
                            key={ep.id}
                            onClick={() => onJumpToEpisode(ep.id)}
                            className="block text-left w-full text-xs text-blue-600 hover:underline hover:text-blue-800 transition-colors"
                          >
                            → {ep.period}：{ep.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
