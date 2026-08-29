import type {
  AiCompletion,
  AiGenerateOptions,
  AiMessage,
  AiProvider,
} from "./types";

export interface GeminiProviderConfig {
  apiKey: string;
  model?: string;
}

/**
 * Google Gemini provider — SCAFFOLD ONLY.
 *
 * The Gemini SDK (`@google/genai`) is deliberately NOT a dependency during the
 * setup phase, so nothing here imports it. The class exists so the factory in
 * `lib/ai/index.ts` and the rest of the codebase can already be written against
 * the real provider name.
 *
 * Master build phase TODO:
 *   1. `npm i @google/genai`
 *   2. Implement `generateText` / `chat` with a dynamic `import("@google/genai")`.
 *   3. Delete the `notImplemented()` guard.
 */
export class GeminiAiProvider implements AiProvider {
  readonly name = "gemini" as const;
  readonly model: string;
  readonly #apiKey: string;

  constructor(config: GeminiProviderConfig) {
    this.#apiKey = config.apiKey;
    this.model = config.model ?? "gemini-2.5-flash";
  }

  isAvailable(): boolean {
    return this.#apiKey.length > 0;
  }

  async generateText(
    prompt: string,
    options?: AiGenerateOptions,
  ): Promise<AiCompletion> {
    return this.#notImplemented(prompt, options);
  }

  async chat(
    messages: AiMessage[],
    options?: AiGenerateOptions,
  ): Promise<AiCompletion> {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    return this.#notImplemented(lastUser?.content ?? "", options);
  }

  #notImplemented(
    _prompt: string,
    _options?: AiGenerateOptions,
  ): Promise<AiCompletion> {
    void _prompt;
    void _options;
    return Promise.reject(
      new Error(
        "GeminiAiProvider is not implemented yet. Set AI_PROVIDER=mock, or " +
          "complete the integration in lib/ai/gemini-provider.ts (see DEVELOPMENT.md).",
      ),
    );
  }
}
