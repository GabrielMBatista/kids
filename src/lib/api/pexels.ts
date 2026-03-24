// Pexels API client — B-roll videos and images for word illustration
// Results cached in MediaCache table (1 entry per search query)

const PEXELS_BASE = "https://api.pexels.com"
const API_KEY = process.env.PEXELS_API_KEY!

const headers = { Authorization: API_KEY }

export interface PexelsPhoto {
    id: number
    src: { medium: string; large: string }
    alt: string
}

export interface PexelsVideo {
    id: number
    video_files: { link: string; quality: string; file_type: string }[]
    image: string // thumbnail
}

export async function searchPhotos(query: string, perPage = 5): Promise<PexelsPhoto[]> {
    const url = new URL(`${PEXELS_BASE}/v1/search`)
    url.searchParams.set("query", query)
    url.searchParams.set("per_page", String(perPage))
    url.searchParams.set("locale", "pt-BR")

    const res = await fetch(url.toString(), { headers, next: { revalidate: 86400 } })
    if (!res.ok) throw new Error(`Pexels photo error: ${res.status}`)

    const json = await res.json()
    return json.photos as PexelsPhoto[]
}

export async function searchVideos(query: string, perPage = 3): Promise<PexelsVideo[]> {
    const url = new URL(`${PEXELS_BASE}/videos/search`)
    url.searchParams.set("query", query)
    url.searchParams.set("per_page", String(perPage))
    url.searchParams.set("size", "small") // short clips for kids

    const res = await fetch(url.toString(), { headers, next: { revalidate: 86400 } })
    if (!res.ok) throw new Error(`Pexels video error: ${res.status}`)

    const json = await res.json()
    return json.videos as PexelsVideo[]
}

/** Returns the best SD mp4 video file from a PexelsVideo */
export function getBestVideoFile(video: PexelsVideo): string | null {
    const sd = video.video_files.find(
        (f) => f.quality === "sd" && f.file_type === "video/mp4"
    )
    return sd?.link ?? video.video_files[0]?.link ?? null
}
