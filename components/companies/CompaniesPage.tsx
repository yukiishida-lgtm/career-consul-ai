'use client';

import { useState, useCallback } from 'react';
import {
  Search, MapPin, Users, TrendingUp, Briefcase, Star, AlertTriangle,
  FileText, ChevronDown, ChevronUp, Clock, Building2, Info, CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { mockCompanies } from '@/lib/mockCompanies';
import { storage } from '@/lib/storage';
import { cn } from '@/lib/utils';
import type { TargetCompany, JobPosting, MatchCriterionKey } from '@/types';
import type { TabId } from '@/components/layout/types';

// ── Constants ─────────────────────────────────────────────────────

const ALL_CRITERIA: { key: MatchCriterionKey; label: string }[] = [
  { key: 'skill',           label: 'スキル適合' },
  { key: 'values',          label: '価値観' },
  { key: 'career',          label: 'キャリア成長' },
  { key: 'salary',          label: '給与水準' },
  { key: 'workStyle',       label: '働き方' },
  { key: 'growth',          label: '成長機会' },
  { key: 'stability',       label: '安定性' },
  { key: 'autonomy',        label: '裁量度' },
  { key: 'relationship',    label: '人間関係' },
  { key: 'industryInterest',label: '業界関心' },
  { key: 'location',        label: '立地' },
  { key: 'companySize',     label: '規模感' },
];

const MAX_CRITERIA = 10;

function calcOverallMatch(scores: TargetCompany['matchScores'], criteria: MatchCriterionKey[]): number {
  if (criteria.length === 0) return 0;
  const sum = criteria.reduce((acc, k) => acc + scores[k], 0);
  return Math.round(sum / criteria.length);
}

// ── Sub-components ────────────────────────────────────────────────

function MatchGauge({ score }: { score: number }) {
  const color =
    score >= 80 ? 'text-emerald-600' :
    score >= 70 ? 'text-blue-600' :
                  'text-slate-500';
  const ring =
    score >= 80 ? 'stroke-emerald-500' :
    score >= 70 ? 'stroke-blue-500' :
                  'stroke-slate-400';
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);

  return (
    <div className="flex flex-col items-center">
      <svg width="72" height="72" className="-rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
        <circle
          cx="36" cy="36" r={r} fill="none"
          className={ring}
          strokeWidth="6"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="flex flex-col items-center -mt-14">
        <span className={cn('text-xl font-black', color)}>{score}</span>
        <span className="text-[10px] text-slate-400 font-medium">%</span>
      </div>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 85 ? 'bg-emerald-400' :
    score >= 70 ? 'bg-blue-400' :
                  'bg-amber-400';
  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={cn('h-full rounded-full transition-all', color)}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty?: '易' | '普通' | '難' }) {
  if (!difficulty) return null;
  const styles = {
    '易': 'bg-emerald-100 text-emerald-700',
    '普通': 'bg-blue-100 text-blue-700',
    '難': 'bg-red-100 text-red-700',
  };
  return (
    <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full', styles[difficulty])}>
      {difficulty}
    </span>
  );
}

