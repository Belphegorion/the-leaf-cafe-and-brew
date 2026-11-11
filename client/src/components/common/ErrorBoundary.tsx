import { Component, type ErrorInfo, type ReactNode } from 'react';
import { MonolineIcon } from '../brand/MonolineIcon';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <main
          id="main-content"
          className="min-h-[70dvh] flex items-center justify-center p-6 bg-[#F5EFE4] dark:bg-[#101C13] text-[#1F2A22] dark:text-[#EDE3D1]"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-md w-full text-center bg-white dark:bg-[#1F3A24] p-8 rounded-3xl border border-[#E0D2B8] dark:border-[#284A2D] shadow-xl">
            <div className="w-16 h-16 rounded-full bg-[#EDE3D1] dark:bg-[#142318] text-[#325736] dark:text-[#A3C2A5] mx-auto flex items-center justify-center mb-4">
              <MonolineIcon name="leaf" size={32} />
            </div>
            <h1 className="font-display text-2xl uppercase tracking-wider font-bold mb-2">
              {this.props.fallbackTitle || 'A Gentle Pause in the Sanctuary'}
            </h1>
            <p className="text-xs text-[#4A5A4E] dark:text-[#C9DCC9] mb-6 leading-relaxed">
              {this.props.fallbackMessage ||
                'Something unexpected occurred while crafting this page. Refreshing will restore our serene cafe experience.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto rounded-full bg-[#325736] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md hover:bg-[#284A2D] transition-colors"
              >
                Refresh Sanctuary
              </button>
              <a
                href="/"
                className="w-full sm:w-auto rounded-full border border-[#325736] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#325736] dark:text-[#A3C2A5] hover:bg-[#EDE3D1] transition-colors"
              >
                Return Home
              </a>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
