interface Finding {
  category: string;
  severity: string;
  title: string;
  description: string;
  impact: string;
  fix: string;
}

export async function generateAiReport(url: string, score: number, findings: Finding[]) {
  const apiKey = process.env.OPENCODE_API_KEY || process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENCODE_BASE_URL || process.env.OPENAI_BASE_URL || "https://opencode.ai/zen/go/v1";
  const model = process.env.OPENCODE_MODEL || process.env.OPENAI_MODEL || "deepseek-v4-flash";

  if (!apiKey) {
    return {
      summary: "Analisis AI tidak tersedia karena API key belum dikonfigurasi.",
      fixPlan: "Tambahkan OPENCODE_API_KEY atau OPENAI_API_KEY di file .env untuk mengaktifkan analisis AI.",
    };
  }

  const prompt = `Kamu adalah senior QA engineer. Website ${url} baru saja diuji otomatis dan mendapat skor ${score}/100.

Temuan berikut dikumpulkan oleh scanner otomatis:
${findings
  .map(
    (f, i) =>
      `${i + 1}. [${f.category.toUpperCase()} | ${f.severity.toUpperCase()}] ${f.title}\n   Dampak: ${f.impact}\n   Saran: ${f.fix}`
  )
  .join("\n\n")}

Buatlah:
1. Ringkasan eksekutif singkat (2-3 paragraf) dalam bahasa Indonesia tentang kondisi website ini.
2. Rencana perbaikan prioritas (maksimal 5 poin) yang bisa langsung dikerjakan developer.

Format jawaban JSON seperti ini:
{
  "summary": "...",
  "fixPlan": "1. ...\n2. ..."
}
`;

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
          { role: "system", content: "Kamu adalah asisten QA engineer yang memberikan analisis website dalam bahasa Indonesia. Selalu balas dengan JSON valid." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 1200,
      }),
    });

    const responseText = await res.text();

    if (!res.ok) {
      console.error("AI API HTTP error:", res.status, responseText);
      return {
        summary: `Gagal menghubungi API AI (HTTP ${res.status}).`,
        fixPlan: `Periksa konfigurasi .env — pastikan OPENCODE_BASE_URL (atau OPENAI_BASE_URL) dan API key sesuai dengan provider yang kamu gunakan.`,
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

    const message = data.choices?.[0]?.message || {};
    // Some models (e.g. DeepSeek) return reasoning_content separately
    const content = [message.reasoning_content, message.content]
      .filter(Boolean)
      .join("\n\n");

    // Try to parse JSON from content
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary || content,
          fixPlan: parsed.fixPlan || "",
        };
      } catch {
        // ignore parse error, use raw content
      }
    }

    return { summary: content, fixPlan: "" };
  } catch (err: any) {
    console.error("AI generation error:", err);
    return {
      summary: "Terjadi kesalahan saat meminta analisis AI.",
      fixPlan: `Detail error: ${err.message || "Koneksi ke API AI gagal"}. Periksa koneksi internet dan konfigurasi .env.`,
    };
  }
}
