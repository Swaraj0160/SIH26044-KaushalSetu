import { env, isGeminiConfigured } from "@/lib/env";

import { GeminiAiProvider } from "./gemini-provider";
import { MockAiProvider } from "./mock-provider";
import type { AiProvider, AiProviderName } from "./types";

export * from "./types";
export { MockAiProvider } from "./mock-provider";
export { GeminiAiProvider } from "./gemini-provider";

let cached: AiProvider | null = null;

/**
 * Returns the active AI provider (singleton).
 *
 * Resolution order:
 *   - `AI_PROVIDER=gemini` AND `GEMINI_API_KEY` present  -> GeminiAiProvider
 *   - otherwise                                          -> MockAiProvider
 *
 * The app therefore always has a working provider, even with no configuration.
 */
export function getAiProvider(): AiProvider {
  if (cached) return cached;
  const useGemini = env.AI_PROVIDER === "gemini" && isGeminiConfigured();
  cached = useGemini
    ? new GeminiAiProvider({ apiKey: env.GEMINI_API_KEY as string })
    : new MockAiProvider();
  return cached;
}

export function getAiProviderName(): AiProviderName {
  return getAiProvider().name;
}

/** Test-only: clears the cached singleton so env changes take effect. */
export function resetAiProviderCache(): void {
  cached = null;
}
