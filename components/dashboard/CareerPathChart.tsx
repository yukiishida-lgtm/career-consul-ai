'use client';

// SVG-based career path chart — 3 curved lines with milestone markers

const W = 460;
const H = 140;

// 3 x-points: 現在, 2〜3年後, 5年後〜
const XS = [60, 230, 400];

// y-values for each of the 3 paths (low/mid/high) at each x-point
// lower y = higher on screen in SVG
const PATHS = [
  { ys: [115, 80, 55],  stroke: '#86efac', width: 2 },   // green (conservative)
  { ys: [105, 65, 38],  stroke: '#2563eb', width: 2.5 },  // blue (recommended)
  { ys: [95,  52, 24],  stroke: '#c4b5fd', width: 2 },    // purple (ambitious)
];

// Cubic bezier: P0 → P3 with control points 1/3 and 2/3 along x
function cubicPath(x0: number, y0: number, x1: number, y1: number) {
  const cx1 = x0 + (x1 - x0) * 0.4;
  const cx2 = x0 + (x1 - x0) * 0.6;
  return `M${x0},${y0} C${cx1},${y0} ${cx2},${y1} ${x1},${y1}`;
}

const MILESTONES = [
  { x: XS[0], label: 'コンサルタント',       sub: '課題解決・提案経験を積む',   icon: '👤' },
  { x: XS[1], label: 'プロジェクトリーダー', sub: 'チーム・プロジェクトを牽引', icon: '🚩' },
  { x: XS[2], label: '事業責任者・\nマネージャー', sub: '事業成長をリードする',      icon: '⭐' },
];

const X_LABELS = ['現在', '2〜3年後', '5年後〜'];

export function CareerPathChart() {
  const midPath = PATHS[1];

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        style={{ overflow: 'visible' }}
      >
        {/* Background subtle grid line */}
        <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="#f1f5f9" strokeWidth={1} />

        {/* Path lines */}
        {PATHS.map((p, pi) => {
          const segments: string[] = [];
          for (let i = 0; i < XS.length - 1; i++) {
            segments.push(cubicPath(XS[i], p.ys[i], XS[i + 1], p.ys[i + 1]));
          }
          return (
            <g key={pi}>
              {segments.map((d, si) => (
                <path
                  key={si}
                  d={d}
                  fill="none"
                  stroke={p.stroke}
                  strokeWidth={p.width}
                  strokeLinecap="round"
                />
              ))}
            </g>
          );
        })}

        {/* Dots on mid (blue) line */}
        {midPath.ys.map((y, i) => (
          <g key={i}>
            <circle cx={XS[i]} cy={y} r={5} fill="white" stroke="#2563eb" strokeWidth={2} />
            {/* Icon above dot (not first) */}
            {i > 0 && (
              <text x={XS[i]} y={y - 14} textAnchor="middle" fontSize={13}>
                {MILESTONES[i].icon}
              </text>
            )}
          </g>
        ))}

        {/* X-axis labels */}
        {X_LABELS.map((label, i) => (
          <text
            key={i}
            x={XS[i]}
            y={H - 2}
            textAnchor="middle"
            fontSize={10}
            fill="#94a3b8"
          >
            {label}
          </text>
        ))}
      </svg>

      {/* Milestone role labels */}
      <div className="grid grid-cols-3 mt-2 gap-1 px-1">
        {MILESTONES.map((m) => (
          <div key={m.label} className="text-center">
            <p className="text-xs font-semibold text-slate-700 leading-snug">
              {m.label.replace('\\n', '\n')}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 leading-snug">{m.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
