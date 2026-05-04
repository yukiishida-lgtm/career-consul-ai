'use client';

import { cn } from '@/lib/utils';

export function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-medium text-slate-600 mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300',
        props.className
      )}
    />
  );
}

export function Select({
  children,
  value,
  onChange,
  className,
}: {
  children: React.ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}) {
  return (
    <select
      value={value ?? ''}
      onChange={onChange}
      className={cn(
        'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 appearance-none cursor-pointer',
        className
      )}
    >
      {children}
    </select>
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 resize-none',
        props.className
      )}
    />
  );
}

export function RadioGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  optional,
}: {
  label: string;
  options: T[];
  value?: T;
  onChange: (v: T) => void;
  optional?: boolean;
}) {
  return (
    <div className="mb-4">
      <Label>{label}{optional && <span className="text-slate-400 ml-1 text-xs font-normal">（任意）</span>}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-sm border transition-colors',
              value === opt
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Field({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-bold text-slate-700 mb-4 pb-2 border-b border-slate-100">{children}</h3>;
}
