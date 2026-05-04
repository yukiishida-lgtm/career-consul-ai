import type { UserProfile, LifeEvent, ChatMessage, ChatSession, CareerPlan, ExtendedProfile, ApplicationDocument, Episode, ActiveEpisodeForDeepDive, MatchCriterionKey, CompanyViewHistoryItem, SelectedCompanyInfo, SelectedJobInfo, InterviewDocument, CommonInterviewPrep, CompanyInterviewPrep, InterviewPracticeMode, LifePlan, LifeTask, LifeVision, VisionDreamItem, YearlyVisionData } from '@/types';

const KEYS = {
  profile: 'career_profile',
  extendedProfile: 'career_extended_profile',
  lifeEvents: 'career_life_events',
  chatMessages: 'career_chat_messages',
  careerPlan: 'career_plan',
  selectedCompanyId: 'career_selected_company_id',
  applicationDocuments: 'career_application_documents',
  chatSessions: 'career_chat_sessions',
  episodes: 'career_episodes',
  activeEpisode: 'career_active_episode',
  favoriteCompanies: 'career_favorite_companies',
  companyViewHistory: 'career_company_view_history',
  selectedMatchCriteria: 'career_selected_match_criteria',
  selectedCompanyInfo: 'career_selected_company_info',
  selectedJobInfo: 'career_selected_job',
  interviewDocuments: 'career_interview_documents',
  commonInterviewPrep: 'career_common_interview_prep',
  companyInterviewPrep: 'career_company_interview_prep',
  interviewPracticeMode: 'career_interview_practice_mode',
  lifePlan: 'career_life_plan',
  lifeTasks: 'career_life_tasks',
  lifeVision: 'career_life_vision',
  visionDreams: 'career_vision_dreams',
  visionYears: 'career_vision_years',
} as const;

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

