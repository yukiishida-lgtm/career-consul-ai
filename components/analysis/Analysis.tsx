'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LifeHistoryTab } from './LifeHistoryTab';
import { AnalysisResultTab } from './AnalysisResultTab';
import type { TabId } from '@/components/layout/types';

type SubTab = '自分史' | '分析結果';

interface Props {
  onTabChange: (tab: TabId) => void;
}

export function Analysis({ onTabChange }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('自分史');
  const [highlightedEpisodeId, setHighlightedEpisodeId] = useState<string | null>(null);

  const handleJumpToEpisode = (id: string) => {
    setHighlightedEpisodeId(id);
    setActiveSubTab('自分史');
    setTimeout(() => {
      document.getElementById(`ep-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Sub-tab bar */}
      <div className="bg-white border-b border-slate-100 px-6 py-3 flex-shrink-0 flex items-center justify-between">
        <div className="flex gap-1">
          {(['自分史', '分析結果'] as SubTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
                activeSubTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === '自分史' && (
        <LifeHistoryTab
          onTabChange={onTabChange}
          highlightedEpisodeId={highlightedEpisodeId}
          onClearHighlight={() => setHighlightedEpisodeId(null)}
        />
      )}
      {activeSubTab === '分析結果' && (
        <AnalysisResultTab onJumpToEpisode={handleJumpToEpisode} />
      )}
    </div>
  );
}
