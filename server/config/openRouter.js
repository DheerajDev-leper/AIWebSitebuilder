const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";

const MODELS = [
    "google/gemma-4-31b-it:free",
    "google/gemma-4-26b-a4b-it:free",
    "qwen/qwen3.8-27b:free",
    "poolside/laguna-xs-2.1:free",
       // fallback 1
    "openrouter/free",          // fallback 2, last resort
];

const callModel = async (model, prompt) => {
    const res = await fetch(openRouterUrl, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model,
            messages: [
                {
                    role: "system",
                    content:
                        "Follow the requested output format exactly. No markdown fences, no explanation, no reasoning text — output only what was asked for.",
                },
                { role: "user", content: prompt },
            ],
            temperature: 0.2,
            max_tokens: 8000,
            reasoning: { enabled: false },
        }),
    });

    const data = await res.json();
    return { res, data };
};

const generateResponse = async (prompt, modelIndex = 0) => {
    if (modelIndex >= MODELS.length) {
        throw new Error("All models failed or are rate-limited");
    }

    const model = MODELS[modelIndex];
    let { res, data } = await callModel(model, prompt);

    // Rate-limited: wait briefly and retry the SAME model once
    if (res.status === 429) {
        console.log(`${model} rate-limited, retrying once in 3s...`);
        await new Promise((r) => setTimeout(r, 3000));
        ({ res, data } = await callModel(model, prompt));
    }

    if (!res.ok) {
        console.log(
            `Model ${model} failed (${res.status}):`,
            data?.error?.metadata?.raw || data?.error?.message || JSON.stringify(data)
        );
        return generateResponse(prompt, modelIndex + 1); // try next model
    }

    const choice = data?.choices?.[0];

    console.log("Model used:", data?.model);
    console.log("Finish reason:", choice?.finish_reason);
    console.log("AI content length:", choice?.message?.content?.length);
    console.log("Has separate reasoning field:", !!choice?.message?.reasoning);

    return {
        content: choice?.message?.content ?? null,
        finishReason: choice?.finish_reason,
        modelUsed: data?.model,
    };
};

export default generateResponse;