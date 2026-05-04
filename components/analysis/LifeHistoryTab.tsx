'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { MotivationChart, EPISODE_PERIODS } from './MotivationChart';
import { EpisodeCard } from './EpisodeCard';
import type { Episode, EpisodePeriod } from '@/types';
import type { TabId } from '@/components/layout/types';

const PERIOD_COLORS: Record<EpisodePeriod, { header: string; badge: string }> = {
  '幼少期': { header: 'border-pink-200 bg-pink-50', badge: 'bg-pink-100 text-pink-700' },
  '小学生': { header: 'border-blue-200 bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
  '中学生': { header: 'border-teal-200 bg-teal-50', badge: 'bg-teal-100 text-teal-700' },
  '高校生': { header: 'border-violet-200 bg-violet-50', badge: 'bg-violet-100 text-violet-700' },
  '大学生': { header: 'border-amber-200 bg-amber-50', badge: 'bg-amber-100 text-amber-700' },
  '社会人': { header: 'border-emerald-200 bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
};

interface Props {
  onTabChange: (tab: TabId) => void;
  highlightedEpisodeId: string | null;
  onClearHighlight: () => void;
}

function EpisodeAddForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: Omit<Episode, 'id' | 'createdAt' | 'updatedAt' | 'isDeepDived'>) => void;
  onCancel: () => void;
}) {
  const [period, setPeriod] = useState<EpisodePeriod>('社会人');
  const [age, setAge] = useState('');
  const [title, setTitle] = useState('');
  const [score, setScore] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ period, age: age ? Number(age) : undefined, title: title.trim(), motivationScore: score });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">エピソードを追加</p>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      </div>

      {/* Period */}
      <div>
        <label className="text-xs font-medium text-slate-500 mb-2 block">時代</label>
        <div className="flex flex-wrap gap-1.5">
          {EPISODE_PERIODS.map((p) => (
            <button
              key={p} type="button" onClick={() => setPeriod(p)}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-medium border transition-colors',
                period === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Age */}
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1.5 block">年齢（任意）</label>
          <input
            type="number" min={1} max={100} value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="歳"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* Title */}
        <div className="col-span-2">
          <label className="text-xs font-medium text-slate-500 mb-1.5 block">出来事 *</label>
          <input
            type="text" value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：文化祭のリーダーを経験"
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {/* Score */}
      <div>
        <label className="text-xs font-medium text-slate-500 mb-1.5 block">
          モチベーションスコア：
          <span className={cn('ml-1 font-bold', score >= 0 ? 'text-blue-600' : 'text-red-500')}>
            {score > 0 ? '+' : ''}{score}
          </span>
        </label>
        <input
          type="range" min={-100} max={100} step={5} value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-0.5">
          <span>-100</span><span>0</span><span>+100</span>
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
          キャンセル
        </button>
        <button type="submit"
          className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
          追加する
        </button>
      </div>
    </form>
  );
}

export function LifeHistoryTab({ onTabChange, highlightedEpisodeId, onClearHighlight }: Props) {
  const { episodes, setEpisodes, chatSessions, setChatSessions, setActiveChatSessionId, setActiveEpisodeForDeepDive } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<EpisodePeriod | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleAdd = (data: Omit<Episode, 'id' | 'createdAt' | 'updatedAt' | 'isDeepDived'>) => {
    const now = new Date().toISOString();
    const ep: Episode = { ...data, id: generateId(), isDeepDived: false, createdAt: now, updatedAt: now };
    setEpisodes([...episodes, ep]);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setEpisodes(episodes.filter((e) => e.id !== id));
  };

  const handleDeepDive = (ep: Episode) => {
    const sessionId = generateId();
    const introMsg = {
      id: generateId(),
      role: 'assistant' as const,
      content: `このエピソードについて深掘りしていきましょう。\n\n「${ep.title}」という出来事ですね。まず、この出来事の中で一番印象に残っている場面を教えてください。`,
      createdAt: new Date().toISOString(),
    };
    const newSession = {
      id: sessionId,
      name: `${ep.period}：${ep.title.slice(0, 15)}${ep.title.length > 15 ? '…' : ''}`,
      createdAt: new Date().toISOString(),
      messages: [introMsg],
    };
    setChatSessions([...chatSessions, newSession]);
    setActiveChatSessionId(sessionId);
    setActiveEpisodeForDeepDive({
      episodeId: ep.id,
      period: ep.period,
      age: ep.age,
      title: ep.title,
      motivationScore: ep.motivationScore,
      chatSessionId: sessionId,
    });
    onTabChange('chat');
  };

  const filteredEpisodes = selectedPeriod
    ? episodes.filter((e) => e.period === selectedPeriod)
    : episodes;
  const sortedEpisodes = [...filteredEpisodes].sort((a, b) =>
    EPISODE_PERIODS.indexOf(a.period) - EPISODE_PERIODS.indexOf(b.period)
  );

  return (
    <div className="flex-1 overflow-y-auto pb-20 md:pb-0 bg-slate-50">
      <div className="p-5 max-w-3xl space-y-4">

        {/* Period timeline header */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {EPISODE_PERIODS.map((p) => {
            const count = episodes.filter((e) => e.period === p).length;
            const colors = PERIOD_COLORS[p];
            const isSelected = selectedPeriod === p;
            return (
              <button
                key={p}
                onClick={() => setSelectedPeriod(isSelected ? null : p)}
                className={cn(
                  'flex flex-col items-center py-2.5 px-2 rounded-xl border transition-all text-center',
                  isSelected
                    ? `${colors.header} border-2`
                    : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                )}
              >
                <p className="text-xs font-semibold text-slate-700">{p}</p>
                <span className={cn('text-xs font-bold mt-0.5 px-1.5 py-0.5 rounded-full', colors.badge)}>
                  {count}件
                </span>
              </button>
            );
          })}
        </div>

        {/* Motivation chart */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-600">モチベーション推移</p>
            {selectedPeriod && (
              <button onClick={() => setSelectedPeriod(null)} className="text-xs text-blue-600 hover:underline">
                全期間を表示
              </button>
            )}
          </div>
          <MotivationChart
            episodes={episodes}
            selectedPeriod={selectedPeriod}
            onPeriodSelect={(p) => setSelectedPeriod(selectedPeriod === p ? null : p)}
          />
          <p className="text-xs text-slate-400 text-center mt-1">各点をクリックして時代を選択</p>
        </div>

        {/* Add episode */}
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-dashed border-blue-200 text-blue-600 rounded-2xl text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            <Plus size={16} /> エピソードを追加する
          </button>
        ) : (
          <EpisodeAddForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
        )}

        {/* Episode list */}
        <div className="space-y-3">
          {selectedPeriod && (
            <p className="text-xs font-semibold text-slate-500 flex items-center gap-2">
              <span className={cn('px-2 py-0.5 rounded-full text-xs', PERIOD_COLORS[selectedPeriod].badge)}>{selectedPeriod}</span>
              のエピソード（{sortedEpisodes.length}件）
            </p>
          )}
          {sortedEpisodes.length === 0 && (
            <div className="text-center py-10 text-slate-400">
              <p className="text-sm">エピソードがありません</p>
              <p className="text-xs mt-1">上のボタンから追加してください</p>
            </div>
          )}
          {sortedEpisodes.map((ep) => (
            <EpisodeCard
              key={ep.id}
              episode={ep}
              highlighted={highlightedEpisodeId === ep.id}
              onDeepDive={handleDeepDive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
