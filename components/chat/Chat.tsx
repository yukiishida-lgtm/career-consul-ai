'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Bot, Plus, X, Search, MessageSquare,
  TrendingUp, Clock, BarChart2, Pencil, Check,
  BookOpen, CheckCircle2, Mic,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { mockAIResponses } from '@/lib/mockData';
import { generateId, formatDate, cn } from '@/lib/utils';
import { storage } from '@/lib/storage';
import type { ChatMessage, ChatSession, ActiveEpisodeForDeepDive, InterviewPracticeMode, PracticeType } from '@/types';

// ── AI response ────────────────────────────────────────────────────

const QUICK_TOPICS = ['転職したい', '年収を上げたい', '今の会社がつらい', '将来が不安', '自己分析したい'];

const DEEP_DIVE_QUESTIONS = [
  'あなたはどんな役割でしたか？どんな行動を取りましたか？',
  'その時、何が一番大変でしたか？',
  'どうやってその困難を乗り越えましたか？',
  'その経験から、何を学びましたか？',
  '今のあなたのキャリアや価値観に、どう影響していると思いますか？',
  '最後に、この経験を通じて気づいたあなたの強みを一言で表すとしたら？',
];

function generateNormalResponse(userText: string): string {
  for (const key of Object.keys(mockAIResponses)) {
    if (userText.includes(key)) return mockAIResponses[key];
  }
  return `【状況理解】\n「${userText.slice(0, 20)}${userText.length > 20 ? '...' : ''}」についてのご相談ですね。\n\n【分析】\nあなたのこれまでの経験・価値観・モチベーションパターンを踏まえると、これは重要な問いかけです。\n\n【選択肢】\n① 現状を整理し、問題の本質を明確にする\n② 自己分析を深めて、自分の軸を確認する\n③ 具体的なアクションプランを立てる\n\n【次のアクション】\nまずは自己分析タブで、この問いに関連する過去のエピソードを振り返ってみましょう。`;
}

function generateDeepDiveResponse(questionIdx: number): string {
  return DEEP_DIVE_QUESTIONS[questionIdx] ?? 'ありがとうございます。とても大切な気づきですね。深掘りを完了して、あなたの強みと価値観を整理しましょう。';
}

function generateMockSummary(ep: ActiveEpisodeForDeepDive) {
  const posNeg = ep.motivationScore > 0 ? '強い主体性と実行力' : '困難を乗り越える強さ';
  return {
    aiConclusion: `「${ep.title}」の経験から、あなたの${posNeg}が見えてきます。`,
    aiDetail: `この出来事は${ep.period}時代の重要な転換点でした。当時の行動パターンや感情の動きは、現在のあなたの強みと価値観の根源となっています。チャットの回答から、あなたが困難な状況でも主体的に取り組む姿勢が一貫していることが確認できます。`,
    extractedStrengths: ep.motivationScore > 0 ? ['実行力', '課題解決力'] : ['回復力', 'レジリエンス'],
    extractedValues: ep.motivationScore > 0 ? ['成長', '挑戦'] : ['誠実さ', '忍耐'],
  };
}

// ── Interview Practice helpers ─────────────────────────────────────

function getPracticeOpeningMessage(mode: InterviewPracticeMode): string {
  const { companyName, practiceType } = mode;
  const MESSAGES: Record<PracticeType, string> = {
    '企業について': `【面談練習】\nそれでは面談練習を始めましょう。まず、なぜ当社（${companyName}）を志望しているのか教えてください。`,
    '自分について': '【面談練習】\n自己紹介と、これまでのご経験を簡潔に教えてください。',
    '社会情勢について': `【面談練習】\n最近の業界動向の中で、${companyName}に影響がありそうなテーマは何だと思いますか？`,
    'ケース面接': '【面談練習】\nケース面接を始めましょう。ある企業の売上を1年で20%向上させるとしたら、どのように考えますか？フレームワークを使って考えてみてください。',
    'ランダム': '',
  };
  if (practiceType === 'ランダム') {
    const keys: PracticeType[] = ['企業について', '自分について', '社会情勢について', 'ケース面接'];
    const picked = keys[Math.floor(Math.random() * keys.length)];
    return getPracticeOpeningMessage({ ...mode, practiceType: picked });
  }
  return MESSAGES[practiceType];
}

