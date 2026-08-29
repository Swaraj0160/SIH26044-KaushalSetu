/**
 * @vitest-environment node
 *
 * The AI factory reads server-only env vars, so it must run in a Node (not
 * jsdom) environment — otherwise @t3-oss/env-nextjs blocks the access.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MockAiProvider } from "@/lib/ai/mock-provider";

describe("MockAiProvider", () => {
  const provider = new MockAiProvider();

  it("is always available", () => {
    expect(provider.isAvailable()).toBe(true);
  });

  it("is deterministic for the same input", async () => {
    const a = await provider.generateText("map skills for a backend intern");
    const b = await provider.generateText("map skills for a backend intern");
    expect(a.text).toBe(b.text);
    expect(a.mock).toBe(true);
    expect(a.provider).toBe("mock");
  });

  it("varies output when the prompt changes", async () => {
    const a = await provider.generateText("prompt one");
    const b = await provider.generateText("prompt two");
    expect(a.text).not.toBe(b.text);
  });

  it("chat() uses the last user message", async () => {
    const viaChat = await provider.chat([
      { role: "system", content: "be terse" },
      { role: "user", content: "hello" },
      { role: "assistant", content: "hi" },
      { role: "user", content: "final question" },
    ]);
    const viaText = await provider.generateText("final question", {
      system: "be terse",
    });
    expect(viaChat.text).toBe(viaText.text);
  });
});

describe("getAiProvider factory", () => {
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("falls back to mock when no Gemini key is present", async () => {
    vi.stubEnv("AI_PROVIDER", "gemini");
    vi.stubEnv("GEMINI_API_KEY", "");
    const { getAiProvider, resetAiProviderCache } = await import("@/lib/ai");
    resetAiProviderCache();
    expect(getAiProvider().name).toBe("mock");
  });
});
