// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught error:', error, info);
    // tady můžeš přidat logování do externího servisu
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen p-4">
          <h1 className="text-3xl font-bold mb-2">Něco se pokazilo 😞</h1>
          <p className="mb-4">Omlouváme se, došlo k neočekávané chybě.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white py-2 px-4 rounded"
          >
            Načíst znovu
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
