import type { BlastRadiusHop } from '../../types/graph.types';
import { AffectedServiceCard } from './AffectedServiceCard';

interface HopGroupProps {
  hopData: BlastRadiusHop;
  isVisible: boolean;
}

export function HopGroup({ hopData, isVisible }: HopGroupProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-700/50" />
        <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-widest">
          Hop {hopData.hop}
        </span>
        <div className="h-px flex-1 bg-slate-700/50" />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x no-scrollbar">
        {hopData.services.map((service, idx) => (
          <div key={service.id} className="snap-start shrink-0">
            <AffectedServiceCard
              service={service}
              isVisible={isVisible}
              animationDelay={idx * 120}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
