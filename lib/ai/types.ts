/**
 * Provider-agnostic AI contract.
 *
 * The product code depends ONLY on this interface. Swapping MOCK <-> GEMINI is a
 * configuration change (`AI_PROVIDER` env var), never a refactor.
 */

export type AiProviderName = "mock" | "gemini";

export interface AiGenerateOptions {
  /** System / instruction prompt. */
  system?: string;
  temperature?: number;
  maxOutputTokens?: number;
  /** Opaque tag for logging / tracing. */
  requestId?: string;
}

export interface AiMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AiUsage {
  inputTokens?: number;
  outputTokens?: number;
}

export interface AiCompletion {
  text: string;
  provider: AiProviderName;
  model: string;
  usage?: AiUsage;
  /** True when the response was produced by a deterministic mock, not a real model. */
  mock: boolean;
}

export interface AiProvider {
  readonly name: AiProviderName;
  readonly model: string;
  /** Whether this provider can serve requests right now (keys present, etc.). */
  isAvailable(): boolean;
  generateText(
    prompt: string,
    options?: AiGenerateOptions,
  ): Promise<AiCompletion>;
  chat(
    messages: AiMessage[],
    options?: AiGenerateOptions,
  ): Promise<AiCompletion>;
}
