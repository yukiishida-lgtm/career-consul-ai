// Career ページで初期表示するセクションを一時的に保持するシンプルなストア
let _pendingSection: string | null = null;

export const careerSectionStore = {
  set: (section: string) => { _pendingSection = section; },
  consume: (): string | null => {
    const s = _pendingSection;
    _pendingSection = null;
    return s;
  },
};
