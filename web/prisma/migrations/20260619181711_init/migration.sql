-- CreateTable
CREATE TABLE "CompanyProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteName" TEXT NOT NULL,
    "homeTitle" TEXT NOT NULL,
    "homeSubtitle" TEXT NOT NULL,
    "heroBadgeText" TEXT NOT NULL,
    "ctaText" TEXT NOT NULL,
    "disclaimerText" TEXT NOT NULL,
    "footerText" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "HomeFeature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyProfileId" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "HomeFeature_companyProfileId_fkey" FOREIGN KEY ("companyProfileId") REFERENCES "CompanyProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HomeBenefit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyProfileId" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "HomeBenefit_companyProfileId_fkey" FOREIGN KEY ("companyProfileId") REFERENCES "CompanyProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrustBadge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyProfileId" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "TrustBadge_companyProfileId_fkey" FOREIGN KEY ("companyProfileId") REFERENCES "CompanyProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AboutContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pageTitle" TEXT NOT NULL,
    "pageSubtitle" TEXT NOT NULL,
    "howItWorksTitle" TEXT NOT NULL,
    "benefitsTitle" TEXT NOT NULL,
    "roadmapTitle" TEXT NOT NULL,
    "roadmapSubtitle" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "TestType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aboutContentId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "TestType_aboutContentId_fkey" FOREIGN KEY ("aboutContentId") REFERENCES "AboutContent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HowItWorksStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aboutContentId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "HowItWorksStep_aboutContentId_fkey" FOREIGN KEY ("aboutContentId") REFERENCES "AboutContent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AboutBenefit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aboutContentId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "AboutBenefit_aboutContentId_fkey" FOREIGN KEY ("aboutContentId") REFERENCES "AboutContent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoadmapItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aboutContentId" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "RoadmapItem_aboutContentId_fkey" FOREIGN KEY ("aboutContentId") REFERENCES "AboutContent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SecurityContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pageTitle" TEXT NOT NULL,
    "pageSubtitle" TEXT NOT NULL,
    "commitmentTitle" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "SecurityCommitment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "securityContentId" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "SecurityCommitment_securityContentId_fkey" FOREIGN KEY ("securityContentId") REFERENCES "SecurityContent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PrivacyCommitment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "securityContentId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "PrivacyCommitment_securityContentId_fkey" FOREIGN KEY ("securityContentId") REFERENCES "SecurityContent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ThemeConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "primary" TEXT NOT NULL,
    "primaryForeground" TEXT NOT NULL,
    "secondary" TEXT NOT NULL,
    "accent" TEXT NOT NULL,
    "background" TEXT NOT NULL,
    "foreground" TEXT NOT NULL,
    "muted" TEXT NOT NULL,
    "border" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "themeConfigId" TEXT NOT NULL,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "allowAnonymousTest" BOOLEAN NOT NULL DEFAULT true,
    "maxAnonymousTests" INTEGER NOT NULL DEFAULT 5,
    "defaultPreset" TEXT NOT NULL DEFAULT 'pre-launch',
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Settings_themeConfigId_fkey" FOREIGN KEY ("themeConfigId") REFERENCES "ThemeConfig" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "avatarUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "url" TEXT NOT NULL,
    "preset" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "overallScore" INTEGER,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "config" TEXT,
    CONSTRAINT "TestRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testRunId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "score" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    CONSTRAINT "TestResult_testRunId_fkey" FOREIGN KEY ("testRunId") REFERENCES "TestRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "testResultId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "fix" TEXT NOT NULL,
    "code" TEXT,
    CONSTRAINT "Issue_testResultId_fkey" FOREIGN KEY ("testResultId") REFERENCES "TestResult" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LoadTest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "url" TEXT NOT NULL,
    "vus" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "rampUp" INTEGER NOT NULL,
    "maxRps" INTEGER NOT NULL,
    "paths" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "summaryJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "LoadTest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WebhookEndpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "events" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WebhookEndpoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WebhookDelivery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "webhookEndpointId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "statusCode" INTEGER,
    "responseBody" TEXT,
    "deliveredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WebhookDelivery_webhookEndpointId_fkey" FOREIGN KEY ("webhookEndpointId") REFERENCES "WebhookEndpoint" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TestType_aboutContentId_slug_key" ON "TestType"("aboutContentId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
