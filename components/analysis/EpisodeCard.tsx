'use client';

import { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, MessageSquare, RefreshCw, Trash2 } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { Episode } from '@/types';

const PERIOD_COLORS: Record<string, string> = {
  '幼少期': 'bg-pink-50 text-pink-600',
  '小学生': 'bg-blue-50 text-blue-600',
  '中学生': 'bg-teal-50 text-teal-600',
  '高校生': 'bg-violet-50 text-violet-600',
  '大学生': 'bg-amber-50 text-amber-600',
  '社会人': 'bg-emerald-50 text-emerald-600',
};

function ScoreBar({ score }: { score: number | null }) {
  if (score === null) {
    return <p className="text-xs text-slate-300">モチベーション未入力</p>;
  }
  const pct = Math.abs(score) / 2;
  const color = score > 0 ? 'bg-blue-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 relative overflow-hidden">
        <div className="absolute left-1/2 top-0 w-px h-full bg-slate-300" />
        <div
          className={cn('absolute h-full rounded-full', color)}
          style={{
            width: `${pct}%`,
            left: score >= 0 ? '50%' : `${50 - pct}%`,
          }}
        />
      </div>
      <span className={cn('text-xs font-bold w-8 text-right tabular-nums', score >= 0 ? 'text-blue-600' : 'text-red-500')}>
        {score > 0 ? '+' : ''}{score}
      </span>
    </div>
  );
}

interface Props {
  episode: Episode;
  highlighted?: boolean;
  onDeepDive: (ep: Episode) => void;
  onDelete: (id: string) => void;
}

export function EpisodeCard({ episode, highlighted, onDeepDive, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      id={`ep-${episode.id}`}
      className={cn(
        'bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300',
        highlighted ? 'border-blue-400 ring-2 ring-blue-200 ring-offset-1' : 'border-slate-100'
      )}
    >
      <div
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', PERIOD_COLORS[episode.period] ?? 'bg-slate-100 text-slate-600')}>
              {episode.period}
            </span>
            {episode.age != null && (
              <span className="text-xs text-slate-400">{episode.age}歳</span>
            )}
            {episode.isDeepDived && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <CheckCircle2 size={10} /> 深掘り済み
              </span>
            )}
            {!episode.isDeepDived && (
              <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                未深掘り
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-800 leading-snug">{episode.title}</p>
          <div className="mt-2">
            <ScoreBar score={episode.motivationScore} />
          </div>
        </div>
        {expanded
          ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0 mt-1" />
          : <ChevronDown size={16} className="text-slate-400 flex-shrink-0 mt-1" />
        }
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-50 pt-3 space-y-3">
          {/* AI summary (if deep dived) */}
          {episode.isDeepDived && episode.aiConclusion && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 space-y-2 border border-blue-100">
              <p className="text-xs font-bold text-blue-700">✨ AI分析結果</p>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">{episode.aiConclusion}</p>
              {episode.aiDetail && (
                <p className="text-xs text-slate-600 leading-relaxed">{episode.aiDetail}</p>
              )}
              {(episode.extractedStrengths?.length || episode.extractedValues?.length) ? (
                <div className="flex flex-wrap gap-1 pt-1">
                  {episode.extractedStrengths?.map((s) => (
                    <span key={s} className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">💪 {s}</span>
                  ))}
                  {episode.extractedValues?.map((v) => (
                    <span key={v} className="text-xs bg-violet-100 text-violet-700 rounded-full px-2 py-0.5">🌟 {v}</span>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {!episode.isDeepDived ? (
              <button
                onClick={(e) => { e.stopPropagation(); onDeepDive(episode); }}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors px-3 py-1.5 rounded-xl"
              >
                <MessageSquare size={12} /> 深掘りする
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onDeepDive(episode); }}
                className="flex items-center gap-1.5 text-xs font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors px-3 py-1.5 rounded-xl"
              >
                <RefreshCw size={11} /> 再度深掘りする
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(episode.id); }}
              className="ml-auto text-slate-300 hover:text-red-400 transition-colors p-1"
            >
              <Trash2 size={13} />
            </button>
          </div>
          <p className="text-xs text-slate-400">登録：{formatDate(episode.createdAt)}</p>
        </div>
      )}
    </div>
  );
}
