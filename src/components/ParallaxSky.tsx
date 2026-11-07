import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MoonPhase } from '../types';
import { sound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { sparkles } from '../utils/sparkles';

interface ParallaxSkyProps {
  isDawn: boolean;
  onMoonTap7: () => void;
  onCometCatch: () => void;
  onHiddenStarTap: () => void;
  onMoonChangePhase: (phase: MoonPhase) => void;
}

const PHASES: { phase: MoonPhase; name: string }[] = [
  { phase: 'full', name: 'Full Moon' },
  { phase: 'waning_gibbous', name: 'Waning Gibbous' },
  { phase: 'third_quarter', name: 'Third Quarter' },
  { phase: 'waning_crescent', name: 'Waning Crescent' },
  { phase: 'new', name: 'New Moon' },
  { phase: 'waxing_crescent', name: 'Waxing Crescent' },
  { phase: 'first_quarter', name: 'First Quarter' },
  { phase: 'waxing_gibbous', name: 'Waxing Gibbous' },
];

export const ParallaxSky: React.FC<ParallaxSkyProps> = ({
  isDawn,
  onMoonTap7,
  onCometCatch,
  onHiddenStarTap,
  onMoonChangePhase,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const [moonTapCount, setMoonTapCount] = useState<number>(0);
  const [cometActive, setCometActive] = useState<boolean>(false);
  const [cometKey, setCometKey] = useState<number>(0);
  const [hiddenStarFound, setHiddenStarFound] = useState<boolean>(false);
  const [moonFeedback, setMoonFeedback] = useState<string | null>(null);

  // Canvas starfield animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate layered stars
    const starCount = Math.min(140, Math.floor((width * height) / 8000));
    const stars: {
      x: number;
      y: number;
      size: number;
      baseAlpha: number;
      speed: number;
      twinkleSpeed: number;
      color: string;
      phase: number;
    }[] = [];

    const starColors = ['#FFFFFF', '#F0F6FC', '#E0F2FE', '#00F0FF', '#FDE047'];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() < 0.85 ? 0.8 + Math.random() * 1.4 : 2.0 + Math.random() * 1.5,
        baseAlpha: 0.2 + Math.random() * 0.7,
        speed: 0.05 + Math.random() * 0.15,
        twinkleSpeed: 0.015 + Math.random() * 0.035,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        phase: Math.random() * Math.PI * 2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle nebula gradient blobs
      if (!isDawn) {
        const grad1 = ctx.createRadialGradient(width * 0.2, height * 0.3, 20, width * 0.2, height * 0.3, width * 0.5);
        grad1.addColorStop(0, 'rgba(0, 240, 255, 0.045)');
        grad1.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.fillStyle = grad1;
        ctx.fillRect(0, 0, width, height);

        const grad2 = ctx.createRadialGradient(width * 0.8, height * 0.7, 40, width * 0.8, height * 0.7, width * 0.45);
        grad2.addColorStop(0, 'rgba(245, 197, 66, 0.035)');
        grad2.addColorStop(1, 'rgba(245, 197, 66, 0)');
        ctx.fillStyle = grad2;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw stars
      for (const s of stars) {
        s.y -= s.speed;
        if (s.y < 0) {
          s.y = height;
          s.x = Math.random() * width;
        }

        s.phase += s.twinkleSpeed;
        const currentAlpha = isDawn
          ? s.baseAlpha * 0.4 * (0.6 + 0.4 * Math.sin(s.phase))
          : s.baseAlpha * (0.6 + 0.4 * Math.sin(s.phase));

        ctx.fillStyle = s.color;
        ctx.globalAlpha = Math.max(0.1, currentAlpha);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();

        // Cross sparkle for larger stars
        if (s.size > 2.2 && !isDawn) {
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(s.x - s.size * 2, s.y);
          ctx.lineTo(s.x + s.size * 2, s.y);
          ctx.moveTo(s.x, s.y - s.size * 2);
          ctx.lineTo(s.x, s.y + s.size * 2);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [isDawn]);

  // Hidden comet trigger every 20 seconds
  useEffect(() => {
    const cometInterval = setInterval(() => {
      setCometActive(true);
      setCometKey((prev) => prev + 1);

      // Auto-hide after 3.8s flight
      setTimeout(() => {
        setCometActive(false);
      }, 3800);
    }, 20000);

    return () => clearInterval(cometInterval);
  }, []);

  // Moon tap interaction
  const handleMoonTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

      sound.playMoonBell();
      triggerHaptic(40);
      sparkles.burst(clientX, clientY, 14);

      const nextIndex = (phaseIndex + 1) % PHASES.length;
      setPhaseIndex(nextIndex);
      onMoonChangePhase(PHASES[nextIndex].phase);

      const newCount = moonTapCount + 1;
      setMoonTapCount(newCount);

      setMoonFeedback(PHASES[nextIndex].name);
      setTimeout(() => setMoonFeedback(null), 1400);

      if (newCount === 7) {
        sound.playSecretRevealed();
        triggerHaptic([100, 50, 150]);
        sparkles.burst(clientX, clientY, 50);
        onMoonTap7();
      }
    },
    [phaseIndex, moonTapCount, onMoonChangePhase, onMoonTap7]
  );

  // Catching the comet
  const handleCatchComet = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playSecretRevealed();
    triggerHaptic([60, 40, 80]);
    sparkles.burst(e.clientX, e.clientY, 35);
    setCometActive(false);
    onCometCatch();
  };

  // Hidden corner star click
  const handleHiddenStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hiddenStarFound) {
      setHiddenStarFound(true);
      sound.playSecretRevealed();
      triggerHaptic([70, 50, 100]);
      sparkles.burst(e.clientX, e.clientY, 30);
      onHiddenStarTap();
    }
  };

  const currentPhase = PHASES[phaseIndex].phase;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 transition-colors duration-1000 ${
          isDawn
            ? 'bg-gradient-to-b from-[#0B1536] via-[#35254A] to-[#D97706]/70'
            : 'bg-gradient-to-b from-[#050B1F] via-[#08153A] to-[#0B1F4D]'
        }`}
      />

      {/* Secret Dawn Silhouette Horizon */}
      {isDawn && (
        <div className="absolute bottom-0 inset-x-0 h-48 pointer-events-none transition-opacity duration-1000 flex items-end">
          <svg
            className="w-full h-36 text-[#060D24] opacity-90 fill-current"
            viewBox="0 0 1200 200"
            preserveAspectRatio="none"
          >
            <path d="M0,200 L0,140 Q150,110 320,150 T650,120 Q800,90 980,145 T1200,130 L1200,200 Z" />
            <path
              d="M0,200 L0,165 Q220,135 480,170 T950,140 T1200,160 L1200,200 Z"
              opacity="0.6"
            />
          </svg>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-amber-200/90 text-xs font-medium tracking-wide">
            Dawn in the Odyssey · Even deep navy skies make way for morning light
          </div>
        </div>
      )}

      {/* Canvas Starfield */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Glowing Interactive Moon */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 pointer-events-auto select-none flex flex-col items-center">
        <button
          onClick={handleMoonTap}
          type="button"
          aria-label="Celestial Moon: tap to cycle phase"
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-95 group focus:outline-none"
        >
          {/* Atmospheric Halo Glow */}
          <div className="absolute -inset-2 rounded-full bg-cyan-400/20 blur-md group-hover:bg-cyan-400/30 transition-all duration-300" />
          <div className="absolute -inset-4 rounded-full bg-amber-300/10 blur-xl pointer-events-none" />

          {/* Moon Disc */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-slate-200 via-amber-100 to-white shadow-[0_0_20px_rgba(255,255,255,0.7)] flex items-center justify-center overflow-hidden border border-white/50">
            {/* Crater Textures */}
            <div className="absolute w-2 h-2 rounded-full bg-slate-300/40 top-3 left-3" />
            <div className="absolute w-3 h-3 rounded-full bg-slate-300/30 bottom-3 right-3" />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-slate-300/50 top-6 right-4" />

            {/* Dynamic Moon Shadow for Phases */}
            {currentPhase === 'new' && (
              <div className="absolute inset-0 bg-[#060D24]/92 rounded-full" />
            )}
            {currentPhase === 'waxing_crescent' && (
              <div className="absolute inset-y-0 right-0 w-3/4 bg-[#060D24]/90 rounded-l-full" />
            )}
            {currentPhase === 'first_quarter' && (
              <div className="absolute inset-y-0 left-0 w-1/2 bg-[#060D24]/90" />
            )}
            {currentPhase === 'waxing_gibbous' && (
              <div className="absolute inset-y-0 left-0 w-1/4 bg-[#060D24]/80 rounded-r-full" />
            )}
            {currentPhase === 'full' && (
              <div className="absolute inset-0 bg-transparent shadow-[inset_0_0_8px_rgba(255,255,255,0.9)]" />
            )}
            {currentPhase === 'waning_gibbous' && (
              <div className="absolute inset-y-0 right-0 w-1/4 bg-[#060D24]/80 rounded-l-full" />
            )}
            {currentPhase === 'third_quarter' && (
              <div className="absolute inset-y-0 right-0 w-1/2 bg-[#060D24]/90" />
            )}
            {currentPhase === 'waning_crescent' && (
              <div className="absolute inset-y-0 left-0 w-3/4 bg-[#060D24]/90 rounded-r-full" />
            )}
          </div>
        </button>

        {/* Phase Feedback Tooltip */}
        {moonFeedback && (
          <div className="mt-1 text-[11px] font-medium text-cyan-200/90 tracking-wide animate-fade-in pointer-events-none drop-shadow">
            {moonFeedback}
          </div>
        )}
      </div>

      {/* Hidden Drifting Comet (every 20s) */}
      {cometActive && (
        <div
          key={cometKey}
          onClick={handleCatchComet}
          className="absolute z-20 pointer-events-auto cursor-pointer animate-comet flex items-center group"
          style={{ top: '15%', left: '0%' }}
        >
          {/* Head & Tail */}
          <div className="relative flex items-center">
            {/* Comet Head */}
            <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_16px_#00F0FF,0_0_30px_#FCD34D] ring-2 ring-cyan-300 group-hover:scale-125 transition-transform" />
            {/* Sparkling Tail */}
            <div className="h-1 w-32 bg-gradient-to-r from-transparent via-cyan-400/60 to-white/90 blur-[1px] -translate-x-1" />
          </div>
          <span className="ml-2 text-[10px] text-cyan-200 opacity-0 group-hover:opacity-100 transition-opacity bg-navy-950/80 px-1.5 py-0.5 rounded">
            Tap comet!
          </span>
        </div>
      )}

      {/* Easter Egg #3: Hidden Corner Star */}
      <button
        onClick={handleHiddenStarClick}
        type="button"
        aria-label="Mysterious faint star"
        className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-7 h-7 pointer-events-auto flex items-center justify-center cursor-pointer opacity-30 hover:opacity-100 transition-opacity focus:outline-none"
      >
        <div
          className={`w-2 h-2 rounded-full transition-all duration-500 ${
            hiddenStarFound
              ? 'bg-amber-300 shadow-[0_0_12px_#FCD34D] scale-125'
              : 'bg-cyan-200/60 shadow-[0_0_6px_#00F0FF] animate-pulse'
          }`}
        />
      </button>
    </div>
  );
};
