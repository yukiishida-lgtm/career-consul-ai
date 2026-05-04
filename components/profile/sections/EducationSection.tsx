'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { ExtendedProfile, Education, EducationType, GraduationType } from '@/types';
import { generateId } from '@/lib/utils';
import { Label, Input, Select, Field, SectionTitle } from '../ui';
import { cn } from '@/lib/utils';

interface Props {
  extended: ExtendedProfile;
  onExtendedChange: (e: ExtendedProfile) => void;
}

const EDU_TYPES: EducationType[] = ['高校', '専門学校', '大学', '大学院'];
const GRAD_TYPES: GraduationType[] = ['卒業', '卒業見込み', '中退'];

const PERIOD_OPTIONS = (() => {
  const opts: string[] = [];
  for (let y = new Date().getFullYear(); y >= 1980; y--) {
    for (let m = 12; m >= 1; m--) {
      opts.push(`${y}-${String(m).padStart(2, '0')}`);
    }
  }
  return opts;
})();

function EduCard({
  edu,
  onUpdate,
  onDelete,
}: {
  edu: Education;
  onUpdate: (e: Education) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(true);
  const set = <K extends keyof Education>(k: K, v: Education[K]) => onUpdate({ ...edu, [k]: v });

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden mb-3">
      <div
        className="flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-medium text-slate-700">
          {edu.type} — {edu.schoolName || '（学校名未入力）'}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
          {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>

      {open && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field className="mb-0">
              <Label required>区分</Label>
              <Select value={edu.type} onChange={(e) => set('type', e.target.value as EducationType)}>
                {EDU_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field className="mb-0">
              <Label required>学校名</Label>
              <Input value={edu.schoolName} onChange={(e) => set('schoolName', e.target.value)} placeholder="〇〇大学" />
            </Field>
          </div>

          <Field className="mb-0">
            <Label>{edu.type === '高校' ? '学部・学科（任意）' : '学部・学科'}</Label>
            <Input value={edu.department ?? ''} onChange={(e) => set('department', e.target.value)} placeholder="経済学部 経済学科" />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field className="mb-0">
              <Label required>入学年月</Label>
              <Select value={edu.startDate} onChange={(e) => set('startDate', e.target.value)}>
                <option value="">選択</option>
                {PERIOD_OPTIONS.map((o) => <option key={o} value={o}>{o.replace('-', '年')}月</option>)}
              </Select>
            </Field>
            <Field className="mb-0">
              <Label>卒業年月</Label>
              <Select value={edu.endDate ?? ''} onChange={(e) => set('endDate', e.target.value || undefined)}>
                <option value="">選択</option>
                {PERIOD_OPTIONS.map((o) => <option key={o} value={o}>{o.replace('-', '年')}月</option>)}
              </Select>
            </Field>
            <Field className="mb-0">
              <Label required>卒業区分</Label>
              <Select value={edu.graduationType} onChange={(e) => set('graduationType', e.target.value as GraduationType)}>
                {GRAD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}

export function EducationSection({ extended, onExtendedChange }: Props) {
  const addEducation = () => {
    const newEdu: Education = {
      id: generateId(),
      type: '大学',
      schoolName: '',
      startDate: '',
      graduationType: '卒業',
    };
    onExtendedChange({ ...extended, education: [...extended.education, newEdu] });
  };

  const updateEdu = (id: string, updated: Education) => {
    onExtendedChange({
      ...extended,
      education: extended.education.map((e) => (e.id === id ? updated : e)),
    });
  };

  const deleteEdu = (id: string) => {
    onExtendedChange({ ...extended, education: extended.education.filter((e) => e.id !== id) });
  };

  return (
    <div>
      <SectionTitle>学歴（高校から・複数登録可）</SectionTitle>

      {extended.education.length === 0 && (
        <p className="text-sm text-slate-400 mb-4">学歴がまだ登録されていません。</p>
      )}

      {extended.education.map((edu) => (
        <EduCard
          key={edu.id}
          edu={edu}
          onUpdate={(u) => updateEdu(edu.id, u)}
          onDelete={() => deleteEdu(edu.id)}
        />
      ))}

      <button
        type="button"
        onClick={addEducation}
        className={cn(
          'w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-2xl py-3 text-sm text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-colors'
        )}
      >
        <Plus size={16} />
        学歴を追加する
      </button>
    </div>
  );
}
