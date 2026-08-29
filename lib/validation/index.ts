import { z } from "zod";

export { z };

/** Flattens a ZodError into `{ "path.to.field": "message" }` for form display. */
export function formatZodError(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_root";
    fieldErrors[key] ??= issue.message;
  }
  return fieldErrors;
}

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

/** Parse without throwing; returns a discriminated result. */
export function safeValidate<T>(
  schema: z.ZodType<T>,
  input: unknown,
): ValidationResult<T> {
  const parsed = schema.safeParse(input);
  return parsed.success
    ? { success: true, data: parsed.data }
    : { success: false, errors: formatZodError(parsed.error) };
}
