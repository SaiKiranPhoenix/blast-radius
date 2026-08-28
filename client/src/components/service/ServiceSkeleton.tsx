import { Card } from '../common/Card';

interface ServiceSkeletonProps {
  variant?: 'default' | 'compact' | 'affected';
  className?: string;
}

export function ServiceSkeleton({ variant = 'default', className = '' }: ServiceSkeletonProps) {
  const isCompact = variant === 'compact' || variant === 'affected';

  return (
    <Card className={`animate-pulse flex flex-col gap-3 ${isCompact ? 'p-3' : 'p-4'} ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className={`bg-slate-700/50 rounded ${isCompact ? 'h-4 w-3/4' : 'h-5 w-2/3'}`} />
          <div className="bg-slate-700/30 rounded h-3 w-1/2 mt-2" />
        </div>
        {!isCompact && (
          <div className="bg-slate-700/50 rounded h-5 w-16 shrink-0" />
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-700/50">
        <div className="bg-slate-700/50 rounded h-6 w-20" />
        
        <div className="flex items-center gap-3">
          <div className="bg-slate-700/30 rounded h-4 w-8" />
          <div className="bg-slate-700/30 rounded h-4 w-8" />
        </div>
      </div>
    </Card>
  );
}
