import React, { useState, useRef, useEffect, useCallback } from "react";
import { Camera, QrCode, AlertCircle, RefreshCw, X, Keyboard, Flashlight, Volume2, VolumeX, SwitchCamera } from "lucide-react";

const SCAN_COOLDOWN_MS = 2500;

/**
 * Web Audio API Synthesizer & Haptic Vibration Feedback
 * Zero external audio files required — crystal clear 0ms latency.
 */
export const playScanSound = (type = "success", enabled = true) => {
  if (!enabled) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === "success") {
      // Pleasant Crystal Double Chime: D5 (587Hz) -> A5 (880Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === "warning") {
      // Warning Chord: 440Hz -> 349Hz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(349.23, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else {
      // Error Buzz: 180Hz Sawtooth
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {
    // Audio Context autoplay blocked
  }

  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      if (type === "success") {
        navigator.vibrate([70, 40, 70]);
      } else {
        navigator.vibrate([180, 80, 180]);
      }
    } catch {
      // Ignore vibration unsupported error
    }
  }
};

export default function QRScanner({
  onScan,
  onClose,
  title = "Scan Ticket QR Pass",
  scanMode = "CHECK_IN", // "CHECK_IN" | "CHECK_OUT"
  soundEnabled = true,
  onToggleSound,
}) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const [isStarting, setIsStarting] = useState(true);
  const [error, setError] = useState(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [lastScannedCode, setLastScannedCode] = useState(null);
  const [scanCount, setScanCount] = useState(0);
  const [manualCode, setManualCode] = useState("");
  const [mode, setMode] = useState("camera"); // "camera" | "manual"
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

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

  // Enumerate video cameras
  useEffect(() => {
    const listCameras = async () => {
      try {
        if (!navigator.mediaDevices?.enumerateDevices) return;
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === "videoinput");
        setCameras(videoInputs);
        if (videoInputs.length > 0 && !selectedCameraId) {
          // Prefer back/environment camera if named
          const backCam = videoInputs.find((c) =>
            /back|rear|environment/i.test(c.label)
          );
          setSelectedCameraId(backCam ? backCam.deviceId : videoInputs[0].deviceId);
        }
      } catch (err) {
        console.warn("Camera enumeration notice:", err);
      }
    };
    listCameras();
  }, []);

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
    setTorchOn(false);
    setTorchSupported(false);
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
        reader.timeBetweenDecodingAttempts = 250;

        // Smart constraints with fallback
        const constraints = {
          audio: false,
          video: selectedCameraId
            ? { deviceId: { exact: selectedCameraId } }
            : {
                facingMode: { ideal: "environment" },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
        };

        let controls;
        try {
          controls = await reader.decodeFromConstraints(
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
        } catch (firstErr) {
          // Fallback to basic video constraint if environment/resolution failed
          console.warn("Retrying with fallback video constraints:", firstErr);
          controls = await reader.decodeFromConstraints(
            { video: true, audio: false },
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
        }

        controlsRef.current = controls;

        // Check torch support
        if (videoRef.current?.srcObject) {
          const track = videoRef.current.srcObject.getVideoTracks()[0];
          if (track?.getCapabilities?.()?.torch) {
            setTorchSupported(true);
          }
        }

        setIsStarting(false);
      } catch (err) {
        console.error("Camera scanner error:", err);
        if (!cancelled) {
          setError("Unable to access video camera. Please verify browser permissions or switch to Manual Mode.");
          setIsStarting(false);
        }
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [mode, selectedCameraId, stopScanner]);

  // Flashlight toggle
  const toggleTorch = async () => {
    try {
      if (!videoRef.current?.srcObject) return;
      const track = videoRef.current.srcObject.getVideoTracks()[0];
      if (track?.applyConstraints) {
        await track.applyConstraints({
          advanced: [{ torch: !torchOn }],
        });
        setTorchOn(!torchOn);
      }
    } catch (e) {
      console.warn("Torch toggle failed:", e);
    }
  };

  // Switch camera toggle
  const handleSwitchCamera = () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex((c) => c.deviceId === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    stopScanner();
    setSelectedCameraId(cameras[nextIndex].deviceId);
  };

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
    <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-2xl space-y-4 max-w-lg mx-auto select-none">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl shadow-md shadow-cyan-500/20">
            <QrCode size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-white tracking-tight">{title}</h3>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                scanMode === "CHECK_OUT"
                  ? "bg-slate-800 text-slate-300 border border-slate-700"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}>
                {scanMode === "CHECK_OUT" ? "Exit Gate Mode" : "Entry Gate Mode"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Auto-Focus High Velocity Scanner</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Audio Sound Toggle */}
          {onToggleSound && (
            <button
              type="button"
              onClick={onToggleSound}
              title={soundEnabled ? "Mute Sound Feedback" : "Enable Sound Feedback"}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700 cursor-pointer"
            >
              {soundEnabled ? <Volume2 size={15} className="text-cyan-400" /> : <VolumeX size={15} className="text-slate-500" />}
            </button>
          )}

          {/* Flashlight button */}
          {torchSupported && mode === "camera" && (
            <button
              type="button"
              onClick={toggleTorch}
              title={torchOn ? "Turn Torch Off" : "Turn Torch On"}
              className={`p-2 rounded-xl transition border cursor-pointer ${
                torchOn
                  ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/30"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              }`}
            >
              <Flashlight size={15} />
            </button>
          )}

          {/* Camera Switcher */}
          {cameras.length > 1 && mode === "camera" && (
            <button
              type="button"
              onClick={handleSwitchCamera}
              title="Switch Camera Feed"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700 cursor-pointer"
            >
              <SwitchCamera size={15} />
            </button>
          )}

          {/* Mode Switch Button */}
          <button
            type="button"
            onClick={() => {
              stopScanner();
              setMode((prev) => (prev === "camera" ? "manual" : "camera"));
            }}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            {mode === "camera" ? <Keyboard size={13} /> : <Camera size={13} />}
            <span>{mode === "camera" ? "Manual / Gun" : "Camera Feed"}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl transition border-none bg-transparent cursor-pointer ml-1"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Main Viewport */}
      {mode === "camera" ? (
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 sm:aspect-video flex items-center justify-center border border-slate-800 shadow-inner">
          <video ref={videoRef} className="w-full h-full object-cover" />

          {/* Animated Target Scanning Frame Overlay */}
          {!isStarting && !error && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 border-2 border-cyan-400/80 rounded-3xl relative animate-pulse shadow-xl shadow-cyan-500/25">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-xl" />
                
                {/* Horizontal Laser Scanning Line */}
                <div className="absolute left-2 right-2 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400" />
              </div>
            </div>
          )}

          {isStarting && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <RefreshCw size={26} className="animate-spin text-cyan-400" />
              <span className="text-xs font-bold">Locking Camera Stream...</span>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 bg-slate-950 p-6 flex flex-col items-center justify-center text-center space-y-3 text-amber-400">
              <AlertCircle size={32} />
              <p className="text-xs font-semibold text-slate-300 max-w-xs">{error}</p>
              <button
                type="button"
                onClick={() => setMode("manual")}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs rounded-xl border-none cursor-pointer shadow-md"
              >
                Switch to Manual / USB Gun Mode
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Rapid Manual & Barcode Scanner Gun Input Mode */
        <form onSubmit={handleManualSubmit} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-300">
              Enter Pass Code / USB Barcode Gun Scan:
            </label>
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/60">
              Auto-Submit on Enter ↵
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. BME-TECH26-A1B2C3D4 or attendee email"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-black text-white outline-none focus:ring-2 focus:ring-cyan-400 uppercase placeholder:normal-case placeholder:font-sans placeholder:text-slate-500"
              autoFocus
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs rounded-xl border-none cursor-pointer shadow-md shadow-cyan-500/20"
            >
              Verify Pass
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            💡 <strong>Pro-Tip:</strong> Connect any handheld Bluetooth or USB barcode scanner gun — it will scan directly into this box automatically.
          </p>
        </form>
      )}

      {/* Footer Status Bar */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pt-1">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${cooldownRemaining > 0 ? "bg-amber-400 animate-pulse" : "bg-emerald-400 animate-ping"}`} />
          <span>Scanned: <strong className="text-white">{scanCount}</strong> passes</span>
          {cooldownRemaining > 0 && (
            <span className="text-[10px] text-amber-400 font-mono">
              (Cooling {Math.ceil(cooldownRemaining / 1000)}s)
            </span>
          )}
        </div>

        {lastScannedCode && (
          <div className="text-[11px] font-mono text-cyan-400 truncate max-w-[220px]">
            Last: <span className="font-bold">{lastScannedCode}</span>
          </div>
        )}
      </div>
    </div>
  );
}
