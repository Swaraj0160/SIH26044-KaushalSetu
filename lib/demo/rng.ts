/** Deterministic PRNG (mulberry32) + sampling helpers for demo generation. */

export class Rng {
  private s: number;
  constructor(seed = 26044) {
    this.s = seed >>> 0;
  }
  next(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  float(min: number, max: number, dp = 2): number {
    const v = this.next() * (max - min) + min;
    const f = 10 ** dp;
    return Math.round(v * f) / f;
  }
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
  chance(p: number): boolean {
    return this.next() < p;
  }
  sample<T>(arr: readonly T[], n: number): T[] {
    const copy = [...arr];
    const out: T[] = [];
    while (out.length < n && copy.length) {
      out.push(copy.splice(Math.floor(this.next() * copy.length), 1)[0]);
    }
    return out;
  }
  weightedLevel(centre: number, spread = 1.5): number {
    // triangular-ish around centre, clamped 1..8
    const r = (this.next() + this.next() + this.next()) / 3; // ~normal 0..1
    const v = Math.round(centre + (r - 0.5) * 2 * spread);
    return Math.max(1, Math.min(8, v));
  }
}

export function isoDaysAgo(days: number): string {
  const d = new Date("2026-08-25T00:00:00.000Z");
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export function isoDaysAhead(days: number): string {
  return isoDaysAgo(-days);
}
