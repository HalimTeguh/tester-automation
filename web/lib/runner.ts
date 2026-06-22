import { chromium } from "playwright";
import lighthouse from "lighthouse";
import * as net from "net";
import * as cheerio from "cheerio";
import { prisma } from "@/lib/prisma";
import { generateAiReport } from "@/lib/ai";
import { runScenarios } from "./scenarios";

function getFreePort(): Promise<number> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(0, () => {
      const port = (server.address() as net.AddressInfo).port;
      server.close(() => resolve(port));
    });
  });
}

async function fetchUrl(url: string, method: string = "GET") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method,
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WebQA/1.0; +https://webqa.local)",
      },
    });
    const text = method === "GET" ? await res.text() : "";
    return {
      ok: res.ok,
      status: res.status,
      headers: res.headers,
      text,
      duration: Date.now() - start,
    };
  } catch {
    return { ok: false, status: 0, headers: new Headers(), text: "", duration: 0 };
  } finally {
    clearTimeout(timeout);
  }
}

function sameOrigin(a: string, b: string) {
  try {
    return new URL(a).origin === new URL(b).origin;
  } catch {
    return false;
  }
}

function severity(weight: number): string {
  if (weight >= 8) return "critical";
  if (weight >= 4) return "warning";
  return "info";
}

function createCategories() {
  return {
    functionality: { score: 100, issues: [] as any[] },
    performance: { score: 100, issues: [] as any[] },
    seo: { score: 100, issues: [] as any[] },
    security: { score: 100, issues: [] as any[] },
  };
}

function addIssue(
  categories: ReturnType<typeof createCategories>,
  category: string,
  title: string,
  description: string,
  impact: string,
  fix: string,
  weight: number,
  code?: string
) {
  categories[category as keyof typeof categories].issues.push({
    category,
    title,
    description,
    impact,
    fix,
    severity: severity(weight),
    code,
  });
  categories[category as keyof typeof categories].score = Math.max(
    0,
    categories[category as keyof typeof categories].score - weight
  );
}

