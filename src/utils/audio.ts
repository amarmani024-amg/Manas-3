/**
 * Web Audio API ambient soundscape and sound effects.
 * Synthesized completely client-side. Zero external audio file dependencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isAmbientRunning: boolean = false;
  private ambientTimer: number | null = null;

  public init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.45, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch {
      // Audio not supported in environment
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.45, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public startAmbient() {
    this.init();
    if (!this.ctx || this.isAmbientRunning) return;
    this.isAmbientRunning = true;

    // Gentle random celestial pentatonic arpeggio chords
    const notes = [130.81, 164.81, 196.00, 246.94, 261.63, 329.63, 392.00, 493.88];
    let noteIndex = 0;

    const playPadNote = () => {
      if (!this.isAmbientRunning || !this.ctx || !this.masterGain) return;
      if (this.isMuted) {
        this.ambientTimer = window.setTimeout(playPadNote, 3500);
        return;
      }

      try {
        const baseFreq = notes[noteIndex % notes.length];
        noteIndex = (noteIndex + 1 + Math.floor(Math.random() * 3)) % notes.length;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, this.ctx.currentTime);

        const now = this.ctx.currentTime;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.08, now + 1.5);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 4.8);
      } catch {
        // Ignore audio errors
      }

      this.ambientTimer = window.setTimeout(playPadNote, 2800 + Math.random() * 1200);
    };

    playPadNote();
  }

  public playStarChime(freq = 659.25) {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      // Subtle pitch bend upwards
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + 0.35);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.65);
    } catch {
      // Ignore
    }
  }

  public playConstellationSuccess() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      // Dreamy celebratory chord: C5, E5, G5, B5, D6
      const chord = [523.25, 659.25, 783.99, 987.77, 1174.66];
      chord.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        const startTime = now + idx * 0.08;
        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + 1.3);
      });
    } catch {
      // Ignore
    }
  }

  public playShieldHit() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Ignore
    }
  }

  public playWishCaught() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      // High bright celestial bell sparkle
      [880, 1318.51, 1760].forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0.15, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.8);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.85);
      });
    } catch {
      // Ignore
    }
  }

  public playMoonBell() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(432, now + 1.2);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 1.25);
    } catch {
      // Ignore
    }
  }

  public playSecretRevealed() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [587.33, 739.99, 880.00, 1174.66];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.18, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.9);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.95);
      });
    } catch {
      // Ignore
    }
  }

  public playMeteorVictory() {
    this.playConstellationSuccess();
  }
}

export const sound = new SoundEngine();
