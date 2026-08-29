import type { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
};

export function Card({ className = '', interactive = false, ...props }: CardProps): JSX.Element {
  return (
    <div
      className={[
        'rounded-lg border border-slate-700/80 bg-slate-800/85 shadow-card',
        interactive
          ? 'transition hover:border-blue-500/60 hover:bg-slate-750 hover:shadow-card-hover'
          : '',
        className,
      ].join(' ')}
      {...props}
    />
  );
}