async function runHttpChecks(url: string, categories: ReturnType<typeof createCategories>) {
  const res = await fetchUrl(url, "GET");

  if (!res.ok && res.status === 0) {
    addIssue(
      categories,
      "functionality",
      "Halaman tidak dapat dimuat",
      `Tidak ada response HTTP saat mengakses ${url}. Kemungkinan domain tidak aktif, SSL error, atau request timeout.`,
      "Website tidak bisa diuji. User tidak bisa mengaksesnya.",
      "Pastikan domain aktif, SSL valid, dan server merespons dalam 15 detik.",
      100
    );
    return { finalUrl: url, loaded: false };
  }

  if (res.status >= 400) {
    addIssue(
      categories,
      "functionality",
      `Status HTTP ${res.status}`,
      `Server mengembalikan status ${res.status} untuk ${url}.`,
      "Halaman error membuat user meninggalkan website.",
      "Periksa log server, routing, dan sumber daya yang hilang.",
      100,
      `HTTP ${res.status}`
    );
    return { finalUrl: url, loaded: false };
  }

  // Performance proxy: response duration
  if (res.duration > 3000) {
    addIssue(
      categories,
      "performance",
      "Waktu respons server lambat",
      `Server membutuhkan ${res.duration}ms untuk merespons. Target ideal di bawah 800ms (TTFB).`,
      "User merasa website lambat sebelum konten mulai dimuat.",
      "Optimasi query database, gunakan caching, atau pertimbangkan CDN/upgrade server.",
      20,
      `TTFB: ${res.duration}ms`
    );
    categories.performance.score = Math.max(0, 100 - Math.round(res.duration / 100));
  } else if (res.duration > 1000) {
    categories.performance.score = Math.max(0, 100 - Math.round(res.duration / 50));
  } else {
    categories.performance.score = Math.max(0, 100 - Math.round(res.duration / 30));
  }

  const $ = cheerio.load(res.text);
  const finalUrl = url; // fetch already followed redirects

  const title = $("title").text().trim();
  const metaDesc = $('meta[name="description"]').attr("content") || "";
  const h1s = $("h1").toArray();
  const links = $("a[href]")
    .toArray()
    .map((el) => ({
      href: $(el).attr("href") || "",
      text: $(el).text().trim(),
    }))
    .filter((l) => l.href && !l.href.startsWith("#") && !l.href.startsWith("javascript:"));
  const images = $("img").toArray();
  const forms = $("form").toArray();

  if (!title) {
    addIssue(
      categories,
      "seo",
      "Title tag kosong",
      "Halaman tidak memiliki <title>.",
      "Mesin pencari dan tab browser tidak menampilkan judul.",
      "Tambahkan tag <title> yang deskriptif dan mengandung kata kunci utama.",
      20,
      "<title></title>"
    );
  }

  if (!metaDesc) {
    addIssue(
      categories,
      "seo",
      "Meta description hilang",
      "Tag meta description tidak ditemukan.",
      "Snippet di hasil pencarian tidak optimal.",
      "Tambahkan <meta name='description' content='...'>.",
      15,
      '<meta name="description">'
    );
  }

  if (h1s.length === 0) {
    addIssue(
      categories,
      "seo",
      "Heading H1 tidak ditemukan",
      "Setiap halaman sebaiknya memiliki satu H1.",
      "Struktur konten kurang jelas bagi mesin pencari.",
      "Tambahkan satu tag <h1> yang menggambarkan topik utama halaman.",
      12
    );
  } else if (h1s.length > 1) {
    addIssue(
      categories,
      "seo",
      "Lebih dari satu H1",
      `Ditemukan ${h1s.length} tag H1 pada halaman.`,
      "Mesin pencari bingung menentukan topik utama.",
      "Gunakan satu H1 dan sisanya gunakan H2/H3.",
      8
    );
  }

  const imagesWithoutAlt = images.filter((img) => !$(img).attr("alt")).length;
  if (imagesWithoutAlt > 0) {
    addIssue(
      categories,
      "functionality",
      "Gambar tanpa atribut alt",
      `${imagesWithoutAlt} gambar tidak memiliki atribut alt.`,
      "Screen reader tidak bisa menjelaskan gambar, dan SEO gambar berkurang.",
      "Tambahkan atribut alt yang deskriptif pada setiap gambar.",
      10,
      `<img src="..."> tanpa alt`
    );
  }

  // Link checks
  const checked = new Set<string>();
  let broken = 0;
  for (const link of links.slice(0, 30)) {
    if (!link.href || checked.has(link.href)) continue;
    checked.add(link.href);
    const absolute = new URL(link.href, finalUrl).toString();
    if (!sameOrigin(absolute, finalUrl)) continue;
    const head = await fetchUrl(absolute, "HEAD");
    if (!head.ok) {
      broken++;
      if (broken <= 5) {
        addIssue(
          categories,
          "functionality",
          `Link rusak: ${link.text || link.href}`,
          `Link ke ${link.href} mengembalikan status ${head.status}.`,
          "User mengklik link dan menemukan halaman error.",
          "Perbaiki URL, redirect, atau hapus link yang sudah tidak digunakan.",
          12,
          `<a href="${link.href}">${link.text || "link"}</a>`
        );
      }
    }
  }
  if (broken > 5) {
    addIssue(
      categories,
      "functionality",
      `Ditemukan ${broken} link rusak`,
      "Beberapa link internal mengembalikan status error.",
      "Meningkatkan bounce rate dan menurunkan kepercayaan user.",
      "Audit semua link internal dan perbaiki yang error.",
      15
    );
  }

  if (forms.length > 0) {
    const formsWithoutMethod = forms.filter((f) => !$(f).attr("method")).length;
    if (formsWithoutMethod > 0) {
      addIssue(
        categories,
        "functionality",
        "Form tanpa method",
        `${formsWithoutMethod} form tidak memiliki atribut method.`,
        "Form mungkin tidak terkirim ke endpoint yang benar.",
        "Tambahkan method=\"POST\" atau \"GET\" pada setiap form.",
        8,
        `<form>`
      );
    }
  }

  // Security headers
  const headers = res.headers;
  const securityHeaders: { name: string; weight: number; recommendation: string }[] = [
    { name: "strict-transport-security", weight: 15, recommendation: "Aktifkan HSTS di web server: Strict-Transport-Security: max-age=63072000" },
    { name: "content-security-policy", weight: 15, recommendation: "Tambahkan header Content-Security-Policy untuk membatasi sumber resource." },
    { name: "x-content-type-options", weight: 8, recommendation: "Tambahkan X-Content-Type-Options: nosniff." },
    { name: "x-frame-options", weight: 8, recommendation: "Tambahkan X-Frame-Options: DENY atau SAMEORIGIN untuk mencegah clickjacking." },
    { name: "referrer-policy", weight: 5, recommendation: "Tambahkan Referrer-Policy: strict-origin-when-cross-origin." },
  ];

  for (const h of securityHeaders) {
    if (!headers.get(h.name)) {
      addIssue(
        categories,
        "security",
        `Header keamanan hilang: ${h.name}`,
        `Header ${h.name} tidak ditemukan dalam response HTTP.`,
        "Website lebih rentan terhadap serangan umum.",
        h.recommendation,
        h.weight,
        `${h.name}: ...`
      );
    }
  }

  if (!finalUrl.startsWith("https://")) {
    addIssue(
      categories,
      "security",
      "Website tidak menggunakan HTTPS",
      `URL aktif adalah ${finalUrl}.`,
      "Data user rentan disadap dan ranking SEO menurun.",
      "Pasang sertifikat SSL dan arahkan semua traffic ke HTTPS.",
      30,
      finalUrl
    );
  }

  return { finalUrl, loaded: true };
}

