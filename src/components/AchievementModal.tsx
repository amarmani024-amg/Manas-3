import React, { useState } from 'react';
import { ALL_ACHIEVEMENTS } from '../data/achievements';
import { Achievement } from '../types';
import { sound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { sparkles } from '../utils/sparkles';
import {
  X,
  Award,
  Sparkles,
  Boxes,
  Compass,
  Star,
  Moon,
  SunMedium,
  Flame,
  Terminal,
  Zap,
  Lock,
  CheckCircle2,
  Send,
} from 'lucide-react';

interface AchievementModalProps {
  unlockedIds: string[];
  isOpen: boolean;
  onClose: () => void;
  onSendSignalHello: () => void;
}

export const AchievementModal: React.FC<AchievementModalProps> = ({
  unlockedIds,
  isOpen,
  onClose,
  onSendSignalHello,
}) => {
  const [typedInput, setTypedInput] = useState('');
  const [signalFeedback, setSignalFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalCount = Object.keys(ALL_ACHIEVEMENTS).length;
  const unlockedCount = unlockedIds.length;

  const getIcon = (iconName: string, isUnlocked: boolean) => {
    const cls = `w-5 h-5 ${isUnlocked ? 'text-amber-300' : 'text-slate-500'}`;
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className={cls} />;
      case 'Boxes':
        return <Boxes className={cls} />;
      case 'Compass':
        return <Compass className={cls} />;
      case 'Star':
        return <Star className={cls} />;
      case 'Moon':
        return <Moon className={cls} />;
      case 'SunMedium':
        return <SunMedium className={cls} />;
      case 'Flame':
        return <Flame className={cls} />;
      case 'Terminal':
        return <Terminal className={cls} />;
      case 'Zap':
        return <Zap className={cls} />;
      case 'Award':
      default:
        return <Award className={cls} />;
    }
  };

  const handleTransmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedInput.trim().toLowerCase() === 'hello') {
      sound.playSecretRevealed();
      triggerHaptic([60, 40, 100]);
      sparkles.burst(window.innerWidth / 2, window.innerHeight / 2, 40);
      onSendSignalHello();
      setSignalFeedback('Signal Verified: "hello" acknowledged.');
      setTypedInput('');
    } else {
      sound.playShieldHit();
      triggerHaptic(30);
      setSignalFeedback('Unknown frequency. Try signal: hello');
    }
    setTimeout(() => setSignalFeedback(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md max-h-[88vh] rounded-3xl bg-[#071333] border border-cyan-500/40 p-5 shadow-[0_0_40px_rgba(0,240,255,0.2)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
              <Award className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cosmic Badges</h3>
              <p className="text-xs text-cyan-300 font-medium">
                {unlockedCount} of {totalCount} discovered
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close dialog"
            className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Badges List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
          {Object.values(ALL_ACHIEVEMENTS).map((ach: Achievement) => {
            const isUnlocked = unlockedIds.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                  isUnlocked
                    ? 'bg-[#0A1B45] border-amber-400/40 shadow-[0_0_15px_rgba(252,211,77,0.1)]'
                    : 'bg-slate-900/50 border-slate-800/80 opacity-60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isUnlocked ? 'bg-amber-400/20 border border-amber-300/40' : 'bg-slate-800'
                  }`}
                >
                  {isUnlocked ? getIcon(ach.icon, true) : <Lock className="w-4 h-4 text-slate-500" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4
                      className={`text-sm font-semibold truncate ${
                        isUnlocked ? 'text-amber-200' : 'text-slate-400'
                      }`}
                    >
                      {ach.title}
                    </h4>
                    {isUnlocked && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                    {ach.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Easter Egg Terminal / Secret Signal input */}
        <div className="pt-3 border-t border-cyan-500/20">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Cosmic Transmitter (Easter Egg #2)</span>
            <span className="text-cyan-300 font-mono">freq: HELLO</span>
          </div>
          <form onSubmit={handleTransmit} className="flex gap-2">
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder='Type "hello" to transmit...'
              className="flex-1 h-10 rounded-xl bg-slate-900 border border-cyan-500/30 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="h-10 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
          {signalFeedback && (
            <p className="text-xs text-cyan-300 font-medium mt-1.5 animate-fade-in">
              {signalFeedback}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
