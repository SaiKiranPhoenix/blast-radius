import { useDependencies } from '../../hooks/useServices';
import { UpstreamList } from './UpstreamList';
import { DownstreamList } from './DownstreamList';
import { Spinner } from '../common/Spinner';
import { ErrorState } from '../common/ErrorState';

interface DependencyExplorerProps {
  serviceId: string;
}

export function DependencyExplorer({ serviceId }: DependencyExplorerProps) {
  const { data, isLoading, error, refetch } = useDependencies(serviceId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 bg-slate-900/50 rounded-xl border border-slate-800">
        <Spinner />
      </div>
    );
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Failed to load dependencies"
        description="Could not fetch the dependency graph for this service."
        action={
          <button
            type="button"
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400"
            onClick={() => void refetch()}
          >
            Try again
          </button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full max-h-[800px]">
      <UpstreamList services={data.upstream} />
      <DownstreamList services={data.downstream} />
    </div>
  );
}
