import { Card } from '../common/Card';

export function IncidentSkeleton(): JSX.Element {
  return (
    <Card className="p-5 border-slate-700/50 animate-pulse">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="h-6 bg-slate-700/50 rounded w-2/3" />
        <div className="h-5 bg-slate-700/50 rounded-full w-16" />
      </div>

      <div className="space-y-3 mb-6">
        <div className="h-4 bg-slate-700/30 rounded w-1/3" />
        <div className="h-4 bg-slate-700/30 rounded w-1/4" />
      </div>

      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <div className="flex gap-4">
          <div className="h-4 bg-slate-700/50 rounded w-20" />
          <div className="h-4 bg-slate-700/50 rounded w-24" />
        </div>
      </div>
    </Card>
  );
}
