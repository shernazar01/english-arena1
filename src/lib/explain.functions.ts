import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Explanation = {
  meaning_uz: string;
  example_en: string;
  example_uz: string;
};

export type ExplainResult = { ok: true; data: Explanation } | { ok: false; error: string };

export const MAX_INPUT = 200;

export const cleanInput = (s: string) => s.replace(/\s+/g, " ").trim().slice(0, MAX_INPUT);

// Signed-in students only: each call uses AI credits.
export const explainEnglish = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { text: string }) => {
    const text = cleanInput(String(input?.text ?? ""));
    if (!text) throw new Error("Empty text");
    return { text };
  })
  .handler(async ({ data }): Promise<ExplainResult> => {
    const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions:
          "You are a friendly English teacher for Uzbek school students (ages 9-20). " +
          "The student gives an English word or sentence. Explain its meaning simply in Uzbek (Latin script), " +
          "in 1-3 short sentences. Then give ONE short, easy English example sentence and its Uzbek translation. " +
          "If the input is not English, still help briefly in Uzbek. Keep everything child-friendly.",
        input: [{ role: "user", content: data.text }],
        max_output_tokens: 600,
        text: {
          format: {
            type: "json_schema",
            name: "explanation",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                meaning_uz: { type: "string" },
                example_en: { type: "string" },
                example_uz: { type: "string" },
              },
              required: ["meaning_uz", "example_en", "example_uz"],
            },
          },
        },
      });

      let raw = "";
      for (const item of (res as { output?: unknown[] }).output ?? []) {
        const it = item as { type?: string; content?: { type?: string; text?: string }[] };
        if (it.type !== "message") continue;
        for (const c of it.content ?? []) if (c.type === "output_text" && c.text) raw += c.text;
      }
      const parsed = JSON.parse(raw) as Explanation;
      if (!parsed.meaning_uz) throw new Error("Empty answer");
      return { ok: true, data: parsed };
    } catch (e) {
      if (e instanceof GatewayError) {
        console.error("explainEnglish gateway error", e.code, e.httpStatus, e.ids);
        if (e.httpStatus === 429) return { ok: false, error: "Hozir juda ko'p so'rov bor. Birozdan keyin qayta urinib ko'r." };
        if (e.httpStatus === 402) return { ok: false, error: "AI yordamchi vaqtincha ishlamayapti. O'qituvchingga ayt." };
      } else {
        console.error("explainEnglish failed", e);
      }
      return { ok: false, error: "Tushuntirib bo'lmadi. Qaytadan urinib ko'r." };
    }
  });
