import { prisma } from "@/lib/prisma";

interface Finding {
  category: string;
  severity: string;
  title: string;
  description: string;
  impact: string;
  fix: string;
}

interface AiConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
}

async function getActiveAiConfig(): Promise<AiConfig | null> {
  const dbConfig = await prisma.aiProviderConfig.findFirst({
    where: { isActive: true },
  });

  if (dbConfig && dbConfig.apiKey) {
    return {
      apiKey: dbConfig.apiKey,
      baseUrl: dbConfig.baseUrl,
      model: dbConfig.model,
      maxTokens: dbConfig.maxTokens,
    };
  }

  // Fallback ke environment variables
  const apiKey = process.env.OPENCODE_API_KEY || process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENCODE_BASE_URL || process.env.OPENAI_BASE_URL || "https://opencode.ai/zen/go/v1";
  const model = process.env.OPENCODE_MODEL || process.env.OPENAI_MODEL || "qwen-max";

  if (!apiKey) return null;

  const envMax = process.env.AI_MAX_TOKENS ? parseInt(process.env.AI_MAX_TOKENS, 10) : NaN;
  const maxTokens = !isNaN(envMax) && envMax > 0 ? envMax : getDefaultMaxTokens(model);

  return { apiKey, baseUrl, model, maxTokens };
}

function isReasoningModel(model: string): boolean {
  const reasoningModels = [
    "kimi",
    "o1",
    "o3",
    "claude-thinking",
    "deepseek-reasoner",
    "deepseek-r1",
    "qwq",
    "gemini-thinking",
  ];
  return reasoningModels.some((r) => model.toLowerCase().includes(r));
}

function getDefaultMaxTokens(model: string): number {
  // Reasoning models need larger token budget because they consume tokens for reasoning
  if (isReasoningModel(model)) {
    return 12000;
  }
  return 8000;
}

