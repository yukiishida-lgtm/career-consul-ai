'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { IdealCareerForm } from './IdealCareerForm';
import { CareerPathCards } from './CareerPathCards';
import { GapAnalysis } from './GapAnalysis';
import { ActionPlan } from './ActionPlan';
import { LifePlanSection } from './LifePlanSection';
import { LifeTasksSection } from './LifeTasksSection';
import { LifeVisionSection } from './LifeVisionSection';
import { Map, ListChecks, Star, Target, TrendingUp, BarChart2, Zap } from 'lucide-react';

const SECTION_GROUPS = [
  {
    group: '人生設計',
    color: 'text-blue-600',
    sections: [
      { id: 'lifePlan',    label: '人生設計',       icon: Map,        desc: 'タイムライン' },
      { id: 'lifeTasks',   label: '人生タスク',     icon: ListChecks, desc: '目標を分解' },
      { id: 'lifeVision',  label: '目標ビジュアル', icon: Star,       desc: 'ビジョンボード' },
    ],
  },
  {
    group: 'キャリア設計',
    color: 'text-violet-600',
    sections: [
      { id: 'ideal',   label: '理想キャリア',     icon: Target,    desc: '価値観・条件' },
      { id: 'paths',   label: 'キャリアパス',     icon: TrendingUp,desc: 'AI提案' },
      { id: 'gap',     label: 'ギャップ分析',     icon: BarChart2,  desc: '現在vs理想' },
      { id: 'actions', label: 'アクションプラン', icon: Zap,        desc: '今すべきこと' },
    ],
  },
] as const;

type SectionId =
  | 'lifePlan' | 'lifeTasks' | 'lifeVision'
  | 'ideal' | 'paths' | 'gap' | 'actions';

const SECTION_TITLES: Record<SectionId, string> = {
  lifePlan:   '人生設計タイムライン',
  lifeTasks:  '人生タスク',
  lifeVision: '目標ビジュアル',
  ideal:      '理想キャリア',
  paths:      'キャリアパス提案',
  gap:        'ギャップ分析',
  actions:    'アクションプラン',
};

export function Career() {
  const [activeSection, setActiveSection] = useState<SectionId>('lifePlan');
  const { careerPlan } = useApp();

  return (
    <div className="flex-1 overflow-y-auto pb-20 md:pb-0 bg-slate-50">
      {/* Sticky header + tabs */}
      <div className="sticky top-0 bg-slate-50 z-10 border-b border-slate-100">
        <div className="px-5 pt-5 pb-0">
          <h1 className="text-base font-black text-slate-800">キャリア設計</h1>
          <p className="text-xs text-slate-500 mt-0.5">人生・キャリアの全体像を描き、行動につなげましょう</p>

          {/* Tab groups */}
          <div className="flex gap-4 mt-4 overflow-x-auto pb-0" style={{ scrollbarWidth: 'none' }}>
            {SECTION_GROUPS.map(({ group, color, sections }) => (
              <div key={group} className="flex-shrink-0">
                <p className={cn('text-[10px] font-bold uppercase tracking-wide mb-1.5', color)}>{group}</p>
                <div className="flex gap-1.5 pb-0">
                  {sections.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveSection(id as SectionId)}
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
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-5">
        {/* Section title */}
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-700">{SECTION_TITLES[activeSection]}</h2>
        </div>

        {activeSection === 'lifePlan'   && <LifePlanSection />}
        {activeSection === 'lifeTasks'  && <LifeTasksSection />}
        {activeSection === 'lifeVision' && <LifeVisionSection />}
        {activeSection === 'ideal'      && <IdealCareerForm plan={careerPlan} />}
        {activeSection === 'paths'      && <CareerPathCards paths={careerPlan.paths} />}
        {activeSection === 'gap'        && <GapAnalysis gaps={careerPlan.gaps} />}
        {activeSection === 'actions'    && <ActionPlan actions={careerPlan.actions} />}
      </div>
    </div>
  );
}
