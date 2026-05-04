export type CareerStatus = '成長期' | '停滞期' | '転換期' | '模索期' | '安定期';
export type JobChangeProb = '低' | '中' | '高';
export type LifePeriod = '幼少期' | '小学生' | '中学生' | '高校生' | '大学生' | '社会人' | '現在';
export type DepthLevel = '浅' | '普通' | '深' | '超深' | '海底';

export interface UserProfile {
  name: string;
  currentJob: string;
  currentCompany: string;
  careerStatus: CareerStatus;
  jobChangeProbability: JobChangeProb;
  motivationScore: number;
  expectedSalaryMin: number;
  expectedSalaryMax: number;
  strengths: string[];
  weaknesses: string[];
  values: string[];
  stressFactors: string[];
  vision: string;
  marketValueLevel: number; // 1-5
}

// ── Extended Profile ─────────────────────────────────────────────

export type Gender = '男性' | '女性' | 'その他' | '回答しない';
export type MaritalStatus = '未婚' | '既婚';
export type ChildrenStatus = 'なし' | 'あり';
export type LivingStatus = '一人暮らし' | '実家' | '同居';
export type EducationType = '高校' | '専門学校' | '大学' | '大学院';
export type GraduationType = '卒業' | '卒業見込み' | '中退';
export type EmploymentType = '正社員' | '契約社員' | '派遣' | 'フリーランス';
export type EnglishLevel = 'ネイティブ' | 'ビジネスレベル' | '日常会話レベル' | '基礎レベル' | 'なし';
export type MBTIType =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP'
  | '未診断';

export interface Education {
  id: string;
  type: EducationType;
  schoolName: string;
  department?: string;
  startDate: string;  // YYYY-MM
  endDate?: string;   // YYYY-MM
  graduationType: GraduationType;
}

export interface WorkPeriod {
  id: string;
  startDate: string;  // YYYY-MM
  endDate?: string;   // YYYY-MM
  isCurrent: boolean;
  jobType: string;    // 職種
  position?: string;  // 役職
  description: string;
  domains: string[];
  teamSize?: number;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  employmentType: EmploymentType;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  periods: WorkPeriod[];
}

export interface ExtendedProfile {
  // 基本情報
  nameKana: string;
  birthDate: string;  // YYYY-MM-DD
  gender?: Gender;
  prefecture?: string;
  city?: string;
  // 家族・ライフスタイル
  maritalStatus?: MaritalStatus;
  hasChildren?: ChildrenStatus;
  livingStatus?: LivingStatus;
  // 学歴
  education: Education[];
  // 職務経歴
  companies: Company[];
  // スキル
  skills: string[];
  certifications: string[];
  englishLevel?: EnglishLevel;
  // 性格・特性
  mbti?: MBTIType;
}

export const defaultExtendedProfile: ExtendedProfile = {
  nameKana: '',
  birthDate: '',
  gender: undefined,
  prefecture: undefined,
  city: '',
  maritalStatus: undefined,
  hasChildren: undefined,
  livingStatus: undefined,
  education: [],
  companies: [],
  skills: [],
  certifications: [],
  englishLevel: undefined,
  mbti: undefined,
};

// ── Other models ─────────────────────────────────────────────────

export interface LifeEvent {
  id: string;
  period: LifePeriod;
  title: string;
  emotion: string;
  motivationScore: number;
  memo: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  name: string;
  createdAt: string;
  messages: ChatMessage[];
}

export interface CareerPath {
  id: string;
  title: string;
  summary: string;
  reason: string;
  salaryRange: string;
  difficulty: '低' | '中' | '高';
  requiredSkills: string[];
  nextAction: string;
}

export interface GapItem {
  label: string;
  current: number;
  ideal: number;
}

export interface ActionPlan {
  thisWeek: string[];
  thisMonth: string[];
  threeMonths: string[];
}

export interface CareerPlan {
  idealWorkStyle: string;
  targetSalary: string;
  values: string[];
  vision: string;
  paths: CareerPath[];
  gaps: GapItem[];
  actions: ActionPlan;
}

export interface MotivationDataPoint {
  period: string;
  score: number;
  event?: string;
}

export interface AnalysisResult {
  strengths: { title: string; basis: string }[];
  weaknesses: { title: string; basis: string }[];
  values: { title: string; basis: string }[];
  motivationSources: { title: string; basis: string }[];
  stressFactors: { title: string; basis: string }[];
  thinkingPatterns: { title: string; basis: string }[];
}

// ── Company Research ──────────────────────────────────────────────

export interface CompanyMatchScores {
  skill: number;
  values: number;
  career: number;
  salary: number;
  workStyle: number;
  growth: number;
  stability: number;
  autonomy: number;
  relationship: number;
  industryInterest: number;
  location: number;
  companySize: number;
}

