type SpinnerProps = {
  label?: string;
};

export function Spinner({ label = 'Loading' }: SpinnerProps): JSX.Element {
  return (
    <div className="inline-flex items-center gap-3 text-sm text-slate-300">
      <svg className="h-5 w-5 animate-spin text-blue-500" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
      </svg>
      <span>{label}</span>
    </div>
  );
}
