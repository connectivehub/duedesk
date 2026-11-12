import { mergeExtraction, validateLlmPayload, type Extraction } from "@/lib/whatsapp/extract";

export async function enrichExtraction(text: string, base: Extraction): Promise<Extraction> {
  if (base.handoffReason || base.greetingOnly || base.companyName || base.uen) return base;
  if (text.trim().length < 8) return base;
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  const model = process.env.AI_GATEWAY_MODEL;
  if (!apiKey || !model) return base;

  try {
    const extra = await requestExtraction(text.slice(0, 2000), apiKey, model);
    return mergeExtraction(base, extra);
  } catch (error) {
    console.error("company extraction skipped", error instanceof Error ? error.message : "error");
    return base;
  }
}

async function requestExtraction(text: string, apiKey: string, model: string) {
  const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Extract JSON with keys companyName (string or null), uen (string or null), and years (array of strings like FY2021). Use null or [] when unsure. Do not invent a company, UEN, or year.",
        },
        { role: "user", content: text },
      ],
    }),
    signal: AbortSignal.timeout(4000),
  });

  if (!response.ok) return null;
  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) return null;
  const json = content.replace(/^```json\s*|```$/g, "").trim();
  return validateLlmPayload(JSON.parse(json) as unknown);
}