async function runBrowserChecks(url: string, testRunId: string, categories: ReturnType<typeof createCategories>) {
  const browserPort = await getFreePort();
  const browser = await chromium.launch({
    headless: true,
    args: [
      `--remote-debugging-port=${browserPort}`,
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();
    const response = await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });

    if (!response) {
      addIssue(
        categories,
        "functionality",
        "Halaman tidak dapat dimuat",
        `Tidak ada response HTTP saat mengakses ${url}. Kemungkinan domain tidak aktif atau diblokir.`,
        "Website sama sekali tidak bisa diuji. User tidak bisa mengaksesnya.",
        "Pastikan domain aktif, SSL valid, dan tidak ada firewall yang memblokir bot.",
        100
      );
      return { finalUrl: url, loaded: false };
    }

    const finalUrl = page.url();
    const status = response.status();

    if (status >= 400) {
      addIssue(
        categories,
        "functionality",
        `Status HTTP ${status}`,
        `Server mengembalikan status ${status} untuk ${finalUrl}.`,
        "Halaman error membuat user meninggalkan website.",
        "Periksa log server, routing, dan sumber daya yang hilang.",
        100,
        `HTTP ${status}`
      );
      return { finalUrl, loaded: false };
    }

    // Lighthouse
    try {
      const lhResult: any = await lighthouse(finalUrl, {
        port: browserPort,
        output: "json",
        logLevel: "error",
      });
      const lhr = lhResult?.lhr;

      if (lhr) {
        const perfScore = lhr.categories?.performance?.score * 100;
        categories.performance.score = Math.round(perfScore ?? 60);

        const audits = lhr.audits || {};
        const lcp = audits["largest-contentful-paint"];
        const cls = audits["cumulative-layout-shift"];
        const fcp = audits["first-contentful-paint"];

        if (lcp && lcp.numericValue > 2500) {
          addIssue(
            categories,
            "performance",
            "Largest Contentful Paint (LCP) lambat",
            `LCP tercatat ${Math.round(lcp.numericValue / 10) / 100} detik. Target ideal di bawah 2,5 detik.`,
            "User merasa website lambat, terutama di koneksi lemah.",
            "Optimasi gambar hero, gunakan format WebP/AVIF, lazy-load, dan pertimbangkan CDN.",
            20,
            `LCP: ${lcp.displayValue}`
          );
        }

        if (cls && cls.numericValue > 0.1) {
          addIssue(
            categories,
            "performance",
            "Layout Shift (CLS) tinggi",
            `CLS tercatat ${cls.numericValue}. Idealnya di bawah 0,1.`,
            "Elemen yang bergeser saat dimuat mengganggu interaksi user.",
            "Tentukan width/height pada gambar dan iklan, hindari menyisipkan konten di atas elemen yang sudah ada.",
            15,
            `CLS: ${cls.displayValue}`
          );
        }

        if (fcp && fcp.numericValue > 1800) {
          addIssue(
            categories,
            "performance",
            "First Contentful Paint (FCP) lambat",
            `FCP tercatat ${Math.round(fcp.numericValue / 10) / 100} detik.`,
            "Waktu pertama kali konten muncul terasa lama.",
            "Kurangi render-blocking resources, inline critical CSS, dan gunakan preconnect.",
            12,
            `FCP: ${fcp.displayValue}`
          );
        }
      }
    } catch (lhErr) {
      console.error("Lighthouse error:", lhErr);
      addIssue(
        categories,
        "performance",
        "Tidak bisa mengukur performa lengkap",
        "Lighthouse gagal berjalan, hanya pengecekan dasar yang tersedia.",
        "Skor performa mungkin tidak akurat.",
        "Pastikan Chrome/Playwright berjalan normal dan ulangi tes.",
        10
      );
    }

    const title = await page.title();
    const metaDesc = await page
      .$eval('meta[name="description"]', (el: Element) => el.getAttribute("content"))
      .catch(() => null);
    const h1s = await page.$$eval("h1", (els: Element[]) => els.map((e) => (e as HTMLElement).textContent?.trim()));
    const links: { href: string | null; text: string }[] = await page.$$eval("a[href]", (els: Element[]) =>
      els
        .map((el) => ({
          href: el.getAttribute("href"),
          text: (el as HTMLElement).textContent?.trim() || "",
        }))
        .filter((l) => l.href && !l.href.startsWith("#") && !l.href.startsWith("javascript:")) as any
    );
    const images: { src: string | null; alt: string | null }[] = await page.$$eval("img", (els: Element[]) =>
      els.map((el) => ({
        src: el.getAttribute("src"),
        alt: el.getAttribute("alt"),
      }))
    );
    const forms: { action: string | null; method: string | null }[] = await page.$$eval("form", (els: Element[]) =>
      els.map((el) => ({
        action: el.getAttribute("action"),
        method: el.getAttribute("method"),
      }))
    );

    if (!title) {
      addIssue(
        categories,
        "seo",
        "Title tag kosong",
        "Halaman tidak memiliki <title>.",
        "Mesin pencari dan tab browser tidak menampilkan judul.",
        "Tambahkan tag <title> yang deskriptif dan mengandung kata kunci utama.",
        20,
        "<title></title>"
      );
    }

    if (!metaDesc) {
      addIssue(
        categories,
        "seo",
        "Meta description hilang",
        "Tag meta description tidak ditemukan.",
        "Snippet di hasil pencarian tidak optimal.",
        "Tambahkan <meta name='description' content='...'>.",
        15,
        '<meta name="description">'
      );
    }

    if (h1s.length === 0) {
      addIssue(
        categories,
        "seo",
        "Heading H1 tidak ditemukan",
        "Setiap halaman sebaiknya memiliki satu H1.",
        "Struktur konten kurang jelas bagi mesin pencari.",
        "Tambahkan satu tag <h1> yang menggambarkan topik utama halaman.",
        12
      );
    } else if (h1s.length > 1) {
      addIssue(
        categories,
        "seo",
        "Lebih dari satu H1",
        `Ditemukan ${h1s.length} tag H1 pada halaman.`,
        "Mesin pencari bingung menentukan topik utama.",
        "Gunakan satu H1 dan sisanya gunakan H2/H3.",
        8
      );
    }

    const imagesWithoutAlt = images.filter((img) => !img.alt).length;
    if (imagesWithoutAlt > 0) {
      addIssue(
        categories,
        "functionality",
        "Gambar tanpa atribut alt",
        `${imagesWithoutAlt} gambar tidak memiliki atribut alt.`,
        "Screen reader tidak bisa menjelaskan gambar, dan SEO gambar berkurang.",
        "Tambahkan atribut alt yang deskriptif pada setiap gambar.",
        10,
        `<img src="..."> tanpa alt`
      );
    }

    const checked = new Set<string>();
    let broken = 0;
    for (const link of links.slice(0, 30)) {
      if (!link.href || checked.has(link.href)) continue;
      checked.add(link.href);
      const absolute = new URL(link.href, finalUrl).toString();
      if (!sameOrigin(absolute, finalUrl)) continue;
      const res = await fetchUrl(absolute, "HEAD");
      if (!res.ok) {
        broken++;
        if (broken <= 5) {
          addIssue(
            categories,
            "functionality",
            `Link rusak: ${link.text || link.href}`,
            `Link ke ${link.href} mengembalikan status ${res.status}.`,
            "User mengklik link dan menemukan halaman error.",
            "Perbaiki URL, redirect, atau hapus link yang sudah tidak digunakan.",
            12,
            `<a href="${link.href}">${link.text || "link"}</a>`
          );
        }
      }
    }
    if (broken > 5) {
      addIssue(
        categories,
        "functionality",
        `Ditemukan ${broken} link rusak`,
        "Beberapa link internal mengembalikan status error.",
        "Meningkatkan bounce rate dan menurunkan kepercayaan user.",
        "Audit semua link internal dan perbaiki yang error.",
        15
      );
    }

    if (forms.length > 0) {
      const formsWithoutMethod = forms.filter((f) => !f.method).length;
      if (formsWithoutMethod > 0) {
        addIssue(
          categories,
          "functionality",
          "Form tanpa method",
          `${formsWithoutMethod} form tidak memiliki atribut method.`,
          "Form mungkin tidak terkirim ke endpoint yang benar.",
          "Tambahkan method=\"POST\" atau \"GET\" pada setiap form.",
          8,
          `<form>`
        );
      }
    }

    const headRes = await fetchUrl(finalUrl, "HEAD");
    const headers = headRes.headers;
    const securityHeaders: { name: string; weight: number; recommendation: string }[] = [
      { name: "strict-transport-security", weight: 15, recommendation: "Aktifkan HSTS di web server: Strict-Transport-Security: max-age=63072000" },
      { name: "content-security-policy", weight: 15, recommendation: "Tambahkan header Content-Security-Policy untuk membatasi sumber resource." },
      { name: "x-content-type-options", weight: 8, recommendation: "Tambahkan X-Content-Type-Options: nosniff." },
      { name: "x-frame-options", weight: 8, recommendation: "Tambahkan X-Frame-Options: DENY atau SAMEORIGIN untuk mencegah clickjacking." },
      { name: "referrer-policy", weight: 5, recommendation: "Tambahkan Referrer-Policy: strict-origin-when-cross-origin." },
    ];

    for (const h of securityHeaders) {
      if (!headers.get(h.name)) {
        addIssue(
          categories,
          "security",
          `Header keamanan hilang: ${h.name}`,
          `Header ${h.name} tidak ditemukan dalam response HTTP.`,
          "Website lebih rentan terhadap serangan umum.",
          h.recommendation,
          h.weight,
          `${h.name}: ...`
        );
      }
    }

    if (!finalUrl.startsWith("https://")) {
      addIssue(
        categories,
        "security",
        "Website tidak menggunakan HTTPS",
        `URL aktif adalah ${finalUrl}.`,
        "Data user rentan disadap dan ranking SEO menurun.",
        "Pasang sertifikat SSL dan arahkan semua traffic ke HTTPS.",
        30,
        finalUrl
      );
    }

    await runScenarios(page, testRunId, url).catch((err) => console.error("Scenario runner error:", err));

    return { finalUrl, loaded: true };
  } finally {
    await browser.close();
  }
}

