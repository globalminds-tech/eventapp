import React, { useState, useEffect, useRef } from "react";
import { WifiOff, Wifi, AlertTriangle, ShieldAlert, X } from "lucide-react";

/**
 * Global Network Status & Latency Watcher Component
 * Monitors:
 * 1. Physical offline / online events
 * 2. W3C Network Information API (2G / high RTT slow connection)
 * 3. Prolonged API request delays (> 4000ms)
 * 4. HTTP 429 Rate Limiting cooldown alerts
 */
export default function NetworkStatusWatcher() {
  const [status, setStatus] = useState({
    isOffline: !navigator.onLine,
    isSlow: false,
    rateLimitMsg: null,
    slowRequestMsg: null,
  });
  const [visible, setVisible] = useState(!navigator.onLine);
  const [toastType, setToastType] = useState(!navigator.onLine ? "offline" : null); // "offline" | "online" | "slow" | "ratelimit"
  const timerRef = useRef(null);

  // Monitor Offline & Online events
  useEffect(() => {
    const handleOnline = () => {
      setStatus((prev) => ({ ...prev, isOffline: false }));
      setToastType("online");
      setVisible(true);

      // Auto-dismiss "Back Online" message after 3.5 seconds
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setToastType(null);
      }, 3500);
    };

    const handleOffline = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setStatus((prev) => ({ ...prev, isOffline: true }));
      setToastType("offline");
      setVisible(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Network Information API for 2G / high RTT
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const checkConnectionQuality = () => {
      if (!conn) return;
      const isSlow =
        conn.effectiveType === "slow-2g" ||
        conn.effectiveType === "2g" ||
        (conn.rtt && conn.rtt > 1500);

      setStatus((prev) => ({ ...prev, isSlow }));
      if (isSlow && navigator.onLine) {
        setToastType("slow");
        setVisible(true);
      }
    };

    if (conn) {
      checkConnectionQuality();
      conn.addEventListener("change", checkConnectionQuality);
    }

    // Custom API Interceptor Events
    const handleSlowRequest = (e) => {
      if (!navigator.onLine) return;
      const msg = e.detail?.message || "Server response is taking longer than usual...";
      setStatus((prev) => ({ ...prev, slowRequestMsg: msg }));
      setToastType("slow");
      setVisible(true);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setVisible(false);
      }, 5000);
    };

    const handleRateLimit = (e) => {
      const retryAfter = e.detail?.retry_after || 60;
      const msg = e.detail?.detail || `Rate limit reached. Please wait ${retryAfter}s before retrying.`;
      setStatus((prev) => ({ ...prev, rateLimitMsg: msg }));
      setToastType("ratelimit");
      setVisible(true);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setVisible(false);
      }, Math.min(retryAfter * 1000, 8000));
    };

    window.addEventListener("network:slow-request", handleSlowRequest);
    window.addEventListener("network:rate-limited", handleRateLimit);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (conn) conn.removeEventListener("change", checkConnectionQuality);
      window.removeEventListener("network:slow-request", handleSlowRequest);
      window.removeEventListener("network:rate-limited", handleRateLimit);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible || !toastType) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-6 right-6 z-[99999] max-w-md w-full px-4 pointer-events-auto transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-5"
    >
      {toastType === "offline" && (
        <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-900/95 border border-rose-500/40 text-rose-100 shadow-2xl shadow-rose-950/50 backdrop-blur-md">
          <div className="p-2 rounded-lg bg-rose-500/15 text-rose-400 shrink-0">
            <WifiOff className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 text-sm">
            <h4 className="font-semibold text-white">You are offline</h4>
            <p className="mt-0.5 text-xs text-rose-200/80 leading-relaxed">
              Check your internet connection. Pending changes will sync once connection is restored.
            </p>
          </div>
          <button
            onClick={() => setVisible(false)}
            aria-label="Dismiss offline alert"
            className="p-1 text-rose-300/70 hover:text-white rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {toastType === "online" && (
        <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-900/95 border border-emerald-500/40 text-emerald-100 shadow-2xl shadow-emerald-950/50 backdrop-blur-md">
          <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
            <Wifi className="w-5 h-5" />
          </div>
          <div className="flex-1 text-sm">
            <h4 className="font-semibold text-white">Connection Restored</h4>
            <p className="mt-0.5 text-xs text-emerald-200/80 leading-relaxed">
              You are back online. All operations are running normally.
            </p>
          </div>
          <button
            onClick={() => setVisible(false)}
            aria-label="Dismiss online alert"
            className="p-1 text-emerald-300/70 hover:text-white rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {toastType === "slow" && (
        <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-900/95 border border-amber-500/40 text-amber-100 shadow-2xl shadow-amber-950/50 backdrop-blur-md">
          <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 text-sm">
            <h4 className="font-semibold text-white">Slow Network Detected</h4>
            <p className="mt-0.5 text-xs text-amber-200/80 leading-relaxed">
              {status.slowRequestMsg || "Your network connection is sluggish. Requests may take extra moments."}
            </p>
          </div>
          <button
            onClick={() => setVisible(false)}
            aria-label="Dismiss slow network alert"
            className="p-1 text-amber-300/70 hover:text-white rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {toastType === "ratelimit" && (
        <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-900/95 border border-cyan-500/40 text-cyan-100 shadow-2xl shadow-cyan-950/50 backdrop-blur-md">
          <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex-1 text-sm">
            <h4 className="font-semibold text-white">Too Many Requests</h4>
            <p className="mt-0.5 text-xs text-cyan-200/90 leading-relaxed">
              {status.rateLimitMsg || "Rate limit exceeded. Please wait a few moments before trying again."}
            </p>
          </div>
          <button
            onClick={() => setVisible(false)}
            aria-label="Dismiss rate limit alert"
            className="p-1 text-cyan-300/70 hover:text-white rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
