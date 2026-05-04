'use client';

import { useState } from 'react';
import { Plus, X, Briefcase, User, HelpCircle, Pencil } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { MotivationChart } from './MotivationChart';
import { EpisodeCard } from './EpisodeCard';
import type { Episode, EpisodePeriod, EpisodeCategory } from '@/types';
import type { TabId } from '@/components/layout/types';

// ── Display columns ───────────────────────────────────────────────
// 小学生を低学年/高学年に分割して表示（データ上は同じ '小学生' period）
const DISPLAY_COLS: {
  key: string;
  period: EpisodePeriod;
  label: string;
  ageRange: string;
  color: string;       // text color
  bg: string;          // cell bg
  headerBg: string;    // header bg
  border: string;      // border color
}[] = [
  { key: '幼少期',       period: '幼少期', label: '幼少期',       ageRange: '0歳〜6歳',   color: 'text-pink-600',   bg: 'bg-pink-50/60',   headerBg: 'bg-pink-50',   border: 'border-pink-200' },
  { key: '小学生低学年', period: '小学生', label: '小学生低学年', ageRange: '7歳〜9歳',   color: 'text-blue-600',   bg: 'bg-blue-50/60',   headerBg: 'bg-blue-50',   border: 'border-blue-200' },
  { key: '小学生高学年', period: '小学生', label: '小学生高学年', ageRange: '10歳〜12歳', color: 'text-blue-500',   bg: 'bg-blue-50/40',   headerBg: 'bg-sky-50',    border: 'border-sky-200'  },
  { key: '中学生',       period: '中学生', label: '中学生',       ageRange: '13歳〜15歳', color: 'text-teal-600',   bg: 'bg-teal-50/60',   headerBg: 'bg-teal-50',   border: 'border-teal-200' },
  { key: '高校生',       period: '高校生', label: '高校生',       ageRange: '16歳〜18歳', color: 'text-violet-600', bg: 'bg-violet-50/60', headerBg: 'bg-violet-50', border: 'border-violet-200' },
  { key: '大学生',       period: '大学生', label: '大学生',       ageRange: '19歳〜22歳', color: 'text-amber-600',  bg: 'bg-amber-50/60',  headerBg: 'bg-amber-50',  border: 'border-amber-200' },
  { key: '社会人①',      period: '社会人', label: '社会人',       ageRange: '23歳〜26歳', color: 'text-emerald-600',bg: 'bg-emerald-50/60',headerBg: 'bg-emerald-50',border: 'border-emerald-200' },
  { key: '社会人②',      period: '社会人', label: '社会人',       ageRange: '27歳〜30歳', color: 'text-emerald-700',bg: 'bg-emerald-50/40',headerBg: 'bg-green-50',  border: 'border-green-200'   },
];

// ── Motivation score buttons ──────────────────────────────────────

const SCORE_VALUES = [-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100];

function scoreButtonStyle(val: number, selected: boolean): string {
  if (selected) {
    if (val < 0)  return 'bg-red-500 text-white border-red-500';
    if (val === 0) return 'bg-slate-500 text-white border-slate-500';
    return 'bg-blue-500 text-white border-blue-500';
  }
  if (val < 0)  return 'bg-white text-red-400 border-red-200 hover:bg-red-50';
  if (val === 0) return 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50';
  return 'bg-white text-blue-400 border-blue-200 hover:bg-blue-50';
}

function MotivationButtons({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {SCORE_VALUES.map(v => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            'text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors min-w-[36px] text-center',
            scoreButtonStyle(v, value === v)
          )}
        >
          {v > 0 ? `+${v}` : v}
        </button>
      ))}
    </div>
  );
}

// ── Episode Modal (Add / Edit) ────────────────────────────────────