export type MatchCriterionKey = keyof CompanyMatchScores;

export interface JobPosting {
  id: string;
  title: string;
  salary: string;
  location: string;
  employmentType: string;
  requirements: string[];
  welcomeRequirements?: string[];
  difficulty?: '易' | '普通' | '難';
  postedAt?: string;
  deadline?: string;
}

export interface TargetCompany {
  id: string;
  name: string;
  industry: string;
  address: string;
  employeeCount: string;
  revenue: string;
  founded: string;
  logoInitials: string;
  logoColor: string;
  businessSummary: string;
  tags: string[];
  recommendationReason: string;
  overallMatch: number;
  matchScores: CompanyMatchScores;
  aiComment?: string;
  reasons: string[];
  risks: string[];
  postings: JobPosting[];
}

export interface CompanyViewHistoryItem {
  companyId: string;
  companyName: string;
  viewedAt: string;
}

export interface SelectedCompanyInfo {
  companyId: string;
  companyName: string;
}

export interface SelectedJobInfo {
  jobId: string;
  jobTitle: string;
  salaryRange: string;
  location: string;
  requirements: string[];
}

// ── Application Documents ─────────────────────────────────────────

export interface STARStory {
  id: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  theme: string; // e.g. "リーダーシップ"
}

export interface ApplicationDocument {
  motivation: string;          // 志望動機
  selfPR: string;              // 自己PR
  workHistory: string;         // 職務経歴書
  resume: string;              // 履歴書テキスト
  interviewQA: { q: string; a: string }[];  // 面接想定Q&A
  starStories: STARStory[];
  companyAppeal: string;       // 企業別アピールポイント
  targetCompanyId?: string;
}

export type EpisodePeriod = '幼少期' | '小学生' | '中学生' | '高校生' | '大学生' | '社会人';

export interface Episode {
  id: string;
  period: EpisodePeriod;
  age?: number;
  title: string;
  motivationScore: number; // -100 to 100
  isDeepDived: boolean;
  aiConclusion?: string;
  aiDetail?: string;
  extractedStrengths?: string[];
  extractedValues?: string[];
  deepDiveChatId?: string;
  deepDiveUpdatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveEpisodeForDeepDive {
  episodeId: string;
  period: EpisodePeriod;
  age?: number;
  title: string;
  motivationScore: number;
  chatSessionId: string;
}

// ── Interview Prep ─────────────────────────────────────────────────

export type DocStatus = '未作成' | '作成中' | '完成';
export type PracticeType = '企業について' | '自分について' | '社会情勢について' | 'ケース面接' | 'ランダム';

export interface InterviewDocument {
  content: string;
  status: DocStatus;
  updatedAt: string;
}

export interface StrengthWeaknessItem {
  title: string;
  basis: string;
  episodeId?: string;
  episodeTitle?: string;
}

export interface CommonQA {
  question: string;
  answer: string;
}

export interface CommonInterviewPrep {
  selfPR: string;
  strengths: StrengthWeaknessItem[];
  weaknesses: StrengthWeaknessItem[];
  commonQuestions: CommonQA[];
}

export interface CompanyInterviewPrep {
  companyId: string;
  jobId?: string;
  motivation: string;
  expectedQuestions: CommonQA[];
  companyAnalysis: string;
  appealPoints: string;
  updatedAt: string;
}

export interface InterviewPracticeMode {
  companyId: string;
  companyName: string;
  jobId?: string;
  jobTitle?: string;
  practiceType: PracticeType;
}

// ── Life Plan ─────────────────────────────────────────────────────

export type LifePlanSpan = '1年' | '5年' | '10年';

export interface LifePlanCareer {
  salary: string;
  position: string;
  workContent: string;
  workStyle: string;
  skills: string;
}

export interface LifePlanPrivate {
  marriage: string;
  children: string;
  assets: string;
  lifestyle: string;
  residence: string;
  dream: string;
}

export interface LifePlanEntry {
  age: number;
  year: number;
  career: Partial<LifePlanCareer>;
  private: Partial<LifePlanPrivate>;
}

export interface LifePlan {
  birthYear: number;
  span: LifePlanSpan;
  entries: LifePlanEntry[];
}

// ── Life Tasks ────────────────────────────────────────────────────

export type TaskHorizon = 'short' | 'mid' | 'long';
export type TaskStatus = 'todo' | 'doing' | 'done';

export interface LifeTask {
  id: string;
  title: string;
  horizon: TaskHorizon;
  status: TaskStatus;
  deadline?: string;
  relatedGoal?: string;
}

// ── Life Vision ───────────────────────────────────────────────────

export interface VisionCell {
  id: string;
  category: string;
  title: string;
  memo: string;
  emoji: string;
  color: string;  // tailwind bg+border class
}

export interface LifeVision {
  yearTheme: string;
  cells: VisionCell[];
}
