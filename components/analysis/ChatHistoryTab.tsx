'use client';

import { useEffect, useRef } from 'react';
import { MessageSquare, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { ChatSession } from '@/types';

// ─── カテゴリ定義 ────────────────────────────────────────────
const CATEGORIES = [
  { id: 'career',      label: '転職・キャリア',   icon: '🔄', border: 'border-blue-200',   bg: 'bg-blue-50',   badge: 'bg-blue-100 text-blue-700',   keywords: ['転職', 'キャリア', '就職', '職種', 'キャリアチェンジ', 'キャリアアップ'] },
  { id: 'salary',      label: '年収・市場価値',   icon: '💰', border: 'border-green-200',  bg: 'bg-green-50',  badge: 'bg-green-100 text-green-700',  keywords: ['年収', '給与', '市場価値', '年俸', '報酬', '収入'] },
  { id: 'self',        label: '自己分析・強み',   icon: '🔍', border: 'border-violet-200', bg: 'bg-violet-50', badge: 'bg-violet-100 text-violet-700', keywords: ['強み', '弱み', '自己分析', '価値観', '自分', 'Will', 'Can'] },
  { id: 'skill',       label: 'スキルアップ',     icon: '📈', border: 'border-orange-200', bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700', keywords: ['スキル', '資格', '学習', '勉強', '成長', '学び'] },
  { id: 'environment', label: '企業・職場環境',   icon: '🏢', border: 'border-slate-200',  bg: 'bg-slate-50',  badge: 'bg-slate-100 text-slate-600',   keywords: ['企業', '会社', '職場', '環境', '組織', '文化', '働き方'] },
  { id: 'other',       label: 'その他',           icon: '💬', border: 'border-gray-200',   bg: 'bg-gray-50',   badge: 'bg-gray-100 text-gray-600',     keywords: [] },
] as const;

type CategoryId = typeof CATEGORIES[number]['id'];

// ─── デモ用シードデータ（チャット履歴が空の場合に表示）──────
const SEED_SESSIONS: ChatSession[] = [
  {
    id: 'seed-1',
    name: '転職を検討しています',
    createdAt: '2026-04-10T10:00:00Z',
    messages: [
      { id: 'm1', role: 'user', content: '転職を考えているのですが、今の年収から上げるにはどうしたらいいですか？', createdAt: '2026-04-10T10:00:00Z' },
      { id: 'm2', role: 'assistant', content: '現在のITコンサルタントとしての経験は転職市場で高く評価されます。年収を上げるには①外資系・大手コンサルへの横移動、②事業会社のDX推進ポジション、③マネジメント職へのステップアップが有効です。', createdAt: '2026-04-10T10:01:00Z' },
    ],
  },
  {
    id: 'seed-2',
    name: '自分の強みを整理したい',
    createdAt: '2026-04-15T14:00:00Z',
    messages: [
      { id: 'm3', role: 'user', content: '自己分析をしたいのですが、自分の強みが何かよくわかりません。', createdAt: '2026-04-15T14:00:00Z' },
      { id: 'm4', role: 'assistant', content: 'エピソードをもとに整理すると、調整力・実行力・論理思考力が一貫して見られます。特に文化祭のリーダー経験やインターンでのプロジェクト完遂が根拠となっています。', createdAt: '2026-04-15T14:01:00Z' },
    ],
  },
  {
    id: 'seed-3',
    name: '市場価値を知りたい',
    createdAt: '2026-04-20T09:00:00Z',
    messages: [
      { id: 'm5', role: 'user', content: '今の自分の市場価値はどのくらいですか？', createdAt: '2026-04-20T09:00:00Z' },
      { id: 'm6', role: 'assistant', content: '経験・スキルを総合すると推定年収600〜750万円のレンジです。同年代・同職種の中央値580万円を上回っており、転職市場での競争力は高い状態です。', createdAt: '2026-04-20T09:01:00Z' },
    ],
  },
  {
    id: 'seed-4',
    name: 'スキルアップの方向性',
    createdAt: '2026-04-25T11:00:00Z',
    messages: [
      { id: 'm7', role: 'user', content: 'これからどんなスキルを身につければいいですか？', createdAt: '2026-04-25T11:00:00Z' },
      { id: 'm8', role: 'assistant', content: 'AI・データ分析スキルとプロジェクトマネジメント（PMP等）の掛け合わせが市場価値を大きく上げます。特にDX領域では技術理解があるコンサルタントの需要が急増しています。', createdAt: '2026-04-25T11:01:00Z' },
    ],
  },
];

// ─── セッションをカテゴリ分類 ─────────────────────────────
function categorize(sessions: ChatSession[]): Record<CategoryId, ChatSession[]> {
  const result = Object.fromEntries(CATEGORIES.map((c) => [c.id, []])) as Record<CategoryId, ChatSession[]>;

  for (const session of sessions) {
    const text = session.messages.map((m) => m.content).join(' ') + ' ' + session.name;
    let matched = false;
    for (const cat of CATEGORIES) {
      if (cat.id === 'other') continue;
      if (cat.keywords.some((kw) => text.includes(kw))) {
        result[cat.id].push(session);
        matched = true;
        break;
      }
    }
    if (!matched) result.other.push(session);
  }

  return result;
}

// ─── 日付フォーマット ──────────────────────────────────────
function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// ─── SessionCard ───────────────────────────────────────────
function SessionCard({
  session,
  highlighted,
}: {
  session: ChatSession;
  highlighted: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const userMsg = session.messages.find((m) => m.role === 'user');
  const aiMsg   = session.messages.find((m) => m.role === 'assistant');

  return (
    <div
      id={`chat-${session.id}`}
      ref={ref}
      className={`rounded-xl border p-4 transition-all ${
        highlighted
          ? 'border-blue-400 bg-blue-50 shadow-md'
          : 'border-slate-100 bg-white hover:border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-xs font-semibold text-slate-700 leading-snug">{session.name}</p>
        <span className="text-[10px] text-slate-400 flex-shrink-0">{formatDate(session.createdAt)}</span>
      </div>

      {userMsg && (
        <div className="flex items-start gap-1.5 mb-1.5">
          <span className="text-[10px] font-bold text-blue-600 flex-shrink-0 mt-0.5">Q.</span>
          <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">{userMsg.content}</p>
        </div>
      )}
      {aiMsg && (
        <div className="flex items-start gap-1.5">
          <span className="text-[10px] font-bold text-emerald-600 flex-shrink-0 mt-0.5">A.</span>
          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{aiMsg.content}</p>
        </div>
      )}

      <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
        <MessageSquare size={10} />
        {session.messages.length}件のメッセージ
      </div>
    </div>
  );
}

// ─── CategorySection ──────────────────────────────────────
function CategorySection({
  cat,
  sessions,
  highlightedSessionId,
}: {
  cat: typeof CATEGORIES[number];
  sessions: ChatSession[];
  highlightedSessionId: string | null;
}) {
  if (sessions.length === 0) return null;

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">{cat.icon}</span>
        <h3 className="text-xs font-bold text-slate-700">{cat.label}</h3>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cat.badge}`}>
          {sessions.length}件
        </span>
      </div>
      <div className="space-y-2">
        {sessions.map((s) => (
          <SessionCard
            key={s.id}
            session={s}
            highlighted={highlightedSessionId === s.id}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────
interface Props {
  highlightedSessionId: string | null;
  onClearHighlight: () => void;
}

export function ChatHistoryTab({ highlightedSessionId, onClearHighlight: _onClearHighlight }: Props) {
  const { chatSessions } = useApp();

  // チャット履歴がない場合はシードデータを使用
  const allSessions = chatSessions.flatMap((s) => s.messages.length > 0 ? [s] : []);
  const sessions = allSessions.length > 0 ? allSessions : SEED_SESSIONS;

  const categorized = categorize(sessions);
  const totalCount  = sessions.length;

  // ハイライトされたセッションへスクロール
  useEffect(() => {
    if (highlightedSessionId) {
      document.getElementById(`chat-${highlightedSessionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedSessionId]);

  return (
    <div className="flex-1 overflow-y-auto pb-20 md:pb-0 bg-slate-50">
      <div className="p-5 max-w-3xl">
        {/* Summary bar */}
        <div className="flex items-center gap-3 mb-5 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
          <MessageSquare size={16} className="text-blue-500" />
          <span className="text-xs text-slate-600">
            合計 <span className="font-bold text-slate-800">{totalCount}件</span> の相談が記録されています。
          </span>
          <div className="flex gap-1.5 ml-auto flex-wrap">
            {CATEGORIES.filter((c) => categorized[c.id].length > 0).map((c) => (
              <span key={c.id} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
                {c.icon} {c.label} {categorized[c.id].length}
              </span>
            ))}
          </div>
        </div>

        {/* カテゴリ別セクション */}
        {CATEGORIES.map((cat) => (
          <CategorySection
            key={cat.id}
            cat={cat}
            sessions={categorized[cat.id]}
            highlightedSessionId={highlightedSessionId}
          />
        ))}

        {/* 相談チャットへのリンク */}
        <div className="mt-2 p-4 bg-white rounded-xl border border-blue-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-700">新しい相談を追加する</p>
            <p className="text-[11px] text-slate-400 mt-0.5">相談チャットで話した内容は自動的にここに分類されます。</p>
          </div>
          <button
            onClick={() => {}}
            className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors flex-shrink-0"
          >
            相談チャットへ <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
