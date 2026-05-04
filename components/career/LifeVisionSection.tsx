'use client';

import { useState, useCallback } from 'react';
import { Edit3, Check, Sparkles } from 'lucide-react';
import { storage } from '@/lib/storage';
import { cn } from '@/lib/utils';
import type { LifeVision, VisionCell } from '@/types';

// ── Default data ───────────────────────────────────────────────────

const DEFAULT_CELLS: VisionCell[] = [
  { id: 'c1', category: 'キャリア',       title: 'マネージャーに昇格',    memo: 'チームをリードする立場へ',         emoji: '🚀', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'c2', category: '収入',           title: '年収1,000万円',          memo: '市場価値を高めて達成',             emoji: '💰', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { id: 'c3', category: 'スキル',         title: 'AI/DX専門家',            memo: '生成AIを武器にしたプロ',           emoji: '🧠', color: 'bg-violet-50 border-violet-200 text-violet-700' },
  { id: 'c4', category: '健康',           title: 'フルマラソン完走',       memo: '毎日30分ランニング継続',           emoji: '🏃', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { id: 'c5', category: '学習',           title: 'MBA・資格取得',          memo: '経営・専門知識を体系化',           emoji: '📚', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { id: 'c6', category: '独立',           title: '副業で月10万円',         memo: '複数の収入源を構築する',           emoji: '⚡', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  { id: 'c7', category: 'プライベート',   title: '理想のライフスタイル',   memo: '仕事と私生活のバランスを実現',     emoji: '🌿', color: 'bg-teal-50 border-teal-200 text-teal-700' },
  { id: 'c8', category: '旅行・体験',     title: '年2回の海外旅行',        memo: 'ヨーロッパとアジアを制覇',         emoji: '✈️', color: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
];

const DEFAULT_VISION: LifeVision = {
  yearTheme: '挑戦と成長の年',
  cells: DEFAULT_CELLS,
};

// ── Cell Edit Modal ────────────────────────────────────────────────

function CellEditModal({
  cell, onSave, onClose,
}: {
  cell: VisionCell;
  onSave: (cell: VisionCell) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState({ ...cell });

  const EMOJI_OPTIONS = ['🚀','💰','🧠','🏃','📚','⚡','🌿','✈️','❤️','🏠','🎯','🌟','💡','🤝','🎨','🏆'];
  const COLOR_OPTIONS: { label: string; value: string }[] = [
    { label: 'ブルー',   value: 'bg-blue-50 border-blue-200 text-blue-700' },
    { label: 'グリーン', value: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    { label: 'パープル', value: 'bg-violet-50 border-violet-200 text-violet-700' },
    { label: 'オレンジ', value: 'bg-orange-50 border-orange-200 text-orange-700' },
    { label: 'アンバー', value: 'bg-amber-50 border-amber-200 text-amber-700' },
    { label: 'ティール', value: 'bg-teal-50 border-teal-200 text-teal-700' },
    { label: 'シアン',   value: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
    { label: 'ピンク',   value: 'bg-pink-50 border-pink-200 text-pink-700' },
  ];

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-bold text-slate-700 mb-4">マスを編集</h3>

        <div className="space-y-3">
          {/* Emoji picker */}
          <div>
            <p className="text-xs text-slate-500 mb-1.5">絵文字</p>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  key={em}
                  onClick={() => setDraft({ ...draft, emoji: em })}
                  className={cn(
                    'w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-colors',
                    draft.emoji === em ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-slate-50 hover:bg-slate-100'
                  )}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <p className="text-xs text-slate-500 mb-1">カテゴリ</p>
            <input
              type="text"
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Title */}
          <div>
            <p className="text-xs text-slate-500 mb-1">タイトル</p>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className="w-full text-sm font-semibold border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Memo */}
          <div>
            <p className="text-xs text-slate-500 mb-1">一言メモ</p>
            <input
              type="text"
              value={draft.memo}
              onChange={(e) => setDraft({ ...draft, memo: e.target.value })}
              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Color */}
          <div>
            <p className="text-xs text-slate-500 mb-1.5">カラー</p>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setDraft({ ...draft, color: c.value })}
                  className={cn(
                    'text-[10px] px-2 py-1 rounded-lg border font-semibold transition-colors',
                    c.value,
                    draft.color === c.value ? 'ring-2 ring-blue-400' : ''
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => { onSave(draft); onClose(); }}
            className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <Check size={14} /> 保存
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Vision Cell ───────────────────────────────────────────────────

function VisionCellCard({
  cell, isCenter, onEdit,
}: {
  cell: VisionCell;
  isCenter?: boolean;
  onEdit: () => void;
}) {
  if (isCenter) {
    return (
      <div className="relative bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl p-4 flex flex-col items-center justify-center text-center aspect-square shadow-md">
        <Sparkles size={16} className="text-blue-200 mb-1" />
        <p className="text-[10px] text-blue-200 font-semibold mb-1">今年のテーマ</p>
        <p className="text-sm font-black text-white leading-snug">{cell.title}</p>
        <button
          onClick={onEdit}
          className="absolute top-2 right-2 w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <Edit3 size={11} className="text-white" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative rounded-2xl border-2 p-3 flex flex-col items-center justify-center text-center aspect-square cursor-pointer hover:shadow-md transition-all group',
        cell.color
      )}
    >
      <span className="text-2xl mb-1.5">{cell.emoji}</span>
      <p className="text-[9px] font-semibold opacity-70 mb-0.5">{cell.category}</p>
      <p className="text-xs font-bold leading-snug">{cell.title}</p>
      <p className="text-[9px] opacity-60 mt-0.5 leading-snug line-clamp-2">{cell.memo}</p>
      <button
        onClick={onEdit}
        className="absolute top-1.5 right-1.5 w-5 h-5 bg-white/70 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit3 size={10} className="text-slate-500" />
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────

export function LifeVisionSection() {
  const saved = storage.getLifeVision();
  const [vision, setVision] = useState<LifeVision>(saved ?? DEFAULT_VISION);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTheme, setEditingTheme] = useState(false);
  const [themeInput, setThemeInput] = useState(vision.yearTheme);

  const saveVision = useCallback((next: LifeVision) => {
    setVision(next);
    storage.setLifeVision(next);
  }, []);

  const saveCell = useCallback((updated: VisionCell) => {
    if (updated.id === 'center') {
      saveVision({ ...vision, yearTheme: updated.title });
    } else {
      saveVision({
        ...vision,
        cells: vision.cells.map((c) => c.id === updated.id ? updated : c),
      });
    }
  }, [vision, saveVision]);

  const saveTheme = () => {
    saveVision({ ...vision, yearTheme: themeInput });
    setEditingTheme(false);
  };

  // The editing cell - either a real cell or the virtual center cell
  const editingCell = editingId === 'center'
    ? { id: 'center', category: '', title: vision.yearTheme, memo: '', emoji: '✨', color: '' }
    : vision.cells.find((c) => c.id === editingId) ?? null;

  // Grid layout: 3×3 with center as index 4
  // positions: [0,1,2, 3,CENTER,4, 5,6,7]
  const gridCells = vision.cells.slice(0, 8);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-100 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-600 mb-1">✨ 今年のテーマ</p>
            {editingTheme ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={themeInput}
                  onChange={(e) => setThemeInput(e.target.value)}
                  autoFocus
                  className="text-lg font-black text-slate-800 bg-white border border-blue-300 rounded-xl px-3 py-1 focus:outline-none"
                />
                <button onClick={saveTheme} className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <Check size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-lg font-black text-slate-800">{vision.yearTheme}</p>
                <button
                  onClick={() => { setThemeInput(vision.yearTheme); setEditingTheme(true); }}
                  className="text-blue-400 hover:text-blue-600 transition-colors"
                >
                  <Edit3 size={14} />
                </button>
              </div>
            )}
          </div>
          <div className="text-3xl">🎯</div>
        </div>
      </div>

      {/* 3×3 Vision Grid */}
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-3">ビジョンボード（各マスをクリックして編集）</p>
        <div className="grid grid-cols-3 gap-2.5">
          {gridCells.slice(0, 3).map((cell) => (
            <VisionCellCard key={cell.id} cell={cell} onEdit={() => setEditingId(cell.id)} />
          ))}
          {gridCells.slice(3, 4).map((cell) => (
            <VisionCellCard key={cell.id} cell={cell} onEdit={() => setEditingId(cell.id)} />
          ))}
          {/* Center */}
          <VisionCellCard
            cell={{ id: 'center', category: '', title: vision.yearTheme, memo: '', emoji: '✨', color: '' }}
            isCenter
            onEdit={() => setEditingId('center')}
          />
          {gridCells.slice(4, 5).map((cell) => (
            <VisionCellCard key={cell.id} cell={cell} onEdit={() => setEditingId(cell.id)} />
          ))}
          {gridCells.slice(5, 8).map((cell) => (
            <VisionCellCard key={cell.id} cell={cell} onEdit={() => setEditingId(cell.id)} />
          ))}
        </div>
      </div>

      {/* AI image mock notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
        <Sparkles size={14} className="text-violet-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-slate-700">AI画像生成（準備中）</p>
          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
            各マスのビジョンに合ったAI生成画像を自動挿入できるようになる予定です。現在は絵文字でビジュアライズしています。
          </p>
        </div>
      </div>

      {/* Edit modal */}
      {editingId && editingCell && (
        <CellEditModal
          cell={editingCell}
          onSave={saveCell}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  );
}
