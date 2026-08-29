import { expect, test } from "@playwright/test";

test("health API responds and reports a working AI provider", async ({
  request,
}) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);

  const body = await res.json();
  expect(body.application).toBe("ok");
  expect(["mock", "gemini"]).toContain(body.ai.provider);
});

test("home page renders the setup placeholder", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText(/environment is ready/i)).toBeVisible();
});

test("health page renders diagnostics", async ({ page }) => {
  await page.goto("/health");
  await expect(page.getByText("Application")).toBeVisible();
  await expect(page.getByText(/NOT CONFIGURED|OK/).first()).toBeVisible();
});