function generatePracticeFeedback(userText: string): string {
  const preview = userText.slice(0, 30) + (userText.length > 30 ? '...' : '');
  return `ご回答ありがとうございます。フィードバックをお伝えします。\n\n✅ 良かった点：\n・「${preview}」という形で具体的に回答いただけました\n・論旨が明確で理解しやすい回答です\n\n💡 改善のヒント：\n・結論から話すと、より伝わりやすくなります。\n・具体的な数値や事例があるとさらに説得力が増します。\n・企業との接続をより明確にするとよいでしょう。\n\n次の質問です。先ほどの回答を踏まえて、具体的にどのような場面でその強みを発揮しましたか？`;
}

// ── Topic detection ────────────────────────────────────────────────

const TOPIC_MAP: [string, string][] = [
  ['転職', '転職・求人'], ['年収', '年収・給与'], ['給与', '年収・給与'],
  ['つらい', '職場環境'], ['辛い', '職場環境'], ['不安', '将来設計'],
  ['将来', '将来設計'], ['自己分析', '自己分析'], ['スキル', 'スキルアップ'],
  ['面接', '選考対策'], ['副業', '副業・独立'], ['独立', '副業・独立'],
  ['評価', '評価・待遇'], ['成長', 'キャリア成長'],
];

function detectTopics(sessions: ChatSession[]): { topic: string; count: number }[] {
  const freq: Record<string, number> = {};
  for (const s of sessions) {
    for (const m of s.messages) {
      if (m.role !== 'user') continue;
      for (const [kw, topic] of TOPIC_MAP) {
        if (m.content.includes(kw)) freq[topic] = (freq[topic] ?? 0) + 1;
      }
    }
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([topic, count]) => ({ topic, count }));
}

function getLastActiveDate(sessions: ChatSession[]): string | null {
  let latest = '';
  for (const s of sessions) for (const m of s.messages) if (m.createdAt > latest) latest = m.createdAt;
  return latest || null;
}

// ── Practice banner ────────────────────────────────────────────────

function PracticeBanner({
  mode,
  onEnd,
}: {
  mode: InterviewPracticeMode;
  onEnd: () => void;
}) {
  return (
    <div className="bg-gradient-to-r from-violet-50 to-blue-50 border-b border-violet-200 px-4 md:px-6 py-2.5 flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
          <Mic size={13} className="text-violet-600" />
        </div>
        <span className="text-xs font-bold text-violet-700 flex-shrink-0">面談練習中</span>
        <span className="text-xs text-slate-600 truncate">
          {mode.companyName}
          {mode.jobTitle && <span className="text-slate-400"> | {mode.jobTitle}</span>}
          <span className="ml-1.5 bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full font-medium">{mode.practiceType}</span>
        </span>
        <button
          onClick={onEnd}
          className="ml-auto flex-shrink-0 flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-white transition-colors"
        >
          <X size={11} />終了
        </button>
      </div>
    </div>
  );
}

// ── Summary bar ────────────────────────────────────────────────────

