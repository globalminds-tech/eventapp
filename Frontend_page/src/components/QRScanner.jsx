import React, { useState, useRef, useEffect, useCallback } from "react";
import { Camera, QrCode, CheckCircle2, AlertCircle, RefreshCw, X, Keyboard, Sparkles } from "lucide-react";

const SCAN_COOLDOWN_MS = 3000;

export default function QRScanner({ onScan, onClose, title = "Scan Ticket QR Code" }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const [isStarting, setIsStarting] = useState(true);
  const [error, setError] = useState(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [lastScannedCode, setLastScannedCode] = useState(null);
  const [scanCount, setScanCount] = useState(0);
  const [manualCode, setManualCode] = useState("");
  const [mode, setMode] = useState("camera"); // "camera" | "manual"

  const lastScanTimeRef = useRef(0);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  // Cooldown countdown loop
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => Math.max(0, prev - 100));
    }, 100);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  // Stop scanner tracks cleanly
  const stopScanner = useCallback(() => {
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
      } catch (e) {
        console.warn("Scanner stop exception:", e);
      }
      controlsRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      try {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach((track) => track.stop());
      } catch (e) {
        console.warn("MediaStream stop exception:", e);
      }
      videoRef.current.srcObject = null;
    }
  }, []);

  // Initialize ZXing browser scanner
  useEffect(() => {
    if (mode !== "camera") return;
    let cancelled = false;

    const startScanner = async () => {
      setIsStarting(true);
      setError(null);

      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        if (cancelled) return;

        const reader = new BrowserMultiFormatReader();
        reader.timeBetweenDecodingAttempts = 300;

        const constraints = {
          audio: false,
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        };

        const controls = await reader.decodeFromConstraints(
          constraints,
          videoRef.current,
          (result) => {
            if (result && !cancelled) {
              const code = result.getText();
              const now = Date.now();
              if (now - lastScanTimeRef.current < SCAN_COOLDOWN_MS) return;

              lastScanTimeRef.current = now;
              setLastScannedCode(code);
              setScanCount((prev) => prev + 1);
              setCooldownRemaining(SCAN_COOLDOWN_MS);

              if (onScanRef.current) {
                onScanRef.current(code);
              }
            }
          }
        );

        controlsRef.current = controls;
        setIsStarting(false);
      } catch (err) {
        console.error("Camera scanner error:", err);
        if (!cancelled) {
          setError("Unable to access camera. Please check camera permissions or use manual entry mode.");
          setIsStarting(false);
        }
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [mode, stopScanner]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    const code = manualCode.trim();
    setLastScannedCode(code);
    setScanCount((prev) => prev + 1);
    setCooldownRemaining(SCAN_COOLDOWN_MS);
    if (onScanRef.current) {
      onScanRef.current(code);
    }
    setManualCode("");
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4 max-w-lg mx-auto select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
            <QrCode size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white tracking-tight">{title}</h3>
            <p className="text-[11px] text-slate-400 font-medium">Real-Time Gate Verification Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switch Button */}
          <button
            type="button"
            onClick={() => {
              stopScanner();
              setMode((prev) => (prev === "camera" ? "manual" : "camera"));
            }}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-slate-700 cursor-pointer"
          >
            {mode === "camera" ? <Keyboard size={13} /> : <Camera size={13} />}
            <span>{mode === "camera" ? "Manual Mode" : "Camera Mode"}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition border-none bg-transparent cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Main Viewport */}
      {mode === "camera" ? (
        <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800">
          <video ref={videoRef} className="w-full h-full object-cover" />

          {/* Animated Target Scanning Frame Overlay */}
          {!isStarting && !error && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-cyan-400/80 rounded-2xl relative animate-pulse shadow-lg shadow-cyan-500/20">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-cyan-400 rounded-br-lg" />
              </div>
            </div>
          )}

          {isStarting && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center space-y-2 text-slate-400">
              <RefreshCw size={24} className="animate-spin text-cyan-400" />
              <span className="text-xs font-semibold">Initializing Camera Feed...</span>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 bg-slate-950 p-4 flex flex-col items-center justify-center text-center space-y-2 text-amber-400">
              <AlertCircle size={28} />
              <p className="text-xs font-semibold text-slate-300">{error}</p>
              <button
                type="button"
                onClick={() => setMode("manual")}
                className="mt-2 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs rounded-xl border-none cursor-pointer"
              >
                Switch to Manual Entry
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Manual Code Entry Form */
        <form onSubmit={handleManualSubmit} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <label className="block text-xs font-bold text-slate-300">
            Enter Ticket Barcode / Registration Code:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. TKT-904281 OR REG-8821"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold text-white outline-none focus:ring-1 focus:ring-cyan-400"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl border-none cursor-pointer"
            >
              Verify Code
            </button>
          </div>
        </form>
      )}

      {/* Footer Status Bar */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pt-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Scanned: <strong className="text-white">{scanCount}</strong> codes</span>
        </div>

        {lastScannedCode && (
          <div className="text-[11px] font-mono text-cyan-400 truncate max-w-[200px]">
            Last: {lastScannedCode}
          </div>
        )}
      </div>
    </div>
  );
}
