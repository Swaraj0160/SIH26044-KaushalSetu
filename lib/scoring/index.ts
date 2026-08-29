/**
 * Deterministic business logic lives here.
 *
 * Competency scoring, skill-gap computation and match ranking must be pure,
 * testable functions — NOT AI calls. AI may *explain* a score; it must never
 * *be* the score. Implementations land in the master build phase.
 */

export type Scored<T> = T & { score: number };

/** Clamp a number into the inclusive [min, max] range. */
export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}
