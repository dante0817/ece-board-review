/** Fail-closed local-study API policy. A shared server never exports Gemini access anonymously. */
export function isLoopbackRemote(address: string | undefined): boolean {
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1';
}

/** A browser origin must be the exact authority from which it loaded this app. */
export function sameOrigin(origin: string | undefined, host: string | undefined): boolean {
  if (!origin) return true; // command-line API clients do not send Origin; network authorization still applies.
  if (!host) return false;
  try {
    const parsed = new URL(origin);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      parsed.host.toLowerCase() === host.toLowerCase() && parsed.username === '' && parsed.password === '' &&
      parsed.pathname === '/' && parsed.search === '' && parsed.hash === '';
  } catch { return false; }
}

export function isLoopbackHost(host: string | undefined): boolean {
  if (!host) return false;
  try {
    const hostname = new URL(`http://${host}`).hostname.toLowerCase();
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  } catch { return false; }
}

export function canUseAiApi(args: {
  remoteAddress?: string; origin?: string; host?: string; tokenHeader?: string; configuredToken?: string;
}): boolean {
  if (!sameOrigin(args.origin, args.host)) return false;
  // Reject DNS-rebinding hostnames even if the TCP peer itself is loopback.
  if (isLoopbackRemote(args.remoteAddress) && isLoopbackHost(args.host)) return true;
  // LAN clients need an explicit server-side token, even when their Origin is same-host.
  // A token must never be placed in an application bundle or query string.
  return Boolean(args.configuredToken && args.configuredToken.length >= 24 &&
    args.tokenHeader === `Bearer ${args.configuredToken}`);
}

export function validateAiText(value: unknown, maxLength: number): boolean {
  return value === undefined || (typeof value === 'string' && value.length <= maxLength);
}

/** Fixed-window local limits, intentionally fail-closed; no external services needed. */
export class RequestRateGate {
  private readonly calls = new Map<string, { start: number; count: number }>();
  allow(identity: string, now: number, maxCalls: number, windowMs = 60000): boolean {
    // Bound memory across long-lived study sessions.
    if (this.calls.size > 2048) {
      for (const [key, val] of this.calls) if (now - val.start >= windowMs) this.calls.delete(key);
      if (this.calls.size > 2048) this.calls.clear();
    }
    const previous = this.calls.get(identity);
    if (!previous || now - previous.start >= windowMs || now < previous.start) {
      this.calls.set(identity, {start: now, count: 1}); return true;
    }
    if (previous.count >= maxCalls) return false;
    previous.count++; return true;
  }
}
