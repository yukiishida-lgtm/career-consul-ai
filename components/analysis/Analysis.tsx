'use client';

import { useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LifeHistoryTab } from './LifeHistoryTab';
import { AnalysisResultTab } from './AnalysisResultTab';
import { ChatHistoryTab } from './ChatHistoryTab';
import type { TabId } from '@/components/layout/types';

type SubTab = '自分史' | '相談履歴' | '分析結果';

const TAB_META: Record<SubTab, { title: string; subtitle: string }> = {
  '自分史': {
    title: '自分史',
    subtitle: 'これまでの人生を年表で振り返り、モチベーションの変化を可視化しましょう。',
  },
  '相談履歴': {
    title: '相談履歴',
    subtitle: '相談チャットの内容をテーマ別に分類しています。分析結果にも反映されます。',
  },
  '分析結果': {
    title: '自己分析の結果',
    subtitle: 'あなたの強み・価値観・行動特性を多角的に分析しました。',
  },
};

interface Props {
  onTabChange: (tab: TabId) => void;
}

export function Analysis({ onTabChange }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('自分史');
  const [highlightedEpisodeId, setHighlightedEpisodeId] = useState<string | null>(null);
  const [highlightedChatId, setHighlightedChatId] = useState<string | null>(null);

  const handleJumpToEpisode = (id: string) => {
    setHighlightedEpisodeId(id);
    setActiveSubTab('自分史');
    setTimeout(() => {
      document.getElementById(`ep-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleJumpToChat = (sessionId: string) => {
    setHighlightedChatId(sessionId);
    setActiveSubTab('相談履歴');
    setTimeout(() => {
      document.getElementById(`chat-${sessionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const meta = TAB_META[activeSubTab];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-slate-100 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: title + tabs */}
          <div>
            <h1 className="text-lg font-black text-slate-800">{meta.title}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{meta.subtitle}</p>
            {/* Tab pills */}
            <div className="flex mt-3 bg-slate-100 rounded-xl p-1 w-fit gap-0.5">
              {(['自分史', '相談履歴', '分析結果'] as SubTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={cn(
                    'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    activeSubTab === tab
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Right: buttons (分析結果 only) */}
          {activeSubTab === '分析結果' && (
            <div className="flex items-center gap-2 flex-shrink-0 mt-1">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <Download size={13} className="text-slate-400" />
                レポートをダウンロード
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors">
                <RefreshCw size={13} />
                再分析する
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {activeSubTab === '自分史' && (
        <LifeHistoryTab
          onTabChange={onTabChange}
          highlightedEpisodeId={highlightedEpisodeId}
          onClearHighlight={() => setHighlightedEpisodeId(null)}
        />
      )}
      {activeSubTab === '相談履歴' && (
        <ChatHistoryTab
          highlightedSessionId={highlightedChatId}
          onClearHighlight={() => setHighlightedChatId(null)}
        />
      )}
      {activeSubTab === '分析結果' && (
        <AnalysisResultTab
          onJumpToEpisode={handleJumpToEpisode}
          onJumpToChat={handleJumpToChat}
        />
      )}
    </div>
  );
}
