'use client';

import { useState, useEffect } from 'react';
import { X, Check, User, Heart, GraduationCap, Briefcase, Wrench, Brain } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import type { ExtendedProfile, UserProfile } from '@/types';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { LifestyleSection } from './sections/LifestyleSection';
import { EducationSection } from './sections/EducationSection';
import { WorkHistorySection } from './sections/WorkHistorySection';
import { SkillsSection } from './sections/SkillsSection';
import { PersonalitySection } from './sections/PersonalitySection';

const SECTIONS = [
  { id: 'basic',       label: '基本情報',         icon: User },
  { id: 'lifestyle',   label: '家族・ライフ',      icon: Heart },
  { id: 'education',   label: '学歴',             icon: GraduationCap },
  { id: 'work',        label: '職務経歴',          icon: Briefcase },
  { id: 'skills',      label: 'スキル',            icon: Wrench },
  { id: 'personality', label: '性格・特性',        icon: Brain },
] as const;

type SectionId = typeof SECTIONS[number]['id'];

export function ProfileModal() {
  const { profileModalOpen, setProfileModalOpen, profile, setProfile, extendedProfile, setExtendedProfile } = useApp();
  const [activeSection, setActiveSection] = useState<SectionId>('basic');

  // Draft state — only committed on Save
  const [draftProfile, setDraftProfile] = useState<UserProfile>(profile);
  const [draftExtended, setDraftExtended] = useState<ExtendedProfile>(extendedProfile);

  useEffect(() => {
    if (profileModalOpen) {
      setDraftProfile(profile);
      setDraftExtended(extendedProfile);
      setActiveSection('basic');
    }
  }, [profileModalOpen, profile, extendedProfile]);

  // Prevent body scroll while open
  useEffect(() => {
    if (profileModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [profileModalOpen]);

  const handleSave = () => {
    setProfile(draftProfile);
    setExtendedProfile(draftExtended);
    setProfileModalOpen(false);
  };

  if (!profileModalOpen) return null;

  const completionPct = calcCompletion(draftProfile, draftExtended);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setProfileModalOpen(false)}
      />

      {/* Drawer */}
      <div className="relative ml-auto w-full max-w-3xl bg-white h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800">プロフィール登録</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 w-40 bg-slate-100 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <span className="text-xs text-slate-500">{completionPct}% 完了</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Check size={15} />
              保存する
            </button>
            <button
              onClick={() => setProfileModalOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Section nav */}
          <nav className="w-40 border-r border-slate-100 py-4 flex-shrink-0 overflow-y-auto">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-4 py-3 text-sm transition-colors text-left',
                  activeSection === id
                    ? 'bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <Icon size={16} className="flex-shrink-0" />
                {label}
              </button>
            ))}
          </nav>

          {/* Section content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {activeSection === 'basic' && (
              <BasicInfoSection
                profile={draftProfile}
                extended={draftExtended}
                onProfileChange={setDraftProfile}
                onExtendedChange={setDraftExtended}
              />
            )}
            {activeSection === 'lifestyle' && (
              <LifestyleSection
                extended={draftExtended}
                onExtendedChange={setDraftExtended}
              />
            )}
            {activeSection === 'education' && (
              <EducationSection
                extended={draftExtended}
                onExtendedChange={setDraftExtended}
              />
            )}
            {activeSection === 'work' && (
              <WorkHistorySection
                extended={draftExtended}
                onExtendedChange={setDraftExtended}
              />
            )}
            {activeSection === 'skills' && (
              <SkillsSection
                extended={draftExtended}
                onExtendedChange={setDraftExtended}
              />
            )}
            {activeSection === 'personality' && (
              <PersonalitySection
                extended={draftExtended}
                onExtendedChange={setDraftExtended}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={() => setProfileModalOpen(false)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Check size={15} />
            保存する
          </button>
        </div>
      </div>
    </div>
  );
}

function calcCompletion(p: UserProfile, e: ExtendedProfile): number {
  const checks = [
    !!p.name,
    !!e.nameKana,
    !!e.birthDate,
    !!e.prefecture,
    e.education.length > 0,
    e.companies.length > 0,
    e.skills.length > 0,
    !!e.mbti,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}
