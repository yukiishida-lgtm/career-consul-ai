'use client';

import { useState, useCallback } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Clock, Flag } from 'lucide-react';
import { storage } from '@/lib/storage';
import { cn } from '@/lib/utils';
import type { LifeTask, TaskHorizon, TaskStatus } from '@/types';

// ── Default data ───────────────────────────────────────────────────

const DEFAULT_TASKS: LifeTask[] = [
  { id: 't1', title: '転職活動を開始する',         horizon: 'short', status: 'doing', deadline: '2026-06-30', relatedGoal: 'キャリアチェンジ' },
  { id: 't2', 'title': 'TOEIC 800点取得',          horizon: 'short', status: 'todo',  deadline: '2026-09-30', relatedGoal: '英語力強化' },
  { id: 't3', title: '英語ビジネスレベルを習得',   horizon: 'mid',   status: 'todo',  deadline: '2027-03-31', relatedGoal: 'グローバル展開' },
  { id: 't4', title: 'マネージャー職に就く',        horizon: 'mid',   status: 'todo',  deadline: '2028-03-31', relatedGoal: 'キャリアアップ' },
  { id: 't5', title: '副業で月10万円達成',          horizon: 'mid',   status: 'doing', relatedGoal: '収入多角化' },
  { id: 't6', title: '独立・起業',                  horizon: 'long',  status: 'todo',  relatedGoal: '5年後のビジョン' },
  { id: 't7', title: '資産5000万円形成',            horizon: 'long',  status: 'todo',  relatedGoal: 'ファイナンシャル自由' },
];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

// ── Config ─────────────────────────────────────────────────────────

