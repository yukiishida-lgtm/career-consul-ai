'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { LifeEvent, LifePeriod } from '@/types';
import { cn } from '@/lib/utils';

const PERIODS: LifePeriod[] = ['小学生', '中学生', '高校生', '大学生', '社会人', '現在'];

interface Props {
  onSubmit: (data: Omit<LifeEvent, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function TimelineForm({ onSubmit, onCancel }: Props) {
  const [period, setPeriod] = useState<LifePeriod>('社会人');
  const [title, setTitle] = useState('');
  const [emotion, setEmotion] = useState('');
  const [motivationScore, setMotivationScore] = useState(0);
  const [memo, setMemo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ period, title, emotion, motivationScore, memo });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700">エピソードを入力</h3>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X size={18} />
        </button>
      </div>

      {/* Period */}
      <div className="mb-4">
        <label className="text-xs font-medium text-slate-600 block mb-2">時期</label>
        <div className="flex gap-2 flex-wrap">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors',
                period === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="text-xs font-medium text-slate-600 block mb-2">出来事 *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：文化祭のリーダーを経験した"
          required
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* Emotion */}
      <div className="mb-4">
        <label className="text-xs font-medium text-slate-600 block mb-2">感情</label>
        <input
          type="text"
          value={emotion}
          onChange={(e) => setEmotion(e.target.value)}
          placeholder="例：充実感・責任感"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* Motivation score */}
      <div className="mb-4">
        <label className="text-xs font-medium text-slate-600 block mb-2">
          モチベーションスコア：
          <span className={cn('ml-1 font-bold', motivationScore >= 0 ? 'text-blue-600' : 'text-red-500')}>
            {motivationScore > 0 ? '+' : ''}{motivationScore}
          </span>
        </label>
        <input
          type="range"
          min={-100}
          max={100}
          step={5}
          value={motivationScore}
          onChange={(e) => setMotivationScore(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>-100</span>
          <span>0</span>
          <span>+100</span>
        </div>
      </div>

      {/* Memo */}
      <div className="mb-5">
        <label className="text-xs font-medium text-slate-600 block mb-2">メモ</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="このエピソードについて補足があれば..."
          rows={3}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          追加する
        </button>
      </div>
    </form>
  );
}
