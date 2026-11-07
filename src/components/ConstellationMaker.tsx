import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CONSTELLATION_SHAPES } from '../data/constellations';
import { sound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { sparkles } from '../utils/sparkles';
import { Check, Dumbbell, Compass, Lightbulb, Shield, ArrowRight, RotateCcw, FastForward } from 'lucide-react';

interface ConstellationMakerProps {
  completedShapes: string[];
  onShapeComplete: (shapeId: string) => void;
  onAllShapesComplete: () => void;
}

export const ConstellationMaker: React.FC<ConstellationMakerProps> = ({
  completedShapes,
  onShapeComplete,
  onAllShapesComplete,
}) => {
  // Current active shape index (0 to 3)
  const [currentIdx, setCurrentIdx] = useState<number>(() => {
    const firstUnfinished = CONSTELLATION_SHAPES.findIndex(
      (s) => !completedShapes.includes(s.id)
    );
    return firstUnfinished === -1 ? 0 : firstUnfinished;
  });

  const activeShape = CONSTELLATION_SHAPES[currentIdx];
  const [connectedIds, setConnectedIds] = useState<number[]>([]);
  const [isRevealed, setIsRevealed] = useState<boolean>(() =>
    completedShapes.includes(activeShape.id)
  );
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync state when active shape changes
  useEffect(() => {
    if (completedShapes.includes(activeShape.id)) {
      setConnectedIds(activeShape.points.map((p) => p.id));
      setIsRevealed(true);
    } else {
      setConnectedIds([]);
      setIsRevealed(false);
    }
  }, [currentIdx, completedShapes, activeShape]);

  // Handle dot click / tap
  const handleDotTap = useCallback(
    (pointId: number, e?: React.MouseEvent | React.TouchEvent) => {
      if (isRevealed) return;

      const nextExpected = connectedIds.length + 1;

      // Click position for sparkles
      let px: number | undefined;
      let py: number | undefined;
      if (e) {
        if ('touches' in e && e.touches[0]) {
          px = e.touches[0].clientX;
          py = e.touches[0].clientY;
        } else if ('clientX' in e) {
          px = (e as React.MouseEvent).clientX;
          py = (e as React.MouseEvent).clientY;
        }
      }

      if (pointId === nextExpected) {
        const nextConnected = [...connectedIds, pointId];
        setConnectedIds(nextConnected);

        // Sound & haptic for successful connection
        const chimeFreq = 520 + pointId * 75;
        sound.playStarChime(chimeFreq);
        triggerHaptic(40);
        if (px && py) {
          sparkles.burst(px, py, 8);
        }

        // Check if all connected
        if (nextConnected.length === activeShape.points.length) {
          sound.playConstellationSuccess();
          triggerHaptic([60, 40, 100]);
          sparkles.burst(window.innerWidth / 2, window.innerHeight * 0.45, 45);
          setIsRevealed(true);
          onShapeComplete(activeShape.id);
        }
      } else if (!connectedIds.includes(pointId)) {
        // Gentle haptic on mis-sequence
        triggerHaptic(20);
        sound.playShieldHit();
        setAttemptCount((prev) => prev + 1);
      }
    },
    [connectedIds, isRevealed, activeShape, onShapeComplete]
  );

  // Drag-to-connect support across canvas container
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isRevealed || !containerRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;

    const rect = containerRef.current.getBoundingClientRect();
    const relX = ((touch.clientX - rect.left) / rect.width) * 100;
    const relY = ((touch.clientY - rect.top) / rect.height) * 100;

    // Check distance to next expected point
    const nextExpectedId = connectedIds.length + 1;
    const nextPt = activeShape.points.find((p) => p.id === nextExpectedId);
    if (nextPt) {
      const dist = Math.hypot(relX - nextPt.x, relY - nextPt.y);
      if (dist < 12) {
        handleDotTap(nextPt.id, e);
      }
    }
  };

  const handleNextShape = () => {
    if (currentIdx < CONSTELLATION_SHAPES.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setConnectedIds([]);
      setIsRevealed(false);
    } else {
      onAllShapesComplete();
    }
  };

  const handleSkipOrAutoConnect = () => {
    setConnectedIds(activeShape.points.map((p) => p.id));
    setIsRevealed(true);
    sound.playConstellationSuccess();
    triggerHaptic([60, 40, 100]);
    sparkles.burst(window.innerWidth / 2, window.innerHeight * 0.45, 30);
    onShapeComplete(activeShape.id);
  };

  const handleResetCurrent = () => {
    setConnectedIds([]);
    setIsRevealed(false);
    sound.playStarChime(440);
  };

  const getTraitIcon = (iconName: string) => {
    switch (iconName) {
      case 'Dumbbell':
        return <Dumbbell className="w-5 h-5 text-amber-300" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-cyan-300" />;
      case 'Lightbulb':
        return <Lightbulb className="w-5 h-5 text-amber-300" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-cyan-300" />;
      default:
        return null;
    }
  };

  const allDone = completedShapes.length >= CONSTELLATION_SHAPES.length;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center px-4 py-2">
      {/* Chapter Title & One-line Instruction */}
      <div className="text-center w-full mb-3">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-cyan-300 tracking-wider uppercase mb-1">
          <span>Starlight Map {currentIdx + 1} of 4</span>
          <span className="text-white/40">·</span>
          <span>{activeShape.name}</span>
        </div>
        <p className="text-sm font-medium text-slate-200">
          Tap the glowing numbered stars in order to draw the constellation.
        </p>
        <p className="text-xs text-cyan-300/80 mt-1">
          Tutorial hint: Tap star 1, then 2, then 3—or drag smoothly between them.
        </p>
      </div>

      {/* Shape Selector Navigation Dots */}
      <div className="flex items-center justify-center gap-3 mb-3">
        {CONSTELLATION_SHAPES.map((shape, idx) => {
          const isDone = completedShapes.includes(shape.id);
          const isCurrent = idx === currentIdx;
          return (
            <button
              key={shape.id}
              onClick={() => {
                setCurrentIdx(idx);
                sound.playStarChime(500 + idx * 80);
              }}
              className={`h-9 px-3.5 rounded-full flex items-center gap-1.5 text-xs font-medium transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : isDone
                  ? 'bg-amber-400/15 text-amber-300 border border-amber-400/50'
                  : 'bg-slate-800/60 text-slate-400 border border-slate-700/60 hover:text-slate-200'
              }`}
            >
              {isDone ? <Check className="w-3.5 h-3.5" /> : <span>{idx + 1}</span>}
              <span className="truncate max-w-[70px]">{shape.name.split(' ')[1]}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Constellation Canvas */}
      <div
        ref={containerRef}
        onTouchMove={handleTouchMove}
        className="relative w-full aspect-square max-w-[340px] sm:max-w-[360px] rounded-3xl bg-[#071333]/70 border border-cyan-500/25 p-4 shadow-[0_0_30px_rgba(5,11,31,0.8)] backdrop-blur-md overflow-hidden select-none touch-none flex items-center justify-center"
      >
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.08)_0%,transparent_70%)] pointer-events-none" />

        {/* SVG Drawing Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
          <defs>
            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Guide lines if completed */}
          {activeShape.lines.map(([fromId, toId], idx) => {
            const p1 = activeShape.points.find((p) => p.id === fromId);
            const p2 = activeShape.points.find((p) => p.id === toId);
            if (!p1 || !p2) return null;

            const isConnected =
              isRevealed ||
              (connectedIds.includes(fromId) && connectedIds.includes(toId));

            return (
              <line
                key={`line-${idx}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={isConnected ? '#FCD34D' : 'rgba(255, 255, 255, 0.08)'}
                strokeWidth={isConnected ? (isRevealed ? 2.2 : 2) : 1}
                strokeDasharray={isConnected ? 'none' : '2,2'}
                filter={isConnected ? 'url(#goldGlow)' : undefined}
                className="transition-all duration-500"
              />
            );
          })}

          {/* Sequential Active Trace Line while in progress */}
          {!isRevealed &&
            connectedIds.map((ptId, idx) => {
              if (idx === 0) return null;
              const prevId = connectedIds[idx - 1];
              const pPrev = activeShape.points.find((p) => p.id === prevId);
              const pCurr = activeShape.points.find((p) => p.id === ptId);
              if (!pPrev || !pCurr) return null;

              return (
                <line
                  key={`trace-${idx}`}
                  x1={pPrev.x}
                  y1={pPrev.y}
                  x2={pCurr.x}
                  y2={pCurr.y}
                  stroke="#00F0FF"
                  strokeWidth="2.4"
                  filter="url(#cyanGlow)"
                  className="transition-all duration-300"
                />
              );
            })}
        </svg>

        {/* Star Nodes (Large Touch Targets >= 48px) */}
        {activeShape.points.map((pt) => {
          const isConnected = isRevealed || connectedIds.includes(pt.id);
          const isNextTarget = !isRevealed && pt.id === connectedIds.length + 1;

          return (
            <div
              key={pt.id}
              style={{
                left: `${pt.x}%`,
                top: `${pt.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute z-10 flex items-center justify-center"
            >
              {/* Outer Large Touch Hitbox (Minimum 48x48px) */}
              <button
                type="button"
                aria-label={`Star ${pt.label}`}
                onClick={(e) => handleDotTap(pt.id, e)}
                onTouchStart={(e) => handleDotTap(pt.id, e)}
                className="w-12 h-12 -m-2 flex items-center justify-center cursor-pointer select-none focus:outline-none group"
              >
                {/* Visual Star Disc */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isConnected
                      ? 'bg-gradient-to-tr from-amber-400 to-amber-200 text-navy-950 shadow-[0_0_15px_#FCD34D] scale-110'
                      : isNextTarget
                      ? 'bg-cyan-400 text-navy-950 shadow-[0_0_16px_#00F0FF] scale-115 animate-bounce ring-4 ring-cyan-400/30'
                      : 'bg-slate-800/90 text-slate-300 border border-cyan-400/40 hover:border-cyan-300 hover:scale-105'
                  }`}
                >
                  {pt.label}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Trait & Appreciation Card (Appears on Complete) */}
      {isRevealed && (
        <div className="w-full mt-3 p-4 rounded-2xl bg-[#091C47]/90 border border-amber-400/40 shadow-[0_0_25px_rgba(252,211,77,0.15)] text-center animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            {getTraitIcon(activeShape.iconName)}
            <h3 className="text-base font-bold text-amber-200 tracking-wide">
              {activeShape.trait}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
            "{activeShape.quote}"
          </p>
        </div>
      )}

      {/* Bottom Controls (Large Touch-Target Buttons) */}
      <div className="w-full flex items-center justify-between gap-3 mt-4">
        {/* Reset / Retry */}
        <button
          onClick={handleResetCurrent}
          type="button"
          aria-label="Restart current constellation"
          className="h-12 px-4 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-2 text-xs font-medium cursor-pointer active:scale-95 transition-all min-h-[48px]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Clear</span>
        </button>

        {/* Skip button available after 2 tries or anytime if needed */}
        {attemptCount >= 2 && !isRevealed && (
          <button
            onClick={handleSkipOrAutoConnect}
            type="button"
            className="h-12 px-4 rounded-xl bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 hover:text-cyan-100 flex items-center gap-1.5 text-xs font-medium cursor-pointer active:scale-95 transition-all min-h-[48px]"
          >
            <FastForward className="w-4 h-4" />
            <span>Skip Shape</span>
          </button>
        )}

        {/* Action Button: Next Shape or Continue to Meteors */}
        {isRevealed ? (
          <button
            onClick={handleNextShape}
            type="button"
            className="flex-1 h-12 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(252,211,77,0.4)] active:scale-95 transition-all cursor-pointer min-h-[48px]"
          >
            <span>
              {currentIdx < CONSTELLATION_SHAPES.length - 1
                ? 'Next Constellation'
                : 'Fly to Meteor Belt'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex-1 flex items-center justify-end text-xs text-cyan-300/80 font-medium">
            <span>
              Connect star {connectedIds.length + 1} of {activeShape.points.length}
            </span>
          </div>
        )}
      </div>

      {allDone && (
        <div className="w-full mt-3 text-center">
          <button
            onClick={onAllShapesComplete}
            className="text-xs text-amber-300 underline font-medium hover:text-amber-200 cursor-pointer p-2"
          >
            All 4 traits uncovered. Proceed to Meteor Belt →
          </button>
        </div>
      )}
    </div>
  );
};
