import React from 'react';
import { Achievement } from '../types';
import { Award, Sparkles, X } from 'lucide-react';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  onDismiss,
}) => {
  if (!achievement) return null;

  return (
    <div className="fixed top-4 inset-x-4 max-w-sm mx-auto z-50 pointer-events-auto animate-bounce-short">
      <div className="relative rounded-2xl bg-gradient-to-r from-[#071338] via-[#0A1F4D] to-[#071338] border-2 border-amber-400 p-3.5 shadow-[0_0_30px_rgba(252,211,77,0.35)] flex items-center gap-3 backdrop-blur-lg">
        {/* Glowing Badge Icon */}
        <div className="w-10 h-10 rounded-xl bg-amber-400/25 border border-amber-300 flex items-center justify-center shrink-0 shadow-[0_0_12px_#FCD34D]">
          <Award className="w-5 h-5 text-amber-300 fill-amber-400" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Achievement Unlocked</span>
          </div>
          <h4 className="text-sm font-bold text-white truncate">
            {achievement.title}
          </h4>
          <p className="text-xs text-cyan-200/90 leading-tight truncate">
            {achievement.description}
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onDismiss}
          type="button"
          aria-label="Dismiss banner"
          className="w-8 h-8 rounded-full bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
