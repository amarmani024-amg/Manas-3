import React, { useEffect, useState, useRef } from 'react';
import { sound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { sparkles } from '../utils/sparkles';
import { RotateCcw, Copy, Check, Sparkles, Key, Award } from 'lucide-react';

interface FinaleProps {
  onReplay: () => void;
  onOpenAchievements: () => void;
  onResetAll: () => void;
}

export const Finale: React.FC<FinaleProps> = ({
  onReplay,
  onOpenAchievements,
  onResetAll,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [starsAssembled, setStarsAssembled] = useState<boolean>(false);
  const showerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Points forming the luminous "N"
  const nPoints = [
    // Left vertical stem
    { x: 30, y: 18 },
    { x: 30, y: 38 },
    { x: 30, y: 58 },
    { x: 30, y: 78 },
    // Diagonal cross
    { x: 40, y: 33 },
    { x: 50, y: 48 },
    { x: 60, y: 63 },
    // Right vertical stem
    { x: 70, y: 18 },
    { x: 70, y: 38 },
    { x: 70, y: 58 },
    { x: 70, y: 78 },
  ];

  // Continuous shooting star shower effect
  useEffect(() => {
    sound.playConstellationSuccess();
    triggerHaptic([100, 60, 120, 60, 180]);
    sparkles.burst(window.innerWidth / 2, window.innerHeight * 0.35, 60);

    // Animate assembling the N
    const timer = setTimeout(() => {
      setStarsAssembled(true);
    }, 400);

    const canvas = showerCanvasRef.current;
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

    interface ShowerStar {
      x: number;
      y: number;
      vx: number;
      vy: number;
      len: number;
      alpha: number;
      color: string;
    }

    const showerStars: ShowerStar[] = [];
    const colors = ['#00F0FF', '#FCD34D', '#FFFFFF', '#38BDF8'];

    const spawnStar = () => {
      const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.2;
      const speed = 7 + Math.random() * 8;
      showerStars.push({
        x: Math.random() * width * 1.2 - width * 0.2,
        y: -30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: 40 + Math.random() * 50,
        alpha: 0.9,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };

    let frameCount = 0;
    const render = () => {
      frameCount++;
      if (frameCount % 18 === 0 && showerStars.length < 12) {
        spawnStar();
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = showerStars.length - 1; i >= 0; i--) {
        const s = showerStars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= 0.012;

        if (s.alpha <= 0 || s.y > height + 50) {
          showerStars.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 3.5, s.y - s.vy * 3.5);
        ctx.stroke();

        // Glowing head
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('STARDUST');
    setCopied(true);
    sound.playWishCaught();
    triggerHaptic(40);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full max-w-md mx-auto flex flex-col items-center px-4 py-2 pb-12 z-10">
      {/* Canvas for shooting star shower */}
      <canvas
        ref={showerCanvasRef}
        className="fixed inset-0 pointer-events-none z-0"
      />

      {/* Intro celebration line */}
      <div className="text-center w-full mb-3 z-10">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-300 tracking-wider uppercase mb-1">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Odyssey Concluded</span>
          <span className="text-white/40">·</span>
          <span>Year 23</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-cyan-300">
          The Stars Have Aligned
        </h2>
      </div>

      {/* Luminous "N" Constellation Box */}
      <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[300px] rounded-3xl bg-[#071338]/85 border border-cyan-400/40 p-4 shadow-[0_0_40px_rgba(0,240,255,0.25)] backdrop-blur-md overflow-hidden select-none mb-4 flex items-center justify-center z-10">
        {/* Deep cyan radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.18)_0%,transparent_75%)] pointer-events-none" />

        {/* SVG Lines forming the N */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
          <defs>
            <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Left Vertical Beam */}
          <line
            x1="30"
            y1="18"
            x2="30"
            y2="78"
            stroke="#00F0FF"
            strokeWidth="3.2"
            filter="url(#laserGlow)"
            className="transition-all duration-1000"
          />
          {/* Diagonal Cross Beam */}
          <line
            x1="30"
            y1="18"
            x2="70"
            y2="78"
            stroke="#FCD34D"
            strokeWidth="3.5"
            filter="url(#laserGlow)"
            className="transition-all duration-1000"
          />
          {/* Right Vertical Beam */}
          <line
            x1="70"
            y1="18"
            x2="70"
            y2="78"
            stroke="#00F0FF"
            strokeWidth="3.2"
            filter="url(#laserGlow)"
            className="transition-all duration-1000"
          />
        </svg>

        {/* Glowing Constellation Stars */}
        {nPoints.map((pt, idx) => (
          <div
            key={idx}
            style={{
              left: `${pt.x}%`,
              top: `${pt.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className={`absolute z-10 rounded-full transition-all duration-700 ${
              starsAssembled ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_14px_#00F0FF,0_0_24px_#FCD34D] ring-2 ring-cyan-200 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Gold Box: "Secret Code: STARDUST" */}
      <div className="w-full rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border-2 border-amber-400/80 p-4 shadow-[0_0_30px_rgba(252,211,77,0.35)] backdrop-blur-md mb-4 flex flex-col items-center text-center z-10">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-widest mb-1">
          <Key className="w-3.5 h-3.5 text-amber-300" />
          <span>Cipher Unlocked</span>
        </div>

        <div className="flex items-center justify-center gap-3 my-1">
          <span className="text-xl sm:text-2xl font-black font-mono tracking-widest text-amber-100 select-all">
            STARDUST
          </span>
          <button
            onClick={handleCopyCode}
            type="button"
            aria-label="Copy secret code"
            className="w-10 h-10 rounded-lg bg-amber-400/30 border border-amber-300/60 text-amber-200 flex items-center justify-center hover:bg-amber-400/50 active:scale-95 transition-all cursor-pointer min-h-[40px]"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <span className="text-[11px] text-amber-200/80">
          {copied ? 'Code copied to clipboard!' : 'Secret Code: STARDUST'}
        </span>
      </div>

      {/* Sincere, respectful, warm note */}
      <div className="w-full bg-[#08173E]/90 border border-cyan-500/30 rounded-2xl p-4 text-center mb-5 backdrop-blur-md z-10">
        <p className="text-sm font-semibold text-slate-100 leading-relaxed mb-2">
          "At 23, you navigate the world with an engineering mind, a quiet discipline, and a character that never wavers."
        </p>
        <p className="text-xs text-cyan-200/90 leading-relaxed italic">
          "May your trajectory stay true, your curiosity stay relentless, and your standards stay uncompromised. Keep building what matters."
        </p>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex flex-col gap-2.5 z-10">
        <button
          onClick={onReplay}
          type="button"
          className="w-full h-13 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.35)] active:scale-98 transition-all cursor-pointer min-h-[50px]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Replay The Odyssey</span>
        </button>

        <div className="w-full grid grid-cols-2 gap-2">
          <button
            onClick={onOpenAchievements}
            type="button"
            className="h-11 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 hover:text-white active:scale-95 transition-all cursor-pointer min-h-[44px]"
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>Badges</span>
          </button>

          <button
            onClick={onResetAll}
            type="button"
            className="h-11 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-400 text-xs font-medium flex items-center justify-center gap-1.5 hover:text-rose-300 active:scale-95 transition-all cursor-pointer min-h-[44px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Progress</span>
          </button>
        </div>
      </div>
    </div>
  );
};
