import type { ComponentType, ReactNode, SVGProps } from 'react';

type EmptyStateProps = {
  action?: ReactNode;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
};

export function EmptyState({ action, description, icon: Icon, title }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/60 px-6 text-center">
      <Icon className="mb-4 h-10 w-10 text-slate-500" aria-hidden="true" />
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
