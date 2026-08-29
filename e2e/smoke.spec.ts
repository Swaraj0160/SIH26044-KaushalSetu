import { expect, test } from "@playwright/test";

test("health API is green and reports a working AI provider", async ({
  request,
}) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.application).toBe("ok");
  expect(["mock", "gemini"]).toContain(body.ai.provider);
});

test("landing page communicates the positioning", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /skills to opportunities/i,
  );
  await expect(
    page.getByRole("link", { name: /explore judge demo/i }).first(),
  ).toBeVisible();
});

test("judge technical showcase renders", async ({ page }) => {
  await page.goto("/judge");
  await expect(
    page.getByRole("heading", { name: /technical showcase/i }),
  ).toBeVisible();
  await expect(page.getByText(/deterministic engines/i)).toBeVisible();
});

test("credential verification: known id verifies, unknown id fails", async ({
  page,
}) => {
  await page.goto("/verify/KS-PASSPORT-AARAV");
  await expect(page.getByText(/Verified/i).first()).toBeVisible();
  await page.goto("/verify/KS-NOPE-0000");
  await expect(page.getByText(/not found/i)).toBeVisible();
});

test("judge demo: enter as student, walk the core flow", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: /Enter as Aarav/i }).click();
  await page.waitForURL(/\/student$/);
  await expect(page.getByText(/Career readiness/i).first()).toBeVisible();

  // competency graph present
  await expect(
    page.getByRole("img", { name: /Competency map/i }),
  ).toBeVisible();

  // explainable match on an opportunity
  await page.goto("/student/opportunities/opp-hero-ml");
  await expect(page.getByText(/Why this match/i)).toBeVisible();
  await expect(page.getByText(/Mandatory competency coverage/i)).toBeVisible();
  await expect(page.getByText(/How to become ready/i)).toBeVisible();

  // skill gaps + roadmap
  await page.goto("/student/gaps");
  await expect(
    page.getByText(/Sequenced to respect skill prerequisites/i),
  ).toBeVisible();
  await expect(page.getByText(/Evidence produced:/i).first()).toBeVisible();
});

test("judge demo: recruiter sees an explainable ranking reconciled to the student", async ({
  page,
}) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: /Enter as Rohan/i }).click();
  await page.waitForURL(/\/recruiter$/);
  await page.goto("/recruiter/opportunities/opp-hero-ml");
  await expect(page.getByText(/candidate ranking/i)).toBeVisible();
  await expect(
    page.getByText(/Mandatory competency coverage/i).first(),
  ).toBeVisible();
});

test("judge demo: institution heatmap drills into a cell", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: /Enter as Dr\./i }).last().click();
  await page.waitForURL(/\/institution$/);
  await page.goto("/institution/heatmap");
  await expect(
    page.getByRole("heading", { name: /Institutional Skill Heatmap/i }),
  ).toBeVisible();
  // first heatmap cell button
  const cell = page.locator("table button").first();
  await cell.click();
  await expect(
    page.getByText(/Recommended institutional action/i),
  ).toBeVisible();
});
