import type { ReactNode } from 'react';

type PageHeaderProps = {
  actions?: ReactNode;
  badge?: ReactNode;
  subtitle?: string;
  title: string;
};

export function PageHeader({ actions, badge, subtitle, title }: PageHeaderProps): JSX.Element {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="truncate text-2xl font-semibold tracking-normal text-white sm:text-3xl">{title}</h1>
          {badge}
        </div>
        {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
