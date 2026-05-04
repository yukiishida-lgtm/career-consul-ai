'use client';

import type { CareerPath } from '@/types';
import { cn } from '@/lib/utils';

const DIFFICULTY_COLOR: Record<CareerPath['difficulty'], string> = {
  低: 'bg-emerald-100 text-emerald-700',
  中: 'bg-amber-100 text-amber-700',
  高: 'bg-red-100 text-red-700',
};

export function CareerPathCards({ paths }: { paths: CareerPath[] }) {
  return (
    <div className="space-y-4">
      {paths.map((path, i) => (
        <div key={path.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-slate-800">{path.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{path.summary}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-0.5">想定年収</p>
              <p className="text-sm font-semibold text-slate-800">{path.salaryRange}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-0.5">難易度</p>
              <span className={cn('text-sm font-semibold px-2 py-0.5 rounded-full', DIFFICULTY_COLOR[path.difficulty])}>
                {path.difficulty}
              </span>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-xs font-medium text-slate-500 mb-1">向いている理由</p>
            <p className="text-sm text-slate-700 bg-blue-50 rounded-xl px-3 py-2 leading-relaxed">{path.reason}</p>
          </div>

          <div className="mb-3">
            <p className="text-xs font-medium text-slate-500 mb-2">必要スキル</p>
            <div className="flex flex-wrap gap-1.5">
              {path.requiredSkills.map((skill) => (
                <span key={skill} className="text-xs bg-slate-100 text-slate-600 rounded-full px-2.5 py-1">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50 rounded-xl px-3 py-2">
            <p className="text-xs font-medium text-emerald-700 mb-0.5">▶ 次にやること</p>
            <p className="text-sm text-emerald-800">{path.nextAction}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
