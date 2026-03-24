// Giphy Stickers API client
// Always uses rating=g for child-safe content
// Results are cached in DB to avoid repeated API calls

const GIPHY_BASE = "https://api.giphy.com/v1/stickers"
const API_KEY = process.env.GIPHY_API_KEY!

export interface GiphySticker {
    id: string
    title: string
    images: {
        fixed_height: { url: string; width: string; height: string }
        original: { url: string }
    }
}

interface GiphyResponse {
    data: GiphySticker[]
    pagination: { total_count: number; count: number; offset: number }
}

export async function searchStickers(
    query: string,
    limit = 10,
    offset = 0
): Promise<GiphySticker[]> {
    const url = new URL(`${GIPHY_BASE}/search`)
    url.searchParams.set("api_key", API_KEY)
    url.searchParams.set("q", query)
    url.searchParams.set("rating", "g") // child-safe — always enforced
    url.searchParams.set("lang", "pt")
    url.searchParams.set("limit", String(limit))
    url.searchParams.set("offset", String(offset))

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`Giphy API error: ${res.status}`)

    const json: GiphyResponse = await res.json()
    return json.data
}

export async function getRandomSticker(query: string): Promise<GiphySticker | null> {
    const results = await searchStickers(query, 25)
    if (!results.length) return null
    return results[Math.floor(Math.random() * results.length)]
}
