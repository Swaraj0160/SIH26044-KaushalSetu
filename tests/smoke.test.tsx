import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";
import { safeValidate, z } from "@/lib/validation";

describe("environment smoke test", () => {
  it("renders React + jsdom + jest-dom together", () => {
    render(<button type="button">Ready</button>);
    expect(screen.getByRole("button", { name: "Ready" })).toBeInTheDocument();
  });

  it("cn() merges and dedupes tailwind classes", () => {
    expect(cn("px-2", "px-4", false && "hidden", "text-sm")).toBe(
      "px-4 text-sm",
    );
  });

  it("zod validation helper returns typed results", () => {
    const schema = z.object({ email: z.email() });
    expect(safeValidate(schema, { email: "a@b.com" })).toEqual({
      success: true,
      data: { email: "a@b.com" },
    });
    const bad = safeValidate(schema, { email: "nope" });
    expect(bad.success).toBe(false);
  });
});
