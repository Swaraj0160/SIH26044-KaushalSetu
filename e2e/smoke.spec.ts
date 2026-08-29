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

test("landing → Enter platform → sign-in screen", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: /enter platform/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  await expect(page.getByText(/demo environment/i)).toBeVisible();
});

test("unauthenticated workspace access redirects to /login", async ({
  page,
}) => {
  await page.goto("/student");
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/institution/heatmap");
  await expect(page).toHaveURL(/\/login/);
});

test("manual sign-in with demo credentials routes to the role home", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel(/username/i).fill("student");
  await page.getByLabel(/password/i).fill("student123");
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await page.waitForURL(/\/student$/);
  await expect(
    page.getByRole("heading", {
      name: /good (morning|afternoon|evening), Aarav/i,
    }),
  ).toBeVisible();
});

test("bad credentials show an error, no redirect", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/username/i).fill("student");
  await page.getByLabel(/password/i).fill("nope");
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await expect(page.getByText(/invalid demo credentials/i)).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("student journey: home → education → skills → projects → career → profile", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /continue as student/i }).click();
  await page.waitForURL(/\/student$/);

  // orientation home: journey spine + next best action
  await expect(page.getByText(/^your journey$/i)).toBeVisible();
  await expect(page.getByText(/you are here/i)).toBeVisible();
  await expect(page.getByText(/your next best action/i)).toBeVisible();

  await page.goto("/student/education");
  await expect(page.getByText(/where your skills came from/i)).toBeVisible();
  await expect(page.getByText(/courses .* → skills produced/i)).toBeVisible();

  await page.goto("/student/skills");
  await expect(page.getByText(/evidence ledger/i)).toBeVisible();

  await page.goto("/student/projects");
  await expect(page.getByText(/evidence factory/i)).toBeVisible();

  await page.goto("/student/career");
  await expect(page.getByRole("link", { name: /^Goal$/ })).toBeVisible();
  await expect(page.getByText(/roles you are closest to/i)).toBeVisible();
  await page.goto("/student/career?tab=readiness");
  await expect(page.getByText(/deterministic score/i)).toBeVisible();

  await page.goto("/student/profile");
  await expect(page.getByText(/single source of truth/i)).toBeVisible();
});

test("wrong-role access bounces to the caller's own home", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /continue as student/i }).click();
  await page.waitForURL(/\/student$/);
  await page.goto("/institution/heatmap");
  await expect(page).toHaveURL(/\/student$/);
});

test("industry sign-in lands on the talent pipeline", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /continue as industry/i }).click();
  await page.waitForURL(/\/industry$/);
  await expect(page.getByText(/talent pipeline/i)).toBeVisible();
  await page.goto("/recruiter/opportunities/opp-hero-ml");
  await expect(page.getByText(/candidate ranking/i)).toBeVisible();
});

test("institution sign-in → command center → heatmap drilldown", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /continue as institution/i }).click();
  await page.waitForURL(/\/institution$/);
  await page.goto("/institution/heatmap");
  await expect(
    page.getByRole("heading", { name: /institutional skill heatmap/i }),
  ).toBeVisible();
  await page.locator("table button").first().click();
  await expect(
    page.getByText(/recommended institutional action/i),
  ).toBeVisible();
});

test("sign out returns to the landing page", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /continue as faculty/i }).click();
  await page.waitForURL(/\/faculty$/);
  await page.getByRole("button", { name: /sign out/i }).click();
  await page.waitForURL("/");
  await expect(
    page.getByRole("link", { name: /enter platform/i }).first(),
  ).toBeVisible();
});

test("judge demo persona picker still works", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: /Enter as Aarav/i }).click();
  await page.waitForURL(/\/student$/);
});

test("credential verification: known id verifies, unknown id fails", async ({
  page,
}) => {
  await page.goto("/verify/KS-PASSPORT-AARAV");
  await expect(page.getByText(/Verified/i).first()).toBeVisible();
  await page.goto("/verify/KS-NOPE-0000");
  await expect(page.getByText(/not found/i)).toBeVisible();
});

test("internship workspace shows the full lifecycle pipeline", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /continue as student/i }).click();
  await page.waitForURL(/\/student$/);
  await page.goto("/student/internship");
  await expect(page.getByText(/^Lifecycle$/)).toBeVisible();
  await expect(page.getByText(/Onboarding/).first()).toBeVisible();
  await expect(page.getByText(/Mentor feedback/).first()).toBeVisible();
  await expect(page.getByText(/Verified skills/).first()).toBeVisible();
});

test("achievements and certifications render with skill links", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /continue as student/i }).click();
  await page.waitForURL(/\/student$/);
  await page.goto("/student/achievements");
  await expect(
    page.getByRole("heading", { name: /achievements/i }),
  ).toBeVisible();
  await page.goto("/student/certifications");
  await expect(
    page.getByRole("heading", { name: /certifications/i }),
  ).toBeVisible();
});

test("legacy student list routes redirect into the Career destination", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /continue as student/i }).click();
  await page.waitForURL(/\/student$/);
  await page.goto("/student/gaps");
  await expect(page).toHaveURL(/\/student\/career\?tab=gaps/);
  await page.goto("/student/simulator");
  await expect(page).toHaveURL(/\/student\/career\?tab=explore/);
});

test("faculty verification offers approve and request-changes", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /continue as faculty/i }).click();
  await page.waitForURL(/\/faculty$/);
  await page.goto("/faculty/verification");
  await expect(
    page.getByRole("button", { name: /^Approve$/ }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /request changes/i }).first(),
  ).toBeVisible();
});

test("command palette opens with the keyboard and navigates", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /continue as student/i }).click();
  await page.waitForURL(/\/student$/);
  await page.getByRole("button", { name: /open command palette/i }).click();
  const box = page.getByPlaceholder(/jump to a page or action/i);
  await expect(box).toBeVisible();
  await box.fill("passport");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/student\/passport/);
});
