/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameChapter } from './types';
import { ALL_ACHIEVEMENTS } from './data/achievements';
import { sound } from './utils/audio';
import { triggerHaptic } from './utils/haptics';
import { sparkles } from './utils/sparkles';
import { ParallaxSky } from './components/ParallaxSky';
import { ConstellationMaker } from './components/ConstellationMaker';
import { MeteorDodge } from './components/MeteorDodge';
import { WishCatcher } from './components/WishCatcher';
import { Finale } from './components/Finale';
import { AchievementToast } from './components/AchievementToast';
import { AchievementModal } from './components/AchievementModal';
import {
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Award,
  ArrowRight,
  Compass,
  Star,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

const STORAGE_KEY = 'navy_night_odyssey_v1';

export default function App() {
  // Load saved state from localStorage
  const [chapter, setChapter] = useState<GameChapter>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.currentChapter || 'intro';
      }
    } catch {
      // Ignore parse error
    }
    return 'intro';
  });

  const [completedShapes, setCompletedShapes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.constellationsCompleted || [];
      }
    } catch {
      // Ignore
    }
    return [];
  });

  const [meteorCleared, setMeteorCleared] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return !!parsed.meteorDodgeCleared;
      }
    } catch {
      // Ignore
    }
    return false;
  });

  const [wishCleared, setWishCleared] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return !!parsed.wishCatcherCleared;
      }
    } catch {
      // Ignore
    }
    return false;
  });

  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.unlockedAchievements || ['stargazer'];
      }
    } catch {
      // Ignore
    }
    return ['stargazer'];
  });

  const [isDawn, setIsDawn] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasStartedAudio, setHasStartedAudio] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<any | null>(null);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Buffer for typing "hello" anywhere
  const keySequenceRef = useRef<string>('');

  // Persist state to localStorage
  useEffect(() => {
    try {
      const data = {
        currentChapter: chapter,
        constellationsCompleted: completedShapes,
        meteorDodgeCleared: meteorCleared,
        wishCatcherCleared: wishCleared,
        unlockedAchievements,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage unavailable
    }
  }, [chapter, completedShapes, meteorCleared, wishCleared, unlockedAchievements]);

  // Unlock achievement helper with toast & sound
  const unlockAchievement = useCallback(
    (id: string) => {
      setUnlockedAchievements((prev) => {
        if (prev.includes(id)) return prev;
        const updated = [...prev, id];
        const ach = ALL_ACHIEVEMENTS[id];
        if (ach) {
          setActiveToast(ach);
          sound.playSecretRevealed();
          triggerHaptic([60, 40, 100]);
          sparkles.burst(window.innerWidth / 2, 70, 30);
          setTimeout(() => {
            setActiveToast((curr: any) => (curr?.id === id ? null : curr));
          }, 3800);
        }
        return updated;
      });
    },
    []
  );

  // Global user interaction: starts ambient sound on first tap/click
  const handleFirstInteraction = useCallback(() => {
    if (!hasStartedAudio) {
      setHasStartedAudio(true);
      sound.startAmbient();
    }
  }, [hasStartedAudio]);

  // Keyboard listener for typing "hello" Easter Egg anywhere
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleFirstInteraction();
      // Only track alphabetic keys
      if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        keySequenceRef.current = (keySequenceRef.current + e.key.toLowerCase()).slice(-8);
        if (keySequenceRef.current.endsWith('hello')) {
          unlockAchievement('cipher_breaker');
          sparkles.burst(window.innerWidth / 2, window.innerHeight / 2, 50);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFirstInteraction, unlockAchievement]);

  // Audio mute toggle
  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleFirstInteraction();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
    triggerHaptic(30);
  };

  // Dawn/Night toggle (Surprise)
  const toggleDawn = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleFirstInteraction();
    const nextState = !isDawn;
    setIsDawn(nextState);
    triggerHaptic(40);
    sound.playMoonBell();
    if (nextState) {
      unlockAchievement('dawn_seeker');
      sparkles.burst(window.innerWidth / 2, window.innerHeight * 0.8, 30);
    }
  };

  // Handlers for game progressions
  const handleShapeComplete = (shapeId: string) => {
    setCompletedShapes((prev) => {
      const next = prev.includes(shapeId) ? prev : [...prev, shapeId];
      if (next.length >= 4) {
        unlockAchievement('master_architect');
      }
      return next;
    });
  };

  const handleAllConstellationsFinished = () => {
    handleShapeComplete('shield');
    setChapter('meteors');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMeteorVictory = () => {
    setMeteorCleared(true);
    unlockAchievement('meteor_pilot');
    setChapter('wishes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMeteorSkip = () => {
    setMeteorCleared(true);
    setChapter('wishes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWishMeterFull = () => {
    setWishCleared(true);
    unlockAchievement('wish_maker');
    unlockAchievement('odyssey_complete');
    setChapter('finale');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReplayOdyssey = () => {
    setChapter('constellations');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetAllProgress = () => {
    setIsResetModalOpen(true);
    sound.playStarChime(450);
  };

  const confirmResetOdyssey = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    setCompletedShapes([]);
    setMeteorCleared(false);
    setWishCleared(false);
    setUnlockedAchievements(['stargazer']);
    setChapter('intro');
    setIsResetModalOpen(false);
    sound.playStarChime(440);
    triggerHaptic(40);
    sparkles.burst(window.innerWidth / 2, window.innerHeight / 2, 25);
  };

  return (
    <div
      onClick={handleFirstInteraction}
      onTouchStart={handleFirstInteraction}
      className="relative min-h-screen w-full flex flex-col justify-between text-slate-100 overflow-x-hidden"
    >
      {/* Background Interactive Parallax Sky */}
      <ParallaxSky
        isDawn={isDawn}
        onMoonTap7={() => unlockAchievement('moonwalker')}
        onCometCatch={() => unlockAchievement('comet_chaser')}
        onHiddenStarTap={() => unlockAchievement('starlight_secret')}
        onMoonChangePhase={() => {}}
      />

      {/* Achievement Toast Banner */}
      <AchievementToast
        achievement={activeToast}
        onDismiss={() => setActiveToast(null)}
      />

      {/* Badges / Secrets Modal */}
      <AchievementModal
        isOpen={isBadgesModalOpen}
        onClose={() => setIsBadgesModalOpen(false)}
        unlockedIds={unlockedAchievements}
        onSendSignalHello={() => unlockAchievement('cipher_breaker')}
      />

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#071333] border border-amber-400/50 p-6 shadow-[0_0_40px_rgba(252,211,77,0.25)] flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(252,211,77,0.3)]">
              <RotateCcw className="w-6 h-6 text-amber-300" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Reset The Odyssey?</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              This will return you to the beginning of the journey so you can trace the constellations, navigate the trials, and unlock secrets fresh anytime.
            </p>
            <div className="w-full flex items-center gap-3">
              <button
                onClick={() => setIsResetModalOpen(false)}
                type="button"
                className="flex-1 h-12 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold active:scale-95 transition-all cursor-pointer min-h-[48px]"
              >
                Keep Exploring
              </button>
              <button
                onClick={confirmResetOdyssey}
                type="button"
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(252,211,77,0.4)] min-h-[48px]"
              >
                Reset Odyssey
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar Navigation (Clean 3-zone contract) */}
      <header className="relative z-30 w-full max-w-4xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.3)]">
            <Compass className="w-4 h-4 text-cyan-300" />
          </div>
          <span className="font-display font-bold text-base sm:text-lg tracking-tight text-white whitespace-nowrap">
            Navy Night Odyssey
          </span>
        </div>

        {/* Right Actions Zone: Dawn toggle, Sound toggle, Badges Shelf, Reset Button */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Dawn / Night Secret Toggle */}
          <button
            onClick={toggleDawn}
            type="button"
            title={isDawn ? 'Return to deep navy night' : 'Reveal secret dawn scene'}
            aria-label="Toggle dawn and night scene"
            className="w-10 h-10 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-amber-300 hover:text-amber-200 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-[0_0_10px_rgba(252,211,77,0.15)] min-h-[44px]"
          >
            {isDawn ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Sound / Ambient Toggle */}
          <button
            onClick={toggleAudio}
            type="button"
            title={isMuted ? 'Unmute ambient soundscape' : 'Mute ambient soundscape'}
            aria-label="Toggle celestial audio"
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer active:scale-95 min-h-[44px] ${
              isMuted
                ? 'bg-slate-900/80 border-slate-700 text-slate-400'
                : 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Badges / Achievements Trigger */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsBadgesModalOpen(true);
              sound.playStarChime(700);
            }}
            type="button"
            title="View discovered badges"
            aria-label="Open achievements drawer"
            className="h-10 px-2.5 sm:px-3 rounded-xl bg-slate-900/80 border border-amber-400/40 text-amber-300 hover:text-amber-200 flex items-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-[0_0_10px_rgba(252,211,77,0.15)] min-h-[44px]"
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span className="font-mono text-[11px] tabular-nums">
              {unlockedAchievements.length}
            </span>
          </button>

          {/* Dedicated Reset Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleResetAllProgress();
            }}
            type="button"
            title="Reset odyssey progress"
            aria-label="Reset odyssey progress"
            className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-400 hover:text-amber-300 hover:border-amber-400/50 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-[0_0_10px_rgba(5,11,31,0.5)] min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="relative z-20 flex-1 flex flex-col justify-center items-center py-4 px-2">
        {/* CHAPTER: INTRO */}
        {chapter === 'intro' && (
          <div className="w-full max-w-md mx-auto text-center px-4 py-8 animate-fade-in flex flex-col items-center">
            {/* Cinematic Intro Line (Exact specification) */}
            <div className="w-full mb-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-300/90 tracking-widest uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Celestial Journey</span>
                <span className="text-white/30">·</span>
                <span>Year 23</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-amber-200 tracking-tight leading-snug">
                "Every sky has a star that stands out."
              </h1>
            </div>

            {/* Sincere, respectful, witty message */}
            <div className="w-full p-5 rounded-3xl bg-[#071338]/85 border border-cyan-500/30 shadow-[0_0_35px_rgba(0,240,255,0.15)] backdrop-blur-md mb-8 text-center">
              <p className="text-sm font-semibold text-slate-100 leading-relaxed mb-3">
                A calm voyage calibrated for an analytical mind, built on discipline, integrity, and boundless purpose.
              </p>
              <p className="text-xs text-cyan-200/85 leading-relaxed italic">
                Step into the navy expanse. Uncover four constellation blueprints, chart a path through stardust, and unlock what lies beyond.
              </p>
            </div>

            {/* Start Button (Large touch target) */}
            <button
              onClick={() => {
                sound.playConstellationSuccess();
                triggerHaptic(60);
                sparkles.burst(window.innerWidth / 2, window.innerHeight * 0.6, 35);
                setChapter('constellations');
              }}
              type="button"
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-amber-300 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,240,255,0.4)] active:scale-95 transition-all cursor-pointer min-h-[56px]"
            >
              <span>Begin Odyssey</span>
              <ArrowRight className="w-5 h-5 text-slate-950" />
            </button>

            {/* Subtle note about audio */}
            <p className="text-[11px] text-slate-400 mt-4">
              Tap anywhere to enjoy soft ambient celestial sounds
            </p>
          </div>
        )}

        {/* CHAPTER 1: CONSTELLATION MAKER */}
        {chapter === 'constellations' && (
          <ConstellationMaker
            completedShapes={completedShapes}
            onShapeComplete={handleShapeComplete}
            onAllShapesComplete={handleAllConstellationsFinished}
          />
        )}

        {/* CHAPTER 2: METEOR DODGE */}
        {chapter === 'meteors' && (
          <MeteorDodge
            alreadyCleared={meteorCleared}
            onVictory={handleMeteorVictory}
            onSkip={handleMeteorSkip}
          />
        )}

        {/* CHAPTER 3: WISH CATCHER */}
        {chapter === 'wishes' && (
          <WishCatcher
            alreadyCleared={wishCleared}
            onMeterFull={handleWishMeterFull}
          />
        )}

        {/* FINALE: REARRANGED "N", SHOOTING STARS & SECRET CODE: STARDUST */}
        {chapter === 'finale' && (
          <Finale
            onReplay={handleReplayOdyssey}
            onOpenAchievements={() => setIsBadgesModalOpen(true)}
            onResetAll={handleResetAllProgress}
          />
        )}
      </main>

      {/* Chapter Stepper Bottom Bar */}
      {chapter !== 'intro' && (
        <footer className="relative z-30 w-full max-w-md mx-auto px-4 pb-4 pt-1">
          <div className="w-full bg-[#06112E]/90 border border-cyan-500/25 rounded-2xl p-1.5 backdrop-blur-md flex items-center justify-between shadow-[0_0_20px_rgba(5,11,31,0.8)]">
            {[
              { id: 'constellations', label: 'Constellations' },
              { id: 'meteors', label: 'Meteor Belt' },
              { id: 'wishes', label: 'Wishes' },
              { id: 'finale', label: 'Finale' },
            ].map((step, idx) => {
              const isActive = chapter === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setChapter(step.id as GameChapter);
                    sound.playStarChime(500 + idx * 80);
                    triggerHaptic(25);
                  }}
                  type="button"
                  className={`flex-1 py-2 px-1 rounded-xl text-center transition-all cursor-pointer select-none min-h-[44px] flex flex-col items-center justify-center ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-[10px] font-mono text-cyan-400/80">0{idx + 1}</span>
                  <span className="text-[11px] font-semibold truncate max-w-[80px]">
                    {step.label}
                  </span>
                </button>
              );
            })}

            {/* Quick Reset in thumb zone */}
            <button
              onClick={handleResetAllProgress}
              type="button"
              title="Reset Odyssey Progress"
              aria-label="Reset Odyssey Progress"
              className="px-2.5 py-2 rounded-xl text-slate-400 hover:text-amber-300 transition-all cursor-pointer select-none min-h-[44px] flex flex-col items-center justify-center border-l border-cyan-500/15"
            >
              <RotateCcw className="w-3.5 h-3.5 mb-0.5" />
              <span className="text-[10px] font-semibold">Reset</span>
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
