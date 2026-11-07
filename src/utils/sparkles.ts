/**
 * Gentle celestial sparkle / stardust canvas particle burst.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  rotation: number;
  vRot: number;
}

class SparkleEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private isRunning: boolean = false;

  private init() {
    if (this.canvas) return;
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'fixed';
    this.canvas.style.inset = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '9999';
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    const resize = () => {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
  }

  public burst(centerX?: number, centerY?: number, count = 45) {
    this.init();
    if (!this.canvas) return;

    const x = centerX ?? window.innerWidth / 2;
    const y = centerY ?? window.innerHeight / 2;
    const colors = ['#00F0FF', '#FCD34D', '#F0F6FC', '#38BDF8', '#F59E0B'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 5.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size: 2 + Math.random() * 3.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.012 + Math.random() * 0.018,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.2,
      });
    }

    if (!this.isRunning) {
      this.isRunning = true;
      this.loop();
    }
  }

  private loop = () => {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06; // subtle gravity
      p.alpha -= p.decay;
      p.rotation += p.vRot;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.fillStyle = p.color;

      // Draw 4-point sparkle star
      const s = p.size;
      this.ctx.beginPath();
      this.ctx.moveTo(0, -s * 2);
      this.ctx.lineTo(s * 0.4, -s * 0.4);
      this.ctx.lineTo(s * 2, 0);
      this.ctx.lineTo(s * 0.4, s * 0.4);
      this.ctx.lineTo(0, s * 2);
      this.ctx.lineTo(-s * 0.4, s * 0.4);
      this.ctx.lineTo(-s * 2, 0);
      this.ctx.lineTo(-s * 0.4, -s * 0.4);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(this.loop);
    } else {
      this.isRunning = false;
    }
  };
}

export const sparkles = new SparkleEngine();
