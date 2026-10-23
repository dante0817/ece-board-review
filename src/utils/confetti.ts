import confetti from 'canvas-confetti';

/**
 * Fires a high-energy, multi-stage celebratory confetti explosion
 * when the user completes their Daily Study Goal in the TodayScreen.
 */
export function triggerDailyGoalConfetti(): void {
  if (typeof window === 'undefined') return;

  const count = 180;
  const boardColors = [
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#fbbf24', // Gold
    '#059669', // Deep Emerald
    '#3b82f6', // Sapphire
    '#f43f5e', // Rose
    '#8b5cf6', // Violet
  ];

  const baseConfig: confetti.Options = {
    disableForReducedMotion: true,
    zIndex: 99999,
  };

  const fire = (particleRatio: number, opts: confetti.Options) => {
    try {
      confetti({
        ...baseConfig,
        ...opts,
        colors: opts.colors || boardColors,
        particleCount: Math.floor(count * particleRatio),
      });
    } catch {
      // Graceful fallback
    }
  };

  // 1. Center burst of sparkling stars
  fire(0.25, {
    spread: 30,
    startVelocity: 55,
    origin: { x: 0.5, y: 0.65 },
    shapes: ['star'],
    scalar: 1.2,
  });

  // 2. Left angled cannon
  setTimeout(() => {
    fire(0.2, {
      spread: 65,
      angle: 60,
      startVelocity: 60,
      origin: { x: 0.15, y: 0.75 },
    });
  }, 100);

  // 3. Right angled cannon
  setTimeout(() => {
    fire(0.2, {
      spread: 65,
      angle: 120,
      startVelocity: 60,
      origin: { x: 0.85, y: 0.75 },
    });
  }, 200);

  // 4. Wide apex shower
  setTimeout(() => {
    fire(0.35, {
      spread: 120,
      decay: 0.91,
      scalar: 0.9,
      origin: { x: 0.5, y: 0.55 },
    });
  }, 350);
}

/**
 * Fires a grand, multi-burst celebration effect when a subject hits 100% Mastery Milestone.
 * Features dual corner cannons, high-velocity golden star bursts, and continuous ribbon cascade.
 */
export function triggerSubjectMastery100Confetti(): void {
  if (typeof window === 'undefined') return;

  const goldColors = ['#f59e0b', '#fbbf24', '#fef08a', '#10b981', '#059669', '#3b82f6', '#ec4899'];
  const baseConfig: confetti.Options = {
    disableForReducedMotion: true,
    zIndex: 99999,
  };

  const fire = (particleRatio: number, opts: confetti.Options) => {
    try {
      confetti({
        ...baseConfig,
        ...opts,
        colors: opts.colors || goldColors,
        particleCount: Math.floor(240 * particleRatio),
      });
    } catch {
      // Graceful fallback
    }
  };

  // Wave 1: Instant golden star center pop
  fire(0.3, {
    spread: 45,
    startVelocity: 65,
    origin: { x: 0.5, y: 0.6 },
    shapes: ['star'],
    scalar: 1.3,
  });

  // Wave 2: Left corner blast
  setTimeout(() => {
    fire(0.25, {
      spread: 70,
      angle: 55,
      startVelocity: 65,
      origin: { x: 0.05, y: 0.8 },
    });
  }, 120);

  // Wave 3: Right corner blast
  setTimeout(() => {
    fire(0.25, {
      spread: 70,
      angle: 125,
      startVelocity: 65,
      origin: { x: 0.95, y: 0.8 },
    });
  }, 240);

  // Wave 4: High sky star rain
  setTimeout(() => {
    fire(0.35, {
      spread: 140,
      decay: 0.92,
      startVelocity: 45,
      scalar: 1.1,
      origin: { x: 0.5, y: 0.4 },
      shapes: ['star', 'circle'],
    });
  }, 400);

  // Wave 5: Final triumphant double blast
  setTimeout(() => {
    fire(0.2, {
      spread: 90,
      angle: 60,
      origin: { x: 0.2, y: 0.7 },
    });
    fire(0.2, {
      spread: 90,
      angle: 120,
      origin: { x: 0.8, y: 0.7 },
    });
  }, 650);
}
