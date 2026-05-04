'use client';

import { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import type { ActionPlan as ActionPlanType } from '@/types';
import { cn } from '@/lib/utils';

interface ActionListProps {
  title: string;
  emoji: string;
  items: string[];
  color: string;
}

function ActionList({ title, emoji, items, color }: ActionListProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    const next = new Set(checked);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setChecked(next);
  };

  return (
    <div className={cn('bg-white rounded-2xl p-5 shadow-sm border', color)}>
      <h3 className="text-sm font-bold text-slate-800 mb-4">
        {emoji} {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-3 cursor-pointer group"
            onClick={() => toggle(i)}
          >
            {checked.has(i) ? (
              <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            ) : (
              <Circle size={18} className="text-slate-300 group-hover:text-blue-400 flex-shrink-0 mt-0.5 transition-colors" />
            )}
            <span className={cn('text-sm leading-relaxed', checked.has(i) ? 'line-through text-slate-400' : 'text-slate-700')}>
              {item}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-slate-400 mt-3">
        {checked.size}/{items.length} 完了
      </p>
    </div>
  );
}

export function ActionPlan({ actions }: { actions: ActionPlanType }) {
  return (
    <div className="space-y-4">
      <ActionList
        title="今週やること"
        emoji="⚡"
        items={actions.thisWeek}
        color="border-blue-100"
      />
      <ActionList
        title="今月やること"
        emoji="📅"
        items={actions.thisMonth}
        color="border-teal-100"
      />
      <ActionList
        title="3ヶ月以内にやること"
        emoji="🎯"
        items={actions.threeMonths}
        color="border-violet-100"
      />
    </div>
  );
}
