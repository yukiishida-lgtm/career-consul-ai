'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, X, ArrowRight, MessageSquare } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { defaultEpisodes } from '@/lib/mockData';
import type { Episode, ChatSession } from '@/types';

// Keywords to match each item against episode titles
const ITEM_KEYWORDS_MAP: Record<string, string[]> = {
  '新しいことに挑戦する':     ['挑戦', '新しい', 'インターン', 'ワクワク'],
  '人の役に立つことをする':   ['リーダー', '文化祭', '役に立つ', '貢献'],
  '成長できる環境にいる':     ['成長', 'インターン', 'プロジェクト', '新しい'],
  '単純作業の繰り返し':       ['やりがい', '見失う'],
  '成果が評価されない環境':   ['やりがい', '評価', '見失う'],
  'ルールが厳格すぎる組織':   ['やりがい', '見失う'],
  '課題を整理し解決策を考える': ['コンサル', 'プロジェクト', '課題'],
  '計画を立てて実行する':     ['レギュラー', 'プロジェクト', 'インターン'],
  '人にわかりやすく伝える':   ['リーダー', '文化祭'],
  '細部にこだわりすぎること': ['やりがい', '評価', '見失う'],
  'マルチタスクを同時にこなすこと': ['プロジェクト', 'インターン'],
  '長期的な単純作業':         ['やりがい', '見失う'],
  '成長・学び':               ['成長', 'インターン', '挑戦', '新しい'],
  '自由・柔軟性':             ['新しい', '挑戦', 'ワクワク'],
  '貢献・社会性':             ['リーダー', '文化祭', 'インターン'],
  '誠実・信頼':               ['リーダー', '文化祭'],
  '挑戦・変化':               ['挑戦', 'インターン', '新しい', 'ワクワク'],
  '家族・人間関係':           ['文化祭', 'リーダー'],
};

function findRelatedEpisodes(label: string, episodes: Episode[]): Episode[] {
  const keywords = ITEM_KEYWORDS_MAP[label] ?? [];
  if (keywords.length === 0) return [];
  const match = (ep: Episode) => keywords.some((kw) => ep.title.includes(kw));
  const fromCurrent = episodes.filter(match);
  // Fall back to default mock episodes if user's custom episodes don't match
  return fromCurrent.length > 0 ? fromCurrent : defaultEpisodes.filter(match);
}

function findRelatedChats(label: string, sessions: ChatSession[]): ChatSession[] {
  const keywords = ITEM_KEYWORDS_MAP[label] ?? [];
  if (keywords.length === 0) return [];
  return sessions.filter((s) => {
    const text = s.name + ' ' + s.messages.map((m) => m.content).join(' ');
    return keywords.some((kw) => text.includes(kw));
  }).slice(0, 3);
}

const willData = {
  want: ['新しいことに挑戦する', '人の役に立つことをする', '成長できる環境にいる'],
  dontWant: ['単純作業の繰り返し', '成果が評価されない環境', 'ルールが厳格すぎる組織'],
};

const canData = {
  good: ['課題を整理し解決策を考える', '計画を立てて実行する', '人にわかりやすく伝える'],
  notGood: ['細部にこだわりすぎること', 'マルチタスクを同時にこなすこと', '長期的な単純作業'],
};

const valueData = [
  { icon: '🌱', label: '成長・学び', desc: '常に学び、成長し続けたい' },
  { icon: '🕊️', label: '自由・柔軟性', desc: '自分らしい働き方をしたい' },
  { icon: '🤝', label: '貢献・社会性', desc: '社会や人の役に立ちたい' },
  { icon: '💎', label: '誠実・信頼', desc: '誠実に、信頼を大切にする' },
  { icon: '🔥', label: '挑戦・変化', desc: '新しいことに挑戦したい' },
  { icon: '👨‍👩‍👧', label: '家族・人間関係', desc: '大切な人との時間を重視する' },
];

const behaviorPatterns = [
  { label: '計画的に行動する', score: 85 },
  { label: '粘り強く取り組む', score: 80 },
  { label: '新しいことに挑戦する', score: 75 },
  { label: '責任感が強い', score: 70 },
  { label: '効率を重視する', score: 65 },
  { label: 'チームで協力する', score: 60 },
  { label: '柔軟に対応する', score: 55 },
];

const motivationSources = [
  { label: '成長実感を得られること', score: 90 },
  { label: '人の役に立つこと', score: 85 },
  { label: '目標を達成すること', score: 80 },
  { label: '新しい知識を得ること', score: 75 },
  { label: '自由に働けること', score: 65 },
  { label: '競争・挑戦すること', score: 60 },
  { label: '評価・承認されること', score: 55 },
];

const recommendedEnvironments = [
  { label: '裁量がある環境', desc: '自分の判断で進められる環境' },
  { label: '成長機会が豊富な環境', desc: '学びや挑戦の機会が多い環境' },
  { label: 'チームワークを重視する環境', desc: '協力し合い、目標に向かう環境' },
  { label: '新しいチャレンジができる環境', desc: '変化が多く、刺激のある環境' },
  { label: '社会貢献性の高い仕事', desc: '人や社会の役に立てる仕事' },
  { label: 'オープンでフラットな文化', desc: '風通しが良く、話しやすい文化' },
];

