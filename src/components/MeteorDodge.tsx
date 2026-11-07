import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { sparkles } from '../utils/sparkles';
import { Shield, ChevronLeft, ChevronRight, Play, RotateCcw, FastForward, ArrowRight, Rocket } from 'lucide-react';

interface MeteorDodgeProps {
  onVictory: () => void;
  onSkip: () => void;
  alreadyCleared: boolean;
}

interface Meteor {
  id: number;
  x: number; // percentage 5 to 95
  y: number; // percentage -10 to 110
  size: number;
  speed: number;
  glow: string;
}

export const MeteorDodge: React.FC<MeteorDodgeProps> = ({
  onVictory,
  onSkip,
  alreadyCleared,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [lives, setLives] = useState<number>(5);
  const [shipX, setShipX] = useState<number>(50); // percentage 10 to 90
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(alreadyCleared);
  const [attempts, setAttempts] = useState<number>(0);
  const [isInvulnerable, setIsInvulnerable] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const meteorsRef = useRef<Meteor[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const nextMeteorId = useRef<number>(1);
  const lastSpawnTime = useRef<number>(0);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver || isVictory) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setShipX((prev) => Math.max(10, prev - 7));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setShipX((prev) => Math.min(90, prev + 7));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver, isVictory]);

  // Game timer countdown (20 seconds)
  useEffect(() => {
    if (!isPlaying || gameOver || isVictory) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGameWon();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, gameOver, isVictory]);

  const handleGameWon = useCallback(() => {
    setIsPlaying(false);
    setIsVictory(true);
    sound.playMeteorVictory();
    triggerHaptic([100, 50, 150]);
    sparkles.burst(window.innerWidth / 2, window.innerHeight * 0.45, 50);
    onVictory();
  }, [onVictory]);

  // Main game animation loop
  useEffect(() => {
    if (!isPlaying || gameOver || isVictory) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const colors = ['#00F0FF', '#38BDF8', '#FCD34D'];

    const gameLoop = (timestamp: number) => {
      // Spawn slow, sparse meteors (approx 1 every 1.4s, max 3-4 active)
      if (timestamp - lastSpawnTime.current > 1400 && meteorsRef.current.length < 4) {
        lastSpawnTime.current = timestamp;
        meteorsRef.current.push({
          id: nextMeteorId.current++,
          x: 10 + Math.random() * 80,
          y: -10,
          size: 16 + Math.random() * 10,
          speed: 0.38 + Math.random() * 0.28, // gentle, slow drift
          glow: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      // Move meteors down
      meteorsRef.current = meteorsRef.current
        .map((m) => ({
          ...m,
          y: m.y + m.speed,
        }))
        .filter((m) => m.y < 115);

      // Collision detection with forgiving hitbox
      if (!isInvulnerable) {
        const shipY = 82; // ship is at bottom 82%
        for (const m of meteorsRef.current) {
          const distX = Math.abs(m.x - shipX);
          const distY = Math.abs(m.y - shipY);

          // Forgiving threshold
          if (distX < 9 && distY < 7) {
            // Collision detected!
            sound.playShieldHit();
            triggerHaptic(60);
            setIsInvulnerable(true);

            setLives((prevLives) => {
              const newLives = prevLives - 1;
              if (newLives <= 0) {
                setGameOver(true);
                setIsPlaying(false);
                setAttempts((a) => a + 1);
                return 0;
              }
              return newLives;
            });

            // Brief invulnerability window (1.2 seconds)
            setTimeout(() => {
              setIsInvulnerable(false);
            }, 1200);

            // Remove the hit meteor
            meteorsRef.current = meteorsRef.current.filter((item) => item.id !== m.id);
            break;
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, gameOver, isVictory, shipX, isInvulnerable]);

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setIsVictory(false);
    setTimeLeft(20);
    setLives(5);
    setShipX(50);
    meteorsRef.current = [];
    setIsInvulnerable(false);
    sound.playStarChime(600);
  };

  // Direct touch/drag tracking across play area
  const handleTouchTrack = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isPlaying || !containerRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = ((clientX - rect.left) / rect.width) * 100;
    setShipX(Math.max(10, Math.min(90, relativeX)));
  };

  const nudgeLeft = () => {
    if (!isPlaying) return;
    triggerHaptic(20);
    setShipX((prev) => Math.max(10, prev - 12));
  };

  const nudgeRight = () => {
    if (!isPlaying) return;
    triggerHaptic(20);
    setShipX((prev) => Math.min(90, prev + 12));
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center px-4 py-2">
      {/* Title & One-line Instruction */}
      <div className="text-center w-full mb-3">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-cyan-300 tracking-wider uppercase mb-1">
          <span>Navigation Trial</span>
          <span className="text-white/40">·</span>
          <span>Meteor Belt</span>
        </div>
        <p className="text-sm font-medium text-slate-200">
          Move your ship left and right to glide through the meteors for 20 seconds.
        </p>
        <p className="text-xs text-cyan-300/80 mt-1">
          Tutorial hint: Tap the Left / Right buttons or drag your ship smoothly. Meteors fall slowly.
        </p>
      </div>

      {/* Status Bar: Time & Shields */}
      <div className="w-full flex items-center justify-between bg-slate-900/70 border border-cyan-500/30 rounded-2xl px-4 py-2.5 mb-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Time:</span>
          <span className="text-base font-bold font-mono text-cyan-300 tabular-nums">
            {timeLeft}s
          </span>
        </div>

        {/* Lives / Shields */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium mr-1">Shields:</span>
          {[1, 2, 3, 4, 5].map((i) => (
            <Shield
              key={i}
              className={`w-4 h-4 transition-all ${
                i <= lives
                  ? 'text-cyan-400 fill-cyan-400 shadow-[0_0_8px_#00F0FF]'
                  : 'text-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Play Area */}
      <div
        ref={containerRef}
        onMouseMove={handleTouchTrack}
        onTouchMove={handleTouchTrack}
        className="relative w-full h-[320px] sm:h-[350px] rounded-3xl bg-[#06112E]/80 border border-cyan-500/25 overflow-hidden select-none touch-none flex items-center justify-center shadow-[0_0_30px_rgba(5,11,31,0.9)] backdrop-blur-md"
      >
        {/* Playfield Stars / Depth grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,240,255,0.12)_0%,transparent_70%)] pointer-events-none" />

        {/* Falling Meteors */}
        {meteorsRef.current.map((m) => (
          <div
            key={m.id}
            style={{
              left: `${m.x}%`,
              top: `${m.y}%`,
              width: `${m.size}px`,
              height: `${m.size}px`,
              transform: 'translate(-50%, -50%)',
            }}
            className="absolute rounded-full pointer-events-none flex items-center justify-center transition-transform"
          >
            {/* Glowing comet aura */}
            <div
              style={{ backgroundColor: m.glow }}
              className="w-full h-full rounded-full opacity-80 blur-[2px] shadow-[0_0_12px_currentColor]"
            />
            {/* Soft tail */}
            <div
              style={{
                background: `linear-gradient(to top, ${m.glow}, transparent)`,
              }}
              className="absolute -top-4 w-1.5 h-6 rounded-full opacity-60"
            />
          </div>
        ))}

        {/* Spaceship */}
        <div
          style={{
            left: `${shipX}%`,
            top: '82%',
            transform: 'translate(-50%, -50%)',
          }}
          className={`absolute flex flex-col items-center pointer-events-none transition-transform duration-75 ${
            isInvulnerable ? 'opacity-50 animate-pulse' : 'opacity-100'
          }`}
        >
          {/* Cyan Shield Dome */}
          <div className="relative w-10 h-10 rounded-full bg-cyan-400/20 border border-cyan-300 flex items-center justify-center shadow-[0_0_16px_rgba(0,240,255,0.6)]">
            <Rocket className="w-5 h-5 text-cyan-200 fill-cyan-400" />
          </div>
          {/* Thruster exhaust */}
          <div className="w-2 h-4 bg-gradient-to-b from-cyan-400 via-amber-300 to-transparent blur-[1px] animate-pulse" />
        </div>

        {/* Start Overlay if not started */}
        {!isPlaying && !gameOver && !isVictory && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              <Rocket className="w-7 h-7 text-cyan-300" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Steady At The Helm</h3>
            <p className="text-xs text-slate-300 max-w-xs mb-5">
              Glide smoothly through gentle stardust for 20 seconds. 5 protective shields are online.
            </p>
            <button
              onClick={startGame}
              type="button"
              className="h-12 px-6 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-95 transition-all cursor-pointer min-h-[48px]"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Engage Course</span>
            </button>
          </div>
        )}

        {/* Game Over Dialog (Unlimited Retries + Skip after 2) */}
        {gameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className="text-base font-bold text-cyan-200 mb-1">Close Call!</h3>
            <p className="text-xs text-slate-300 mb-4 max-w-xs">
              The cosmos is infinitely patient. Unlimited retries—dive right back in.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={startGame}
                type="button"
                className="h-12 px-5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-[0_0_15px_#00F0FF] active:scale-95 transition-all cursor-pointer min-h-[48px]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>

              {attempts >= 2 && (
                <button
                  onClick={onSkip}
                  type="button"
                  className="h-12 px-4 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 active:scale-95 cursor-pointer min-h-[48px]"
                >
                  <FastForward className="w-4 h-4" />
                  <span>Skip Ahead</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Victory Dialog */}
        {isVictory && (
          <div className="absolute inset-0 bg-[#06112E]/92 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-12 h-12 rounded-full bg-amber-400/20 border border-amber-400 flex items-center justify-center mb-2 shadow-[0_0_20px_#FCD34D]">
              <Shield className="w-6 h-6 text-amber-300 fill-amber-400" />
            </div>
            <h3 className="text-base font-bold text-amber-200 mb-1">
              Trial Mastered
            </h3>
            <p className="text-xs text-slate-200 mb-4 max-w-xs italic">
              "Unshakable focus under pressure. The cosmos salutes your steady hand."
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-xs">
              <button
                onClick={onVictory}
                type="button"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(252,211,77,0.4)] active:scale-95 transition-all cursor-pointer min-h-[48px]"
              >
                <span>Catch Falling Wishes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={startGame}
                type="button"
                className="text-xs text-slate-400 hover:text-slate-200 p-2"
              >
                Replay Trial
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Large Touch Controls: Left and Right buttons (min 52px height) */}
      <div className="w-full grid grid-cols-2 gap-4 mt-4">
        <button
          onClick={nudgeLeft}
          onTouchStart={nudgeLeft}
          type="button"
          aria-label="Steer ship left"
          className="h-14 rounded-2xl bg-slate-900/90 border border-cyan-500/40 text-cyan-200 flex items-center justify-center gap-2 font-bold text-sm active:bg-cyan-500/30 active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.15)] select-none min-h-[52px]"
        >
          <ChevronLeft className="w-6 h-6" />
          <span>Steer Left</span>
        </button>

        <button
          onClick={nudgeRight}
          onTouchStart={nudgeRight}
          type="button"
          aria-label="Steer ship right"
          className="h-14 rounded-2xl bg-slate-900/90 border border-cyan-500/40 text-cyan-200 flex items-center justify-center gap-2 font-bold text-sm active:bg-cyan-500/30 active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.15)] select-none min-h-[52px]"
        >
          <span>Steer Right</span>
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Skip button always accessible if previously failed or clearing */}
      {attempts >= 2 && !isVictory && (
        <div className="w-full mt-3 flex justify-center">
          <button
            onClick={onSkip}
            className="text-xs text-cyan-300 underline cursor-pointer p-2 hover:text-cyan-100"
          >
            Skip to next chapter →
          </button>
        </div>
      )}
    </div>
  );
};
