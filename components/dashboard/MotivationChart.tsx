'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { motivationHistory } from '@/lib/mockData';

const CHART_DATA = [
  { name: '小学生', score: 40, label: '部活のレギュラーに' },
  { name: '中学生', score: 35 },
  { name: '中2', score: -30 },
  { name: '高校生', score: 65, label: '文化祭のリーダーを経験' },
  { name: '高2', score: 20 },
  { name: '大学生', score: -20, label: '仕事のやりがいを見失う時期' },
  { name: '大3', score: 55 },
  { name: '社会人 (入社〜3年目)', score: 30 },
  { name: '社会人2年目', score: -15 },
  { name: '現在', score: 85, label: '新しい挑戦にワクワクしている！' },
];

// Keep motivationHistory import to avoid unused warning
void motivationHistory;

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: typeof CHART_DATA[0] }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow text-xs">
      <p className="font-semibold text-slate-700">{label}</p>
      <p className="text-blue-600">スコア: {d.score}</p>
      {d.label && <p className="text-slate-500 mt-1 max-w-[160px]">{d.label}</p>}
    </div>
  );
}

export function MotivationChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={CHART_DATA} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[-100, 100]}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="#e2e8f0" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#2563eb"
          strokeWidth={2.5}
          dot={{ fill: '#2563eb', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
