import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { ReactNode } from 'react';

type ErrorStateProps = {
  action?: ReactNode;
  code?: string;
  description: string;
  title?: string;
};

export function ErrorState({ action, code, description, title = 'Something needs attention' }: ErrorStateProps): JSX.Element {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-red-500/25 bg-red-950/20 px-6 text-center">
      <ExclamationTriangleIcon className="mb-4 h-10 w-10 text-red-300" aria-hidden="true" />
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-red-100/75">{description}</p>
      {code ? <code className="mt-3 rounded bg-red-500/10 px-2 py-1 text-xs text-red-100">{code}</code> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
