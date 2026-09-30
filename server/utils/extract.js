const isValidHtml = (code) =>
    !!code &&
    /^\s*<!DOCTYPE html/i.test(code.trim()) &&
    /<\/html>\s*$/i.test(code.trim());

// Always strips stray backslash-escaping the model left behind,
// regardless of whether the rest of the document has real newlines.
// This is safe for HTML/CSS; the only real risk is JS inside <script>
// that legitimately uses \/ in a regex literal, which is rare compared
// to broken attributes appearing throughout the markup.
const cleanupEscaping = (code) => {
    if (!code) return code;

    let result = code;

    // Full-document JSON escaping (no real newlines at all)
    if (!result.includes("\n") && /\\n/.test(result)) {
        result = result
            .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
            .replace(/\\n/g, "\n")
            .replace(/\\r/g, "\r")
            .replace(/\\t/g, "\t")
            .replace(/\\\\/g, "\\");
    }

    // Always: strip stray escaped quotes/slashes left in attributes,
    // even when the rest of the doc already has real newlines.
    result = result.replace(/\\"/g, '"').replace(/\\\//g, "/");

    return result;
};

const extract = (text) => {
    if (typeof text !== "string" || !text) return null;

    const cleaned = text.replace(/```json/gi, "").replace(/```html/gi, "").replace(/```/g, "").trim();

    let tagCode = cleaned.match(/<code>\s*([\s\S]*?)\s*<\/code>/i)?.[1]?.trim();
    tagCode = cleanupEscaping(tagCode);
    if (tagCode && isValidHtml(tagCode)) {
        const message =
            cleaned.match(/<message>([\s\S]*?)<\/message>/i)?.[1]?.trim() ||
            "Website generated successfully.";
        return { message, code: tagCode };
    }

    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    if (first !== -1 && last !== -1) {
        try {
            const parsed = JSON.parse(cleaned.slice(first, last + 1));
            const jsonCode = cleanupEscaping(parsed?.code);
            if (jsonCode && isValidHtml(jsonCode)) {
                return { message: parsed.message || "Website generated successfully.", code: jsonCode };
            }
        } catch {
            // fall through
        }
    }

    let rawHtml = cleaned.match(/(<!DOCTYPE html[\s\S]*<\/html>)/i)?.[1]?.trim();
    rawHtml = cleanupEscaping(rawHtml);
    if (rawHtml && isValidHtml(rawHtml)) {
        return { message: "Website generated successfully.", code: rawHtml };
    }

    return null;
};

export default extract;