function EpisodeModal({
  colKey, period, category,
  initial,   // if present → edit mode
  onSubmit, onClose,
}: {
  colKey: string;
  period: EpisodePeriod;
  category: EpisodeCategory;
  initial?: Episode;
  onSubmit: (data: Omit<Episode, 'id' | 'createdAt' | 'updatedAt' | 'isDeepDived'>) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [score, setScore] = useState(initial?.motivationScore ?? 0);
  const isEdit = !!initial;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ period, category, title: title.trim(), motivationScore: score });
    onClose();
  };

  const col = DISPLAY_COLS.find(c => c.key === colKey)!;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-bold text-slate-700">{isEdit ? 'エピソードを編集' : 'エピソードを追加'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', col.color, col.headerBg, col.border)}>
                {col.label}
              </span>
              <span className="text-[10px] text-slate-400">
                {category === 'school' ? '🏫 学校・職場' : '🏠 プライベート'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-medium text-slate-500 mb-1 block">出来事 *</label>
            <input
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="例：生徒会長に立候補した"
              autoFocus required
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="text-[10px] font-medium text-slate-500 mb-2 block">
              モチベーション：
              <span className={cn('ml-1 font-bold text-sm', score > 0 ? 'text-blue-600' : score < 0 ? 'text-red-500' : 'text-slate-500')}>
                {score > 0 ? `+${score}` : score}
              </span>
            </label>
            <MotivationButtons value={score} onChange={setScore} />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
              キャンセル
            </button>
            <button type="submit"
              className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
              {isEdit ? '保存' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Mini episode chip ─────────────────────────────────────────────

function EpisodeChip({
  episode, colKey, onEdit, onDeepDive, onDelete,
}: {
  episode: Episode;
  colKey: string;
  onEdit: () => void;
  onDeepDive: (ep: Episode) => void;
  onDelete: (id: string) => void;
}) {
  const col = DISPLAY_COLS.find(c => c.key === colKey)!;
  const scoreColor = episode.motivationScore > 0 ? 'text-blue-600' : episode.motivationScore < 0 ? 'text-red-500' : 'text-slate-400';
  return (
    <div className={cn('group relative rounded-lg border px-2 py-1.5 text-left w-full', col.border, 'bg-white hover:shadow-sm transition-shadow')}>
      <div className="flex items-start justify-between gap-1">
        <p className="text-[10px] font-semibold text-slate-700 leading-tight flex-1 truncate">{episode.title}</p>
        {/* Edit + Delete buttons (visible on hover) */}
        <div className="flex gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={e => { e.stopPropagation(); onEdit(); }}
            className="text-slate-300 hover:text-blue-400">
            <Pencil size={9} />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(episode.id); }}
            className="text-slate-300 hover:text-red-400">
            <X size={9} />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className={cn('text-[9px] font-bold', scoreColor)}>
          {episode.motivationScore > 0 ? '+' : ''}{episode.motivationScore}
        </span>
        <button onClick={() => onDeepDive(episode)}
          className={cn('text-[9px] font-medium hover:underline', col.color)}>
          深掘り →
        </button>
      </div>
      {episode.isDeepDived && (
        <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full bg-emerald-500 text-white text-[8px] font-black leading-none">✓</span>
      )}
    </div>
  );
}

// ── Table cell ────────────────────────────────────────────────────

function TableCell({
  col, category, episodes, onAdd, onEdit, onDeepDive, onDelete,
}: {
  col: typeof DISPLAY_COLS[0];
  category: EpisodeCategory;
  episodes: Episode[];
  onAdd: () => void;
  onEdit: (ep: Episode) => void;
  onDeepDive: (ep: Episode) => void;
  onDelete: (id: string) => void;
}) {
  const filtered = episodes.filter(ep => {
    if (ep.period !== col.period) return false;
    if (col.key === '小学生低学年') return !ep.age || ep.age <= 9;
    if (col.key === '小学生高学年') return ep.age !== undefined && ep.age >= 10;
    if (col.key === '社会人①') return !ep.age || ep.age <= 26;
    if (col.key === '社会人②') return ep.age !== undefined && ep.age >= 27;
    return true;
  }).filter(ep => !ep.category || ep.category === category);

  return (
    <td className={cn('border border-slate-200 align-top p-1.5', col.bg)} style={{ verticalAlign: 'top', width: '120px', maxWidth: '120px' }}>
      <div className="flex flex-col gap-1 min-h-[64px]">
        {filtered.map(ep => (
          <EpisodeChip key={ep.id} episode={ep} colKey={col.key}
            onEdit={() => onEdit(ep)} onDeepDive={onDeepDive} onDelete={onDelete} />
        ))}
        <button
          onClick={onAdd}
          className="flex items-center justify-center w-full py-2 rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-white/60 transition-colors text-sm font-medium mt-auto"
        >
          <Plus size={14} />
        </button>
      </div>
    </td>
  );
}