const HORIZON_CONFIG: Record<TaskHorizon, { label: string; labelShort: string; color: string; bg: string; border: string }> = {
  short: { label: '短期（〜1年）',  labelShort: '短期', color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  mid:   { label: '中期（1〜3年）', labelShort: '中期', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
  long:  { label: '長期（3年〜）',  labelShort: '長期', color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: typeof Circle }> = {
  todo:  { label: '未着手', icon: Circle },
  doing: { label: '進行中', icon: Clock },
  done:  { label: '完了',   icon: CheckCircle2 },
};

// ── Task Row ──────────────────────────────────────────────────────

function TaskRow({
  task, onUpdate, onDelete,
}: {
  task: LifeTask;
  onUpdate: (id: string, partial: Partial<LifeTask>) => void;
  onDelete: (id: string) => void;
}) {
  const h = HORIZON_CONFIG[task.horizon];
  const s = STATUS_CONFIG[task.status];
  const StatusIcon = s.icon;

  const cycleStatus = () => {
    const order: TaskStatus[] = ['todo', 'doing', 'done'];
    const next = order[(order.indexOf(task.status) + 1) % 3];
    onUpdate(task.id, { status: next });
  };

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-xl border transition-all group',
      task.status === 'done' ? 'bg-slate-50 border-slate-100 opacity-60' : `${h.bg} ${h.border}`
    )}>
      {/* Status toggle */}
      <button onClick={cycleStatus} className="flex-shrink-0">
        <StatusIcon
          size={18}
          className={cn(
            'transition-colors',
            task.status === 'done' ? 'text-emerald-500' :
            task.status === 'doing' ? 'text-blue-500' :
            'text-slate-300'
          )}
          fill={task.status === 'done' ? 'currentColor' : 'none'}
        />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={task.title}
          onChange={(e) => onUpdate(task.id, { title: e.target.value })}
          className={cn(
            'w-full text-sm font-semibold bg-transparent focus:outline-none',
            task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'
          )}
        />
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full', h.bg, h.color, h.border, 'border')}>
            {h.labelShort}
          </span>
          {task.deadline && (
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
              <Flag size={9} /> {task.deadline}
            </span>
          )}
          {task.relatedGoal && (
            <span className="text-[10px] text-slate-400 truncate">→ {task.relatedGoal}</span>
          )}
        </div>
      </div>

      {/* Status label */}
      <span className={cn(
        'text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0',
        task.status === 'done'  ? 'bg-emerald-100 text-emerald-700' :
        task.status === 'doing' ? 'bg-blue-100 text-blue-700' :
                                  'bg-slate-100 text-slate-500'
      )}>
        {s.label}
      </span>

      {/* Delete */}
      <button
        onClick={() => onDelete(task.id)}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ── Add Task Form ─────────────────────────────────────────────────

function AddTaskForm({ onAdd }: { onAdd: (t: LifeTask) => void }) {
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');
  const [horizon, setHorizon] = useState<TaskHorizon>('short');
  const [deadline, setDeadline] = useState('');
  const [goal, setGoal] = useState('');

  const submit = () => {
    if (!title.trim()) return;
    onAdd({ id: generateId(), title: title.trim(), horizon, status: 'todo', deadline: deadline || undefined, relatedGoal: goal || undefined });
    setTitle(''); setDeadline(''); setGoal('');
    setShow(false);
  };

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="w-full flex items-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors text-sm"
      >
        <Plus size={16} /> タスクを追加
      </button>
    );
  }

  return (
    <div className="bg-white border border-blue-200 rounded-xl p-4 space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="タスクタイトル"
        autoFocus
        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
      />
      <div className="flex gap-2 flex-wrap">
        {(Object.entries(HORIZON_CONFIG) as [TaskHorizon, typeof HORIZON_CONFIG.short][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setHorizon(key)}
            className={cn(
              'text-xs px-3 py-1 rounded-full border font-semibold transition-colors',
              horizon === key ? `${cfg.bg} ${cfg.color} ${cfg.border} border` : 'bg-white border-slate-200 text-slate-500'
            )}
          >
            {cfg.labelShort}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-400 text-slate-600"
        />
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="関連目標（任意）"
          className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-400"
        />
      </div>
      <div className="flex gap-2">
        <button onClick={submit} className="flex-1 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors">
          追加
        </button>
        <button onClick={() => setShow(false)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-200 transition-colors">
          キャンセル
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────

export function LifeTasksSection() {
  const saved = storage.getLifeTasks();
  const [tasks, setTasks] = useState<LifeTask[]>(saved.length > 0 ? saved : DEFAULT_TASKS);

  const saveTasks = useCallback((next: LifeTask[]) => {
    setTasks(next);
    storage.setLifeTasks(next);
  }, []);

  const updateTask = useCallback((id: string, partial: Partial<LifeTask>) => {
    saveTasks(tasks.map((t) => t.id === id ? { ...t, ...partial } : t));
  }, [tasks, saveTasks]);

  const deleteTask = useCallback((id: string) => {
    saveTasks(tasks.filter((t) => t.id !== id));
  }, [tasks, saveTasks]);

  const addTask = useCallback((t: LifeTask) => {
    saveTasks([...tasks, t]);
  }, [tasks, saveTasks]);

  const horizons: TaskHorizon[] = ['short', 'mid', 'long'];

  // Stats
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const doing = tasks.filter((t) => t.status === 'doing').length;

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '総タスク', value: total, color: 'text-slate-700' },
          { label: '進行中', value: doing, color: 'text-blue-600' },
          { label: '完了', value: done, color: 'text-emerald-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl p-3 border border-slate-100 text-center">
            <p className={cn('text-xl font-black', color)}>{value}</p>
            <p className="text-[10px] text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* 今やること (short, status !== done) */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <p className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse inline-block" />
          今やること
        </p>
        <div className="space-y-2">
          {tasks.filter((t) => t.horizon === 'short' && t.status !== 'done').length === 0 ? (
            <p className="text-xs text-blue-400 text-center py-2">短期タスクはすべて完了しています 🎉</p>
          ) : (
            tasks
              .filter((t) => t.horizon === 'short' && t.status !== 'done')
              .map((t) => (
                <TaskRow key={t.id} task={t} onUpdate={updateTask} onDelete={deleteTask} />
              ))
          )}
        </div>
      </div>

      {/* Grouped by horizon */}
      {horizons.map((h) => {
        const cfg = HORIZON_CONFIG[h];
        const grouped = tasks.filter((t) => t.horizon === h);
        return (
          <div key={h}>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn('text-xs font-bold', cfg.color)}>{cfg.label}</span>
              <span className="text-[10px] text-slate-400">({grouped.length}件)</span>
            </div>
            <div className="space-y-2">
              {grouped.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-3 bg-slate-50 rounded-xl">タスクがありません</p>
              ) : (
                grouped.map((t) => (
                  <TaskRow key={t.id} task={t} onUpdate={updateTask} onDelete={deleteTask} />
                ))
              )}
            </div>
          </div>
        );
      })}

      {/* Add task */}
      <AddTaskForm onAdd={addTask} />
    </div>
  );
}
