'use client';

import { useState, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { storage } from '@/lib/storage';
import { cn } from '@/lib/utils';
import type { LifePlan, LifePlanEntry, LifePlanSpan } from '@/types';

// ── Helpers ────────────────────────────────────────────────────────

const MAX_AGE = 60;

function calcAge(birthDate: string): number {
  if (!birthDate) return 30;
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return Math.max(18, Math.min(age, MAX_AGE));
}

function buildAgeList(currentAge: number, span: LifePlanSpan): number[] {
  const start = Math.min(currentAge, MAX_AGE);

  if (span === '1年') {
    const ages: number[] = [];
    for (let a = start; a <= MAX_AGE; a++) ages.push(a);
    return ages;
  }

  const step = span === '5年' ? 5 : 10;
  // First = current age, then snap up to next clean multiple of step
  const nextRounded = Math.ceil((start + 1) / step) * step;
  const ages: number[] = [start];
  for (let a = nextRounded; a <= MAX_AGE; a += step) ages.push(a);
  return ages;
}

function generateEntries(
  currentAge: number,
  birthYear: number,
  span: LifePlanSpan,
  existing: LifePlanEntry[]
): LifePlanEntry[] {
  return buildAgeList(currentAge, span).map((age) => {
    const found = existing.find((e) => e.age === age);
    return found ?? { age, year: birthYear + age, career: {}, private: {} };
  });
}

const CAREER_FIELDS: { key: keyof LifePlanEntry['career']; label: string; placeholder: string }[] = [
  { key: 'salary',      label: '年収',       placeholder: '例: 800万円' },
  { key: 'position',    label: '役職',       placeholder: '例: マネージャー' },
  { key: 'workContent', label: '仕事内容',   placeholder: '例: DX推進PM' },
  { key: 'workStyle',   label: '働き方',     placeholder: '例: フルリモート' },
  { key: 'skills',      label: 'スキル',     placeholder: '例: AI/DX, PM' },
];

const PRIVATE_FIELDS: { key: keyof LifePlanEntry['private']; label: string; placeholder: string }[] = [
  { key: 'marriage',   label: '結婚',         placeholder: '例: 結婚' },
  { key: 'children',   label: '子供',         placeholder: '例: 第一子誕生' },
  { key: 'assets',     label: '資産',         placeholder: '例: 1000万円' },
  { key: 'lifestyle',  label: '生活スタイル', placeholder: '例: 都市×自然' },
  { key: 'residence',  label: '住居',         placeholder: '例: 持ち家' },
  { key: 'dream',      label: '夢',           placeholder: '例: 海外移住' },
];

const SPAN_OPTIONS: LifePlanSpan[] = ['1年', '5年', '10年'];

// ── Age card color ─────────────────────────────────────────────────

function ageColor(age: number, currentAge: number): string {
  if (age === currentAge) return 'border-blue-500 bg-blue-50';
  if (age <= currentAge + 5) return 'border-emerald-300 bg-emerald-50/40';
  if (age <= currentAge + 15) return 'border-violet-300 bg-violet-50/40';
  return 'border-slate-200 bg-white';
}

function ageLabel(age: number, currentAge: number): { text: string; cls: string } {
  if (age === currentAge) return { text: '現在', cls: 'bg-blue-600 text-white' };
  if (age <= currentAge + 5) return { text: '近期', cls: 'bg-emerald-500 text-white' };
  if (age <= currentAge + 15) return { text: '中期', cls: 'bg-violet-500 text-white' };
  return { text: '長期', cls: 'bg-slate-400 text-white' };
}

// ── Main Component ────────────────────────────────────────────────

export function LifePlanSection() {
  const { extendedProfile } = useApp();
  const currentAge = calcAge(extendedProfile.birthDate);
  const birthYear = new Date().getFullYear() - currentAge;

  const saved = storage.getLifePlan();
  const [span, setSpan] = useState<LifePlanSpan>(saved?.span ?? '5年');
  const [entries, setEntries] = useState<LifePlanEntry[]>(
    generateEntries(currentAge, birthYear, saved?.span ?? '5年', saved?.entries ?? [])
  );

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSpanChange = useCallback((newSpan: LifePlanSpan) => {
    setSpan(newSpan);
    const newEntries = generateEntries(currentAge, birthYear, newSpan, entries);
    setEntries(newEntries);
    storage.setLifePlan({ birthYear, span: newSpan, entries: newEntries });
  }, [entries, currentAge, birthYear]);

  const updateEntry = useCallback((
    age: number,
    section: 'career' | 'private',
    field: string,
    value: string
  ) => {
    setEntries((prev) => {
      const next = prev.map((e) =>
        e.age === age
          ? { ...e, [section]: { ...e[section], [field]: value } }
          : e
      );
      storage.setLifePlan({ birthYear, span, entries: next });
      return next;
    });
  }, [birthYear, span]);

  const scrollBy = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <div className="space-y-4">
      {/* Span selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">表示スパン</span>
        </div>
        <div className="flex gap-1.5">
          {SPAN_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSpanChange(s)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors',
                span === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              {s}ごと
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 ml-auto">
          {currentAge}歳〜{MAX_AGE}歳 / {entries.length}ステップ
        </span>
      </div>

      {/* Scroll controls + cards */}
      <div className="relative">
        <button
          onClick={() => scrollBy(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-7 h-7 bg-white border border-slate-200 rounded-full shadow flex items-center justify-center hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft size={14} className="text-slate-500" />
        </button>
        <button
          onClick={() => scrollBy(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-7 h-7 bg-white border border-slate-200 rounded-full shadow flex items-center justify-center hover:bg-slate-50 transition-colors"
        >
          <ChevronRight size={14} className="text-slate-500" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-3 scroll-smooth px-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {entries.map((entry) => {
            const label = ageLabel(entry.age, currentAge);
            return (
              <div
                key={entry.age}
                className={cn(
                  'flex-shrink-0 w-72 rounded-2xl border-2 p-4 transition-all',
                  ageColor(entry.age, currentAge)
                )}
              >
                {/* Card header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-slate-800">{entry.age}歳</span>
                      <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full', label.cls)}>
                        {label.text}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{entry.year}年</p>
                  </div>
                </div>

                {/* キャリア */}
                <div className="mb-3">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                    キャリア
                  </p>
                  <div className="space-y-1.5">
                    {CAREER_FIELDS.map(({ key, label: fieldLabel, placeholder }) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 w-14 flex-shrink-0 text-right">{fieldLabel}</span>
                        <input
                          type="text"
                          value={entry.career[key] ?? ''}
                          onChange={(e) => updateEntry(entry.age, 'career', key, e.target.value)}
                          placeholder={placeholder}
                          className="flex-1 text-xs bg-white/80 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-400 placeholder:text-slate-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* プライベート */}
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    プライベート
                  </p>
                  <div className="space-y-1.5">
                    {PRIVATE_FIELDS.map(({ key, label: fieldLabel, placeholder }) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 w-14 flex-shrink-0 text-right">{fieldLabel}</span>
                        <input
                          type="text"
                          value={entry.private[key] ?? ''}
                          onChange={(e) => updateEntry(entry.age, 'private', key, e.target.value)}
                          placeholder={placeholder}
                          className="flex-1 text-xs bg-white/80 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-400 placeholder:text-slate-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] text-slate-400 text-center">← 横スクロールで全ステップを確認できます →</p>
    </div>
  );
}