// ── Main component ────────────────────────────────────────────────

interface Props {
  onTabChange: (tab: TabId) => void;
  highlightedEpisodeId: string | null;
  onClearHighlight: () => void;
}

export function LifeHistoryTab({ onTabChange, highlightedEpisodeId, onClearHighlight }: Props) {
  const { episodes, setEpisodes, chatSessions, setChatSessions, setActiveChatSessionId, setActiveEpisodeForDeepDive } = useApp();
  const [selectedColKey, setSelectedColKey] = useState<string | null>(null);
  const [addModal, setAddModal] = useState<{ colKey: string; period: EpisodePeriod; category: EpisodeCategory } | null>(null);
  const [editModal, setEditModal] = useState<{ episode: Episode; colKey: string } | null>(null);

  const handleAdd = (data: Omit<Episode, 'id' | 'createdAt' | 'updatedAt' | 'isDeepDived'>) => {
    const now = new Date().toISOString();
    // 分割列のフィルタが正しく機能するよう sentinel age をセット
    let age = data.age;
    if (addModal?.colKey === '小学生高学年' && (age === undefined || age < 10)) age = 10;
    if (addModal?.colKey === '社会人②'     && (age === undefined || age < 27)) age = 27;
    const ep: Episode = { ...data, age, id: generateId(), isDeepDived: false, createdAt: now, updatedAt: now };
    setEpisodes([...episodes, ep]);
  };

  const handleEdit = (id: string, data: Omit<Episode, 'id' | 'createdAt' | 'updatedAt' | 'isDeepDived'>) => {
    setEpisodes(episodes.map(e => e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e));
  };

  // Find which colKey an episode belongs to (for edit modal)
  const getColKey = (ep: Episode): string => {
    if (ep.period === '小学生') return ep.age !== undefined && ep.age >= 10 ? '小学生高学年' : '小学生低学年';
    if (ep.period === '社会人') return ep.age !== undefined && ep.age >= 27 ? '社会人②' : '社会人①';
    return ep.period;
  };

  const handleDelete = (id: string) => setEpisodes(episodes.filter(e => e.id !== id));

  const handleDeepDive = (ep: Episode) => {
    const sessionId = generateId();
    const introMsg = {
      id: generateId(), role: 'assistant' as const,
      content: `「${ep.title}」について深掘りしていきましょう。\n\nこの出来事の中で一番印象に残っている場面を教えてください。`,
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
      episodeId: ep.id, period: ep.period, age: ep.age,
      title: ep.title, motivationScore: ep.motivationScore, chatSessionId: sessionId,
    });
    onTabChange('chat');
  };

  // 年齢列96px + 8列×120px = 1056px
  const SHARED_MIN_WIDTH = 1056;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-20 md:pb-0">
      <div className="p-5 space-y-0 max-w-full">

        {/* Shared scroll wrapper — graph + table aligned */}
        <div className="overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
          <div style={{ width: `${SHARED_MIN_WIDTH}px` }} className="space-y-0">

            {/* Motivation chart card */}
            <div className="bg-white rounded-t-2xl border border-slate-100 shadow-sm pt-3 pb-1">
              {/* Title row — padding only here so SVG gets full width */}
              <div className="flex items-center justify-between mb-1 px-4">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-700">モチベーショングラフ</p>
                  <button className="text-slate-300 hover:text-slate-400">
                    <HelpCircle size={11} />
                  </button>
                </div>
                {selectedColKey && (
                  <button onClick={() => setSelectedColKey(null)} className="text-[10px] text-blue-500 hover:underline">
                    全期間を表示
                  </button>
                )}
              </div>
              {/* SVG renders at full container width = 1056px, matching table exactly */}
              <MotivationChart
                episodes={episodes}
                selectedColKey={selectedColKey}
                onColSelect={key => setSelectedColKey(selectedColKey === key ? null : key)}
              />
            </div>

            {/* Timeline table — no own overflow-x-auto */}
            <div className="bg-white rounded-b-2xl border border-x border-b border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full border-collapse" style={{ tableLayout: 'fixed', width: `${SHARED_MIN_WIDTH}px` }}>
              <thead>
                <tr>
                  {/* Row label header */}
                  <th className="border border-slate-200 bg-slate-50 px-3 py-3 text-left" style={{ width: '96px' }}>
                    <span className="text-xs font-semibold text-slate-500">年齢</span>
                  </th>
                  {DISPLAY_COLS.map(col => (
                    <th key={col.key} className={cn('border border-slate-200 px-2 py-2 text-center', col.headerBg)} style={{ width: '120px' }}>
                      <p className={cn('text-[10px] font-bold', col.color)}>{col.ageRange}</p>
                      <p className={cn('text-xs font-bold mt-0.5', col.color)}>{col.label}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* 学校・職場 row */}
                <tr>
                  <td className="border border-slate-200 bg-slate-50 px-3 py-3 align-middle">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Briefcase size={14} className="text-blue-600" />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-600 text-center leading-tight">学校・職場</span>
                    </div>
                  </td>
                  {DISPLAY_COLS.map(col => (
                    <TableCell
                      key={col.key}
                      col={col}
                      category="school"
                      episodes={episodes}
                      onAdd={() => setAddModal({ colKey: col.key, period: col.period, category: 'school' })}
                      onEdit={(ep) => setEditModal({ episode: ep, colKey: getColKey(ep) })}
                      onDeepDive={handleDeepDive}
                      onDelete={handleDelete}
                    />
                  ))}
                </tr>

                {/* プライベート row */}
                <tr>
                  <td className="border border-slate-200 bg-slate-50 px-3 py-3 align-middle">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <User size={14} className="text-emerald-600" />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-600 text-center leading-tight">プライベート</span>
                    </div>
                  </td>
                  {DISPLAY_COLS.map(col => (
                    <TableCell
                      key={col.key}
                      col={col}
                      category="private"
                      episodes={episodes}
                      onAdd={() => setAddModal({ colKey: col.key, period: col.period, category: 'private' })}
                      onEdit={(ep) => setEditModal({ episode: ep, colKey: getColKey(ep) })}
                      onDeepDive={handleDeepDive}
                      onDelete={handleDelete}
                    />
                  ))}
                </tr>
              </tbody>
            </table>
            {/* Footer hint */}
            <div className="border-t border-slate-100 px-4 py-2 text-center">
              <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
                <span className="text-slate-300">✦</span>
                表の空白セルをクリックしてエピソードを追加できます
              </p>
            </div>
            </div>{/* end table card */}

          </div>{/* end shared minWidth div */}
        </div>{/* end overflow-x-auto */}

        {/* Deep-dive highlight (if any) */}
        {highlightedEpisodeId && (
          <div className="space-y-2 mt-4">
            {episodes.filter(e => e.id === highlightedEpisodeId).map(ep => (
              <EpisodeCard
                key={ep.id}
                episode={ep}
                highlighted
                onDeepDive={handleDeepDive}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add episode modal */}
      {addModal && (
        <EpisodeModal
          colKey={addModal.colKey}
          period={addModal.period}
          category={addModal.category}
          onSubmit={handleAdd}
          onClose={() => setAddModal(null)}
        />
      )}

      {/* Edit episode modal */}
      {editModal && (
        <EpisodeModal
          colKey={editModal.colKey}
          period={editModal.episode.period}
          category={editModal.episode.category ?? 'school'}
          initial={editModal.episode}
          onSubmit={(data) => handleEdit(editModal.episode.id, data)}
          onClose={() => setEditModal(null)}
        />
      )}
    </div>
  );
}
