'use client';

import { useState } from 'react';
import { Edit3, Check } from 'lucide-react';
import type { CareerPlan } from '@/types';
import { useApp } from '@/context/AppContext';

interface Props {
  plan: CareerPlan;
}

export function IdealCareerForm({ plan }: Props) {
  const { setCareerPlan } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    idealWorkStyle: plan.idealWorkStyle,
    targetSalary: plan.targetSalary,
    valuesText: plan.values.join('、'),
    vision: plan.vision,
  });

  const handleSave = () => {
    setCareerPlan({
      ...plan,
      idealWorkStyle: form.idealWorkStyle,
      targetSalary: form.targetSalary,
      values: form.valuesText.split(/[、,，\s]+/).filter(Boolean),
      vision: form.vision,
    });
    setEditing(false);
  };

  const Field = ({ label, value, field, multiline = false }: { label: string; value: string; field: keyof typeof form; multiline?: boolean }) => (
    <div className="mb-4">
      <label className="text-xs font-medium text-slate-500 block mb-1">{label}</label>
      {editing ? (
        multiline ? (
          <textarea
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
          />
        ) : (
          <input
            type="text"
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        )
      ) : (
        <p className="text-sm text-slate-800 bg-slate-50 rounded-xl px-4 py-2.5 leading-relaxed">{value}</p>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-slate-800">理想のキャリア</h2>
        {editing ? (
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 rounded-xl px-4 py-2 hover:bg-blue-700 transition-colors"
          >
            <Check size={14} />
            保存する
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-xl px-4 py-2 hover:bg-blue-50 transition-colors"
          >
            <Edit3 size={14} />
            編集する
          </button>
        )}
      </div>

      <Field label="理想の働き方" value={form.idealWorkStyle} field="idealWorkStyle" multiline />
      <Field label="年収目標" value={form.targetSalary} field="targetSalary" />
      <Field label="大事にしたい価値観（カンマ区切り）" value={form.valuesText} field="valuesText" />
      <Field label="将来ビジョン" value={form.vision} field="vision" multiline />
    </div>
  );
}