const recommendedRoles = ['プロジェクトマネージャー', 'コンサルタント', '企画・戦略職', 'マーケティング職', '人事・組織開発', '広報・PR', '営業企画', 'カスタマーサクセス'];
const recommendedIndustries = ['IT・SaaS', 'コンサルティング', '教育・研修', '人材・HR', 'マーケティング・広告', 'ヘルスケア', '社会課題解決・NPO', 'スタートアップ'];

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
    </div>
  );
}

interface PopupState {
  label: string;
  episodes: Episode[];
  chatSessions: ChatSession[];
}

interface EpisodePopupProps {
  popup: PopupState;
  onClose: () => void;
  onJumpToEpisode: (id: string) => void;
  onJumpToChat: (sessionId: string) => void;
}

function EpisodePopup({ popup, onClose, onJumpToEpisode, onJumpToChat }: EpisodePopupProps) {
  const hasEpisodes = popup.episodes.length > 0;
  const hasChats = popup.chatSessions.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-80 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">分析の根拠</p>
            <h3 className="text-sm font-bold text-slate-800">「{popup.label}」</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-5 pb-5 space-y-4">
          {/* Episodes section */}
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <span>📖</span> 関連エピソード（自分史）
            </p>
            {!hasEpisodes ? (
              <p className="text-xs text-slate-400 py-1">関連するエピソードがありません。</p>
            ) : (
              <div className="space-y-2">
                {popup.episodes.map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => { onJumpToEpisode(ep.id); onClose(); }}
                    className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition-all group text-left"
                  >
                    <div>
                      <span className="inline-block text-[10px] font-semibold text-blue-600 bg-blue-50 group-hover:bg-white px-2 py-0.5 rounded-full mb-1 transition-colors">
                        {ep.period}
                      </span>
                      <p className="text-xs font-medium text-slate-700 leading-snug">{ep.title}</p>
                    </div>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat sessions section */}
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <MessageSquare size={10} /> 関連する相談内容
            </p>
            {!hasChats ? (
              <p className="text-xs text-slate-400 py-1">関連する相談がありません。</p>
            ) : (
              <div className="space-y-2">
                {popup.chatSessions.map((s) => {
                  const aiMsg = s.messages.find((m) => m.role === 'assistant');
                  return (
                    <button
                      key={s.id}
                      onClick={() => { onJumpToChat(s.id); onClose(); }}
                      className="w-full flex items-start justify-between gap-3 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 hover:border-emerald-300 transition-all group text-left"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-700 leading-snug truncate">{s.name}</p>
                        {aiMsg && (
                          <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2 mt-0.5">{aiMsg.content}</p>
                        )}
                      </div>
                      <ArrowRight size={14} className="text-emerald-300 group-hover:text-emerald-600 flex-shrink-0 mt-0.5 transition-colors" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <p className="text-[10px] text-slate-400 pb-3 text-center flex-shrink-0">
          クリックで該当タブへジャンプ
        </p>
      </div>
    </div>
  );
}

interface Props {
  onJumpToEpisode: (id: string) => void;
  onJumpToChat: (sessionId: string) => void;
}

export function AnalysisResultTab({ onJumpToEpisode, onJumpToChat }: Props) {
  const { episodes, chatSessions } = useApp();
  const [popup, setPopup] = useState<PopupState | null>(null);

  const allSessions = chatSessions.flatMap((s) => s.messages.length > 0 ? [s] : []);

  const openPopup = (label: string) => {
    const relatedEpisodes = findRelatedEpisodes(label, episodes);
    const relatedChats = findRelatedChats(label, allSessions);
    setPopup({ label, episodes: relatedEpisodes, chatSessions: relatedChats });
  };

  const ClickableItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <button
      onClick={() => openPopup(label)}
      className="flex items-start gap-1.5 text-xs text-left w-full hover:opacity-70 transition-opacity cursor-pointer"
    >
      {children}
    </button>
  );

  return (
    <div className="flex-1 overflow-y-auto pb-20 md:pb-0 bg-slate-50">
      <div className="p-5 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ===== Column 1: Will・Can・Value ===== */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">1</span>
                <h2 className="text-base font-black text-slate-800">Will・Can・Value</h2>
              </div>
              <p className="text-xs text-slate-400">あなたの「やりたいこと・できること・大事にしたいこと」を整理しました。</p>
            </div>

            {/* Will */}
            <div className="border border-blue-100 rounded-xl p-4">
              <h3 className="text-xs font-bold text-blue-600 mb-3 flex items-center gap-1.5">
                <span>🎯</span> Will　やりたいこと・やりたくないこと
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">やりたいこと</p>
                  <ul className="space-y-1.5">
                    {willData.want.map((item) => (
                      <li key={item}>
                        <ClickableItem label={item}>
                          <CheckCircle2 size={12} className="text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700">{item}</span>
                        </ClickableItem>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">やりたくないこと</p>
                  <ul className="space-y-1.5">
                    {willData.dontWant.map((item) => (
                      <li key={item}>
                        <ClickableItem label={item}>
                          <XCircle size={12} className="text-slate-300 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-400">{item}</span>
                        </ClickableItem>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Can */}
            <div className="border border-emerald-100 rounded-xl p-4">
              <h3 className="text-xs font-bold text-emerald-600 mb-3 flex items-center gap-1.5">
                <span>⚡</span> Can　できること・にがてなこと
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">できること（得意）</p>
                  <ul className="space-y-1.5">
                    {canData.good.map((item) => (
                      <li key={item}>
                        <ClickableItem label={item}>
                          <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700">{item}</span>
                        </ClickableItem>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">にがてなこと</p>
                  <ul className="space-y-1.5">
                    {canData.notGood.map((item) => (
                      <li key={item}>
                        <ClickableItem label={item}>
                          <XCircle size={12} className="text-slate-300 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-400">{item}</span>
                        </ClickableItem>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Value */}
            <div className="border border-violet-100 rounded-xl p-4">
              <h3 className="text-xs font-bold text-violet-600 mb-3 flex items-center gap-1.5">
                <span>💠</span> Value　大事にしたいこと・価値観
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {valueData.map((v) => (
                  <button
                    key={v.label}
                    onClick={() => openPopup(v.label)}
                    className="bg-slate-50 hover:bg-violet-50 rounded-lg p-2 text-center transition-colors cursor-pointer border border-transparent hover:border-violet-100"
                  >
                    <div className="text-lg mb-1">{v.icon}</div>
                    <p className="text-xs font-semibold text-slate-700 leading-tight">{v.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{v.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ===== Column 2: 行動パターン・モチベーション ===== */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold">2</span>
                <h2 className="text-base font-black text-slate-800">行動パターン・モチベーションの源泉</h2>
              </div>
              <p className="text-xs text-slate-400">あなたの行動の特徴と、やる気が高まるポイントを分析しました。</p>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                <span>🏃</span> 行動パターン・特徴
              </h3>
              <div className="space-y-2.5">
                {behaviorPatterns.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 w-36 flex-shrink-0">{item.label}</span>
                    <ScoreBar score={item.score} color="bg-emerald-500" />
                    <span className="text-xs font-bold text-emerald-600 w-6 text-right">{item.score}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                <span>🔥</span> モチベーションの源泉
              </h3>
              <div className="space-y-2.5">
                {motivationSources.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 w-36 flex-shrink-0">{item.label}</span>
                    <ScoreBar score={item.score} color="bg-orange-400" />
                    <span className="text-xs font-bold text-orange-500 w-6 text-right">{item.score}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4">
              <h3 className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1.5">
                <span>💡</span> あなたの特徴
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                目標に向かって計画的に行動し、粘り強くやり遂げる力があります。
                成長や貢献を実感できる環境で、モチベーションが高まります。
              </p>
            </div>
          </div>

          {/* ===== Column 3: おすすめ環境・職種・業界 ===== */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold">3</span>
                <h2 className="text-base font-black text-slate-800">おすすめ環境・職種・業界</h2>
              </div>
              <p className="text-xs text-slate-400">あなたの特性に合う環境や職種、業界の傾向をまとめました。</p>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                <span>🏢</span> おすすめの環境
              </h3>
              <div className="space-y-2">
                {recommendedEnvironments.map((env) => (
                  <div key={env.label} className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-violet-500 flex-shrink-0 mt-0.5" />
                      <span className="text-xs font-semibold text-slate-700">{env.label}</span>
                    </div>
                    <span className="text-xs text-slate-400 text-right flex-shrink-0">{env.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                <span>💼</span> おすすめの職種
              </h3>
              <div className="flex flex-wrap gap-2">
                {recommendedRoles.map((role) => (
                  <span key={role} className="px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-medium border border-violet-100">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                <span>🏭</span> おすすめの業界
              </h3>
              <div className="flex flex-wrap gap-2">
                {recommendedIndustries.map((ind) => (
                  <span key={ind} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                    {ind}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-violet-50 rounded-xl p-4">
              <h3 className="text-xs font-bold text-violet-700 mb-2 flex items-center gap-1.5">
                <span>⭐</span> 活かせる強み
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                課題解決力・計画力・実行力を活かして、成長フェーズの組織や新しい価値を生み出す環境で力を発揮できます。
              </p>
            </div>
          </div>

        </div>

        <div className="mt-4 flex items-start gap-2 text-xs text-slate-400 bg-white rounded-xl px-4 py-3 border border-slate-100">
          <span className="text-blue-400 mt-0.5">ℹ</span>
          この分析結果は定期的に更新することをおすすめします。新しい経験や気づきによって、自己理解をより深めていきましょう。
        </div>
      </div>

      {/* Episode / Chat popup */}
      {popup && (
        <EpisodePopup
          popup={popup}
          onClose={() => setPopup(null)}
          onJumpToEpisode={onJumpToEpisode}
          onJumpToChat={onJumpToChat}
        />
      )}
    </div>
  );
}
