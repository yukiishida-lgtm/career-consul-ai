'use client';

import type { ExtendedProfile, MBTIType } from '@/types';
import { SectionTitle } from '../ui';
import { cn } from '@/lib/utils';

interface Props {
  extended: ExtendedProfile;
  onExtendedChange: (e: ExtendedProfile) => void;
}

const MBTI_TYPES: MBTIType[] = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
  '未診断',
];

const MBTI_DESC: Partial<Record<MBTIType, string>> = {
  INTJ: '建築家 — 想像力豊かで戦略的な思想家',
  INTP: '論理学者 — 革新的な発明家',
  ENTJ: '指揮官 — 大胆で想像力豊かなリーダー',
  ENTP: '討論者 — スマートで好奇心旺盛な思想家',
  INFJ: '提唱者 — 静かな神秘的存在、理想主義的なビジョナリー',
  INFP: '仲介者 — 詩的で親切な利他主義者',
  ENFJ: '主人公 — カリスマ性があり感化力のあるリーダー',
  ENFP: '広報運動家 — 熱狂的で創造的な自由人',
  ISTJ: '管理者 — 実用的で事実に基づいた信頼できる人物',
  ISFJ: '擁護者 — 非常に献身的で温かい守護者',
  ESTJ: '幹部 — 優秀な管理者、物事や人を管理する能力に長けた人',
  ESFJ: '領事 — 非常に思いやりがあり社交的で人気者',
  ISTP: '巨匠 — 大胆で実用的な実験者',
  ISFP: '冒険家 — 柔軟で魅力的なアーティスト',
  ESTP: '起業家 — スマートでエネルギッシュな認識者',
  ESFP: 'エンターテイナー — 自発的でエネルギッシュな楽しいことが大好きな人',
};

const MBTI_COLORS: Partial<Record<MBTIType, string>> = {
  INTJ: 'bg-purple-100 text-purple-700', INTP: 'bg-purple-100 text-purple-700',
  ENTJ: 'bg-purple-100 text-purple-700', ENTP: 'bg-purple-100 text-purple-700',
  INFJ: 'bg-green-100 text-green-700', INFP: 'bg-green-100 text-green-700',
  ENFJ: 'bg-green-100 text-green-700', ENFP: 'bg-green-100 text-green-700',
  ISTJ: 'bg-blue-100 text-blue-700', ISFJ: 'bg-blue-100 text-blue-700',
  ESTJ: 'bg-blue-100 text-blue-700', ESFJ: 'bg-blue-100 text-blue-700',
  ISTP: 'bg-amber-100 text-amber-700', ISFP: 'bg-amber-100 text-amber-700',
  ESTP: 'bg-amber-100 text-amber-700', ESFP: 'bg-amber-100 text-amber-700',
};

export function PersonalitySection({ extended, onExtendedChange }: Props) {
  const set = (mbti: MBTIType) =>
    onExtendedChange({ ...extended, mbti: extended.mbti === mbti ? undefined : mbti });

  const selected = extended.mbti;

  return (
    <div>
      <SectionTitle>性格・特性</SectionTitle>

      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
        MBTIタイプを選択してください。
        未診断の場合は「未診断」を選択するか、
        <a href="https://www.16personalities.com/ja" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-0.5">
          16Personalities
        </a>
        で診断できます。
      </p>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {MBTI_TYPES.filter((t) => t !== '未診断').map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => set(type)}
            className={cn(
              'py-2 rounded-xl text-sm font-bold border-2 transition-all',
              selected === type
                ? `${MBTI_COLORS[type] ?? 'bg-blue-100 text-blue-700'} border-current`
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            )}
          >
            {type}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => set('未診断')}
        className={cn(
          'w-full py-2 rounded-xl text-sm border-2 transition-all',
          selected === '未診断'
            ? 'bg-slate-200 text-slate-700 border-slate-400'
            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
        )}
      >
        未診断
      </button>

      {selected && selected !== '未診断' && MBTI_DESC[selected] && (
        <div className={cn('mt-4 rounded-2xl p-4', MBTI_COLORS[selected] ?? 'bg-blue-50 text-blue-700')}>
          <p className="font-bold text-lg mb-1">{selected}</p>
          <p className="text-sm">{MBTI_DESC[selected]}</p>
        </div>
      )}
    </div>
  );
}
