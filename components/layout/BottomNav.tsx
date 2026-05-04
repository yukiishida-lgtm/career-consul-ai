'use client';

import { Home, MessageCircle, User, Compass, Building2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TabId } from './types';

const NAV_ITEMS = [
  { id: 'dashboard' as TabId,  label: 'ホーム',    icon: Home },
  { id: 'chat' as TabId,       label: '相談',      icon: MessageCircle },
  { id: 'analysis' as TabId,   label: '自己分析',  icon: User },
  { id: 'companies' as TabId,  label: '企業情報',  icon: Building2 },
  { id: 'interview' as TabId,  label: '選考対策',  icon: FileText },
];

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function BottomNav({ activeTab, onTabChange }: Props) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex z-50">
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={cn(
            'flex-1 flex flex-col items-center py-2 gap-1 text-xs transition-colors',
            activeTab === id ? 'text-blue-600' : 'text-slate-400'
          )}
        >
          <Icon size={20} />
          <span className="leading-tight text-center" style={{ fontSize: '10px' }}>{label}</span>
        </button>
      ))}
    </nav>
  );
}