function SummaryBar({ sessions }: { sessions: ChatSession[] }) {
  const totalMessages = sessions.reduce((n, s) => n + s.messages.filter((m) => m.role === 'user').length, 0);
  const activeSessions = sessions.filter((s) => s.messages.length > 0).length;
  const topics = detectTopics(sessions);
  const lastDate = getLastActiveDate(sessions);
  if (totalMessages === 0) return null;
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-4 md:px-6 py-3 flex-shrink-0">
      <div className="flex items-start gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-blue-700">
          <BarChart2 size={13} className="flex-shrink-0" />
          <span className="text-xs font-semibold">相談傾向</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap flex-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-slate-600">
              <MessageSquare size={11} /><span className="font-semibold text-slate-800">{activeSessions}</span>件の相談
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-600">
              <TrendingUp size={11} /><span className="font-semibold text-slate-800">{totalMessages}</span>回の発言
            </span>
            {lastDate && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock size={11} />最終：{formatDate(lastDate)}
              </span>
            )}
          </div>
          {topics.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-500">よく話すテーマ：</span>
              {topics.map(({ topic }) => (
                <span key={topic} className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 font-medium">{topic}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tab bar ────────────────────────────────────────────────────────

interface TabBarProps {
  sessions: ChatSession[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onClose: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onSearchOpen: () => void;
}

function TabBar({ sessions, activeId, onSelect, onAdd, onClose, onRename, onSearchOpen }: TabBarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = (s: ChatSession) => { setEditingId(s.id); setEditValue(s.name); setTimeout(() => inputRef.current?.select(), 0); };
  const commitEdit = () => { if (editingId && editValue.trim()) onRename(editingId, editValue.trim()); setEditingId(null); };

  return (
    <div className="bg-white border-b border-slate-100 flex-shrink-0">
      <div className="flex items-center overflow-x-auto scrollbar-hide">
        {sessions.map((s) => {
          const isActive = s.id === activeId;
          const isEditing = editingId === s.id;
          return (
            <div key={s.id} onClick={() => !isEditing && onSelect(s.id)}
              className={cn('flex items-center gap-1.5 px-3 py-2.5 border-r border-slate-100 flex-shrink-0 cursor-pointer group transition-colors min-w-0', isActive ? 'bg-white border-b-2 border-b-blue-600 -mb-px' : 'bg-slate-50 hover:bg-white')}
              style={{ maxWidth: '160px' }}
            >
              <MessageSquare size={12} className={cn('flex-shrink-0', isActive ? 'text-blue-500' : 'text-slate-400')} />
              {isEditing ? (
                <input ref={inputRef} value={editValue} onChange={(e) => setEditValue(e.target.value)}
                  onBlur={commitEdit} onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingId(null); }}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-medium bg-transparent border-b border-blue-400 outline-none w-20 min-w-0" autoFocus />
              ) : (
                <span className={cn('text-xs font-medium truncate flex-1', isActive ? 'text-slate-800' : 'text-slate-500')}
                  onDoubleClick={(e) => { e.stopPropagation(); startEdit(s); }} title="ダブルクリックで名前変更">
                  {s.name}
                </span>
              )}
              {isEditing ? (
                <button onClick={(e) => { e.stopPropagation(); commitEdit(); }} className="flex-shrink-0 text-emerald-500"><Check size={11} /></button>
              ) : (
                <>
                  <button onClick={(e) => { e.stopPropagation(); startEdit(s); }} className="flex-shrink-0 text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"><Pencil size={10} /></button>
                  {sessions.length > 1 && (
                    <button onClick={(e) => { e.stopPropagation(); onClose(s.id); }} className="flex-shrink-0 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                  )}
                </>
              )}
            </div>
          );
        })}
        <button onClick={onAdd} className="flex-shrink-0 px-3 py-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="新しい相談を始める"><Plus size={14} /></button>
        <div className="flex-1" />
        <button onClick={onSearchOpen} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 text-xs text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors mr-1">
          <Search size={13} /><span className="hidden md:inline">検索</span>
        </button>
      </div>
    </div>
  );
}

// ── Search panel ───────────────────────────────────────────────────

interface SearchResult { sessionId: string; sessionName: string; messageId: string; role: 'user' | 'assistant'; excerpt: string; createdAt: string; }

function SearchPanel({ sessions, onClose, onJump }: { sessions: ChatSession[]; onClose: () => void; onJump: (id: string) => void; }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const results: SearchResult[] = query.trim().length < 1 ? [] : sessions.flatMap((s) =>
    s.messages.filter((m) => m.content.toLowerCase().includes(query.toLowerCase())).map((m) => ({
      sessionId: s.id, sessionName: s.name, messageId: m.id, role: m.role,
      excerpt: m.content.slice(0, 80) + (m.content.length > 80 ? '…' : ''), createdAt: m.createdAt,
    }))
  );
  const highlight = (text: string) => {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return <>{text.slice(0, idx)}<mark className="bg-yellow-200 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>{text.slice(idx + query.length)}</>;
  };
  return (
    <div className="flex-shrink-0 bg-white border-b border-slate-200 shadow-sm">
      <div className="px-4 md:px-6 pt-3 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="相談内容を検索..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1"><X size={16} /></button>
        </div>
        {query.trim() && (
          <div className="max-h-56 overflow-y-auto space-y-1 pb-2">
            {results.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">「{query}」に一致する相談が見つかりません</p>
            ) : results.map((r) => (
              <button key={r.messageId} onClick={() => { onJump(r.sessionId); onClose(); }} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-blue-50 transition-colors group">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={cn('text-xs font-semibold', r.role === 'user' ? 'text-blue-600' : 'text-slate-500')}>{r.role === 'user' ? 'あなた' : 'AI'}</span>
                  <span className="text-xs text-slate-400">{r.sessionName}</span>
                  <span className="text-xs text-slate-300 ml-auto">{formatDate(r.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-600 leading-snug">{highlight(r.excerpt)}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Deep Dive Banner ───────────────────────────────────────────────

function DeepDiveBanner({
  ep, userMessageCount, onComplete,
}: {
  ep: ActiveEpisodeForDeepDive;
  userMessageCount: number;
  onComplete: () => void;
}) {
  const canComplete = userMessageCount >= 2;
  const scoreColor = ep.motivationScore >= 0 ? 'text-blue-600' : 'text-red-500';
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-blue-200 rounded-2xl p-3 mx-1 mt-1 flex-shrink-0">
      <div className="flex items-start gap-2">
        <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
          <BookOpen size={14} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-blue-700 mb-0.5">深掘りモード</p>
          <p className="text-xs text-slate-700 truncate">
            <span className="font-medium">{ep.period}</span>：{ep.title}
            <span className={cn('ml-2 font-bold tabular-nums', scoreColor)}>
              {ep.motivationScore > 0 ? '+' : ''}{ep.motivationScore}
            </span>
          </p>
        </div>
        {canComplete && (
          <button
            onClick={onComplete}
            className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-2.5 py-1.5 rounded-xl transition-colors"
          >
            <CheckCircle2 size={12} />
            <span className="hidden sm:inline">深掘りを完了して要約する</span>
            <span className="sm:hidden">完了</span>
          </button>
        )}
      </div>
      {!canComplete && (
        <p className="text-xs text-slate-500 mt-1.5 pl-9">あと {2 - userMessageCount} 回答すると完了できます</p>
      )}
    </div>
  );
}

// ── Message list ───────────────────────────────────────────────────

function MessageList({ session, isTyping, profile }: { session: ChatSession; isTyping: boolean; profile: { name: string }; }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [session.messages, isTyping]);
  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4 pb-36 md:pb-4">
      {session.messages.length === 0 && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0"><Bot size={16} className="text-white" /></div>
          <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm shadow-sm">
            <p className="text-sm text-slate-700 leading-relaxed">こんにちは、{profile.name.split(' ')[1] || profile.name}さん！<br />新しい相談を始めましょう。何でも気軽に話しかけてください。</p>
          </div>
        </div>
      )}
      {session.messages.map((msg) => (
        <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
          {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0"><Bot size={16} className="text-white" /></div>}
          {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0"><span className="text-slate-600 font-bold text-xs">{profile.name.charAt(0)}</span></div>}
          <div className={cn('rounded-2xl px-4 py-3 max-w-[75%] text-sm leading-relaxed shadow-sm', msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm')}>
            {msg.role === 'assistant' ? <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre> : msg.content}
          </div>
        </div>
      ))}
      {isTyping && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0"><Bot size={16} className="text-white" /></div>
          <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
            <div className="flex gap-1 items-center h-5">{[0,1,2].map((i) => (<span key={i} className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />))}</div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

// ── Main Chat ──────────────────────────────────────────────────────

export function Chat() {
  const {
    chatSessions, setChatSessions, activeChatSessionId, setActiveChatSessionId,
    profile, activeEpisodeForDeepDive, setActiveEpisodeForDeepDive,
    episodes, setEpisodes,
  } = useApp();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [practiceMode, setPracticeModeState] = useState<InterviewPracticeMode | null>(null);
  const sessionsRef = useRef(chatSessions);
  useEffect(() => { sessionsRef.current = chatSessions; }, [chatSessions]);

  // Load practice mode on mount and start new session if found
  useEffect(() => {
    const saved = storage.getInterviewPracticeMode();
    if (!saved) return;
    setPracticeModeState(saved);

    // Create a new session for the practice
    const newId = generateId();
    const sessionName = `面談練習：${saved.companyName}（${saved.practiceType}）`;
    const openingMsg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: getPracticeOpeningMessage(saved),
      createdAt: new Date().toISOString(),
    };
    const newSession: ChatSession = {
      id: newId,
      name: sessionName,
      createdAt: new Date().toISOString(),
      messages: [openingMsg],
    };
    setChatSessions([...sessionsRef.current, newSession]);
    setActiveChatSessionId(newId);
    // Clear from storage so it doesn't re-trigger
    storage.setInterviewPracticeMode(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeSession = chatSessions.find((s) => s.id === activeChatSessionId) ?? chatSessions[0];

  const isDeepDiveMode = !!(
    activeEpisodeForDeepDive &&
    activeEpisodeForDeepDive.chatSessionId === activeSession?.id
  );
  const deepDiveUserCount = isDeepDiveMode
    ? activeSession.messages.filter((m) => m.role === 'user').length
    : 0;

  const updateSession = useCallback((id: string, patch: Partial<ChatSession>) => {
    setChatSessions(chatSessions.map((s) => s.id === id ? { ...s, ...patch } : s));
  }, [chatSessions, setChatSessions]);

  const addSession = () => {
    const newId = generateId();
    const n = chatSessions.length + 1;
    const s: ChatSession = { id: newId, name: `相談 ${n}`, createdAt: new Date().toISOString(), messages: [] };
    setChatSessions([...chatSessions, s]);
    setActiveChatSessionId(newId);
    setInput('');
  };

  const closeSession = (id: string) => {
    const remaining = chatSessions.filter((s) => s.id !== id);
    if (remaining.length === 0) return;
    setChatSessions(remaining);
    if (activeChatSessionId === id) setActiveChatSessionId(remaining[remaining.length - 1].id);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;
    setInput('');

    const sessionId = activeSession.id;
    const userMsg: ChatMessage = { id: generateId(), role: 'user', content: text.trim(), createdAt: new Date().toISOString() };
    const withUser = [...activeSession.messages, userMsg];
    updateSession(sessionId, { messages: withUser });
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 1000));

    let responseText: string;
    if (isDeepDiveMode) {
      const questionIdx = withUser.filter((m) => m.role === 'user').length - 1;
      responseText = generateDeepDiveResponse(questionIdx);
    } else if (practiceMode) {
      responseText = generatePracticeFeedback(text);
    } else {
      responseText = generateNormalResponse(text);
    }

    const aiMsg: ChatMessage = { id: generateId(), role: 'assistant', content: responseText, createdAt: new Date().toISOString() };
    setChatSessions(sessionsRef.current.map((s) => s.id === sessionId ? { ...s, messages: [...withUser, aiMsg] } : s));
    setIsTyping(false);
  };

  const handleCompleteDeepDive = () => {
    if (!activeEpisodeForDeepDive) return;
    const summary = generateMockSummary(activeEpisodeForDeepDive);
    const now = new Date().toISOString();
    setEpisodes(episodes.map((e) =>
      e.id === activeEpisodeForDeepDive.episodeId
        ? {
            ...e,
            isDeepDived: true,
            aiConclusion: summary.aiConclusion,
            aiDetail: summary.aiDetail,
            extractedStrengths: summary.extractedStrengths,
            extractedValues: summary.extractedValues,
            deepDiveChatId: activeSession.id,
            deepDiveUpdatedAt: now,
            updatedAt: now,
          }
        : e
    ));
    const completionMsg: ChatMessage = {
      id: generateId(), role: 'assistant',
      content: `✨ 深掘りが完了しました！\n\n【AI結論】\n${summary.aiConclusion}\n\n【補足】\n${summary.aiDetail}\n\n【抽出された強み】${summary.extractedStrengths.join('、')}\n【抽出された価値観】${summary.extractedValues.join('、')}\n\n自己分析タブに結果が反映されました。エピソードカードを確認してみてください。`,
      createdAt: now,
    };
    setChatSessions(sessionsRef.current.map((s) =>
      s.id === activeSession.id ? { ...s, messages: [...s.messages, completionMsg] } : s
    ));
    setActiveEpisodeForDeepDive(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const handleEndPractice = () => {
    storage.setInterviewPracticeMode(null);
    setPracticeModeState(null);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {practiceMode && <PracticeBanner mode={practiceMode} onEnd={handleEndPractice} />}
      <SummaryBar sessions={chatSessions} />
      <TabBar
        sessions={chatSessions}
        activeId={activeSession.id}
        onSelect={(id) => { setActiveChatSessionId(id); setInput(''); }}
        onAdd={addSession}
        onClose={closeSession}
        onRename={(id, name) => updateSession(id, { name })}
        onSearchOpen={() => setSearchOpen((v) => !v)}
      />
      {searchOpen && (
        <SearchPanel sessions={chatSessions} onClose={() => setSearchOpen(false)} onJump={(id) => setActiveChatSessionId(id)} />
      )}

      {/* Deep dive banner */}
      {isDeepDiveMode && activeEpisodeForDeepDive && (
        <DeepDiveBanner
          ep={activeEpisodeForDeepDive}
          userMessageCount={deepDiveUserCount}
          onComplete={handleCompleteDeepDive}
        />
      )}

      <MessageList session={activeSession} isTyping={isTyping} profile={profile} />

      <div className="flex-shrink-0 bg-white border-t border-slate-100 px-4 md:px-6 py-3 pb-safe mb-16 md:mb-0">
        {!isDeepDiveMode && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
            {QUICK_TOPICS.map((topic) => (
              <button key={topic} onClick={() => sendMessage(topic)} disabled={isTyping}
                className="flex-shrink-0 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1.5 hover:bg-blue-100 transition-colors disabled:opacity-40">
                {topic}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2 items-end">
          <textarea
            value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={isDeepDiveMode ? '回答を入力してください...' : 'なんでも相談してください...'}
            rows={1}
            className="flex-1 resize-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 min-h-[44px] max-h-32"
            style={{ height: 'auto' }}
            onInput={(e) => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = `${Math.min(t.scrollHeight, 128)}px`; }}
          />
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || isTyping}
            className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
