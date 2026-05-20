import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary - Catches JavaScript errors anywhere in the child component tree
 * 
 * Prevents the entire app from crashing and shows a user-friendly error message
 * 
 * @example
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console (in production, send to error tracking service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
          <div className="max-w-md w-full glass border border-[#c9a96e]/20 rounded-2xl p-8 text-center">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <AlertTriangle size={32} className="text-red-400" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-['Cormorant_Garamond'] font-bold text-[#e8d5a3] mb-3">
              Nešto je pošlo po zlu
            </h1>

            {/* Description */}
            <p className="text-[#e8d5a3]/60 text-sm font-['Inter'] mb-6 leading-relaxed">
              Došlo je do neočekivane greške. Naš tim je obaviješten i radi na rješenju problema.
            </p>

            {/* Error Details (only in development) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-xs text-[#c9a96e] cursor-pointer hover:text-[#e8d5a3] mb-2">
                  Tehnički detalji (samo u development modu)
                </summary>
                <div className="bg-[#1a1a1a] border border-[#c9a96e]/10 rounded-lg p-3 text-xs text-[#e8d5a3]/50 font-mono overflow-auto max-h-40">
                  <p className="text-red-400 mb-2">{this.state.error.toString()}</p>
                  {this.state.errorInfo && (
                    <pre className="whitespace-pre-wrap text-[10px]">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-[#c9a96e] text-[#0a0a0a] px-6 py-3 rounded-xl text-sm font-bold tracking-wider uppercase hover:bg-[#e8d5a3] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Pokušaj ponovno
              </button>
              <a
                href="/"
                className="flex-1 bg-[#111111] text-[#e8d5a3] border border-[#c9a96e]/30 px-6 py-3 rounded-xl text-sm font-bold tracking-wider uppercase hover:bg-[#c9a96e]/10 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Home size={16} />
                Početna
              </a>
            </div>

            {/* Support */}
            <p className="mt-6 text-xs text-[#e8d5a3]/40 font-['Inter']">
              Ako problem i dalje postoji, kontaktirajte nas na{' '}
              <a href="mailto:info@dekantihr.com" className="text-[#c9a96e] hover:underline">
                info@dekantihr.com
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
