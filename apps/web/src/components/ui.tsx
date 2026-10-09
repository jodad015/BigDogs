import { useState, type ReactNode } from 'react';
import { Check, Copy, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { avatarSrc } from '@/lib/avatars';

export const inputClass =
  'w-full rounded-lg border border-border bg-input px-3 py-2 text-sm placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-ring';

export const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50';

export const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-50';

export const dangerButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50';

export function PageSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export function Page({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-4 pb-8">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">{title}</h1>
        {action}
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('rounded-xl bg-card', className)}>{children}</div>;
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <p className="text-sm text-destructive">{children}</p>;
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return <img src={avatarSrc(name)} alt="" className={cn('h-9 w-9 shrink-0 rounded-full', className)} />;
}

export function Badge({ tone = 'muted', children }: { tone?: 'muted' | 'primary'; children: ReactNode }) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[11px] font-semibold',
        tone === 'primary' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
      )}
    >
      {children}
    </span>
  );
}

export function CopyButton({ text, label = 'Copy link' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt('Copy this link', text);
    }
  };

  return (
    <button type="button" onClick={copy} className={secondaryButtonClass}>
      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Copied' : label}
    </button>
  );
}
