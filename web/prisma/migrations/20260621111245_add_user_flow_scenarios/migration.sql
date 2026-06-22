/*
  Warnings:

  - You are about to drop the column `config` on the `TestRun` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `TestRun` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "TestScenario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ScenarioStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testScenarioId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "selector" TEXT,
    "value" TEXT,
    "assertionText" TEXT,
    "waitMs" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ScenarioStep_testScenarioId_fkey" FOREIGN KEY ("testScenarioId") REFERENCES "TestScenario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScenarioResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testRunId" TEXT NOT NULL,
    "testScenarioId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "durationMs" INTEGER,
    "errorMessage" TEXT,
    "screenshotPath" TEXT,
    "stepResults" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScenarioResult_testRunId_fkey" FOREIGN KEY ("testRunId") REFERENCES "TestRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScenarioResult_testScenarioId_fkey" FOREIGN KEY ("testScenarioId") REFERENCES "TestScenario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TestRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "url" TEXT NOT NULL,
    "preset" TEXT NOT NULL DEFAULT 'pre-launch',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "overallScore" INTEGER,
    "aiSummary" TEXT,
    "aiFixPlan" TEXT,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TestRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TestRun" ("aiFixPlan", "aiSummary", "completedAt", "id", "overallScore", "preset", "startedAt", "status", "url", "userId") SELECT "aiFixPlan", "aiSummary", "completedAt", "id", "overallScore", "preset", "startedAt", "status", "url", "userId" FROM "TestRun";
DROP TABLE "TestRun";
ALTER TABLE "new_TestRun" RENAME TO "TestRun";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ScenarioResult_testRunId_testScenarioId_key" ON "ScenarioResult"("testRunId", "testScenarioId");