export async function generateAiReport(url: string, score: number, findings: Finding[]) {
  const config = await getActiveAiConfig();

  if (!config) {
    return {
      summary: "Analisis AI tidak tersedia karena konfigurasi belum lengkap.",
      fixPlan: "Masuk ke panel Admin > Konfigurasi AI untuk menambahkan provider AI, atau tambahkan OPENCODE_API_KEY di file .env.",
    };
  }

  const { apiKey, baseUrl, model, maxTokens } = config;

  const prompt = `Website ${url} baru saja diuji otomatis dan dapat skor ${score}/100. Berikut temuan dari scanner:
${findings
  .map(
    (f, i) =>
      `${i + 1}. [${f.category.toUpperCase()} | ${f.severity.toUpperCase()}] ${f.title}\n   Dampak: ${f.impact}\n   Saran: ${f.fix}`
  )
  .join("\n\n")}

Tugas kamu:
1. Buat ringkasan kasus (2-3 paragraf) dalam bahasa Indonesia yang santai dan gaul ala Gen Z, tapi tetap sopan. Jelaskan seperti lagi ngobrol sama teman SMP/SMA — mudah dipahami, nggak pake bahasa teknikal yang berat, nggak pake istilah "executive summary" atau "rekomendasi strategis".
2. Buat rencana perbaikan (maksimal 5 poin) yang langsung to the point, bahasa sehari-hari, kayak lagi kasih tahu temen "webnya perlu diapain aja sih".

Aturan gaya bahasa:
- Gunakan bahasa Indonesia santai tapi tetap sopan (boleh pakai "kamu", "kita", "sih", "aja", "gitu", tapi jangan berlebihan).
- Hindari kata-kata baku atau formal seperti "berdasarkan", "dikarenakan", "diperlukan", "optimalisasi", "implementasi". Ganti dengan kata sehari-hari.
- Jelaskan masalah seolah-olah ke orang yang baru pertama kali dengar tentang website, bukan ke developer senior.
- Boleh pakai analogi sederhana atau perumpamaan kehidupan sehari-hari kalau membantu.
- Untuk fix plan, tiap poin dimulai dengan kata kerja aktif: "Tambahin...", "Perbaiki...", "Ganti...", "Cek...", "Pasang...".
- Hindari singkatan teknis tanpa penjelasan. Kalau mau pakai singkatan, jelasin dulu singkat.

PENTING: Output HANYA JSON mentah, tanpa markdown, tanpa teks di luar JSON.
Format:
{"summary":"...","fixPlan":"1. ...\\n2. ..."}`;

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "Kamu adalah teman yang ngerti soal website dan suka bantu jelasin dengan bahasa Indonesia santai, gaul ala Gen Z, tapi tetap sopan. Jelasinnya kayak lagi ngobrol sama temen SMP/SMA — gampang dipahami, nggak pake kata-kata berat. Selalu balas dengan JSON valid." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_tokens: maxTokens,
      }),
    });

    const responseText = await res.text();

    if (!res.ok) {
      console.error("AI API HTTP error:", res.status, responseText);
      return {
        summary: `Gagal menghubungi API AI (HTTP ${res.status}).`,
        fixPlan: `Periksa konfigurasi di Admin > Konfigurasi AI — pastikan Base URL dan API key sesuai dengan provider yang kamu gunakan.`,
      };
    }

    // Handle non-JSON responses (e.g. "Not Found" from wrong endpoint)
    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("AI API returned non-JSON:", responseText.substring(0, 200));
      return {
        summary: `API AI mengembalikan respons yang tidak valid.`,
        fixPlan: `Base URL API mungkin salah. Cek apakah \`${baseUrl}\` adalah endpoint yang benar untuk provider AI kamu.`,
      };
    }

    const choice = data.choices?.[0];
    const message = choice?.message || {};

    // Detect token limit hit (common with reasoning models like Kimi)
    const finishReason = choice?.finish_reason || choice?.native_finish_reason;
    if (finishReason === "length") {
      const isReasoning = isReasoningModel(model);
      return {
        summary: `Analisis AI terpotong karena batas token (${maxTokens.toLocaleString()}). Model ${model} ${isReasoning ? "adalah reasoning model yang memakan token besar." : "membutuhkan lebih banyak token untuk output ini."}`,
        fixPlan: isReasoning
          ? `1. Ganti model di Admin > Konfigurasi AI ke qwen-plus atau qwen-max (non-reasoning)\n2. Atau naikkan Max Tokens di konfigurasi jika ingin tetap pakai ${model}`
          : `1. Naikkan Max Tokens di Admin > Konfigurasi AI\n2. Atau ganti ke model yang lebih hemat token seperti qwen-plus`,
      };
    }

    // Some models return reasoning in different fields
    const content = [message.content, message.reasoning_content, message.reasoning]
      .filter(Boolean)
      .join("\n\n");

    // If content is completely empty, return a clear error instead of silent failure
    if (!content.trim()) {
      const isReasoning = isReasoningModel(model);
      return {
        summary: `Analisis AI gagal dihasilkan — model ${model} mengembalikan respons kosong. ${isReasoning ? "Model reasoning sering kehabisan token budget untuk reasoning." : "Coba naikkan batas token atau ganti model."}`,
        fixPlan: isReasoning
          ? `1. Ganti model di Admin > Konfigurasi AI ke qwen-plus atau qwen-max (lebih stabil)\n2. Atau naikkan Max Tokens di konfigurasi untuk model reasoning ${model}`
          : `1. Naikkan Max Tokens di Admin > Konfigurasi AI\n2. Atau ganti ke qwen-plus jika model ${model} sering error`,
      };
    }

    // Robust JSON extraction: try direct parse first, then balanced braces
    let parsed: any = null;
    try {
      parsed = JSON.parse(content.trim());
    } catch {
      let depth = 0;
      let start = -1;
      for (let i = 0; i < content.length; i++) {
        if (content[i] === "{") {
          if (depth === 0) start = i;
          depth++;
        } else if (content[i] === "}") {
          depth--;
          if (depth === 0 && start !== -1) {
            try {
              parsed = JSON.parse(content.substring(start, i + 1));
              break;
            } catch {
              start = -1;
            }
          }
        }
      }
    }

    if (parsed) {
      return {
        summary: parsed.summary || content,
        fixPlan: parsed.fixPlan || "",
      };
    }

    // Fallback: return raw content if JSON parsing fails
    return { summary: content, fixPlan: "" };
  } catch (err: any) {
    console.error("AI generation error:", err);
    return {
      summary: "Terjadi kesalahan saat meminta analisis AI.",
      fixPlan: `Detail error: ${err.message || "Koneksi ke API AI gagal"}. Periksa koneksi internet dan konfigurasi di Admin > Konfigurasi AI.`,
    };
  }
}
