import { expect, test } from "@playwright/test";

test("landing page shows simulator entry button", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: /시뮬레이터 열기/i })).toBeVisible();
  await expect(page.getByText("차폐함 시뮬레이터")).toBeVisible();
});
