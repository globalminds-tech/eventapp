import React from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] Uncaught application error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-slate-50 via-[#f8fafc] to-slate-100 text-slate-900 p-4 font-sans select-none relative overflow-hidden">
          {/* Ambient background glow */}
          <div className="absolute w-96 h-96 bg-amber-200/20 rounded-full blur-3xl -top-12 -left-12 pointer-events-none" />
          <div className="absolute w-96 h-96 bg-rose-200/20 rounded-full blur-3xl -bottom-12 -right-12 pointer-events-none" />

          <div className="relative z-10 max-w-md w-full rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-md p-8 shadow-2xl shadow-slate-200/60 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
              <AlertTriangle size={30} />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Something went wrong</h2>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                An unexpected component rendering error occurred. You can retry loading this section or safely return to the dashboard.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200/80 text-left font-mono text-[11px] text-rose-700 truncate max-h-24 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:brightness-105 text-white font-extrabold text-xs shadow-md shadow-cyan-500/25 transition cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Retry Loading</span>
              </button>

              <a
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs border border-slate-200 transition"
              >
                <Home size={14} />
                <span>Go Home</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
