// Gemini API client — Image generation for rare/epic/legendary stickers and themes

const API_KEY = process.env.GEMINI_API_KEY!
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta"

interface GeneratedImage {
    base64: string
    mimeType: string
}

/** Generate an image using Gemini imagen model */
export async function generateImage(prompt: string, aspectRatio = "1:1"): Promise<GeneratedImage> {
    // A API Studio do Google suporta o Imagen 4 através do endpoint :predict
    const res = await fetch(
        `${BASE_URL}/models/imagen-4.0-generate-001:predict?key=${API_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                instances: [{ prompt }],
                parameters: { sampleCount: 1, aspectRatio }
            }),
        }
    )

    if (!res.ok) {
        const err = await res.text()
        throw new Error(`Gemini image error: ${res.status} — ${err}`)
    }

    const json = await res.json()
    const b64 = json.predictions?.[0]?.bytesBase64Encoded

    if (!b64) throw new Error("Gemini returned no image data")

    return {
        base64: b64,
        mimeType: "image/png",
    }
}

/** Build a child-safe sticker prompt for a given theme and rarity */
export function buildStickerPrompt(theme: string, rarity: string, subject: string): string {
    const style = rarity === "LEGENDARY"
        ? "holographic shiny sticker, rainbow shimmer, highly detailed"
        : rarity === "EPIC"
            ? "glowing sticker, vibrant colors, magical aura"
            : "cartoon sticker, clean lines, bright colors"

    return [
        `${style}, ${theme}-inspired original character, ${subject},`,
        "child-friendly, cute, kawaii aesthetic, white background,",
        "sticker illustration style, no text, no watermark,",
        "safe for children, educational app asset",
    ].join(" ")
}

/** Build a game background prompt for a theme */
export function buildBgPrompt(themeName: string, ageGroup: string): string {
    const styleMap: Record<string, string> = {
        EXPLORER: "simple, soft, colorful, toddler-friendly cartoon scene",
        ADVENTURER: "pixel art game scene, bright colors, blocky style",
        CHALLENGER: "adventure game map, isometric cartoon, vibrant",
    }
    return [
        `${styleMap[ageGroup] ?? "cartoon scene"}, ${themeName} theme,`,
        "educational game background, no characters, no text,",
        "landscape orientation, child-friendly, original illustration",
    ].join(" ")
}
