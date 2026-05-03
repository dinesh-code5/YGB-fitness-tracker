import React, { useState, useEffect, useRef } from 'react';
import { FiPause, FiPlay, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

// ── Audio Alarm ────────────────────────────────────────────
let sharedAudioCtx = null;

function getAudioContext() {
  if (!sharedAudioCtx) {
    sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return sharedAudioCtx;
}

function playAlarm() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    [[880,0,0.15],[880,0.18,0.15],[1100,0.36,0.3]].forEach(([f,s,d]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = f; o.type = 'sine';
      g.gain.setValueAtTime(0, ctx.currentTime + s);
      g.gain.linearRampToValueAtTime(0.4, ctx.currentTime + s + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + s + d);
      o.start(ctx.currentTime + s);
      o.stop(ctx.currentTime + s + d + 0.1);
    });
  } catch (e) {
    console.error('Audio alarm failed:', e);
  }
}

export default function LiquidRestTimer({ duration, isActive, startTime, onComplete, onClose }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  
  const timerRef = useRef(null);

  // Sync with prop changes
  useEffect(() => {
    if (isActive) {
      setTimeLeft(duration);
      setIsPaused(false);
      
      // Try to "prime" audio context when timer becomes active
      // This is often within a user gesture call stack (e.g. clicking "Done")
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    }
  }, [duration, startTime, isActive]);

  useEffect(() => {
    if (!isActive || isPaused) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          playAlarm();
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isActive, isPaused]);

  const togglePause = () => {
    getAudioContext().resume().catch(() => {});
    setIsPaused(!isPaused);
  };

  const adjustTime = (s) => {
    getAudioContext().resume().catch(() => {});
    setTimeLeft(prev => Math.max(0, prev + s));
  };

  const progress = ((duration - timeLeft) / duration) * 100;

  const getColor = () => {
    if (progress < 40) return 'bg-brand';
    if (progress < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!isActive) return null;

  return (
    <div className="sticky top-0 z-[40] w-full py-2 pointer-events-none mb-6">
      <div className="relative w-full h-20 bg-[var(--surface-card)] border border-brand shadow-glow rounded-2xl overflow-hidden flex items-center px-6 pointer-events-auto backdrop-blur-md">
        {/* Horizontal Fill Animation (Left to Right) */}
        <div 
          className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-linear ${getColor()} opacity-20`}
          style={{ width: `${progress}%` }}
        />

        {/* Glow Overlay */}
        <div className={`absolute inset-0 opacity-10 bg-gradient-to-r from-[var(--brand)] to-transparent`} />

        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <span className="font-display text-4xl font-bold tabular-nums text-[var(--text-primary)]">
              {timeLeft}
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">Resting</span>
              <span className="text-xs font-bold text-[var(--brand)] uppercase">Seconds Left</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => adjustTime(-15)} className="px-3 py-2 text-[10px] font-black uppercase bg-[var(--surface-elevated)] hover:bg-[var(--surface-border)] text-[var(--text-primary)] rounded-xl border border-[var(--surface-border)] transition-all">-15s</button>
            <button onClick={() => adjustTime(15)} className="px-3 py-2 text-[10px] font-black uppercase bg-[var(--surface-elevated)] hover:bg-[var(--surface-border)] text-[var(--text-primary)] rounded-xl border border-[var(--surface-border)] transition-all">+15s</button>
            <button onClick={togglePause} className="p-3 bg-[var(--surface-elevated)] rounded-xl hover:bg-[var(--surface-border)]">
              {isPaused ? <FiPlay className="text-brand" /> : <FiPause className="text-muted" />}
            </button>
            <button onClick={onClose} className="p-3 bg-[var(--surface-elevated)] rounded-xl hover:bg-red-500/20">
              <FiX className="text-muted hover:text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
