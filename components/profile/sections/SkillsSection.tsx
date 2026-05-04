'use client';

import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import type { ExtendedProfile, EnglishLevel } from '@/types';
import { Label, Input, Select, RadioGroup, Field, SectionTitle } from '../ui';

interface Props {
  extended: ExtendedProfile;
  onExtendedChange: (e: ExtendedProfile) => void;
}

const ENGLISH_LEVELS: EnglishLevel[] = ['ネイティブ', 'ビジネスレベル', '日常会話レベル', '基礎レベル', 'なし'];

function TagInput({
  label,
  tags,
  onChange,
  placeholder,
  optional,
}: {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  optional?: boolean;
}) {
  const [input, setInput] = useState('');

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <Field>
      <Label>
        {label}
        {optional && <span className="text-slate-400 ml-1 text-xs font-normal">（任意）</span>}
      </Label>
      <div className="min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex flex-wrap gap-1.5 focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-blue-300">
        {tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full">
            {tag}
            <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))}>
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(input)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>
      <p className="text-xs text-slate-400 mt-1">Enterまたはカンマで追加</p>
    </Field>
  );
}

export function SkillsSection({ extended, onExtendedChange }: Props) {
  const set = <K extends keyof ExtendedProfile>(key: K, value: ExtendedProfile[K]) =>
    onExtendedChange({ ...extended, [key]: value });

  return (
    <div>
      <SectionTitle>スキル（任意）</SectionTitle>

      <TagInput
        label="保有スキル"
        tags={extended.skills}
        onChange={(v) => set('skills', v)}
        placeholder="Python、Excel、プロジェクト管理..."
        optional
      />

      <TagInput
        label="資格"
        tags={extended.certifications}
        onChange={(v) => set('certifications', v)}
        placeholder="基本情報技術者、TOEIC..."
        optional
      />

      <RadioGroup<EnglishLevel>
        label="語学力（英語レベル）"
        options={ENGLISH_LEVELS}
        value={extended.englishLevel}
        onChange={(v) => set('englishLevel', v)}
        optional
      />
    </div>
  );
}
