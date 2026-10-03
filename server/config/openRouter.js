const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";

// Free models come and go. Override without redeploying: OPENROUTER_MODELS="a/b:free,c/d:free"
const DEFAULT_MODELS = [
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "qwen/qwen3.8-27b:free",
  "poolside/laguna-xs-2.1:free",
  "openrouter/free",
];

const getModels = () =>
  process.env.OPENROUTER_MODELS
    ? process.env.OPENROUTER_MODELS.split(",").map((m) => m.trim()).filter(Boolean)
    : DEFAULT_MODELS;

const TIMEOUT_MS = Number(process.env.OPENROUTER_TIMEOUT_MS) || 180000;
// A full website is 10k+ tokens (HTML and CSS tokenize badly), so 8000 cut pages off mid-way.
const MAX_TOKENS = Number(process.env.OPENROUTER_MAX_TOKENS) || 16000;
const FALLBACK_MAX_TOKENS = 8000; // used if a model rejects the bigger limit
const MAX_CONTINUATIONS = process.env.OPENROUTER_MAX_CONTINUATIONS
  ? Number(process.env.OPENROUTER_MAX_CONTINUATIONS)
  : 2;

const SYSTEM_PROMPT =
  "Follow the requested output format exactly. No markdown fences, no explanation, no reasoning text — output only what was asked for.";

const CONTINUE_PROMPT =
  "Your reply was cut off. Continue from the very next character. Do not repeat anything already written, do not restart, add no commentary. Finish the document, ending with </html> and then </code>.";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const callModel = async (model, messages, maxTokens) => {
  const headers = {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    "X-Title": "GenWeb.AI",
  };
  const referer = (process.env.CLIENT_URL || "").split(",")[0].trim();
  if (referer) headers["HTTP-Referer"] = referer;

  const res = await fetch(openRouterUrl, {
    method: "POST",
    signal: AbortSignal.timeout(TIMEOUT_MS), // a hung model must not hang the request forever
    headers,
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
      max_tokens: maxTokens,
      reasoning: { enabled: false },
    }),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON body (gateway error page); handled by caller via res.ok
  }
  return { res, data };
};

const generateResponse = async (prompt) => {
  for (const model of getModels()) {
    try {
      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ];
      let maxTokens = MAX_TOKENS;

      let { res, data } = await callModel(model, messages, maxTokens);

      if (res.status === 429) {
        console.log(`${model} rate-limited, retrying once in 3s...`);
        await sleep(3000);
        ({ res, data } = await callModel(model, messages, maxTokens));
      }

      // Some models cap output lower than 16k and reject the request
      if (res.status === 400 && maxTokens > FALLBACK_MAX_TOKENS) {
        console.log(`${model} rejected max_tokens=${maxTokens}, retrying with ${FALLBACK_MAX_TOKENS}`);
        maxTokens = FALLBACK_MAX_TOKENS;
        ({ res, data } = await callModel(model, messages, maxTokens));
      }

      if (!res.ok) {
        console.log(`Model ${model} failed (${res.status}):`, data?.error?.metadata?.raw || data?.error?.message || "no body");
        continue;
      }

      const choice = data?.choices?.[0];
      let content = choice?.message?.content;
      let finishReason = choice?.finish_reason;
      const modelUsed = data?.model;

      if (!content) {
        console.log(`Model ${model} returned empty content (finish: ${finishReason})`);
        continue;
      }

      // Cut off by the token limit: ask the SAME model to carry on, then stitch the parts together
      for (let i = 0; finishReason === "length" && i < MAX_CONTINUATIONS; i++) {
        console.log(`Output cut off at ${content.length} chars, continuing (${i + 1}/${MAX_CONTINUATIONS})...`);
        const next = await callModel(
          model,
          [...messages, { role: "assistant", content }, { role: "user", content: CONTINUE_PROMPT }],
          maxTokens
        );
        const more = next.data?.choices?.[0];
        if (!next.res.ok || !more?.message?.content) break;
        content += more.message.content;
        finishReason = more.finish_reason;
      }

      console.log("Model used:", modelUsed, "| finish:", finishReason, "| length:", content.length);

      return { content, finishReason, modelUsed };
    } catch (err) {
      console.log(`Model ${model} error:`, err.name, err.message); // timeout / network
    }
  }

  throw new Error("All models failed or are rate-limited");
};

export default generateResponse;