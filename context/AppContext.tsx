'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { UserProfile, LifeEvent, ChatMessage, ChatSession, CareerPlan, ExtendedProfile, TargetCompany, ApplicationDocument, Episode, ActiveEpisodeForDeepDive, MatchCriterionKey, InterviewPracticeMode } from '@/types';
import { defaultExtendedProfile } from '@/types';
import { storage } from '@/lib/storage';
import { defaultProfile, defaultLifeEvents, defaultCareerPlan, defaultEpisodes } from '@/lib/mockData';
import { mockCompanies } from '@/lib/mockCompanies';

const DEFAULT_SESSION_ID = 'session-default';
function makeDefaultSession(): ChatSession {
  return { id: DEFAULT_SESSION_ID, name: '最初の相談', createdAt: new Date().toISOString(), messages: [] };
}

interface AppContextValue {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  extendedProfile: ExtendedProfile;
  setExtendedProfile: (p: ExtendedProfile) => void;
  lifeEvents: LifeEvent[];
  setLifeEvents: (e: LifeEvent[]) => void;
  chatMessages: ChatMessage[];
  setChatMessages: (m: ChatMessage[]) => void;
  chatSessions: ChatSession[];
  setChatSessions: (s: ChatSession[]) => void;
  activeChatSessionId: string;
  setActiveChatSessionId: (id: string) => void;
  careerPlan: CareerPlan;
  setCareerPlan: (p: CareerPlan) => void;
  profileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;
  selectedCompany: TargetCompany;
  setSelectedCompany: (c: TargetCompany) => void;
  applicationDocuments: Record<string, ApplicationDocument>;
  setApplicationDocuments: (docs: Record<string, ApplicationDocument>) => void;
  episodes: Episode[];
  setEpisodes: (e: Episode[]) => void;
  activeEpisodeForDeepDive: ActiveEpisodeForDeepDive | null;
  setActiveEpisodeForDeepDive: (ep: ActiveEpisodeForDeepDive | null) => void;
  favoriteCompanyIds: string[];
  setFavoriteCompanyIds: (ids: string[]) => void;
  selectedMatchCriteria: MatchCriterionKey[];
  setSelectedMatchCriteria: (c: MatchCriterionKey[]) => void;
  interviewPracticeMode: InterviewPracticeMode | null;
  setInterviewPracticeMode: (m: InterviewPracticeMode | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>(defaultProfile);
  const [extendedProfile, setExtendedProfileState] = useState<ExtendedProfile>(defaultExtendedProfile);
  const [lifeEvents, setLifeEventsState] = useState<LifeEvent[]>(defaultLifeEvents);
  const [chatMessages, setChatMessagesState] = useState<ChatMessage[]>([]);
  const [chatSessions, setChatSessionsState] = useState<ChatSession[]>([makeDefaultSession()]);
  const [activeChatSessionId, setActiveChatSessionIdState] = useState<string>(DEFAULT_SESSION_ID);
  const [careerPlan, setCareerPlanState] = useState<CareerPlan>(defaultCareerPlan);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompanyState] = useState<TargetCompany>(mockCompanies[0]);
  const [applicationDocuments, setApplicationDocumentsState] = useState<Record<string, ApplicationDocument>>({});
  const [episodes, setEpisodesState] = useState<Episode[]>(defaultEpisodes);
  const [activeEpisodeForDeepDive, setActiveEpisodeForDeepDiveState] = useState<ActiveEpisodeForDeepDive | null>(null);
  const [favoriteCompanyIds, setFavoriteCompanyIdsState] = useState<string[]>([]);
  const [selectedMatchCriteria, setSelectedMatchCriteriaState] = useState<MatchCriterionKey[]>(['skill', 'values', 'career']);
  const [interviewPracticeMode, setInterviewPracticeModeState] = useState<InterviewPracticeMode | null>(null);

