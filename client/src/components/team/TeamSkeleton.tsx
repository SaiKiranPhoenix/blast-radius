import { Card } from '../common/Card';

export function TeamSkeleton(): JSX.Element {
  return (
    <Card className="h-full flex flex-col p-5 border-slate-700/50 animate-pulse">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="h-6 bg-slate-700/50 rounded w-1/2" />
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-700/30 rounded shrink-0" />
          <div className="h-4 bg-slate-700/30 rounded w-1/3" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-700/30 rounded shrink-0" />
          <div className="h-4 bg-slate-700/30 rounded w-1/4" />
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-700/50 rounded shrink-0" />
          <div className="h-4 bg-slate-700/50 rounded w-20" />
        </div>
      </div>
    </Card>
  );
}
