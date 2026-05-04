'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { ExtendedProfile, Company, WorkPeriod, EmploymentType } from '@/types';
import { generateId } from '@/lib/utils';
import { Label, Input, Select, Textarea, Field, SectionTitle } from '../ui';
import { cn } from '@/lib/utils';

interface Props {
  extended: ExtendedProfile;
  onExtendedChange: (e: ExtendedProfile) => void;
}

const EMP_TYPES: EmploymentType[] = ['正社員', '契約社員', '派遣', 'フリーランス'];
const INDUSTRIES = [
  'IT・ソフトウェア', 'コンサルティング', '金融・保険', 'メーカー', '商社',
  'サービス・小売', '医療・福祉', '教育', '不動産・建設', 'エンタメ・メディア',
  '官公庁・非営利', 'その他',
];
const DOMAINS = ['営業', '企画', 'マーケ', 'エンジニア', '管理', 'デザイン', '研究開発', '人事', '経理・財務', '法務', 'CS', 'その他'];

const PERIOD_OPTIONS = (() => {
  const opts: string[] = [];
  for (let y = new Date().getFullYear(); y >= 1980; y--) {
    for (let m = 12; m >= 1; m--) {
      opts.push(`${y}-${String(m).padStart(2, '0')}`);
    }
  }
  return opts;
})();