  useEffect(() => {
    const savedProfile = storage.getProfile();
    if (savedProfile) setProfileState(savedProfile);

    const savedExtended = storage.getExtendedProfile();
    if (savedExtended) setExtendedProfileState(savedExtended);

    const savedEvents = storage.getLifeEvents();
    if (savedEvents.length > 0) setLifeEventsState(savedEvents);

    const savedMessages = storage.getChatMessages();
    if (savedMessages.length > 0) setChatMessagesState(savedMessages);

    const savedPlan = storage.getCareerPlan();
    if (savedPlan) setCareerPlanState(savedPlan);

    const savedCompanyId = storage.getSelectedCompanyId();
    if (savedCompanyId) {
      const found = mockCompanies.find((c) => c.id === savedCompanyId);
      if (found) setSelectedCompanyState(found);
    }

    const savedDocs = storage.getApplicationDocuments();
    if (Object.keys(savedDocs).length > 0) setApplicationDocumentsState(savedDocs);

    const savedSessions = storage.getChatSessions();
    if (savedSessions.length > 0) {
      setChatSessionsState(savedSessions);
      setActiveChatSessionIdState(savedSessions[savedSessions.length - 1].id);
    }

    const savedEpisodes = storage.getEpisodes();
    if (savedEpisodes.length > 0) setEpisodesState(savedEpisodes);

    const savedActiveEp = storage.getActiveEpisode();
    if (savedActiveEp) setActiveEpisodeForDeepDiveState(savedActiveEp);

    const savedFavorites = storage.getFavoriteCompanies();
    if (savedFavorites.length > 0) setFavoriteCompanyIdsState(savedFavorites);

    const savedCriteria = storage.getSelectedMatchCriteria();
    if (savedCriteria.length > 0) setSelectedMatchCriteriaState(savedCriteria);

    const savedPracticeMode = storage.getInterviewPracticeMode();
    if (savedPracticeMode) setInterviewPracticeModeState(savedPracticeMode);
  }, []);

  const setProfile = useCallback((p: UserProfile) => {
    setProfileState(p);
    storage.setProfile(p);
  }, []);

  const setExtendedProfile = useCallback((p: ExtendedProfile) => {
    setExtendedProfileState(p);
    storage.setExtendedProfile(p);
  }, []);

  const setLifeEvents = useCallback((e: LifeEvent[]) => {
    setLifeEventsState(e);
    storage.setLifeEvents(e);
  }, []);

  const setChatMessages = useCallback((m: ChatMessage[]) => {
    setChatMessagesState(m);
    storage.setChatMessages(m);
  }, []);

  const setCareerPlan = useCallback((p: CareerPlan) => {
    setCareerPlanState(p);
    storage.setCareerPlan(p);
  }, []);

  const setSelectedCompany = useCallback((c: TargetCompany) => {
    setSelectedCompanyState(c);
    storage.setSelectedCompanyId(c.id);
  }, []);

  const setApplicationDocuments = useCallback((docs: Record<string, ApplicationDocument>) => {
    setApplicationDocumentsState(docs);
    storage.setApplicationDocuments(docs);
  }, []);

  const setChatSessions = useCallback((s: ChatSession[]) => {
    setChatSessionsState(s);
    storage.setChatSessions(s);
  }, []);

  const setActiveChatSessionId = useCallback((id: string) => {
    setActiveChatSessionIdState(id);
  }, []);

  const setEpisodes = useCallback((e: Episode[]) => {
    setEpisodesState(e);
    storage.setEpisodes(e);
  }, []);

  const setActiveEpisodeForDeepDive = useCallback((ep: ActiveEpisodeForDeepDive | null) => {
    setActiveEpisodeForDeepDiveState(ep);
    storage.setActiveEpisode(ep);
  }, []);

  const setFavoriteCompanyIds = useCallback((ids: string[]) => {
    setFavoriteCompanyIdsState(ids);
    storage.setFavoriteCompanies(ids);
  }, []);

  const setSelectedMatchCriteria = useCallback((c: MatchCriterionKey[]) => {
    setSelectedMatchCriteriaState(c);
    storage.setSelectedMatchCriteria(c);
  }, []);

  const setInterviewPracticeMode = useCallback((m: InterviewPracticeMode | null) => {
    setInterviewPracticeModeState(m);
    storage.setInterviewPracticeMode(m);
  }, []);

  return (
    <AppContext.Provider value={{
      profile, setProfile,
      extendedProfile, setExtendedProfile,
      lifeEvents, setLifeEvents,
      chatMessages, setChatMessages,
      chatSessions, setChatSessions,
      activeChatSessionId, setActiveChatSessionId,
      careerPlan, setCareerPlan,
      profileModalOpen, setProfileModalOpen,
      selectedCompany, setSelectedCompany,
      applicationDocuments, setApplicationDocuments,
      episodes, setEpisodes,
      activeEpisodeForDeepDive, setActiveEpisodeForDeepDive,
      favoriteCompanyIds, setFavoriteCompanyIds,
      selectedMatchCriteria, setSelectedMatchCriteria,
      interviewPracticeMode, setInterviewPracticeMode,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