export async function runTest(testRunId: string) {
  const run = await prisma.testRun.findUnique({ where: { id: testRunId } });
  if (!run) throw new Error("Test run not found");

  await prisma.testRun.update({
    where: { id: testRunId },
    data: { status: "running" },
  });

  await prisma.scenarioResult.deleteMany({ where: { testRunId } });
  await prisma.testResult.deleteMany({ where: { testRunId } });

  const categories = createCategories();
  let loaded = false;
  let usedBrowser = false;

  // Try real browser first
  try {
    const result = await runBrowserChecks(run.url, testRunId, categories);
    loaded = result.loaded;
    usedBrowser = true;
  } catch (err) {
    console.warn("Browser runner failed, falling back to HTTP checks:", err);
    const result = await runHttpChecks(run.url, categories);
    loaded = result.loaded;
  }

  // Abort jika website tidak bisa diakses sama sekali
  if (!loaded && categories.functionality.issues.some((i) => i.weight >= 100)) {
    await prisma.testRun.update({
      where: { id: testRunId },
      data: { status: "failed", overallScore: 0 },
    });
    await prisma.testResult.create({
      data: {
        testRunId,
        category: "functionality",
        score: 0,
        status: "failed",
        issues: {
          create: categories.functionality.issues.map((issue) => ({
            category: issue.category,
            severity: issue.severity,
            title: issue.title,
            description: issue.description,
            impact: issue.impact,
            fix: issue.fix,
            code: issue.code || null,
          })),
        },
      },
    });
    return;
  }

  // Abort jika fungsionalitas kritis 0 — tidak masuk akal menilai SEO/keamanan
  // saat website tidak berfungsi (WAF block, halaman kosong, banyak error)
  if (categories.functionality.score === 0) {
    await prisma.testRun.update({
      where: { id: testRunId },
      data: { status: "failed", overallScore: 0 },
    });
    await prisma.testResult.create({
      data: {
        testRunId,
        category: "functionality",
        score: 0,
        status: "failed",
        issues: {
          create: categories.functionality.issues.map((issue) => ({
            category: issue.category,
            severity: issue.severity,
            title: issue.title,
            description: issue.description,
            impact: issue.impact,
            fix: issue.fix,
            code: issue.code || null,
          })),
        },
      },
    });
    return;
  }

  // Save results
  let totalScore = 0;
  const allIssues: any[] = [];
  for (const [category, data] of Object.entries(categories)) {
    totalScore += data.score;
    allIssues.push(...data.issues);
    await prisma.testResult.create({
      data: {
        testRunId,
        category,
        score: data.score,
        status: data.score >= 80 ? "passed" : data.score >= 60 ? "warning" : "failed",
        issues: {
          create: data.issues.map((issue) => ({
            category: issue.category,
            severity: issue.severity,
            title: issue.title,
            description: issue.description,
            impact: issue.impact,
            fix: issue.fix,
            code: issue.code || null,
          })),
        },
      },
    });
  }

  const overallScore = Math.round(totalScore / 4);

  // AI analysis
  const ai = await generateAiReport(
    run.url,
    overallScore,
    allIssues.map((i) => ({
      category: i.category,
      severity: i.severity,
      title: i.title,
      description: i.description,
      impact: i.impact,
      fix: i.fix,
    }))
  );

  await prisma.testRun.update({
    where: { id: testRunId },
    data: {
      status: "completed",
      overallScore,
      completedAt: new Date(),
      aiSummary: ai.summary,
      aiFixPlan: ai.fixPlan,
    },
  });

  console.log(`Test ${testRunId} completed. Browser: ${usedBrowser}, Score: ${overallScore}`);
}