function PeriodCard({
  period,
  onUpdate,
  onDelete,
}: {
  period: WorkPeriod;
  onUpdate: (p: WorkPeriod) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(true);
  const set = <K extends keyof WorkPeriod>(k: K, v: WorkPeriod[K]) => onUpdate({ ...period, [k]: v });

  const toggleDomain = (domain: string) => {
    const domains = period.domains.includes(domain)
      ? period.domains.filter((d) => d !== domain)
      : [...period.domains, domain];
    set('domains', domains);
  };

  return (
    <div className="border border-slate-100 rounded-xl mb-2 overflow-hidden">
      <div
        className="flex items-center justify-between px-3 py-2.5 bg-slate-50 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span className="text-xs font-medium text-slate-600">
          {period.jobType || '（職種未入力）'} {period.position ? `/ ${period.position}` : ''}
        </span>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-slate-300 hover:text-red-400 transition-colors">
            <Trash2 size={13} />
          </button>
          {open ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
        </div>
      </div>

      {open && (
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Field className="mb-0">
              <Label required>開始年月</Label>
              <Select value={period.startDate} onChange={(e) => set('startDate', e.target.value)}>
                <option value="">選択</option>
                {PERIOD_OPTIONS.map((o) => <option key={o} value={o}>{o.replace('-', '年')}月</option>)}
              </Select>
            </Field>
            <Field className="mb-0">
              <Label>終了年月</Label>
              <Select
                value={period.isCurrent ? 'current' : (period.endDate ?? '')}
                onChange={(e) => {
                  if (e.target.value === 'current') {
                    set('isCurrent', true);
                    set('endDate', undefined);
                  } else {
                    set('isCurrent', false);
                    set('endDate', e.target.value || undefined);
                  }
                }}
              >
                <option value="">選択</option>
                <option value="current">在籍中</option>
                {PERIOD_OPTIONS.map((o) => <option key={o} value={o}>{o.replace('-', '年')}月</option>)}
              </Select>
            </Field>
            <Field className="mb-0">
              <Label required>職種</Label>
              <Input value={period.jobType} onChange={(e) => set('jobType', e.target.value)} placeholder="営業、エンジニア..." />
            </Field>
          </div>

          <Field className="mb-0">
            <Label>役職（任意）</Label>
            <Input value={period.position ?? ''} onChange={(e) => set('position', e.target.value || undefined)} placeholder="マネージャー、リーダー..." />
          </Field>

          <Field className="mb-0">
            <Label>業務内容</Label>
            <Textarea
              value={period.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              placeholder="担当した業務・プロジェクトの内容を記載してください"
            />
          </Field>

          <Field className="mb-0">
            <Label>担当領域（複数選択可）</Label>
            <div className="flex flex-wrap gap-1.5">
              {DOMAINS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDomain(d)}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs border transition-colors',
                    period.domains.includes(d)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </Field>

          <Field className="mb-0">
            <Label>チーム人数（任意）</Label>
            <Input
              type="number"
              value={period.teamSize ?? ''}
              onChange={(e) => set('teamSize', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="5"
              className="w-32"
            />
          </Field>
        </div>
      )}
    </div>
  );
}

function CompanyCard({
  company,
  onUpdate,
  onDelete,
}: {
  company: Company;
  onUpdate: (c: Company) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(true);
  const set = <K extends keyof Company>(k: K, v: Company[K]) => onUpdate({ ...company, [k]: v });

  const addPeriod = () => {
    const p: WorkPeriod = {
      id: generateId(),
      startDate: '',
      isCurrent: false,
      jobType: '',
      description: '',
      domains: [],
    };
    set('periods', [...company.periods, p]);
  };

  const updatePeriod = (id: string, updated: WorkPeriod) =>
    set('periods', company.periods.map((p) => (p.id === id ? updated : p)));

  const deletePeriod = (id: string) =>
    set('periods', company.periods.filter((p) => p.id !== id));

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden mb-4">
      <div
        className="flex items-center justify-between px-4 py-3 bg-slate-50 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-semibold text-slate-700">
          {company.name || '（会社名未入力）'}
          {company.isCurrent && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">在籍中</span>}
        </span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-slate-400 hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
          {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>

      {open && (
        <div className="p-4">
          {/* Company info */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Field className="mb-0">
              <Label required>会社名</Label>
              <Input value={company.name} onChange={(e) => set('name', e.target.value)} placeholder="株式会社〇〇" />
            </Field>
            <Field className="mb-0">
              <Label>業界</Label>
              <Select value={company.industry} onChange={(e) => set('industry', e.target.value)}>
                <option value="">選択してください</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <Field className="mb-0">
              <Label>雇用形態</Label>
              <Select value={company.employmentType} onChange={(e) => set('employmentType', e.target.value as EmploymentType)}>
                {EMP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field className="mb-0">
              <Label>入社年月</Label>
              <Select value={company.startDate} onChange={(e) => set('startDate', e.target.value)}>
                <option value="">選択</option>
                {PERIOD_OPTIONS.map((o) => <option key={o} value={o}>{o.replace('-', '年')}月</option>)}
              </Select>
            </Field>
            <Field className="mb-0">
              <Label>退社年月</Label>
              <Select
                value={company.isCurrent ? 'current' : (company.endDate ?? '')}
                onChange={(e) => {
                  if (e.target.value === 'current') {
                    set('isCurrent', true);
                    set('endDate', undefined);
                  } else {
                    set('isCurrent', false);
                    set('endDate', e.target.value || undefined);
                  }
                }}
              >
                <option value="">選択</option>
                <option value="current">在籍中</option>
                {PERIOD_OPTIONS.map((o) => <option key={o} value={o}>{o.replace('-', '年')}月</option>)}
              </Select>
            </Field>
          </div>

          {/* Work periods */}
          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-600">在籍履歴（役職・担当変化がある場合は複数追加）</p>
              <button
                type="button"
                onClick={addPeriod}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
              >
                <Plus size={12} /> 追加
              </button>
            </div>

            {company.periods.length === 0 && (
              <p className="text-xs text-slate-400 mb-2">まだ在籍履歴がありません。「追加」から入力してください。</p>
            )}

            {company.periods.map((p) => (
              <PeriodCard
                key={p.id}
                period={p}
                onUpdate={(u) => updatePeriod(p.id, u)}
                onDelete={() => deletePeriod(p.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function WorkHistorySection({ extended, onExtendedChange }: Props) {
  const addCompany = () => {
    const c: Company = {
      id: generateId(),
      name: '',
      industry: '',
      employmentType: '正社員',
      startDate: '',
      isCurrent: false,
      periods: [],
    };
    onExtendedChange({ ...extended, companies: [...extended.companies, c] });
  };

  const updateCompany = (id: string, updated: Company) =>
    onExtendedChange({
      ...extended,
      companies: extended.companies.map((c) => (c.id === id ? updated : c)),
    });

  const deleteCompany = (id: string) =>
    onExtendedChange({ ...extended, companies: extended.companies.filter((c) => c.id !== id) });

  return (
    <div>
      <SectionTitle>職務経歴（複数社対応）</SectionTitle>

      {extended.companies.length === 0 && (
        <p className="text-sm text-slate-400 mb-4">職務経歴がまだ登録されていません。</p>
      )}

      {extended.companies.map((c) => (
        <CompanyCard
          key={c.id}
          company={c}
          onUpdate={(u) => updateCompany(c.id, u)}
          onDelete={() => deleteCompany(c.id)}
        />
      ))}

      <button
        type="button"
        onClick={addCompany}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-2xl py-3 text-sm text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
      >
        <Plus size={16} />
        会社を追加する
      </button>
    </div>
  );
}
