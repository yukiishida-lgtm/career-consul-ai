'use client';

import { useMemo } from 'react';
import type { UserProfile, ExtendedProfile, Gender } from '@/types';
import { Label, Input, Select, RadioGroup, Field, SectionTitle } from '../ui';

const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];

interface Props {
  profile: UserProfile;
  extended: ExtendedProfile;
  onProfileChange: (p: UserProfile) => void;
  onExtendedChange: (e: ExtendedProfile) => void;
}

function calcAge(birthDate: string): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

export function BasicInfoSection({ profile, extended, onProfileChange, onExtendedChange }: Props) {
  const age = useMemo(() => calcAge(extended.birthDate), [extended.birthDate]);

  const setP = (key: keyof UserProfile, value: string) =>
    onProfileChange({ ...profile, [key]: value });

  const setE = <K extends keyof ExtendedProfile>(key: K, value: ExtendedProfile[K]) =>
    onExtendedChange({ ...extended, [key]: value });

  return (
    <div>
      <SectionTitle>基本情報</SectionTitle>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <Label required>氏名</Label>
          <Input
            value={profile.name}
            onChange={(e) => setP('name', e.target.value)}
            placeholder="山田 太郎"
          />
        </Field>
        <Field>
          <Label required>フリガナ</Label>
          <Input
            value={extended.nameKana}
            onChange={(e) => setE('nameKana', e.target.value)}
            placeholder="ヤマダ タロウ"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <Label required>生年月日</Label>
          <Input
            type="date"
            value={extended.birthDate}
            onChange={(e) => setE('birthDate', e.target.value)}
          />
        </Field>
        <Field>
          <Label>年齢（自動算出）</Label>
          <div className="bg-slate-100 rounded-xl px-4 py-2.5 text-sm text-slate-600">
            {age != null ? `${age} 歳` : '—'}
          </div>
        </Field>
      </div>

      <RadioGroup<Gender>
        label="性別"
        options={['男性', '女性', 'その他', '回答しない']}
        value={extended.gender}
        onChange={(v) => setE('gender', v)}
        optional
      />

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <Label>居住地（都道府県）</Label>
          <Select
            value={extended.prefecture}
            onChange={(e) => setE('prefecture', e.target.value)}
          >
            <option value="">選択してください</option>
            {PREFECTURES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label>市区町村（任意）</Label>
          <Input
            value={extended.city ?? ''}
            onChange={(e) => setE('city', e.target.value)}
            placeholder="渋谷区"
          />
        </Field>
      </div>

      <SectionTitle>現職情報</SectionTitle>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <Label>現在の職種</Label>
          <Input
            value={profile.currentJob}
            onChange={(e) => setP('currentJob', e.target.value)}
            placeholder="ITコンサルタント"
          />
        </Field>
        <Field>
          <Label>現在の会社名</Label>
          <Input
            value={profile.currentCompany}
            onChange={(e) => setP('currentCompany', e.target.value)}
            placeholder="株式会社〇〇"
          />
        </Field>
      </div>
    </div>
  );
}
