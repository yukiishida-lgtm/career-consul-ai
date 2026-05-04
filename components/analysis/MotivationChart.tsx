'use client';

import type { Episode, EpisodePeriod } from '@/types';

// Kept for backward compatibility (used by other imports)
export const EPISODE_PERIODS: EpisodePeriod[] = ['幼少期', '小学生', '中学生', '高校生', '大学生', '社会人'];

export const PERIOD_META: Record<EpisodePeriod, {
  color: string; bg: string; bandFill: string; label: string; ageRange: string;
}> = {
  '幼少期':  { color: '#ec4899', bg: 'bg-pink-50',    bandFill: '#fce7f3', label: '幼少期', ageRange: '0〜6歳'   },
  '小学生':  { color: '#3b82f6', bg: 'bg-blue-50',    bandFill: '#dbeafe', label: '小学生', ageRange: '7〜12歳'  },
  '中学生':  { color: '#0d9488', bg: 'bg-teal-50',    bandFill: '#ccfbf1', label: '中学生', ageRange: '13〜15歳' },
  '高校生':  { color: '#8b5cf6', bg: 'bg-violet-50',  bandFill: '#ede9fe', label: '高校生', ageRange: '16〜18歳' },
  '大学生':  { color: '#f59e0b', bg: 'bg-amber-50',   bandFill: '#fef3c7', label: '大学生', ageRange: '19〜22歳' },
  '社会人':  { color: '#10b981', bg: 'bg-emerald-50', bandFill: '#d1fae5', label: '社会人', ageRange: '23歳〜'   },
};

// ── 8 display columns (matches the table exactly) ─────────────────
// 小学生 → 低学年 / 高学年、社会人 → ①23-26歳 / ②27-30歳 に分割
const CHART_COLS = [
  {
    key: '幼少期',
    label: '幼少期',
    color: '#ec4899',
    bandFill: '#fce7f3',
    filter: (ep: Episode) => ep.period === '幼少期',
  },
  {
    key: '小学生低学年',
    label: '小学生低',
    color: '#3b82f6',
    bandFill: '#dbeafe',
    filter: (ep: Episode) => ep.period === '小学生' && (!ep.age || ep.age <= 9),
  },
  {
    key: '小学生高学年',
    label: '小学生高',
    color: '#60a5fa',
    bandFill: '#e0f2fe',
    filter: (ep: Episode) => ep.period === '小学生' && ep.age !== undefined && ep.age >= 10,
  },
  {
    key: '中学生',
    label: '中学生',
    color: '#0d9488',
    bandFill: '#ccfbf1',
    filter: (ep: Episode) => ep.period === '中学生',
  },
  {
    key: '高校生',
    label: '高校生',
    color: '#8b5cf6',
    bandFill: '#ede9fe',
    filter: (ep: Episode) => ep.period === '高校生',
  },
  {
    key: '大学生',
    label: '大学生',
    color: '#f59e0b',
    bandFill: '#fef3c7',
    filter: (ep: Episode) => ep.period === '大学生',
  },
  {
    key: '社会人①',
    label: '社会人①',
    color: '#10b981',
    bandFill: '#d1fae5',
    filter: (ep: Episode) => ep.period === '社会人' && (!ep.age || ep.age <= 26),
  },
  {
    key: '社会人②',
    label: '社会人②',
    color: '#059669',
    bandFill: '#a7f3d0',
    filter: (ep: Episode) => ep.period === '社会人' && ep.age !== undefined && ep.age >= 27,
  },
] as const;

// ── Layout constants ──────────────────────────────────────────────
// テーブルと幅を一致させる: 年齢列96px + 8列×120px = 1056px
const W        = 1056;
const H        = 140;
const LABEL_COL = 96;
const COL_W    = 120; // 8 cols × 120 = 960; 96 + 960 = 1056
const PAD_TOP  = 28;
const PAD_BOT  = 24;
const IH       = H - PAD_TOP - PAD_BOT; // 88px

