'use client';

import { useState, useEffect } from 'react';
import {
  ChevronRight, TrendingUp, MapPin,
  Star, Zap, Calendar, Target,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { mockCompanies } from '@/lib/mockCompanies';
import { storage } from '@/lib/storage';
import { careerSectionStore } from '@/lib/careerSectionStore';
import { cn } from '@/lib/utils';
import type { TabId } from '@/components/layout/types';
import type { LifePlanEntry, LifePlanSpan } from '@/types';

interface Props {
  onTabChange?: (tab: TabId) => void;
}

// ── Mock / static data ────────────────────────────────────────────

const VISION_ITEMS = [
  { id: 'v1', title: '海外旅行に行く',           desc: '年2回海外へ旅行し新しい価値観を得る',           achieved: true,  g: 'from-sky-400 to-blue-600',      emoji: '✈️',  img: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=300&q=60&fit=crop' },
  { id: 'v2', title: '理想の住まいに住む',       desc: 'こだわりの家で心地よい毎日を送る',             achieved: false, g: 'from-amber-400 to-orange-600',  emoji: '🏠',  img: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=300&q=60&fit=crop' },
  { id: 'v3', title: '家族との時間を大切に',     desc: '大切な人と豊かな時間を過ごし続ける',           achieved: true,  g: 'from-rose-400 to-pink-600',     emoji: '👨‍👩‍👧', img: 'https://images.unsplash.com/photo-1511895426328-dc8714191011?w=300&q=60&fit=crop' },
  { id: 'v4', title: '健康でいること',           desc: '心身ともに最高の状態を維持する',               achieved: false, g: 'from-emerald-400 to-teal-600',  emoji: '🏃',  img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=60&fit=crop' },
  { id: 'v5', title: '音楽を楽しむ',             desc: 'オーケストラで音楽の感動を味わう',             achieved: true,  g: 'from-violet-400 to-purple-600', emoji: '🎵',  img: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&q=60&fit=crop' },
  { id: 'v6', title: '学び続ける',               desc: '知識と教養を深め成長し続ける人でいる',         achieved: false, g: 'from-indigo-400 to-blue-600',   emoji: '📚',  img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&q=60&fit=crop' },
  { id: 'v7', title: '社会に貢献する',           desc: '誰かの役に立ち価値を生み出し続ける',           achieved: false, g: 'from-teal-400 to-green-600',    emoji: '🤝',  img: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=300&q=60&fit=crop' },
  { id: 'v8', title: '経済的自由を手に入れる',   desc: '時間とお金の自由を得てやりたいことを実現',     achieved: false, g: 'from-yellow-400 to-amber-600',  emoji: '💎',  img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=300&q=60&fit=crop' },
];

const MILESTONES: Record<number, string[]> = {
  30: ['転職成功', '年収700万円'],   31: ['転職先に適応', 'スキル強化'],
  32: ['プロジェクトリード', '英語強化'], 33: ['副業開始', '資格取得'],
  34: ['マネジメント経験', '貯蓄強化'], 35: ['マネージャー昇進', '年収1000万円'],
  36: ['チーム拡大', '新規事業'],    37: ['部門横断PJ', 'MBA準備'],
  38: ['MBA取得', '資産1500万円'],   39: ['上位職登用', '副業成長'],
  40: ['シニアMgr', '資産2000万円'], 45: ['部長クラス', '教育完了'],
  50: ['経営参画', '資産5000万円'],  55: ['独立・起業', '時間の自由'],
  60: ['海外移住', '好きなことに集中'], 65: ['社会貢献', 'セカンドライフ'],
  70: ['理想の老後', '家族と穏やかに'],
};

const SPAN_OPTIONS: { key: LifePlanSpan; label: string }[] = [
  { key: '1年', label: '1年スパン' },
  { key: '5年', label: '5年スパン' },
  { key: '10年', label: '10年スパン' },
];

// ── Helpers ───────────────────────────────────────────────────────

function calcAge(birthDate: string): number {
  if (!birthDate) return 30;
  const b = new Date(birthDate);
  const n = new Date();
  let age = n.getFullYear() - b.getFullYear();
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) age--;
  return Math.max(20, Math.min(69, age));
}

function getGreeting(): string {
  const h = new Date().getHours();
  return h < 12 ? 'おはようございます' : h < 18 ? 'こんにちは' : 'こんばんは';
}

function getDateStr(): string {
  const d = new Date();
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${days[d.getDay()]}）`;
}

function buildAges(span: LifePlanSpan, current: number): number[] {
  const MAX = 65;
  if (span === '1年') {
    const ages: number[] = [];
    for (let a = current; a <= Math.min(current + 7, MAX); a++) ages.push(a);
    return ages;
  }
  const step = span === '5年' ? 5 : 10;
  // First element is current age, then snap to next multiple of step
  const nextRounded = Math.ceil((current + 1) / step) * step;
  const ages: number[] = [current];
  for (let a = nextRounded; a <= MAX; a += step) {
    if (a > current) ages.push(a);
  }
  return ages;
}

type Phase = 'now' | 'near' | 'mid' | 'long';
function getPhase(age: number, current: number): Phase {
  if (age === current) return 'now';
  if (age <= current + 5) return 'near';
  if (age <= current + 15) return 'mid';
  return 'long';
}
const PHASE_STYLES: Record<Phase, {
  nodeBg: string; nodeBorder: string; nodeText: string;
  badge: string; tagBg: string; tagText: string; line: string;
}> = {
  now:  { nodeBg: 'bg-blue-600',    nodeBorder: 'border-blue-600',   nodeText: 'text-white',        badge: 'bg-blue-600 text-white',         tagBg: 'bg-blue-50',    tagText: 'text-blue-700',    line: 'bg-blue-400' },
  near: { nodeBg: 'bg-emerald-500', nodeBorder: 'border-emerald-400', nodeText: 'text-white',        badge: 'bg-emerald-100 text-emerald-700', tagBg: 'bg-emerald-50', tagText: 'text-emerald-700', line: 'bg-emerald-300' },
  mid:  { nodeBg: 'bg-white',       nodeBorder: 'border-violet-400',  nodeText: 'text-violet-700',   badge: 'bg-violet-100 text-violet-700',   tagBg: 'bg-violet-50',  tagText: 'text-violet-700',  line: 'bg-violet-300' },
  long: { nodeBg: 'bg-white',       nodeBorder: 'border-amber-400',   nodeText: 'text-amber-700',    badge: 'bg-amber-100 text-amber-700',     tagBg: 'bg-amber-50',   tagText: 'text-amber-700',   line: 'bg-amber-300' },
};
const PHASE_LABELS: Record<Phase, string> = { now: 'NOW', near: '近期', mid: '中期', long: '長期' };

// ── Life Timeline ────────────────────────────────────────────────

function LifeTimeline({ span, currentAge, entries, go }: { span: LifePlanSpan; currentAge: number; entries: LifePlanEntry[]; go: (t: TabId) => void }) {
  const ages = buildAges(span, currentAge);
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex-1 min-h-0 flex flex-col min-w-0">
      <div className="flex-1 min-h-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="relative h-full flex flex-col justify-center" style={{ minWidth: `${ages.length * 100}px`, padding: '8px 16px' }}>

          {/* ── Labels row (age + year) ───────── */}
          <div className="flex justify-between mb-2">
            {ages.map((age) => {
              const phase = getPhase(age, currentAge);
              const year = currentYear - currentAge + age;
              const isCurrent = phase === 'now';
              return (
                <div key={age} className="flex flex-col items-center" style={{ width: `${100 / ages.length}%` }}>
                  <span className={cn('text-[10px] font-black leading-none', isCurrent ? 'text-blue-600' : 'text-slate-600')}>
                    {age}歳
                  </span>
                  <span className="text-[8px] text-slate-400 mt-0.5">{year}年</span>
                  {isCurrent && (
                    <span className="text-[8px] font-bold text-blue-500 bg-blue-50 px-1 rounded mt-0.5">現在</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Line + dots row ───────────────── */}
          <div className="relative flex items-center" style={{ height: '28px' }}>
            {/* Background line */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-slate-200" />
            {/* Phase-colored line segments */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex">
              {ages.map((age, idx) => {
                if (idx === ages.length - 1) return null;
                const phase = getPhase(age, currentAge);
                const s = PHASE_STYLES[phase];
                return (
                  <div
                    key={age}
                    className={cn('h-px flex-1', s.line)}
                    style={{ marginLeft: idx === 0 ? '12px' : 0, marginRight: idx === ages.length - 2 ? '12px' : 0 }}
                  />
                );
              })}
            </div>
            {/* Dots */}
            <div className="absolute inset-x-0 flex justify-between items-center">
              {ages.map((age) => {
                const phase = getPhase(age, currentAge);
                const s = PHASE_STYLES[phase];
                const isCurrent = phase === 'now';
                return (
                  <div key={age} className="flex items-center justify-center" style={{ width: `${100 / ages.length}%` }}>
                    {isCurrent ? (
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-6 h-6 rounded-full bg-blue-200 opacity-50 animate-ping" style={{ animationDuration: '2s' }} />
                        <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-md z-10" />
                      </div>
                    ) : (
                      <div className={cn('w-3 h-3 rounded-full border-2 bg-white', s.nodeBorder)} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Milestones row ────────────────── */}
          <div className="flex justify-between mt-2">
            {ages.map((age) => {
              const phase = getPhase(age, currentAge);
              const s = PHASE_STYLES[phase];
              // LifePlan エントリーのデータのみ表示（未入力なら空）
              const entry = entries.find((e) => e.age === age);
              const tags: string[] = [];
              if (entry) {
                if (entry.career.salary)   tags.push(entry.career.salary);
                if (entry.career.position) tags.push(entry.career.position);
              }
              return (
                <div key={age} className="flex flex-col items-center gap-1" style={{ width: `${100 / ages.length}%` }}>
                  {tags.slice(0, 2).map((m, i) => (
                    <span
                      key={i}
                      className={cn('text-[8px] font-semibold px-1.5 py-0.5 rounded-md leading-snug text-center w-full', s.tagBg, s.tagText)}
                      style={{ maxWidth: '88px' }}
                    >
                      {m}
                    </span>
                  ))}
                  {tags.length === 0 && (
                    <span className="text-[8px] text-slate-300 italic">—</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <button
        onClick={() => go('career')}
        className="flex-shrink-0 flex items-center justify-center gap-1 text-[10px] text-blue-500 hover:text-blue-600 transition-colors py-1.5"
      >
        人生プランを詳細に設計する <ChevronRight size={10} />
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────

export function Dashboard({ onTabChange }: Props) {
  const { profile, extendedProfile, favoriteCompanyIds } = useApp();
  const go = (tab: TabId) => onTabChange?.(tab);

  // ── クライアントのみで読む storage 系 state ─────────────────
  // （SSRとクライアントで値が違うと hydration mismatch になるため useEffect で初期化）
  const [span, setSpan]               = useState<LifePlanSpan>('5年');
  const [planEntries, setPlanEntries] = useState<LifePlanEntry[]>([]);
  const [goalTitle, setGoalTitle]     = useState('');
  const [goalSubtitle, setGoalSubtitle] = useState('');
  const [visionItems, setVisionItems] = useState(VISION_ITEMS);

  const thisYear = new Date().getFullYear();

  useEffect(() => {
    // LifePlan
    const savedPlan = storage.getLifePlan();
    if (savedPlan?.span)    setSpan(savedPlan.span);
    if (savedPlan?.entries) setPlanEntries(savedPlan.entries);

    // Vision
    const years = storage.getVisionYears();
    const yd    = years[thisYear];
    const items = yd?.items?.length
      ? yd.items
      : (storage.getVisionDreams().length > 0 ? storage.getVisionDreams() : VISION_ITEMS);
    setGoalTitle(yd?.goalTitle ?? '昇華');
    setGoalSubtitle(yd?.goalSubtitle ?? '成長・挑戦・豊かさの実現');
    setVisionItems(items);
  }, []);

  const achievedCount = visionItems.filter((it) => it.achieved).length;
  const goalProgress  = visionItems.length > 0 ? Math.round(achievedCount / visionItems.length * 100) : 0;

  const currentAge = calcAge(extendedProfile.birthDate);
  const firstName = profile.name ? profile.name.split(/[\s　]/)[0] : '田中';

  const recommendedJobs = [...mockCompanies].sort((a, b) => b.overallMatch - a.overallMatch).slice(0, 3);
  const favoriteJobs = mockCompanies.filter((c) => favoriteCompanyIds.includes(c.id)).slice(0, 7);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-100">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-slate-100 px-5 py-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-black text-slate-800" suppressHydrationWarning>
              {getGreeting()}、{firstName}さん！
            </h1>
            <p className="text-[11px] text-slate-500">今日も理想の未来に向けて、一歩ずつ進みましょう。</p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500" suppressHydrationWarning>
            <Calendar size={12} className="text-slate-400" />
            {getDateStr()}
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex gap-2.5 p-2.5 overflow-hidden">

        {/* ── Left column ──────────────────────────────────── */}
        <div className="flex-[3] min-w-0 flex flex-col gap-2.5 overflow-hidden">

          {/* ① 今年の目標 */}
          <div className="flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              {/* Badge */}
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">1</span>
              <Target size={11} className="text-rose-500 flex-shrink-0" />
              <span className="text-[11px] font-bold text-slate-600 flex-shrink-0">今年の目標</span>
              {/* Divider */}
              <div className="w-px h-4 bg-slate-200 flex-shrink-0 mx-1" />
              {/* Theme */}
              <p className="text-base font-black text-slate-800 leading-none flex-shrink-0">{goalTitle}</p>
              <p className="text-[10px] text-slate-400 flex-shrink-0">{goalSubtitle}</p>
              {/* Spacer */}
              <div className="flex-1" />
              {/* Progress */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-slate-400">達成率</span>
                  <span className="text-sm font-black text-blue-600">{goalProgress}%</span>
                </div>
                <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${goalProgress}%` }} />
                </div>
              </div>
              {/* Link */}
              <button onClick={() => { careerSectionStore.set('lifeDream'); go('career'); }} className="text-[9px] text-blue-500 hover:underline flex items-center gap-0.5 flex-shrink-0 ml-2">
                編集 <ChevronRight size={8} />
              </button>
            </div>
          </div>

          {/* ② 夢の見える化 */}
          <div className="flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-100 px-3 py-2.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">2</span>
                <span className="text-[11px] font-bold text-slate-700">夢の見える化（8つのビジョン）</span>
              </div>
              <button
                onClick={() => { careerSectionStore.set('lifeDream'); go('career'); }}
                className="text-[9px] text-blue-500 hover:underline flex items-center gap-0.5"
              >
                ビジョンを編集する <ChevronRight size={9} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {visionItems.map((item) => (
                <div
                  key={item.id}
                  className="relative rounded-xl overflow-hidden flex-shrink-0 group"
                  style={{ height: '90px' }}
                >
                  {/* Photo background */}
                  <img
                    src={item.img}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  {/* Gradient overlay */}
                  <div className={cn('absolute inset-0 bg-gradient-to-br opacity-70', item.g)} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Achievement badge */}
                  <div className="absolute top-1.5 right-1.5 z-10">
                    {item.achieved
                      ? <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm">達成 ✓</span>
                      : <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-black/40 text-white/80 backdrop-blur-sm">未達成</span>
                    }
                  </div>

                  {/* Text bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 z-10">
                    <p className="text-white text-[10px] font-bold leading-tight drop-shadow-sm">{item.title}</p>
                    <p className="text-white/70 text-[8px] leading-tight line-clamp-1 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ③ 人生プラン */}
          <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-100 px-3 py-2.5 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">3</span>
                <span className="text-[11px] font-bold text-slate-700">人生プラン（ライフタイムライン）</span>
              </div>
              <div className="flex gap-1">
                {SPAN_OPTIONS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSpan(key);
                      const current = storage.getLifePlan();
                      if (current) storage.setLifePlan({ ...current, span: key });
                      else storage.setLifePlan({ birthYear: new Date().getFullYear() - currentAge, span: key, entries: [] });
                    }}
                    className={cn(
                      'text-[9px] px-2 py-0.5 rounded-full font-semibold transition-colors',
                      span === key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <LifeTimeline span={span} currentAge={currentAge} entries={planEntries} go={go} />
          </div>
        </div>

        {/* ── Right column ──────────────────────────────────── */}
        <div className="flex-[2] min-w-0 flex flex-col gap-2.5 overflow-hidden">

          {/* ④ 市場価値 */}
          <div className="flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-100 px-3 py-3">
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">4</span>
              <span className="text-[11px] font-bold text-slate-700">あなたの市場価値</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={18} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[9px] text-slate-500">推定年収レンジ</p>
                <p className="text-xl font-black text-blue-600 leading-none">
                  {profile.expectedSalaryMin}
                  <span className="text-sm font-bold text-slate-400 mx-0.5">〜</span>
                  {profile.expectedSalaryMax}
                  <span className="text-xs font-semibold text-slate-600 ml-0.5">万円</span>
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5">同年代・同職種の中央値：580万円</p>
              </div>
            </div>
          </div>

          {/* ⑤ 求人情報 */}
          <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-100 px-3 py-2.5 flex flex-col overflow-hidden">
            <div className="flex items-center gap-1.5 mb-2 flex-shrink-0">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">5</span>
              <span className="text-[11px] font-bold text-slate-700">求人情報</span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5" style={{ scrollbarWidth: 'none' }}>

              {/* おすすめ求人 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <Zap size={10} className="text-blue-500" />
                    <p className="text-[9px] font-bold text-slate-600">おすすめ求人</p>
                  </div>
                  <button onClick={() => go('companies')} className="text-[9px] text-blue-500 hover:underline">すべて見る</button>
                </div>
                <div className="space-y-1">
                  {recommendedJobs.map((c) => {
                    const p = c.postings[0];
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          storage.setSelectedCompanyInfo({ companyId: c.id, companyName: c.name });
                          if (p) storage.setSelectedJobInfo({ jobId: p.id, jobTitle: p.title, salaryRange: p.salary, location: p.location, requirements: p.requirements });
                          go('companies');
                        }}
                        className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                      >
                        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-white text-[8px] font-black flex-shrink-0', c.logoColor)}>
                          {c.logoInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-slate-800 truncate">{c.name}</p>
                          {p && (
                            <>
                              <p className="text-[8px] text-slate-500 truncate">{p.title}</p>
                              <div className="flex items-center gap-1">
                                <span className="flex items-center gap-0.5 text-[8px] text-slate-400">
                                  <TrendingUp size={7} />{p.salary}
                                </span>
                                <span className="flex items-center gap-0.5 text-[8px] text-slate-400">
                                  <MapPin size={7} />{p.location.split('（')[0]}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                        <span className={cn('text-[10px] font-black flex-shrink-0', c.overallMatch >= 80 ? 'text-emerald-600' : 'text-blue-600')}>
                          {c.overallMatch}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* お気に入り求人 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <Star size={10} className="text-amber-400" fill="currentColor" />
                    <p className="text-[9px] font-bold text-slate-600">お気に入り求人</p>
                  </div>
                  <button onClick={() => go('companies')} className="text-[9px] text-blue-500 hover:underline">管理する</button>
                </div>
                {favoriteJobs.length === 0 ? (
                  <div className="px-1 py-1.5">
                    <p className="text-[9px] text-slate-400 leading-snug">
                      企業情報タブで★を押すと表示されます
                    </p>
                    <button onClick={() => go('companies')} className="text-[9px] text-blue-500 hover:underline mt-1">
                      企業情報を見る →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {favoriteJobs.map((c) => {
                      const p = c.postings[0];
                      return (
                        <button key={c.id} onClick={() => go('companies')} className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors text-left">
                          <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-white text-[8px] font-black flex-shrink-0', c.logoColor)}>
                            {c.logoInitials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-slate-800 truncate">{c.name}</p>
                            {p && <p className="text-[8px] text-slate-500 truncate">{p.title}</p>}
                          </div>
                          <span className="text-[10px] font-black text-amber-500 flex-shrink-0">{c.overallMatch}%</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* All jobs link */}
              <button onClick={() => go('companies')} className="w-full text-[9px] text-center text-blue-500 hover:underline py-0.5">
                すべての求人を見る →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
