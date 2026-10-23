/**
 * Synthesizes a celebratory victory fanfare using standard browser Web Audio API.
 * Safe to run in any browser; fails silently if audio context is blocked.
 */
export function playCelebrationFanfare(): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    
    // Joyful notes: C5, E5, G5, C6 (Major celebratory arpeggio)
    const notes = [
      { freq: 523.25, time: 0, duration: 0.18 },    // C5
      { freq: 659.25, time: 0.14, duration: 0.18 }, // E5
      { freq: 783.99, time: 0.28, duration: 0.22 }, // G5
      { freq: 1046.5, time: 0.44, duration: 0.55 }, // C6 (long triumphant ring)
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // Warm, brassy chime
      osc.frequency.setValueAtTime(n.freq, now + n.time);

      gain.gain.setValueAtTime(0, now + n.time);
      gain.gain.linearRampToValueAtTime(0.18, now + n.time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.time);
      osc.stop(now + n.time + n.duration + 0.05);
    });
  } catch {
    // Graceful fallback for environments with blocked audio
  }
}
