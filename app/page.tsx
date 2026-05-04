'use client';

import { useState } from 'react';
import { AppProvider } from '@/context/AppContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Chat } from '@/components/chat/Chat';
import { Analysis } from '@/components/analysis/Analysis';
import { Career } from '@/components/career/Career';
import { CompaniesPage } from '@/components/companies/CompaniesPage';
import { InterviewPage } from '@/components/interview/InterviewPage';
import type { TabId } from '@/components/layout/types';
import { ProfileModal } from '@/components/profile/ProfileModal';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  return (
    <div className="flex h-full bg-slate-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {activeTab === 'dashboard' && <Dashboard onTabChange={setActiveTab} />}
        {activeTab === 'chat' && <Chat />}
        {activeTab === 'analysis' && <Analysis onTabChange={setActiveTab} />}
        {activeTab === 'career' && <Career />}
        {activeTab === 'companies' && <CompaniesPage onTabChange={setActiveTab} />}
        {activeTab === 'interview' && <InterviewPage onTabChange={setActiveTab} />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <ProfileModal />
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
