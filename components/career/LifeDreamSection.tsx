'use client';

import { useState, useCallback } from 'react';
import { Edit3, Check, X, Plus, Target, ChevronDown } from 'lucide-react';
import { storage } from '@/lib/storage';
import { cn } from '@/lib/utils';
import type { VisionDreamItem, YearlyVisionData } from '@/types';

// ── デフォルトビジョンアイテム ─────────────────────────────
const DEFAULT_ITEMS: VisionDreamItem[] = [
  { id: 'v1', title: '海外旅行に行く',         desc: '年2回海外へ旅行し新しい価値観を得る',     achieved: false, g: 'from-sky-400 to-blue-600',      emoji: '✈️',  img: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=300&q=60&fit=crop' },
  { id: 'v2', title: '理想の住まいに住む',     desc: 'こだわりの家で心地よい毎日を送る',         achieved: false, g: 'from-amber-400 to-orange-600',  emoji: '🏠',  img: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=300&q=60&fit=crop' },
  { id: 'v3', title: '家族との時間を大切に',   desc: '大切な人と豊かな時間を過ごし続ける',       achieved: false, g: 'from-rose-400 to-pink-600',     emoji: '👨‍👩‍👧', img: 'https://images.unsplash.com/photo-1511895426328-dc8714191011?w=300&q=60&fit=crop' },
  { id: 'v4', title: '健康でいること',         desc: '心身ともに最高の状態を維持する',           achieved: false, g: 'from-emerald-400 to-teal-600',  emoji: '🏃',  img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=60&fit=crop' },
  { id: 'v5', title: '音楽を楽しむ',           desc: 'オーケストラで音楽の感動を味わう',         achieved: false, g: 'from-violet-400 to-purple-600', emoji: '🎵',  img: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&q=60&fit=crop' },
  { id: 'v6', title: '学び続ける',             desc: '知識と教養を深め成長し続ける人でいる',     achieved: false, g: 'from-indigo-400 to-blue-600',   emoji: '📚',  img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&q=60&fit=crop' },
  { id: 'v7', title: '社会に貢献する',         desc: '誰かの役に立ち価値を生み出し続ける',       achieved: false, g: 'from-teal-400 to-green-600',    emoji: '🤝',  img: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=300&q=60&fit=crop' },
  { id: 'v8', title: '経済的自由を手に入れる', desc: '時間とお金の自由を得てやりたいことを実現', achieved: false, g: 'from-yellow-400 to-amber-600',  emoji: '💎',  img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=300&q=60&fit=crop' },
];

const GRADIENT_OPTIONS = [
  { label: 'ブルー',     value: 'from-sky-400 to-blue-600' },
  { label: 'オレンジ',   value: 'from-amber-400 to-orange-600' },
  { label: 'ピンク',     value: 'from-rose-400 to-pink-600' },
  { label: 'グリーン',   value: 'from-emerald-400 to-teal-600' },
  { label: 'パープル',   value: 'from-violet-400 to-purple-600' },
  { label: 'インディゴ', value: 'from-indigo-400 to-blue-600' },
  { label: 'ティール',   value: 'from-teal-400 to-green-600' },
  { label: 'アンバー',   value: 'from-yellow-400 to-amber-600' },
];

const EMOJI_OPTIONS = ['✈️','🏠','👨‍👩‍👧','🏃','🎵','📚','🤝','💎','🌟','💰','🧠','❤️','🏆','🌿','🎨','⚡'];

const CURRENT_YEAR = new Date().getFullYear();

// ── 年データ初期化 ─────────────────────────────────────────
function makeDefaultYear(year: number): YearlyVisionData {
  return {
    year,
    goalTitle: '',
    goalSubtitle: '',
    goalProgress: 0,
    items: DEFAULT_ITEMS.map((it) => ({ ...it, achieved: false })),
  };
}

function loadYears(): Record<number, YearlyVisionData> {
  const saved = storage.getVisionYears();

  // 2026年が無ければ、既存の visionDreams データを移行
  if (!saved[2026]) {
    const oldItems = storage.getVisionDreams();
    saved[2026] = {
      year: 2026,
      goalTitle: '昇華',
      goalSubtitle: '成長・挑戦・豊かさの実現',
      goalProgress: 65,
      items: oldItems.length > 0 ? oldItems : DEFAULT_ITEMS.map((it) => ({ ...it })),
    };
    storage.setVisionYears(saved);
  }

  return saved;
}

// ── ビジョン編集モーダル ────────────────────────────────────
function EditModal({ item, onSave, onClose }: {
  item: VisionDreamItem;
  onSave: (item: VisionDreamItem) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState({ ...item });

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-700">ビジョンを編集</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-slate-500 mb-1.5">絵文字</p>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_OPTIONS.map((em) => (
                <button key={em} onClick={() => setDraft({ ...draft, emoji: em })}
                  className={cn('w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-colors',
                    draft.emoji === em ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-slate-50 hover:bg-slate-100'
                  )}>{em}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">タイトル</p>
            <input type="text" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className="w-full text-sm font-semibold border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">説明</p>
            <input type="text" value={draft.desc} onChange={(e) => setDraft({ ...draft, desc: e.target.value })}
              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">画像URL（Unsplash等）</p>
            <input type="text" value={draft.img} onChange={(e) => setDraft({ ...draft, img: e.target.value })}
              placeholder="https://..." className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1.5">カラー</p>
            <div className="flex flex-wrap gap-1.5">
              {GRADIENT_OPTIONS.map((g) => (
                <button key={g.value} onClick={() => setDraft({ ...draft, g: g.value })}
                  className={cn('text-[10px] px-2.5 py-1 rounded-lg text-white font-semibold bg-gradient-to-r transition-all', g.value,
                    draft.g === g.value ? 'ring-2 ring-offset-1 ring-blue-500' : 'opacity-70 hover:opacity-100'
                  )}>{g.label}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">達成状況</p>
            <button onClick={() => setDraft({ ...draft, achieved: !draft.achieved })}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
                draft.achieved ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}>{draft.achieved ? '✓ 達成済み' : '未達成'}</button>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={() => { onSave(draft); onClose(); }}
            className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5">
            <Check size={14} /> 保存
          </button>
          <button onClick={onClose} className="px-4 py-2.5 bg-slate-100 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors">
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ビジョンカード ──────────────────────────────────────────
function VisionCard({ item, onEdit }: { item: VisionDreamItem; onEdit: () => void }) {
  return (
    <div className="relative rounded-2xl overflow-hidden group cursor-pointer" style={{ height: '140px' }} onClick={onEdit}>
      <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-60', item.g)} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute top-2 right-2 z-10">
        {item.achieved
          ? <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-emerald-500 text-white shadow">達成 ✓</span>
          : <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-black/40 text-white/80 backdrop-blur-sm">未達成</span>}
      </div>
      <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-6 h-6 bg-white/80 rounded-lg flex items-center justify-center">
          <Edit3 size={11} className="text-slate-600" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
        <p className="text-white text-xs font-bold leading-tight drop-shadow">{item.emoji} {item.title}</p>
        <p className="text-white/70 text-[10px] leading-tight mt-0.5 line-clamp-1">{item.desc}</p>
      </div>
    </div>
  );
}

// ── メインコンポーネント ────────────────────────────────────
export function LifeDreamSection() {
  const [allYears, setAllYears] = useState<Record<number, YearlyVisionData>>(() => loadYears());
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const years = Object.keys(loadYears()).map(Number);
    return years.includes(CURRENT_YEAR) ? CURRENT_YEAR : Math.max(...years);
  });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState({ title: '', subtitle: '' });
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const data = allYears[selectedYear] ?? makeDefaultYear(selectedYear);
  const sortedYears = Object.keys(allYears).map(Number).sort((a, b) => b - a);

  const saveData = useCallback((next: YearlyVisionData) => {
    const updated = { ...allYears, [next.year]: next };
    setAllYears(updated);
    storage.setVisionYears(updated);
    // 現在年のデータは旧 visionDreams にも同期（Dashboardが読む用）
    if (next.year === CURRENT_YEAR) {
      storage.setVisionDreams(next.items);
    }
  }, [allYears]);

  const handleSaveItem = useCallback((updated: VisionDreamItem) => {
    saveData({ ...data, items: data.items.map((it) => it.id === updated.id ? updated : it) });
  }, [data, saveData]);

  const handleSaveGoal = () => {
    saveData({ ...data, goalTitle: goalDraft.title, goalSubtitle: goalDraft.subtitle });
    setEditingGoal(false);
  };

  const openGoalEdit = () => {
    setGoalDraft({ title: data.goalTitle, subtitle: data.goalSubtitle });
    setEditingGoal(true);
  };

  const addNewYear = () => {
    const nextYear = Math.max(...sortedYears) + 1;
    const newData = makeDefaultYear(nextYear);
    const updated = { ...allYears, [nextYear]: newData };
    setAllYears(updated);
    storage.setVisionYears(updated);
    setSelectedYear(nextYear);
    setShowYearDropdown(false);
  };

  const editingItem    = data.items.find((it) => it.id === editingItemId) ?? null;
  const achievedCount  = data.items.filter((it) => it.achieved).length;
  const achievedRate   = data.items.length > 0 ? Math.round(achievedCount / data.items.length * 100) : 0;

  return (
    <div className="space-y-4">

      {/* ── 年セレクター ─────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setShowYearDropdown(!showYearDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <span className="text-blue-600">{selectedYear}年</span>バージョン
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          {showYearDropdown && (
            <div className="absolute top-full mt-1 left-0 bg-white border border-slate-200 rounded-xl shadow-lg z-20 min-w-[160px] overflow-hidden">
              {sortedYears.map((y) => (
                <button key={y} onClick={() => { setSelectedYear(y); setShowYearDropdown(false); }}
                  className={cn('w-full text-left px-4 py-2.5 text-sm transition-colors',
                    y === selectedYear ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  )}>
                  {y}年バージョン {y === CURRENT_YEAR && <span className="text-[10px] text-blue-500 ml-1">（今年）</span>}
                </button>
              ))}
              <div className="border-t border-slate-100">
                <button onClick={addNewYear}
                  className="w-full text-left px-4 py-2.5 text-xs text-blue-600 font-semibold hover:bg-blue-50 transition-colors flex items-center gap-1.5">
                  <Plus size={12} /> {Math.max(...sortedYears) + 1}年バージョンを追加
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          達成率
          <span className="font-bold text-blue-600 text-sm">{achievedRate}%</span>
          <span className="text-slate-300">（{achievedCount} / {data.items.length}）</span>
        </div>
      </div>

      {/* ── 今年の目標 ───────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-100 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-rose-500" />
            <p className="text-xs font-bold text-slate-600">{selectedYear}年の目標</p>
          </div>
          <button onClick={openGoalEdit}
            className="flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-700 transition-colors font-semibold">
            <Edit3 size={11} /> 編集
          </button>
        </div>

        {editingGoal ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input type="text" value={goalDraft.title} onChange={(e) => setGoalDraft({ ...goalDraft, title: e.target.value })}
                placeholder="テーマ（例: 昇華）"
                className="flex-1 text-base font-black border border-blue-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 bg-white" />
              <input type="text" value={goalDraft.subtitle} onChange={(e) => setGoalDraft({ ...goalDraft, subtitle: e.target.value })}
                placeholder="サブタイトル（例: 成長・挑戦・豊かさ）"
                className="flex-[2] text-xs border border-blue-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 bg-white" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleSaveGoal}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors">
                <Check size={12} /> 保存
              </button>
              <button onClick={() => setEditingGoal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200 transition-colors">
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <div>
            {data.goalTitle ? (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="text-xl font-black text-slate-800">{data.goalTitle}</p>
                    <p className="text-xs text-slate-500">{data.goalSubtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-slate-400">達成率</span>
                  <span className="text-lg font-black text-blue-600">{achievedRate}%</span>
                  <div className="w-24 h-2 bg-white/60 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${achievedRate}%` }} />
                  </div>
                  <span className="text-xs text-slate-400">{achievedCount} / {data.items.length}</span>
                </div>
              </div>
            ) : (
              <button onClick={openGoalEdit}
                className="flex items-center gap-2 text-xs text-blue-500 hover:text-blue-700 transition-colors py-1">
                <Plus size={14} /> {selectedYear}年の目標を設定する
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── 8つのビジョングリッド ────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-1">
        <p className="text-[11px] text-slate-400 px-3 pt-3 pb-2">カードをクリックして編集</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 pt-0">
          {data.items.map((item) => (
            <VisionCard key={item.id} item={item} onEdit={() => setEditingItemId(item.id)} />
          ))}
        </div>
      </div>

      {/* ── ビジョン編集モーダル ─────────────────────────── */}
      {editingItemId && editingItem && (
        <EditModal item={editingItem} onSave={handleSaveItem} onClose={() => setEditingItemId(null)} />
      )}
    </div>
  );
}
