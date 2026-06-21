import type { Page } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { prisma } from "@/lib/prisma";

export interface StepResult {
  order: number;
  action: string;
  selector?: string | null;
  value?: string | null;
  status: "passed" | "failed" | "skipped";
  message?: string;
  durationMs: number;
}

export async function runScenarios(page: Page, testRunId: string, baseUrl: string) {
  const scenarios = await prisma.testScenario.findMany({
    where: { isActive: true },
    include: { steps: { orderBy: { order: "asc" } } },
  });

  if (scenarios.length === 0) return [];

  const results: { scenarioId: string; status: string; error?: string; stepResults: StepResult[] }[] = [];

  for (const scenario of scenarios) {
    const stepResults: StepResult[] = [];
    const start = Date.now();
    let status: "passed" | "failed" | "skipped" = "passed";
    let errorMessage: string | undefined;

    try {
      const startUrl = scenario.startUrl.startsWith("http")
        ? scenario.startUrl
        : new URL(scenario.startUrl, baseUrl).href;

      for (const step of scenario.steps) {
        const stepStart = Date.now();
        let stepStatus: StepResult["status"] = "passed";
        let stepMessage = "";

        try {
          switch (step.action) {
            case "navigate": {
              const target = step.value?.startsWith("http") ? step.value : step.value
                ? new URL(step.value, baseUrl).href
                : startUrl;
              await page.goto(target, { waitUntil: "networkidle", timeout: 30000 });
              break;
            }
            case "click": {
              if (!step.selector) throw new Error("Selector diperlukan untuk click");
              await page.click(step.selector, { timeout: 10000 });
              break;
            }
            case "type": {
              if (!step.selector) throw new Error("Selector diperlukan untuk type");
              await page.fill(step.selector, step.value || "", { timeout: 10000 });
              break;
            }
            case "submit": {
              if (!step.selector) throw new Error("Selector diperlukan untuk submit");
              await page.press(step.selector, "Enter");
              await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
              break;
            }
            case "wait": {
              await page.waitForTimeout(step.waitMs || 1000);
              break;
            }
            case "hover": {
              if (!step.selector) throw new Error("Selector diperlukan untuk hover");
              await page.hover(step.selector, { timeout: 10000 });
              break;
            }
            case "scroll": {
              await page.evaluate(() => window.scrollBy(0, window.innerHeight));
              await page.waitForTimeout(300);
              break;
            }
            case "assertText": {
              if (!step.selector) throw new Error("Selector diperlukan untuk assertText");
              const text = await page.locator(step.selector).textContent({ timeout: 10000 });
              const expected = step.assertionText || "";
              if (!text || !text.includes(expected)) {
                throw new Error(`Teks "${expected}" tidak ditemukan. Aktual: "${text || "kosong"}"`);
              }
              break;
            }
            case "assertVisible": {
              if (!step.selector) throw new Error("Selector diperlukan untuk assertVisible");
              const visible = await page.locator(step.selector).isVisible({ timeout: 10000 });
              if (!visible) throw new Error("Elemen tidak terlihat");
              break;
            }
            case "assertValue": {
              if (!step.selector) throw new Error("Selector diperlukan untuk assertValue");
              const val = await page.inputValue(step.selector, { timeout: 10000 });
              const expected = step.value || "";
              if (val !== expected) {
                throw new Error(`Nilai "${expected}" diharapkan, aktual "${val}"`);
              }
              break;
            }
            case "screenshot": {
              const dir = path.join(process.cwd(), "public", "scenarios", testRunId);
              if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
              const filePath = path.join(dir, `${scenario.id}.png`);
              await page.screenshot({ path: filePath, fullPage: false });
              stepMessage = filePath.replace(process.cwd(), "").replace(/\\/g, "/");
              break;
            }
            default: {
              stepStatus = "skipped";
              stepMessage = `Aksi "${step.action}" belum didukung`;
            }
          }
        } catch (err: any) {
          stepStatus = "failed";
          stepMessage = err.message || String(err);
          status = "failed";
          if (!errorMessage) errorMessage = `Langkah ${step.order + 1} (${step.action}): ${stepMessage}`;
        }

        stepResults.push({
          order: step.order,
          action: step.action,
          selector: step.selector,
          value: step.value,
          status: stepStatus,
          message: stepMessage,
          durationMs: Date.now() - stepStart,
        });

        if (status === "failed") break;
      }
    } catch (err: any) {
      status = "failed";
      errorMessage = err.message || String(err);
    }

    if (status === "passed" && stepResults.every((s) => s.status === "skipped")) {
      status = "skipped";
    }

    results.push({
      scenarioId: scenario.id,
      status,
      error: errorMessage,
      stepResults,
    });

    const screenshotPath = stepResults.find((s) => s.action === "screenshot")?.message;

    await prisma.scenarioResult.upsert({
      where: {
        testRunId_testScenarioId: { testRunId, testScenarioId: scenario.id },
      },
      update: {
        status,
        durationMs: Date.now() - start,
        errorMessage,
        screenshotPath,
        stepResults: JSON.stringify(stepResults),
      },
      create: {
        testRunId,
        testScenarioId: scenario.id,
        status,
        durationMs: Date.now() - start,
        errorMessage,
        screenshotPath,
        stepResults: JSON.stringify(stepResults),
      },
    });
  }

  return results;
}