function colBandX(idx: number): number {
  return LABEL_COL + idx * COL_W;
}
function colDotX(idx: number): number {
  return LABEL_COL + idx * COL_W + COL_W / 2;
}
function py(score: number): number {
  return PAD_TOP + IH / 2 - (score / 100) * (IH / 2);
}

// ── Component ─────────────────────────────────────────────────────

interface Props {
  episodes: Episode[];
  selectedColKey: string | null;
  onColSelect: (key: string) => void;
}

export function MotivationChart({ episodes, selectedColKey, onColSelect }: Props) {
  const colData = CHART_COLS.map((col, i) => {
    const eps = episodes.filter(col.filter);
    const scored = eps.filter(e => e.motivationScore !== null);
    const avg = scored.length > 0
      ? Math.round(scored.reduce((s, e) => s + e.motivationScore!, 0) / scored.length)
      : null;
    const x = colDotX(i);
    return { ...col, idx: i, score: avg, count: eps.length, x, y: avg !== null ? py(avg) : null };
  });

  const withData = colData.filter((d) => d.y !== null) as (typeof colData[0] & { y: number; score: number })[];
  const zeroY   = py(0);

  return (
    <div className="w-full select-none">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: 'visible', display: 'block' }}>

        {/* Band backgrounds */}
        {CHART_COLS.map((col, i) => {
          const isSelected = selectedColKey === col.key;
          return (
            <rect key={col.key}
              x={colBandX(i)} y={PAD_TOP} width={COL_W} height={IH}
              fill={col.bandFill} fillOpacity={isSelected ? 0.85 : 0.45}
            />
          );
        })}

        {/* Zero dashed line */}
        <line x1={LABEL_COL} y1={zeroY} x2={W} y2={zeroY}
          stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 3" />

        {/* Y-axis labels */}
        {[100, 50, 0, -50, -100].map((s) => (
          <text key={s} x={LABEL_COL - 6} y={py(s) + 3}
            textAnchor="end" fontSize={8} fill="#94a3b8">
            {s > 0 ? '+' : ''}{s}
          </text>
        ))}

        {/* Connecting line segments */}
        {withData.map((pt, i) => {
          if (i === 0) return null;
          const prev = withData[i - 1];
          return (
            <line key={`seg-${i}`}
              x1={prev.x} y1={prev.y} x2={pt.x} y2={pt.y}
              stroke={prev.color} strokeWidth={2} strokeLinecap="round" />
          );
        })}

        {/* Dots + score labels */}
        {colData.map((cd) => {
          const isSelected = selectedColKey === cd.key;
          const dotY = cd.y ?? zeroY;
          const r = cd.count > 0 ? (isSelected ? 7 : 5) : (isSelected ? 5 : 3.5);
          return (
            <g key={cd.key} onClick={() => onColSelect(cd.key)} className="cursor-pointer">
              {isSelected && (
                <circle cx={cd.x} cy={dotY} r={r + 5} fill={cd.color} fillOpacity={0.15} />
              )}
              <circle cx={cd.x} cy={dotY} r={r}
                fill={cd.count > 0 ? cd.color : 'white'}
                stroke={cd.color} strokeWidth={2} />
              {cd.score !== null && (
                <text x={cd.x} y={dotY - (r + 4)}
                  textAnchor="middle" fontSize={9} fontWeight="bold"
                  fill={cd.score >= 0 ? '#2563eb' : '#ef4444'}>
                  {cd.score > 0 ? '+' : ''}{cd.score}
                </text>
              )}
            </g>
          );
        })}

        {/* X-axis labels */}
        {CHART_COLS.map((col, i) => {
          const isSelected = selectedColKey === col.key;
          return (
            <text key={col.key} x={colDotX(i)} y={H - 4}
              textAnchor="middle" fontSize={9}
              fill={isSelected ? col.color : '#64748b'}
              fontWeight={isSelected ? 'bold' : 'normal'}>
              {col.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
