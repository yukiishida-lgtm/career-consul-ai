'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  FileText, User, Building2, ChevronDown, ChevronUp,
  Copy, Check, Printer, Save, Edit3, X,
  Mic, Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { storage } from '@/lib/storage';
import { useApp } from '@/context/AppContext';
import { mockCompanies } from '@/lib/mockCompanies';
import type {
  DocStatus, PracticeType,
  InterviewDocument, CommonInterviewPrep, CompanyInterviewPrep,
  StrengthWeaknessItem, CommonQA,
} from '@/types';
import type { TabId } from '@/components/layout/types';

// ── Types ──────────────────────────────────────────────────────────

type MainTab = 'documents' | 'common' | 'company';

interface DocFields {
  summary: string;
  history: string;
  usableExp: string;
  skills: string;
  selfPR: string;
  appealPoints: string;
}

interface ResumeFields {
  basicInfo: string;
  education: string;
  workHistory: string;
  certifications: string;
  motivation: string;
  wishes: string;
}

// ── Toast ──────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
      <Check size={14} className="text-emerald-400 flex-shrink-0" />
      {message}
    </div>
  );
}

// ── Copy button ────────────────────────────────────────────────────

function CopyBtn({ text, label = 'コピー' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-100"
    >
      {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
      {copied ? 'コピー済み' : label}
    </button>
  );
}

// ── Status badge ───────────────────────────────────────────────────

function StatusBadge({ status }: { status: DocStatus }) {
  const cfg: Record<DocStatus, string> = {
    '未作成': 'bg-slate-100 text-slate-500',
    '作成中': 'bg-amber-100 text-amber-700',
    '完成': 'bg-emerald-100 text-emerald-700',
  };
  return (
    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', cfg[status])}>
      {status}
    </span>
  );
}

// ── Selected info bar ──────────────────────────────────────────────

function SelectedInfoBar() {
  const companyInfo = storage.getSelectedCompanyInfo();
  const jobInfo = storage.getSelectedJobInfo();
  const company = companyInfo
    ? mockCompanies.find((c) => c.id === companyInfo.companyId) ?? mockCompanies[0]
    : mockCompanies[0];
  const jobTitle = jobInfo?.jobTitle ?? company.postings[0]?.title ?? '求人未選択';

  return (
    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 mb-5">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0', company.logoColor)}>
        {company.logoInitials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {company.name}
          <span className="mx-1.5 text-slate-300">›</span>
          <span className="font-normal text-slate-600">{jobTitle}</span>
        </p>
      </div>
      <button className="flex-shrink-0 text-xs text-blue-600 hover:underline">変更</button>
    </div>
  );
}

// ── Tab 1: Documents ───────────────────────────────────────────────

const DOC_FIELDS_DEFAULT: DocFields = {
  summary:
    '私はITコンサルタントとして10年以上の経験を持ち、DX推進・業務改善・生成AI導入支援を専門としています。大手製造・金融・小売業のプロジェクトを多数リードし、クライアントの課題解決に貢献してきました。',
  history:
    '【株式会社○○ 2015年4月〜現在】\n職種：ITコンサルタント / シニアコンサルタント\n\n・大手製造業のDX推進プロジェクトリード（売上改善+15%達成）\n・金融機関向け業務自動化システム導入支援（工数削減30%）\n・生成AI活用によるカスタマーサポート効率化支援\n・チームマネジメント（メンバー5〜10名）',
  usableExp:
    '・DX推進プロジェクトのリード経験（要件定義〜実装支援〜定着化）\n・多様なステークホルダーとの調整・合意形成\n・データドリブンな課題分析と提案\n・生成AI・RPA・ERP導入の実務経験',
  skills:
    '【ITスキル】Python / SQL / PowerBI / Salesforce / SAP\n【資格】PMP / ITストラテジスト / 中小企業診断士（勉強中）\n【語学】英語（ビジネスレベル・TOEIC 830点）',
  selfPR:
    '私の強みは「課題解決力」と「調整力」です。複数のステークホルダーが絡む大規模プロジェクトにおいて、関係者間の利害調整を行いながら、データに基づく提案で確実に成果を出してきました。プロジェクトの成功率95%という実績が、この強みを証明しています。',
  appealPoints:
    '貴社が注力するDX推進領域において、私のコンサルティング経験・技術知識・ビジネス感覚を即戦力として活かせます。特に大手クライアントとの折衝経験と、成果にコミットするマインドセットが貢献できると考えています。',
};

const RESUME_FIELDS_DEFAULT: ResumeFields = {
  basicInfo:
    '氏名：山田 太郎（ヤマダ タロウ）\n生年月日：1990年1月15日（35歳）\n住所：東京都新宿区○○1-2-3\n電話：090-XXXX-XXXX\nメール：yamada@example.com',
  education:
    '2012年3月 ○○大学 経済学部 経済学科 卒業',
  workHistory:
    '2012年4月 株式会社○○コンサルティング 入社\n2015年4月 株式会社△△テクノロジー 入社（現在に至る）',
  certifications:
    '2018年6月 PMP（プロジェクトマネジメントプロフェッショナル）取得\n2020年10月 ITストラテジスト試験 合格\n英検準1級',
  motivation:
    '貴社のDX推進事業に強い関心を持ちました。前職ではITコンサルタントとして多くのデジタル変革プロジェクトを支援してきましたが、より深く事業に関わりたいという思いが強くなりました。貴社のコンサルタント→マネージャー→パートナーという明確なキャリアパスと、成果主義の評価制度に魅力を感じています。',
  wishes:
    '給与：650万円以上希望\n勤務地：東京・大阪（リモート可であれば地方も可）\n勤務形態：正社員希望',
};

function buildDocContent(f: DocFields): string {
  return `【職務要約】\n${f.summary}\n\n【職務経歴】\n${f.history}\n\n【活かせる経験】\n${f.usableExp}\n\n【保有スキル】\n${f.skills}\n\n【自己PR】\n${f.selfPR}\n\n【応募企業向けに強調するポイント】\n${f.appealPoints}`;
}

function buildResumeContent(f: ResumeFields): string {
  return `【基本情報】\n${f.basicInfo}\n\n【学歴】\n${f.education}\n\n【職歴】\n${f.workHistory}\n\n【資格】\n${f.certifications}\n\n【志望動機】\n${f.motivation}\n\n【本人希望欄】\n${f.wishes}`;
}

function DocumentCard({
  title,
  description,
  docKey,
  interviewDocuments,
  onSave,
  showToast,
  isResumeType,
}: {
  title: string;
  description: string;
  docKey: string;
  interviewDocuments: Record<string, InterviewDocument>;
  onSave: (key: string, content: string, status: DocStatus) => void;
  showToast: (msg: string) => void;
  isResumeType: boolean;
}) {
  const saved = interviewDocuments[docKey];
  const [expanded, setExpanded] = useState(false);
  const [docFields, setDocFields] = useState<DocFields>(DOC_FIELDS_DEFAULT);
  const [resumeFields, setResumeFields] = useState<ResumeFields>(RESUME_FIELDS_DEFAULT);

  const status: DocStatus = saved?.status ?? '未作成';
  const updatedAt = saved?.updatedAt;
  const currentContent = isResumeType ? buildResumeContent(resumeFields) : buildDocContent(docFields);

  const handleDocChange = (key: keyof DocFields, value: string) => {
    const next = { ...docFields, [key]: value };
    setDocFields(next);
    onSave(docKey, buildDocContent(next), '作成中');
  };

  const handleResumeChange = (key: keyof ResumeFields, value: string) => {
    const next = { ...resumeFields, [key]: value };
    setResumeFields(next);
    onSave(docKey, buildResumeContent(next), '作成中');
  };

  const handleComplete = () => {
    onSave(docKey, currentContent, '完成');
    showToast('ステータスを「完成」に変更しました');
  };

  const handlePrint = () => window.print();
  const handleWordExport = () => showToast('Word出力機能は準備中です');
  const handleGdocsCopy = () => {
    navigator.clipboard.writeText(currentContent).then(() => showToast('Googleドキュメント用にコピーしました'));
  };

  const docFieldDefs: { key: keyof DocFields; label: string; rows: number }[] = [
    { key: 'summary', label: '職務要約', rows: 4 },
    { key: 'history', label: '職務経歴', rows: 8 },
    { key: 'usableExp', label: '活かせる経験', rows: 5 },
    { key: 'skills', label: '保有スキル', rows: 4 },
    { key: 'selfPR', label: '自己PR', rows: 5 },
    { key: 'appealPoints', label: '応募企業向けに強調するポイント', rows: 4 },
  ];

  const resumeFieldDefs: { key: keyof ResumeFields; label: string; rows: number }[] = [
    { key: 'basicInfo', label: '基本情報', rows: 5 },
    { key: 'education', label: '学歴', rows: 3 },
    { key: 'workHistory', label: '職歴', rows: 4 },
    { key: 'certifications', label: '資格', rows: 3 },
    { key: 'motivation', label: '志望動機', rows: 5 },
    { key: 'wishes', label: '本人希望欄', rows: 3 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-slate-800">{title}</h3>
              <StatusBadge status={status} />
            </div>
            <p className="text-xs text-slate-500">{description}</p>
            {updatedAt && (
              <p className="text-xs text-slate-400 mt-1">最終更新：{new Date(updatedAt).toLocaleDateString('ja-JP')}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Edit3 size={12} />
            編集する
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <CopyBtn text={currentContent} label="プレビュー用コピー" />
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Printer size={12} />PDF出力
            </button>
            <button
              onClick={handleWordExport}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Word出力
            </button>
            <button
              onClick={handleGdocsCopy}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Copy size={12} />GDoc用コピー
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 p-5 space-y-4 bg-slate-50">
          {isResumeType
            ? resumeFieldDefs.map(({ key, label, rows }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">{label}</label>
                  <textarea
                    value={resumeFields[key]}
                    onChange={(e) => handleResumeChange(key, e.target.value)}
                    rows={rows}
                    className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-xl p-3 resize-none focus:outline-none focus:border-blue-400 leading-relaxed"
                  />
                </div>
              ))
            : docFieldDefs.map(({ key, label, rows }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">{label}</label>
                  <textarea
                    value={docFields[key]}
                    onChange={(e) => handleDocChange(key, e.target.value)}
                    rows={rows}
                    className="w-full text-sm text-slate-700 bg-white border border-slate-200 rounded-xl p-3 resize-none focus:outline-none focus:border-blue-400 leading-relaxed"
                  />
                </div>
              ))}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleComplete}
              className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-500 text-white px-3 py-2 rounded-xl hover:bg-emerald-600 transition-colors"
            >
              <Check size={12} />
              完成にする
            </button>
            <button
              onClick={() => setExpanded(false)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 px-3 py-2 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <X size={12} />
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentsSection({
  interviewDocuments,
  onSave,
  showToast,
}: {
  interviewDocuments: Record<string, InterviewDocument>;
  onSave: (key: string, content: string, status: DocStatus) => void;
  showToast: (msg: string) => void;
}) {
  return (
    <div className="space-y-4">
      <DocumentCard
        title="職務経歴書"
        description="これまでの職務経歴・スキル・実績をまとめた書類"
        docKey="workHistory"
        interviewDocuments={interviewDocuments}
        onSave={onSave}
        showToast={showToast}
        isResumeType={false}
      />
      <DocumentCard
        title="履歴書"
        description="基本情報・学歴・職歴・資格等を記載する書類"
        docKey="resume"
        interviewDocuments={interviewDocuments}
        onSave={onSave}
        showToast={showToast}
        isResumeType={true}
      />
    </div>
  );
}

// ── Tab 2: Common Prep ─────────────────────────────────────────────

const DUMMY_SELF_PR =
  '私の強みは課題解決力と調整力です。複数のステークホルダーが絡む大規模DXプロジェクトにおいて、関係者間の利害を調整しながら、データに基づく提案で確実に成果を出してきました。「プロジェクトを通じて何が残るか」を常に意識して行動しており、プロジェクト成功率95%という実績が、この強みを体現しています。新しい環境でもこの強みをフルに発揮し、早期に価値を出したいと考えています。';

const DUMMY_STRENGTHS: StrengthWeaknessItem[] = [
  { title: '課題解決力', basis: '複数のDXプロジェクトで実績。問題の本質を構造化し、解決策を実行してきた', episodeId: 'ep1', episodeTitle: '社会人：大規模DXプロジェクトリード' },
  { title: '調整力', basis: '多様なステークホルダーとの折衝経験。利害対立を乗り越えてプロジェクトを前進させた', episodeId: 'ep2', episodeTitle: '社会人：金融機関向け業務改革' },
  { title: '論理的思考力', basis: '課題を構造化して解決してきた経験。ロジックツリーやMECEで問題を整理するアプローチ' },
];

const DUMMY_WEAKNESSES: StrengthWeaknessItem[] = [
  { title: '完璧主義', basis: '品質を重視するあまり時間がかかる傾向。意識的に「完成」の基準を設定するよう取り組んでいる', episodeId: 'ep1', episodeTitle: '社会人：大規模DXプロジェクトリード' },
  { title: '権限委譲', basis: 'チームに任せることへの不安。1on1での育成に力を入れ、信頼関係を築いてから委任するよう改善中' },
  { title: '新環境適応', basis: '新しい環境への慣れに時間がかかる。入社後は積極的な情報収集・質問でキャッチアップを心がけている' },
];

const DUMMY_COMMON_QA: CommonQA[] = [
  {
    question: '自己紹介をしてください',
    answer: 'ITコンサルタントの山田太郎と申します。大学卒業後、コンサルティング会社に入社し、10年以上DX推進・業務改善プロジェクトに従事してきました。主に大手製造・金融業向けにデジタル変革を支援し、プロジェクト成功率95%という実績を積んできました。本日はよろしくお願いいたします。',
  },
  {
    question: '自己PRをしてください',
    answer: '私の強みは「課題解決力」と「調整力」の2点です。前職では複数のステークホルダーが絡む大規模プロジェクトを担当し、関係者間の利害調整を通じてプロジェクトを期限内に完遂してきました。特に金融機関向けプロジェクトでは、30%の工数削減という具体的な成果を出しました。この強みを貴社でも活かしたいと考えています。',
  },
  {
    question: '強みと弱みを教えてください',
    answer: '強みは「課題解決力」です。DXプロジェクトで培った、問題を構造化して解決策を実行する力が私の最大の強みです。\n\n弱みは「完璧主義」です。品質にこだわるあまり時間がかかってしまうことがあります。これを改善するため、事前に完成基準を明確に設定し、そのラインに達したら素早くリリースするよう意識しています。',
  },
  {
    question: 'これまで最も頑張ったことは何ですか？',
    answer: '前職での大手製造業向けDXプロジェクトのリードが最も頑張ったことです。20名以上の関係部門と半年間で合意形成を行い、新しい業務プロセスを導入しました。途中で大きな抵抗もありましたが、データで効果を示し、根気強く説明を重ねた結果、最終的に売上改善に15%貢献できました。',
  },
  {
    question: '挫折経験を教えてください',
    answer: '入社3年目に担当したプロジェクトで、クライアントの期待値と成果物のギャップが生じてしまい、プロジェクトが一時停止になった経験があります。原因を分析すると、要件定義段階でのヒアリングが不十分だったと気づきました。以来、プロジェクト開始前には関係者全員の認識を丁寧に確認するプロセスを必ず組み込むようにしています。',
  },
  {
    question: '今後のキャリアビジョンを教えてください',
    answer: '5年以内に、DX推進領域のリードコンサルタントとして、複数のプロジェクトを同時にマネジメントできるポジションを目指しています。さらに長期的には、自分自身の専門性を軸に、組織や企業の変革を支援するプロフェッショナルとして活躍したいと考えています。貴社のキャリアパスはそのビジョンの実現に最適な環境だと感じています。',
  },
];

function CommonPrepSection({
  commonPrep,
  onSaveCommon,
  showToast,
}: {
  commonPrep: CommonInterviewPrep;
  onSaveCommon: (p: CommonInterviewPrep) => void;
  showToast: (msg: string) => void;
}) {
  const [editingSwItems, setEditingSwItems] = useState(false);
  const [localSelfPR, setLocalSelfPR] = useState(commonPrep.selfPR);
  const [localStrengths, setLocalStrengths] = useState(commonPrep.strengths);
  const [localWeaknesses, setLocalWeaknesses] = useState(commonPrep.weaknesses);
  const [localQA, setLocalQA] = useState(commonPrep.commonQuestions);

  const saveSelfPR = () => {
    onSaveCommon({ ...commonPrep, selfPR: localSelfPR });
    showToast('自己PRを保存しました');
  };

  const saveStrengthsWeaknesses = () => {
    onSaveCommon({ ...commonPrep, strengths: localStrengths, weaknesses: localWeaknesses });
    setEditingSwItems(false);
    showToast('強み・弱みを保存しました');
  };

  const saveQA = () => {
    onSaveCommon({ ...commonPrep, commonQuestions: localQA });
    showToast('質問回答を保存しました');
  };

  return (
    <div className="space-y-4">
      {/* Self PR */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800">自己PR</h3>
          <CopyBtn text={localSelfPR} />
        </div>
        <textarea
          value={localSelfPR}
          onChange={(e) => setLocalSelfPR(e.target.value)}
          rows={6}
          className="w-full text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 resize-none focus:outline-none focus:border-blue-400 leading-relaxed"
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-slate-400">{localSelfPR.length}文字</p>
          <button
            onClick={saveSelfPR}
            className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Save size={12} />保存
          </button>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">強み・弱み</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setEditingSwItems((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
            >
              <Edit3 size={12} />
              {editingSwItems ? '編集終了' : '編集'}
            </button>
            {editingSwItems && (
              <button
                onClick={saveStrengthsWeaknesses}
                className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save size={11} />保存
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg px-3 py-1.5">強み</p>
          {localStrengths.map((item, i) => (
            <div key={i} className="border border-slate-100 rounded-xl p-3 space-y-2">
              {editingSwItems ? (
                <>
                  <input
                    value={item.title}
                    onChange={(e) => setLocalStrengths(localStrengths.map((s, idx) => idx === i ? { ...s, title: e.target.value } : s))}
                    className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400"
                    placeholder="タイトル"
                  />
                  <textarea
                    value={item.basis}
                    onChange={(e) => setLocalStrengths(localStrengths.map((s, idx) => idx === i ? { ...s, basis: e.target.value } : s))}
                    rows={2}
                    className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 resize-none focus:outline-none focus:border-blue-400"
                    placeholder="根拠・エピソード"
                  />
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-600">{item.basis}</p>
                  {item.episodeTitle && (
                    <p className="text-xs text-blue-600 underline cursor-pointer">📎 {item.episodeTitle}</p>
                  )}
                </>
              )}
            </div>
          ))}

          <p className="text-xs font-semibold text-rose-700 bg-rose-50 rounded-lg px-3 py-1.5 mt-3">弱み</p>
          {localWeaknesses.map((item, i) => (
            <div key={i} className="border border-slate-100 rounded-xl p-3 space-y-2">
              {editingSwItems ? (
                <>
                  <input
                    value={item.title}
                    onChange={(e) => setLocalWeaknesses(localWeaknesses.map((s, idx) => idx === i ? { ...s, title: e.target.value } : s))}
                    className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400"
                    placeholder="タイトル"
                  />
                  <textarea
                    value={item.basis}
                    onChange={(e) => setLocalWeaknesses(localWeaknesses.map((s, idx) => idx === i ? { ...s, basis: e.target.value } : s))}
                    rows={2}
                    className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 resize-none focus:outline-none focus:border-blue-400"
                    placeholder="根拠・エピソード"
                  />
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-600">{item.basis}</p>
                  {item.episodeTitle && (
                    <p className="text-xs text-blue-600 underline cursor-pointer">📎 {item.episodeTitle}</p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Common Q&A */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">よく聞かれる質問</h3>
          <button
            onClick={saveQA}
            className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Save size={12} />一括保存
          </button>
        </div>
        <div className="space-y-4">
          {localQA.map((qa, i) => (
            <div key={i} className="border border-slate-100 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-blue-700">Q{i + 1}. {qa.question}</p>
              <textarea
                value={qa.answer}
                onChange={(e) => setLocalQA(localQA.map((q, idx) => idx === i ? { ...q, answer: e.target.value } : q))}
                rows={4}
                className="w-full text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 resize-none focus:outline-none focus:border-blue-400 leading-relaxed"
              />
              <div className="flex justify-end">
                <CopyBtn text={qa.answer} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 3: Company Prep ────────────────────────────────────────────

function buildCompanyQA(companyName: string, jobTitle: string): CommonQA[] {
  return [
    {
      question: `なぜ${companyName}を志望するのですか？`,
      answer: `${companyName}を志望する最大の理由は、貴社がDX推進領域において業界随一の実績を持ち、私がこれまで培ってきたITコンサルティングの経験を最大限に活かせる環境だと感じたからです。特に成果報酬型のエンゲージメントモデルは、私の「正当な評価を受けたい」という価値観と一致しています。`,
    },
    {
      question: `なぜ「${jobTitle}」を希望するのですか？`,
      answer: `これまでの10年以上のコンサルティング経験を通じて、クライアントのDX推進を支援してきました。${jobTitle}というポジションは、私の専門性を直接活かしながら、さらに高いレベルの課題に挑戦できる機会だと感じています。また、マネージャーへのキャリアパスが明確に用意されている点も志望する理由です。`,
    },
    {
      question: `${companyName}でどのように貢献できますか？`,
      answer: `大手製造・金融・小売業向けのDXプロジェクトをリードしてきた実績をもとに、入社初日から即戦力として貢献できます。特にプロジェクト管理・ステークホルダー調整・要件定義から実装支援まで一気通貫で担える点が強みです。また、業界横断的な視点から、貴社の新規案件開拓にも貢献したいと考えています。`,
    },
    {
      question: 'これまでの経験をどう活かせますか？',
      answer: '10年超のITコンサルティング経験で培った「課題解決力」「調整力」「論理的思考力」を直接活かせます。特に複数ステークホルダーとの折衝経験と、DX・生成AI・RPA等のテクノロジー導入支援の実務経験は、貴社のクライアント向けプロジェクトでそのまま活用できます。',
    },
    {
      question: '入社後に挑戦したいことは何ですか？',
      answer: `入社後まずは既存クライアントのプロジェクトで成果を出し、${companyName}のメソドロジーと文化を深く理解することに注力します。その上で、生成AI活用支援という新しい領域でのサービス開発に貢献したいと考えています。3年以内にはプロジェクトマネージャーとして複数案件を担当できるようになることが目標です。`,
    },
    {
      question: `競合他社ではなく${companyName}を選ぶ理由は何ですか？`,
      answer: `他のコンサルティングファームと比較しても、${companyName}の特徴は「成果報酬型のエンゲージメント」と「明確なキャリアパス」にあります。成果を出すほど評価が上がる仕組みは私のモチベーションスタイルと一致しており、入社後のパフォーマンス発揮に最適な環境だと判断しました。`,
    },
  ];
}

function CompanyPrepSection({
  companyPrep,
  onSaveCompany,
  showToast,
  onTabChange,
}: {
  companyPrep: CompanyInterviewPrep;
  onSaveCompany: (p: CompanyInterviewPrep) => void;
  showToast: (msg: string) => void;
  onTabChange: (tab: TabId) => void;
}) {
  const companyInfo = storage.getSelectedCompanyInfo();
  const jobInfo = storage.getSelectedJobInfo();
  const company = companyInfo
    ? mockCompanies.find((c) => c.id === companyInfo.companyId) ?? mockCompanies[0]
    : mockCompanies[0];
  const jobTitle = jobInfo?.jobTitle ?? company.postings[0]?.title ?? 'ITコンサルタント（DX推進）';
  const jobId = jobInfo?.jobId ?? company.postings[0]?.id;

  const [localQA, setLocalQA] = useState<CommonQA[]>(() => {
    if (companyPrep.expectedQuestions.length > 0) return companyPrep.expectedQuestions;
    return buildCompanyQA(company.name, jobTitle);
  });

  const [selectedPracticeType, setSelectedPracticeType] = useState<PracticeType>('企業について');

  const PRACTICE_TYPES: PracticeType[] = ['企業について', '自分について', '社会情勢について', 'ケース面接', 'ランダム'];

  const saveQA = () => {
    onSaveCompany({ ...companyPrep, expectedQuestions: localQA, updatedAt: new Date().toISOString() });
    showToast('想定問答を保存しました');
  };

  const handleStartPractice = () => {
    storage.setInterviewPracticeMode({
      companyId: company.id,
      companyName: company.name,
      jobId,
      jobTitle,
      practiceType: selectedPracticeType,
    });
    onTabChange('chat');
  };

  const reverseQuestions = [
    '現在のDX推進チームの人数と体制を教えていただけますか？',
    'プロジェクトのキックオフから稼働まで、通常どのくらいの期間を想定していますか？',
    '入社後に最初に担当するプロジェクトはどのような案件が多いですか？',
    'マネージャー昇進の平均的な年数と、主な評価基準を教えてください。',
    '社内での生成AI活用の現状と、今後の展開について教えていただけますか？',
  ];

  const motivationElements = [
    '成果報酬型エンゲージメントモデルへの共感（正当評価への価値観一致）',
    '明確なキャリアパス（コンサルタント→マネージャー→パートナー）',
    'DX×生成AI支援という成長市場での専門性構築',
    'これまでのITコンサル経験の即戦力活用（課題解決力・調整力）',
    '大手クライアントとのプロジェクト経験を活かせる環境',
  ];

  return (
    <div className="space-y-4">
      {/* Expected Q&A */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">想定問答</h3>
          <button
            onClick={saveQA}
            className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Save size={12} />保存
          </button>
        </div>
        <div className="space-y-4">
          {localQA.map((qa, i) => (
            <div key={i} className="border border-slate-100 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-blue-700">Q{i + 1}. {qa.question}</p>
              <textarea
                value={qa.answer}
                onChange={(e) => setLocalQA(localQA.map((q, idx) => idx === i ? { ...q, answer: e.target.value } : q))}
                rows={4}
                className="w-full text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 resize-none focus:outline-none focus:border-blue-400 leading-relaxed"
              />
              <div className="flex justify-end">
                <CopyBtn text={qa.answer} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Company Analysis */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-800">企業分析</h3>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-600">企業概要</p>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-3">{company.businessSummary}</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-600">求める人物像</p>
          <ul className="space-y-1">
            {(company.postings[0]?.requirements ?? []).map((r, i) => (
              <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                <span className="text-blue-500 mt-0.5 flex-shrink-0">•</span>{r}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-emerald-700">自分とのマッチポイント</p>
          <ul className="space-y-1">
            {company.reasons.map((r, i) => (
              <li key={i} className="text-sm text-slate-700 flex items-start gap-2 bg-emerald-50 rounded-lg px-3 py-2">
                <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>{r}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-amber-700">注意すべきリスク</p>
          <ul className="space-y-1">
            {company.risks.map((r, i) => (
              <li key={i} className="text-sm text-slate-700 flex items-start gap-2 bg-amber-50 rounded-lg px-3 py-2">
                <span className="text-amber-500 mt-0.5 flex-shrink-0">⚠</span>{r}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-indigo-700">面接で聞くべき逆質問</p>
          <ul className="space-y-1">
            {reverseQuestions.map((q, i) => (
              <li key={i} className="text-sm text-slate-700 flex items-start gap-2 bg-indigo-50 rounded-lg px-3 py-2">
                <span className="text-indigo-500 mt-0.5 flex-shrink-0">?</span>{q}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-rose-700">志望動機に入れるべき要素</p>
          <ul className="space-y-1">
            {motivationElements.map((e, i) => (
              <li key={i} className="text-sm text-slate-700 flex items-start gap-2 bg-rose-50 rounded-lg px-3 py-2">
                <span className="text-rose-500 mt-0.5 flex-shrink-0">★</span>{e}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Practice */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-4">面談練習</h3>
        <p className="text-xs text-slate-500 mb-3">練習タイプを選択してAIとの面談練習を始めましょう</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {PRACTICE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedPracticeType(type)}
              className={cn(
                'text-xs font-medium px-3 py-2 rounded-xl border transition-colors',
                selectedPracticeType === type
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              )}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="bg-blue-50 rounded-xl p-4 mb-4">
          <p className="text-xs text-blue-700 font-semibold mb-1">選択中</p>
          <p className="text-sm text-slate-700">
            <span className="font-semibold">{company.name}</span>
            <span className="text-slate-500"> › {jobTitle}</span>
            <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{selectedPracticeType}</span>
          </p>
        </div>
        <button
          onClick={handleStartPractice}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold text-sm py-3 rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Mic size={16} />
          AIと面談練習を開始
          <Play size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Main InterviewPage ─────────────────────────────────────────────

const DEFAULT_COMMON_PREP: CommonInterviewPrep = {
  selfPR: DUMMY_SELF_PR,
  strengths: DUMMY_STRENGTHS,
  weaknesses: DUMMY_WEAKNESSES,
  commonQuestions: DUMMY_COMMON_QA,
};

function buildDefaultCompanyPrep(companyId: string, jobId?: string): CompanyInterviewPrep {
  return {
    companyId,
    jobId,
    motivation: '',
    expectedQuestions: [],
    companyAnalysis: '',
    appealPoints: '',
    updatedAt: new Date().toISOString(),
  };
}

const MAIN_TABS: { key: MainTab; label: string; icon: React.ReactNode }[] = [
  { key: 'documents', label: '書類関係', icon: <FileText size={14} /> },
  { key: 'common', label: '共通選考対策', icon: <User size={14} /> },
  { key: 'company', label: '企業別選考対策', icon: <Building2 size={14} /> },
];

interface InterviewPageProps {
  onTabChange: (tab: TabId) => void;
}

export function InterviewPage({ onTabChange }: InterviewPageProps) {
  // useApp is imported to ensure context is available; profile/extendedProfile
  // can be used here in the future to pre-fill fields.
  useApp();

  const [activeTab, setActiveTab] = useState<MainTab>('documents');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [interviewDocuments, setInterviewDocumentsState] = useState<Record<string, InterviewDocument>>({});
  const [commonPrep, setCommonPrepState] = useState<CommonInterviewPrep>(DEFAULT_COMMON_PREP);
  const [companyPrepMap, setCompanyPrepMapState] = useState<Record<string, CompanyInterviewPrep>>({});

  useEffect(() => {
    const docs = storage.getInterviewDocuments();
    if (Object.keys(docs).length > 0) setInterviewDocumentsState(docs);

    const cp = storage.getCommonInterviewPrep();
    if (cp) setCommonPrepState(cp);

    const cm = storage.getCompanyInterviewPrep();
    if (Object.keys(cm).length > 0) setCompanyPrepMapState(cm);
  }, []);

  const showToast = useCallback((msg: string) => setToastMsg(msg), []);

  const handleSaveDoc = useCallback((key: string, content: string, status: DocStatus) => {
    setInterviewDocumentsState((prev) => {
      const next: Record<string, InterviewDocument> = {
        ...prev,
        [key]: { content, status, updatedAt: new Date().toISOString() },
      };
      storage.setInterviewDocuments(next);
      return next;
    });
  }, []);

  const handleSaveCommon = useCallback((p: CommonInterviewPrep) => {
    setCommonPrepState(p);
    storage.setCommonInterviewPrep(p);
  }, []);

  const companyInfo = storage.getSelectedCompanyInfo();
  const jobInfo = storage.getSelectedJobInfo();
  const company = companyInfo
    ? mockCompanies.find((c) => c.id === companyInfo.companyId) ?? mockCompanies[0]
    : mockCompanies[0];
  const companyId = company.id;
  const jobId = jobInfo?.jobId ?? company.postings[0]?.id;

  const companyPrep = companyPrepMap[companyId] ?? buildDefaultCompanyPrep(companyId, jobId);

  const handleSaveCompany = useCallback((p: CompanyInterviewPrep) => {
    setCompanyPrepMapState((prev) => {
      const next = { ...prev, [companyId]: p };
      storage.setCompanyInterviewPrep(next);
      return next;
    });
  }, [companyId]);

  return (
    <div className="flex-1 overflow-y-auto pb-20 md:pb-0 bg-slate-50">
      {toastMsg && <Toast message={toastMsg} onDone={() => setToastMsg(null)} />}

      <div className="p-4 md:p-6 max-w-4xl">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-lg font-black text-slate-800">選考対策</h1>
          <p className="text-xs text-slate-500 mt-0.5">書類作成・面接準備・企業別対策を一元管理</p>
        </div>

        {/* Selected info bar */}
        <SelectedInfoBar />

        {/* Tab nav */}
        <div className="flex gap-1 mb-5">
          {MAIN_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors',
                activeTab === t.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              )}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'documents' && (
          <DocumentsSection
            interviewDocuments={interviewDocuments}
            onSave={handleSaveDoc}
            showToast={showToast}
          />
        )}
        {activeTab === 'common' && (
          <CommonPrepSection
            commonPrep={commonPrep}
            onSaveCommon={handleSaveCommon}
            showToast={showToast}
          />
        )}
        {activeTab === 'company' && (
          <CompanyPrepSection
            companyPrep={companyPrep}
            onSaveCompany={handleSaveCompany}
            showToast={showToast}
            onTabChange={onTabChange}
          />
        )}
      </div>
    </div>
  );
}
