import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from './ErrorState';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error(error, info);
    }
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-slate-950 p-6">
          <ErrorState
            code={this.state.error.name}
            description="The interface hit an unexpected state. Refreshing should bring it back."
            title="The page stopped rendering"
          />
        </div>
      );
    }

    return this.props.children;
  }
}
