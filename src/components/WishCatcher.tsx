import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { sparkles } from '../utils/sparkles';
import { Star, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';

interface WishCatcherProps {
  onMeterFull: () => void;
  alreadyCleared: boolean;
}

interface FallingStar {
  id: number;
  x: number; // percentage 10% to 90%
  y: number; // percentage 0% to 100%
  speed: number;
  size: number;
  color: string;
  glow: string;
  caught: boolean;
}

export const WishCatcher: React.FC<WishCatcherProps> = ({
  onMeterFull,
  alreadyCleared,
}) => {
  const [starsCaught, setStarsCaught] = useState<number>(alreadyCleared ? 7 : 0);
  const [fallingStars, setFallingStars] = useState<FallingStar[]>([]);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(alreadyCleared);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const nextId = useRef<number>(1);
  const animFrameRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);

  const targetCount = 7;
  const hopePercentage = Math.min(100, Math.round((starsCaught / targetCount) * 100));

  // Spawn and drift falling stars
  useEffect(() => {
    if (isUnlocked) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const starGems = [
      { color: '#FCD34D', glow: '#F59E0B' },
      { color: '#00F0FF', glow: '#38BDF8' },
      { color: '#FFFFFF', glow: '#67E8F9' },
      { color: '#FDE047', glow: '#EAB308' },
    ];

    const loop = (timestamp: number) => {
      // Spawn a new star every 1.1s if fewer than 4 are falling
      if (timestamp - lastSpawnRef.current > 1100) {
        lastSpawnRef.current = timestamp;
        setFallingStars((prev) => {
          if (prev.length >= 4) return prev;
          const gem = starGems[Math.floor(Math.random() * starGems.length)];
          return [
            ...prev,
            {
              id: nextId.current++,
              x: 12 + Math.random() * 76,
              y: -5,
              speed: 0.32 + Math.random() * 0.22, // calm, peaceful drift
              size: 28 + Math.random() * 8,
              color: gem.color,
              glow: gem.glow,
              caught: false,
            },
          ];
        });
      }

      // Move stars down smoothly
      setFallingStars((prev) =>
        prev
          .map((star) => ({
            ...star,
            y: star.y + star.speed,
          }))
          // Stars fall off bottom with NO PENALTY! (No misses counted)
          .filter((star) => star.y < 108 && !star.caught)
      );

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isUnlocked]);

  // Tap star handler
  const handleCatchStar = (starId: number, e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    sound.playWishCaught();
    triggerHaptic(50);
    sparkles.burst(clientX, clientY, 20);

    // Remove star and update score
    setFallingStars((prev) => prev.filter((s) => s.id !== starId));
    setStarsCaught((prev) => {
      const next = prev + 1;
      if (next >= targetCount && !isUnlocked) {
        setIsUnlocked(true);
        sound.playConstellationSuccess();
        triggerHaptic([100, 50, 150]);
        sparkles.burst(window.innerWidth / 2, window.innerHeight * 0.45, 60);
      }
      return next;
    });
  };

  const handleReset = () => {
    setStarsCaught(0);
    setIsUnlocked(false);
    setFallingStars([]);
    sound.playStarChime(480);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center px-4 py-2">
      {/* Title & One-line Instruction */}
      <div className="text-center w-full mb-3">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-cyan-300 tracking-wider uppercase mb-1">
          <span>Starlight Harvest</span>
          <span className="text-white/40">·</span>
          <span>Wish Catcher</span>
        </div>
        <p className="text-sm font-medium text-slate-200">
          Tap the falling stars as they drift down to fill the Hope Meter to 100%.
        </p>
        <p className="text-xs text-cyan-300/80 mt-1">
          Tutorial hint: Take your time. No misses are counted—every star adds hope.
        </p>
      </div>

      {/* Hope Meter Progress Bar */}
      <div className="w-full bg-[#071333]/90 border border-cyan-500/30 rounded-2xl p-3 mb-3 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.1)]">
        <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1.5">
          <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Hope Meter</span>
          </div>
          <span className="font-mono text-cyan-300 font-bold tabular-nums">
            {hopePercentage}% ({Math.min(starsCaught, targetCount)}/{targetCount} stars)
          </span>
        </div>

        {/* Progress track */}
        <div className="w-full h-3 rounded-full bg-slate-900 border border-cyan-500/20 overflow-hidden relative">
          <div
            style={{ width: `${hopePercentage}%` }}
            className="h-full bg-gradient-to-r from-cyan-400 via-amber-300 to-amber-400 rounded-full transition-all duration-300 shadow-[0_0_12px_#FCD34D]"
          />
        </div>
      </div>

      {/* Play Area */}
      <div
        ref={containerRef}
        className="relative w-full h-[320px] sm:h-[350px] rounded-3xl bg-[#06112E]/80 border border-cyan-500/25 overflow-hidden select-none touch-none flex items-center justify-center shadow-[0_0_30px_rgba(5,11,31,0.9)] backdrop-blur-md"
      >
        {/* Soft background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(252,211,77,0.1)_0%,transparent_70%)] pointer-events-none" />

        {/* Falling Stars */}
        {fallingStars.map((star) => (
          <div
            key={star.id}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className="absolute z-10 flex items-center justify-center"
          >
            {/* Big Touch Target Hitbox (>= 54px) */}
            <button
              onClick={(e) => handleCatchStar(star.id, e)}
              onTouchStart={(e) => handleCatchStar(star.id, e)}
              type="button"
              aria-label="Catch falling wish star"
              className="w-14 h-14 -m-2 flex items-center justify-center cursor-pointer select-none active:scale-90 transition-transform focus:outline-none group"
            >
              {/* Star Visual */}
              <div
                style={{
                  boxShadow: `0 0 16px ${star.glow}, 0 0 30px ${star.glow}60`,
                }}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-200 via-white to-cyan-200 flex items-center justify-center group-hover:scale-110 transition-transform animate-pulse"
              >
                <Star
                  style={{ fill: star.color, color: star.color }}
                  className="w-5 h-5 drop-shadow"
                />
              </div>
            </button>
          </div>
        ))}

        {/* Unlocked Message Dialog */}
        {isUnlocked && (
          <div className="absolute inset-0 bg-[#06112E]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-amber-400/25 border border-amber-300 flex items-center justify-center mb-3 shadow-[0_0_25px_#FCD34D]">
              <Sparkles className="w-6 h-6 text-amber-300 fill-amber-300" />
            </div>

            <h3 className="text-lg font-bold text-amber-200 mb-2">
              Hope Meter at 100%
            </h3>

            {/* Appreciative bright future message (Warm, sincere, short text, addressed only as 'you') */}
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed mb-2 max-w-sm font-medium">
              "Here's to year 23 and the brilliant future you are engineering, one deliberate step at a time."
            </p>
            <p className="text-xs text-cyan-200/90 leading-relaxed mb-5 max-w-sm italic">
              "Disciplined in action, steadfast in character, and always looking forward. The universe is in good hands."
            </p>

            <button
              onClick={onMeterFull}
              type="button"
              className="w-full max-w-xs h-12 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(252,211,77,0.4)] active:scale-95 transition-all cursor-pointer min-h-[48px]"
            >
              <span>Witness The Grand Finale</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Peaceful prompt if catching */}
        {!isUnlocked && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-xs text-slate-400/80 pointer-events-none">
            Tap stars as they drift past
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="w-full flex items-center justify-between mt-3 px-1">
        <button
          onClick={handleReset}
          type="button"
          aria-label="Restart hope meter"
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 p-2 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Meter</span>
        </button>

        {isUnlocked && (
          <button
            onClick={onMeterFull}
            type="button"
            className="text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1 p-2 cursor-pointer underline"
          >
            <span>Proceed to Finale</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