function CompanySideCard({
  company, isSelected, isFavorite, onSelect, onToggleFavorite, overallMatch,
}: {
  company: TargetCompany;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  overallMatch: number;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left p-3 rounded-xl border-2 transition-all group',
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50'
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0', company.logoColor)}>
          {company.logoInitials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-800 truncate">{company.name}</p>
          <p className="text-[10px] text-slate-400 truncate">{company.industry}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={cn(
            'text-xs font-black',
            overallMatch >= 80 ? 'text-emerald-600' :
            overallMatch >= 70 ? 'text-blue-600' : 'text-slate-500'
          )}>{overallMatch}%</span>
          <button
            onClick={onToggleFavorite}
            className={cn(
              'p-0.5 rounded transition-colors',
              isFavorite ? 'text-amber-400 hover:text-amber-500' : 'text-slate-300 hover:text-amber-400'
            )}
          >
            <Star size={14} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
      {company.recommendationReason && (
        <p className="text-[10px] text-slate-400 mt-1.5 leading-snug line-clamp-1 pl-11">
          {company.recommendationReason}
        </p>
      )}
    </button>
  );
}

function PostingCard({
  posting, onSelect,
}: {
  posting: JobPosting;
  onSelect: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-slate-800 leading-snug">{posting.title}</p>
            <DifficultyBadge difficulty={posting.difficulty} />
          </div>
          {posting.deadline && (
            <span className="text-[10px] text-slate-400 flex-shrink-0 whitespace-nowrap">
              〆{posting.deadline.replace('2026-', '')}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-3 mb-3">
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <TrendingUp size={11} className="text-slate-400" /> {posting.salary}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={11} className="text-slate-400" /> {posting.location}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Briefcase size={11} className="text-slate-400" /> {posting.employmentType}
          </span>
        </div>
        {/* 必須要件 */}
        <div className="mb-2">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">必須要件</p>
          <div className="flex flex-wrap gap-1">
            {posting.requirements.map((r) => (
              <span key={r} className="text-[10px] bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">{r}</span>
            ))}
          </div>
        </div>
        {/* 歓迎要件（展開可能） */}
        {posting.welcomeRequirements && posting.welcomeRequirements.length > 0 && (
          <div>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-600 font-semibold mt-1"
            >
              {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              歓迎要件
            </button>
            {expanded && (
              <div className="flex flex-wrap gap-1 mt-1">
                {posting.welcomeRequirements.map((r) => (
                  <span key={r} className="text-[10px] bg-blue-50 text-blue-600 rounded-full px-2 py-0.5">{r}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="px-4 pb-4">
        <button
          onClick={onSelect}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors"
        >
          <FileText size={13} />
          この求人で選考対策を作成
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────

interface Props {
  onTabChange: (tab: TabId) => void;
}

export function CompaniesPage({ onTabChange }: Props) {
  const {
    favoriteCompanyIds, setFavoriteCompanyIds,
    selectedMatchCriteria, setSelectedMatchCriteria,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(mockCompanies[0].id);
  const [showCriteriaPanel, setShowCriteriaPanel] = useState(false);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);

  // View history
  const viewHistory = storage.getCompanyViewHistory();

  const selectCompany = useCallback((id: string) => {
    setSelectedCompanyId(id);
    // Update view history
    const company = mockCompanies.find((c) => c.id === id);
    if (!company) return;
    const existing = storage.getCompanyViewHistory();
    const filtered = existing.filter((h) => h.companyId !== id);
    const updated = [
      { companyId: id, companyName: company.name, viewedAt: new Date().toISOString() },
      ...filtered,
    ].slice(0, 10);
    storage.setCompanyViewHistory(updated);
    setShowHistoryDropdown(false);
  }, []);

  const toggleFavorite = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (favoriteCompanyIds.includes(id)) {
      setFavoriteCompanyIds(favoriteCompanyIds.filter((f) => f !== id));
    } else {
      setFavoriteCompanyIds([...favoriteCompanyIds, id]);
    }
  }, [favoriteCompanyIds, setFavoriteCompanyIds]);

  const toggleCriterion = useCallback((key: MatchCriterionKey) => {
    if (selectedMatchCriteria.includes(key)) {
      setSelectedMatchCriteria(selectedMatchCriteria.filter((k) => k !== key));
    } else if (selectedMatchCriteria.length < MAX_CRITERIA) {
      setSelectedMatchCriteria([...selectedMatchCriteria, key]);
    }
  }, [selectedMatchCriteria, setSelectedMatchCriteria]);

  // Filtered list
  const query = searchQuery.trim().toLowerCase();
  const filtered = query
    ? mockCompanies.filter((c) =>
        c.name.toLowerCase().includes(query) ||
        c.industry.toLowerCase().includes(query) ||
        c.tags.some((t) => t.toLowerCase().includes(query))
      )
    : mockCompanies;

  const sortedFiltered = [...filtered].sort((a, b) => {
    const aM = calcOverallMatch(a.matchScores, selectedMatchCriteria);
    const bM = calcOverallMatch(b.matchScores, selectedMatchCriteria);
    return bM - aM;
  });

  const favorites = mockCompanies.filter((c) => favoriteCompanyIds.includes(c.id));

  const company = mockCompanies.find((c) => c.id === selectedCompanyId) ?? mockCompanies[0];
  const overallMatch = calcOverallMatch(company.matchScores, selectedMatchCriteria);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Top search bar */}
      <div className="flex-shrink-0 px-5 pt-5 pb-3 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="企業名・業界・タグで検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          {/* History button */}
          <div className="relative">
            <button
              onClick={() => setShowHistoryDropdown((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 hover:border-blue-300 transition-colors"
            >
              <Clock size={13} className="text-slate-400" />
              <span className="hidden sm:inline">閲覧履歴</span>
            </button>
            {showHistoryDropdown && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-3 pt-3 pb-1.5">閲覧履歴</p>
                {viewHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 px-3 pb-3">履歴がありません</p>
                ) : (
                  <div className="pb-2">
                    {viewHistory.slice(0, 8).map((h) => {
                      const c = mockCompanies.find((mc) => mc.id === h.companyId);
                      if (!c) return null;
                      return (
                        <button
                          key={h.companyId}
                          onClick={() => selectCompany(h.companyId)}
                          className="w-full text-left flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 transition-colors"
                        >
                          <div className={cn('w-6 h-6 rounded-md flex items-center justify-center text-white text-[9px] font-black flex-shrink-0', c.logoColor)}>
                            {c.logoInitials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-700 truncate">{c.name}</p>
                            <p className="text-[10px] text-slate-400">{new Date(h.viewedAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <div className="w-64 flex-shrink-0 flex flex-col border-r border-slate-100 bg-white overflow-y-auto">
          <div className="p-3 space-y-1">
            {/* Recommended */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-1 mb-2">
                おすすめ企業 {sortedFiltered.length > 0 && `(${sortedFiltered.length})`}
              </p>
              {sortedFiltered.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4 px-2">該当する企業が見つかりません</p>
              ) : (
                <div className="space-y-1.5">
                  {sortedFiltered.map((c) => (
                    <CompanySideCard
                      key={c.id}
                      company={c}
                      isSelected={c.id === selectedCompanyId}
                      isFavorite={favoriteCompanyIds.includes(c.id)}
                      onSelect={() => selectCompany(c.id)}
                      onToggleFavorite={(e) => toggleFavorite(e, c.id)}
                      overallMatch={calcOverallMatch(c.matchScores, selectedMatchCriteria)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Favorites */}
            {favorites.length > 0 && (
              <div className="pt-3">
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide px-1 mb-2 flex items-center gap-1">
                  <Star size={10} fill="currentColor" /> お気に入り ({favorites.length})
                </p>
                <div className="space-y-1.5">
                  {favorites.map((c) => (
                    <CompanySideCard
                      key={c.id}
                      company={c}
                      isSelected={c.id === selectedCompanyId}
                      isFavorite={true}
                      onSelect={() => selectCompany(c.id)}
                      onToggleFavorite={(e) => toggleFavorite(e, c.id)}
                      overallMatch={calcOverallMatch(c.matchScores, selectedMatchCriteria)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right detail panel */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-4 max-w-3xl pb-20 md:pb-6">

            {/* Company header */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-start gap-4">
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-black flex-shrink-0', company.logoColor)}>
                  {company.logoInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-black text-slate-800">{company.name}</h2>
                    <button
                      onClick={(e) => toggleFavorite(e, company.id)}
                      className={cn(
                        'flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border transition-colors',
                        favoriteCompanyIds.includes(company.id)
                          ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-500'
                      )}
                    >
                      <Star size={11} fill={favoriteCompanyIds.includes(company.id) ? 'currentColor' : 'none'} />
                      {favoriteCompanyIds.includes(company.id) ? 'お気に入り済み' : 'お気に入り'}
                    </button>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{company.industry}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {company.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-semibold bg-blue-50 text-blue-600 rounded-full px-2 py-0.5">{tag}</span>
                    ))}
                  </div>
                </div>
                {/* Overall match gauge */}
                <div className="flex-shrink-0 flex flex-col items-center gap-1">
                  <MatchGauge score={overallMatch} />
                  <p className="text-[10px] text-slate-400 text-center leading-tight">総合<br />マッチ度</p>
                </div>
              </div>

              {/* Basic info grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                {[
                  { label: '従業員数', value: company.employeeCount, icon: Users },
                  { label: '売上高', value: company.revenue, icon: TrendingUp },
                  { label: '設立', value: company.founded, icon: Briefcase },
                  { label: '本社', value: company.address.replace(/東京都|大阪府|神奈川県/g, '').split('区')[0] + '区', icon: MapPin },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Icon size={10} className="text-slate-400" />
                      <p className="text-[10px] text-slate-400">{label}</p>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 leading-snug">{value}</p>
                  </div>
                ))}
              </div>

              {/* Business summary */}
              <p className="text-xs text-slate-600 leading-relaxed mt-4">{company.businessSummary}</p>

              {/* Recommendation reason */}
              <div className="flex items-start gap-2 mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
                <Info size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 font-semibold leading-snug">{company.recommendationReason}</p>
              </div>
            </div>

            {/* Match Analysis */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-700">マッチ度分析</h3>
                <button
                  onClick={() => setShowCriteriaPanel((v) => !v)}
                  className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-semibold"
                >
                  {showCriteriaPanel ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  軸を選択 ({selectedMatchCriteria.length}/{MAX_CRITERIA})
                </button>
              </div>

              {/* Criteria selector */}
              {showCriteriaPanel && (
                <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 mb-2">評価軸を選択（最大{MAX_CRITERIA}つ）</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_CRITERIA.map(({ key, label }) => {
                      const isSelected = selectedMatchCriteria.includes(key);
                      const isDisabled = !isSelected && selectedMatchCriteria.length >= MAX_CRITERIA;
                      return (
                        <button
                          key={key}
                          onClick={() => toggleCriterion(key)}
                          disabled={isDisabled}
                          className={cn(
                            'text-xs px-2.5 py-1 rounded-full border font-semibold transition-all',
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : isDisabled
                                ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                          )}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* AI comment */}
              {company.aiComment && (
                <div className="flex items-start gap-2 bg-violet-50 border border-violet-100 rounded-xl p-3 mb-4">
                  <Building2 size={13} className="text-violet-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-violet-700 leading-relaxed">{company.aiComment}</p>
                </div>
              )}

              {/* Score bars */}
              {selectedMatchCriteria.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">評価軸を1つ以上選択してください</p>
              ) : (
                <div className="space-y-3">
                  {selectedMatchCriteria.map((key) => {
                    const criterion = ALL_CRITERIA.find((c) => c.key === key)!;
                    const score = company.matchScores[key];
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-600">{criterion.label}</span>
                          <span className={cn(
                            'text-xs font-black',
                            score >= 85 ? 'text-emerald-600' :
                            score >= 70 ? 'text-blue-600' : 'text-amber-600'
                          )}>{score}%</span>
                        </div>
                        <ScoreBar score={score} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reasons & Risks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Reasons */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <p className="text-xs font-bold text-emerald-700">向いている理由</p>
                </div>
                <ul className="space-y-2.5">
                  {company.reasons.map((r, i) => (
                    <li key={i} className="text-xs text-emerald-800 leading-snug flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risks */}
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <AlertTriangle size={14} className="text-amber-600" />
                  <p className="text-xs font-bold text-amber-700">注意すべきリスク</p>
                </div>
                <ul className="space-y-2.5">
                  {company.risks.map((r, i) => (
                    <li key={i} className="text-xs text-amber-800 leading-snug flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Job Postings */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-4">
                求人情報
                <span className="ml-2 text-xs font-normal text-slate-400">({company.postings.length}件)</span>
              </h3>
              <div className="space-y-3">
                {company.postings.map((posting) => (
                  <PostingCard
                    key={posting.id}
                    posting={posting}
                    onSelect={() => {
                      storage.setSelectedCompanyInfo({ companyId: company.id, companyName: company.name });
                      storage.setSelectedJobInfo({
                        jobId: posting.id,
                        jobTitle: posting.title,
                        salaryRange: posting.salary,
                        location: posting.location,
                        requirements: posting.requirements,
                      });
                      onTabChange('interview');
                    }}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Overlay to close dropdowns */}
      {showHistoryDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowHistoryDropdown(false)}
        />
      )}
    </div>
  );
}
