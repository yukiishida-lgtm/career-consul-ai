'use client';

import { cn } from '@/lib/utils';
import type { Episode, EpisodePeriod } from '@/types';

export const EPISODE_PERIODS: EpisodePeriod[] = ['幼少期', '小学生', '中学生', '高校生', '大学生', '社会人'];

const PERIOD_DOT_COLORS: Record<EpisodePeriod, string> = {
  '幼少期': '#ec4899',
  '小学生': '#3b82f6',
  '中学生': '#14b8a6',
  '高校生': '#8b5cf6',
  '大学生': '#f59e0b',
  '社会人': '#10b981',
};

const W = 600;
const H = 200;
const PAD = { top: 28, right: 24, bottom: 36, left: 46 };
const IW = W - PAD.left - PAD.right;
const IH = H - PAD.top - PAD.bottom;

function px(idx: number): number {
  return PAD.left + (idx / (EPISODE_PERIODS.length - 1)) * IW;
}
function py(score: number): number {
  return PAD.top + IH / 2 - (score / 100) * (IH / 2);
}

interface Props {
  episodes: Episode[];
  selectedPeriod: EpisodePeriod | null;
  onPeriodSelect: (p: EpisodePeriod) => void;
}

export function MotivationChart({ episodes, selectedPeriod, onPeriodSelect }: Props) {
  const periodData = EPISODE_PERIODS.map((p, i) => {
    const eps = episodes.filter((e) => e.period === p);
    const avg = eps.length > 0
      ? Math.round(eps.reduce((s, e) => s + e.motivationScore, 0) / eps.length)
      : null;
    return { period: p, idx: i, score: avg, count: eps.length, x: px(i), y: avg !== null ? py(avg) : null };
  });

  const withData = periodData.filter((d) => d.y !== null) as (typeof periodData[0] & { y: number; score: number })[];
  const pathD = withData.length >= 2
    ? withData.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x},${pt.y}`).join(' ')
    : '';

  const zeroY = py(0);

  return (
    <div className="w-full select-none">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: 'visible' }}>
        {/* Background bands */}
        <rect x={PAD.left} y={PAD.top} width={IW} height={IH / 2} fill="#eff6ff" fillOpacity={0.5} />
        <rect x={PAD.left} y={zeroY} width={IW} height={IH / 2} fill="#fef2f2" fillOpacity={0.5} />

        {/* Grid verticals */}
        {EPISODE_PERIODS.map((_, i) => (
          <line key={i} x1={px(i)} y1={PAD.top} x2={px(i)} y2={PAD.top + IH} stroke="#f1f5f9" strokeWidth={1} />
        ))}

        {/* Zero line */}
        <line x1={PAD.left} y1={zeroY} x2={PAD.left + IW} y2={zeroY} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 3" />

        {/* Y labels */}
        {[100, 50, 0, -50, -100].map((s) => (
          <text key={s} x={PAD.left - 6} y={py(s) + 4} textAnchor="end" fontSize={9} fill="#94a3b8">
            {s > 0 ? '+' : ''}{s}
          </text>
        ))}

        {/* Connection line */}
        {pathD && (
          <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Period dots */}
        {periodData.map((pd) => {
          const isSelected = selectedPeriod === pd.period;
          const dotColor = PERIOD_DOT_COLORS[pd.period];
          const dotY = pd.y ?? zeroY;
          return (
            <g
              key={pd.period}
              onClick={() => onPeriodSelect(pd.period)}
              className="cursor-pointer"
            >
              {isSelected && (
                <circle cx={pd.x} cy={dotY} r={14} fill={dotColor} fillOpacity={0.15} />
              )}
              <circle
                cx={pd.x} cy={dotY} r={pd.count > 0 ? (isSelected ? 8 : 6) : (isSelected ? 6 : 4)}
                fill={pd.count > 0 ? dotColor : 'white'}
                stroke={dotColor}
                strokeWidth={2}
              />
              {pd.score !== null && (
                <text
                  x={pd.x} y={dotY - 13}
                  textAnchor="middle" fontSize={9} fontWeight="bold"
                  fill={pd.score >= 0 ? '#2563eb' : '#ef4444'}
                >
                  {pd.score > 0 ? '+' : ''}{pd.score}
                </text>
              )}
            </g>
          );
        })}

        {/* X labels */}
        {EPISODE_PERIODS.map((p, i) => (
          <text key={p} x={px(i)} y={H - 2} textAnchor="middle" fontSize={10} fill={selectedPeriod === p ? '#2563eb' : '#64748b'} fontWeight={selectedPeriod === p ? 'bold' : 'normal'}>
            {p}
          </text>
        ))}
      </svg>
    </div>
  );
}
