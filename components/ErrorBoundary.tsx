import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6">
          <h1 className="text-2xl font-bold mb-4">کێشەیەک ڕوویدا</h1>
          <p className="text-slate-400 mb-2">هەڵە: {this.state.error?.message}</p>
          <p className="text-slate-400">تکایە پەڕەکە نوێ بکەرەوە (Refresh).</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-bold"
          >
            نوێکردنەوە
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
