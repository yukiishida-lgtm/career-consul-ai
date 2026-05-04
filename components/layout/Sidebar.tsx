'use client';

import { Home, MessageCircle, User, Compass, ChevronRight, Building2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TabId } from '@/components/layout/types';
import { useApp } from '@/context/AppContext';

const NAV_ITEMS = [
  { id: 'dashboard' as TabId,  label: 'ダッシュボード', icon: Home },
  { id: 'chat' as TabId,       label: '相談チャット',   icon: MessageCircle },
  { id: 'analysis' as TabId,   label: '自己分析',       icon: User },
  { id: 'career' as TabId,     label: 'キャリア設計',   icon: Compass },
  { id: 'companies' as TabId,  label: '企業情報',       icon: Building2 },
  { id: 'interview' as TabId,  label: '選考対策',       icon: FileText },
];

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function Sidebar({ activeTab, onTabChange }: Props) {
  const { profile, extendedProfile, setProfileModalOpen } = useApp();

  // Show completion hint if profile is sparse
  const isProfileIncomplete = !extendedProfile.birthDate || !extendedProfile.nameKana;

  return (
    <aside className="hidden md:flex flex-col w-56 bg-white border-r border-slate-100 h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
        <div className="leading-tight">
          <p className="text-xs text-slate-500">あなたの</p>
          <p className="text-sm font-bold text-slate-800">キャリアコンサルAI</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
              activeTab === id
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      {/* User card — clickable to open profile modal */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={() => setProfileModalOpen(true)}
          className="w-full flex items-center gap-3 mb-4 group rounded-xl p-2 -m-2 hover:bg-slate-50 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors relative">
            <span className="text-blue-700 font-bold text-sm">
              {profile.name.charAt(0)}
            </span>
            {isProfileIncomplete && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full border-2 border-white" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 truncate">{profile.name}さん</p>
            <p className="text-xs text-slate-500 truncate">{profile.currentJob}</p>
          </div>
          <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 flex-shrink-0 transition-colors" />
        </button>

        {isProfileIncomplete && (
          <button
            onClick={() => setProfileModalOpen(true)}
            className="w-full bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-left hover:bg-amber-100 transition-colors"
          >
            <p className="text-xs text-amber-700 font-medium">📝 プロフィールを登録する</p>
            <p className="text-xs text-amber-600 mt-0.5">入力するとAI分析の精度が上がります</p>
          </button>
        )}

        {!isProfileIncomplete && (
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-xs text-blue-700 font-medium leading-relaxed">
              キャリアは選択の連続。<br />あなたの可能性は無限大です。
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
