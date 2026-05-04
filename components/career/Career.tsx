'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LifePlanSection } from './LifePlanSection';
import { LifeTasksSection } from './LifeTasksSection';
import { LifeDreamSection } from './LifeDreamSection';
import { careerSectionStore } from '@/lib/careerSectionStore';
import { Map, ListChecks, Sparkles } from 'lucide-react';

const SECTIONS = [
  { id: 'lifePlan',   label: '人生設計',       icon: Map,        desc: 'タイムライン' },
  { id: 'lifeTasks',  label: '人生タスク',     icon: ListChecks, desc: '目標を分解' },
  { id: 'lifeDream',  label: '夢の見える化',   icon: Sparkles,   desc: '8つのビジョン' },
] as const;

type SectionId = 'lifePlan' | 'lifeTasks' | 'lifeDream';

const SECTION_TITLES: Record<SectionId, string> = {
  lifePlan:  '人生設計タイムライン',
  lifeTasks: '人生タスク',
  lifeDream: '夢の見える化（8つのビジョン）',
};

export function Career() {
  const [activeSection, setActiveSection] = useState<SectionId>(() => {
    const pending = careerSectionStore.consume();
    return (pending as SectionId) ?? 'lifePlan';
  });

  return (
    <div className="flex-1 overflow-y-auto pb-20 md:pb-0 bg-slate-50">
      {/* Sticky header + tabs */}
      <div className="sticky top-0 bg-slate-50 z-10 border-b border-slate-100">
        <div className="px-5 pt-5 pb-0">
          <h1 className="text-base font-black text-slate-800">キャリア設計</h1>
          <p className="text-xs text-slate-500 mt-0.5">人生・キャリアの全体像を描き、行動につなげましょう</p>

          {/* Tabs */}
          <div className="flex gap-1.5 mt-4" style={{ scrollbarWidth: 'none' }}>
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-xs font-semibold transition-colors border-b-2',
                  activeSection === id
                    ? 'bg-white text-blue-600 border-blue-500 shadow-sm'
                    : 'bg-transparent text-slate-500 border-transparent hover:text-slate-700 hover:bg-white/60'
                )}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-5">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-700">{SECTION_TITLES[activeSection]}</h2>
        </div>

        {activeSection === 'lifePlan'  && <LifePlanSection />}
        {activeSection === 'lifeTasks' && <LifeTasksSection />}
        {activeSection === 'lifeDream' && <LifeDreamSection />}
      </div>
    </div>
  );
}
