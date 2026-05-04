'use client';

import type { ExtendedProfile, MaritalStatus, ChildrenStatus, LivingStatus } from '@/types';
import { RadioGroup, SectionTitle } from '../ui';

interface Props {
  extended: ExtendedProfile;
  onExtendedChange: (e: ExtendedProfile) => void;
}

export function LifestyleSection({ extended, onExtendedChange }: Props) {
  const set = <K extends keyof ExtendedProfile>(key: K, value: ExtendedProfile[K]) =>
    onExtendedChange({ ...extended, [key]: value });

  return (
    <div>
      <SectionTitle>家族・ライフスタイル（任意）</SectionTitle>

      <RadioGroup<MaritalStatus>
        label="婚姻状況"
        options={['未婚', '既婚']}
        value={extended.maritalStatus}
        onChange={(v) => set('maritalStatus', v)}
        optional
      />

      <RadioGroup<ChildrenStatus>
        label="子供の有無"
        options={['なし', 'あり']}
        value={extended.hasChildren}
        onChange={(v) => set('hasChildren', v)}
        optional
      />

      <RadioGroup<LivingStatus>
        label="同居状況"
        options={['一人暮らし', '実家', '同居']}
        value={extended.livingStatus}
        onChange={(v) => set('livingStatus', v)}
        optional
      />
    </div>
  );
}