export const storage = {
  getProfile: (): UserProfile | null => safeGet<UserProfile | null>(KEYS.profile, null),
  setProfile: (p: UserProfile) => safeSet(KEYS.profile, p),

  getExtendedProfile: (): ExtendedProfile | null => safeGet<ExtendedProfile | null>(KEYS.extendedProfile, null),
  setExtendedProfile: (p: ExtendedProfile) => safeSet(KEYS.extendedProfile, p),

  getLifeEvents: (): LifeEvent[] => safeGet<LifeEvent[]>(KEYS.lifeEvents, []),
  setLifeEvents: (events: LifeEvent[]) => safeSet(KEYS.lifeEvents, events),

  getChatMessages: (): ChatMessage[] => safeGet<ChatMessage[]>(KEYS.chatMessages, []),
  setChatMessages: (msgs: ChatMessage[]) => safeSet(KEYS.chatMessages, msgs),

  getChatSessions: (): ChatSession[] => safeGet<ChatSession[]>(KEYS.chatSessions, []),
  setChatSessions: (sessions: ChatSession[]) => safeSet(KEYS.chatSessions, sessions),

  getCareerPlan: (): CareerPlan | null => safeGet<CareerPlan | null>(KEYS.careerPlan, null),
  setCareerPlan: (plan: CareerPlan) => safeSet(KEYS.careerPlan, plan),

  getSelectedCompanyId: (): string | null => safeGet<string | null>(KEYS.selectedCompanyId, null),
  setSelectedCompanyId: (id: string | null) => safeSet(KEYS.selectedCompanyId, id),

  getApplicationDocuments: (): Record<string, ApplicationDocument> =>
    safeGet<Record<string, ApplicationDocument>>(KEYS.applicationDocuments, {}),
  setApplicationDocuments: (docs: Record<string, ApplicationDocument>) =>
    safeSet(KEYS.applicationDocuments, docs),

  getEpisodes: (): Episode[] => safeGet<Episode[]>(KEYS.episodes, []),
  setEpisodes: (eps: Episode[]) => safeSet(KEYS.episodes, eps),

  getActiveEpisode: (): ActiveEpisodeForDeepDive | null => safeGet<ActiveEpisodeForDeepDive | null>(KEYS.activeEpisode, null),
  setActiveEpisode: (ep: ActiveEpisodeForDeepDive | null) => safeSet(KEYS.activeEpisode, ep),

  getFavoriteCompanies: (): string[] => safeGet<string[]>(KEYS.favoriteCompanies, []),
  setFavoriteCompanies: (ids: string[]) => safeSet(KEYS.favoriteCompanies, ids),

  getCompanyViewHistory: (): CompanyViewHistoryItem[] => safeGet<CompanyViewHistoryItem[]>(KEYS.companyViewHistory, []),
  setCompanyViewHistory: (h: CompanyViewHistoryItem[]) => safeSet(KEYS.companyViewHistory, h),

  getSelectedMatchCriteria: (): MatchCriterionKey[] => safeGet<MatchCriterionKey[]>(KEYS.selectedMatchCriteria, []),
  setSelectedMatchCriteria: (c: MatchCriterionKey[]) => safeSet(KEYS.selectedMatchCriteria, c),

  getSelectedCompanyInfo: (): SelectedCompanyInfo | null => safeGet<SelectedCompanyInfo | null>(KEYS.selectedCompanyInfo, null),
  setSelectedCompanyInfo: (c: SelectedCompanyInfo | null) => safeSet(KEYS.selectedCompanyInfo, c),

  getSelectedJobInfo: (): SelectedJobInfo | null => safeGet<SelectedJobInfo | null>(KEYS.selectedJobInfo, null),
  setSelectedJobInfo: (j: SelectedJobInfo | null) => safeSet(KEYS.selectedJobInfo, j),

  getInterviewDocuments: (): Record<string, InterviewDocument> => safeGet(KEYS.interviewDocuments, {}),
  setInterviewDocuments: (d: Record<string, InterviewDocument>) => safeSet(KEYS.interviewDocuments, d),

  getCommonInterviewPrep: (): CommonInterviewPrep | null => safeGet<CommonInterviewPrep | null>(KEYS.commonInterviewPrep, null),
  setCommonInterviewPrep: (p: CommonInterviewPrep) => safeSet(KEYS.commonInterviewPrep, p),

  getCompanyInterviewPrep: (): Record<string, CompanyInterviewPrep> => safeGet(KEYS.companyInterviewPrep, {}),
  setCompanyInterviewPrep: (p: Record<string, CompanyInterviewPrep>) => safeSet(KEYS.companyInterviewPrep, p),

  getInterviewPracticeMode: (): InterviewPracticeMode | null => safeGet<InterviewPracticeMode | null>(KEYS.interviewPracticeMode, null),
  setInterviewPracticeMode: (m: InterviewPracticeMode | null) => safeSet(KEYS.interviewPracticeMode, m),

  getLifePlan: (): LifePlan | null => safeGet<LifePlan | null>(KEYS.lifePlan, null),
  setLifePlan: (p: LifePlan) => safeSet(KEYS.lifePlan, p),

  getLifeTasks: (): LifeTask[] => safeGet<LifeTask[]>(KEYS.lifeTasks, []),
  setLifeTasks: (tasks: LifeTask[]) => safeSet(KEYS.lifeTasks, tasks),

  getLifeVision: (): LifeVision | null => safeGet<LifeVision | null>(KEYS.lifeVision, null),
  setLifeVision: (v: LifeVision) => safeSet(KEYS.lifeVision, v),

  getVisionDreams: (): VisionDreamItem[] => safeGet<VisionDreamItem[]>(KEYS.visionDreams, []),
  setVisionDreams: (items: VisionDreamItem[]) => safeSet(KEYS.visionDreams, items),

  getVisionYears: (): Record<number, YearlyVisionData> => safeGet<Record<number, YearlyVisionData>>(KEYS.visionYears, {}),
  setVisionYears: (data: Record<number, YearlyVisionData>) => safeSet(KEYS.visionYears, data),
};
