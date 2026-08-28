import type { ReactNode } from 'react';

type BadgeColor = 'slate' | 'blue' | 'red' | 'amber' | 'emerald';
type BadgeSize = 'sm' | 'md';

type BadgeProps = {
  children: ReactNode;
  color?: BadgeColor;
  dot?: boolean;
  dotAnimate?: boolean;
  size?: BadgeSize;
};

const colorClasses: Record<BadgeColor, string> = {
  slate: 'border-slate-600/70 bg-slate-700/60 text-slate-200',
  blue: 'border-blue-500/35 bg-blue-500/12 text-blue-100',
  red: 'border-red-500/35 bg-red-500/12 text-red-100',
  amber: 'border-amber-500/35 bg-amber-500/12 text-amber-100',
  emerald: 'border-emerald-500/35 bg-emerald-500/12 text-emerald-100',
};

const dotClasses: Record<BadgeColor, string> = {
  slate: 'bg-slate-300',
  blue: 'bg-blue-400',
  red: 'bg-red-400',
  amber: 'bg-amber-400',
  emerald: 'bg-emerald-400',
};

export function Badge({ children, color = 'slate', dot = false, dotAnimate = false, size = 'md' }: BadgeProps): JSX.Element {
  return (
    <span
      className={[
        'inline-flex max-w-full items-center gap-1.5 rounded-full border font-medium',
        colorClasses[color],
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
      ].join(' ')}
    >
      {dot ? <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[color]} ${dotAnimate ? 'animate-pulse' : ''}`} /> : null}
      <span className="truncate">{children}</span>
    </span>
  );
}
