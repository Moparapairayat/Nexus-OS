import { test, expect } from "@playwright/test";

test.describe("NexusOS Enterprise E2E Test Suite", () => {
  test("Loads Admin Control Center Dashboard", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveTitle(/NexusOS/i);
    await expect(page.locator("h1, h2, h3")).toBeVisible();
  });

  test("Loads Client Portal Digital Asset Workspace", async ({ page }) => {
    await page.goto("/client/services");
    await expect(page.locator("body")).toBeVisible();
  });

  test("Loads Admin Invoices Workspace", async ({ page }) => {
    await page.goto("/admin/invoices");
    await expect(page.locator("body")).toBeVisible();
  });

  test("Loads Digital Vault Workspace", async ({ page }) => {
    await page.goto("/admin/documents");
    await expect(page.locator("body")).toBeVisible();
  });

  test("Loads Automation Engine Workspace", async ({ page }) => {
    await page.goto("/admin/automation");
    await expect(page.locator("body")).toBeVisible();
  });

  test("Loads Security Operations Center", async ({ page }) => {
    await page.goto("/admin/security");
    await expect(page.locator("body")).toBeVisible();
  });

  test("Loads Operations Center & Diagnostics", async ({ page }) => {
    await page.goto("/admin/operations");
    await expect(page.locator("body")).toBeVisible();
  });
});
