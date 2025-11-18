import type { Artist, Concert } from '@/stores/useConcertStore'

const SETLIST_FM_API_KEY = import.meta.env.VITE_SETLISTFM_API_KEY || 'demo-key'
// Use proxy in development to avoid CORS issues
const BASE_URL = import.meta.env.DEV 
  ? '/api/setlistfm' 
  : 'https://api.setlist.fm/rest/1.0'

const headers = {
  'x-api-key': SETLIST_FM_API_KEY,
  'Accept': 'application/json',
}

export interface SetlistFMResponse<T> {
  type: string
  itemsPerPage: number
  page: number
  total: number
  [key: string]: T[] | string | number
}

export async function searchArtists(query: string): Promise<Artist[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/search/artists?artistName=${encodeURIComponent(query)}&p=1&sort=relevance`,
      { headers }
    )

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('API_KEY_INVALID: Please set a valid VITE_SETLISTFM_API_KEY in your .env file. Get one at https://api.setlist.fm/docs/1.0/index.html')
      }
      throw new Error(`API error: ${response.status}`)
    }

    const data: SetlistFMResponse<Artist> = await response.json()
    const artists = data.artist as Artist[] || []

    // Filter out artists with no concerts
    const artistsWithConcerts = await Promise.all(
      artists.map(async (artist) => {
        const { total } = await getArtistSetlists(artist.mbid, 1)
        return total > 0 ? artist : null
      })
    )

    return artistsWithConcerts.filter((artist): artist is Artist => artist !== null)
  } catch (error) {
    console.error('Error searching artists:', error)
    throw error // Re-throw to allow UI to handle it
  }
}

export async function getArtistSetlists(artistMbid: string, page = 1): Promise<{ setlists: Concert[], total: number }> {
  try {
    const response = await fetch(
      `${BASE_URL}/search/setlists?artistMbid=${artistMbid}&p=${page}`,
      { headers }
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data: SetlistFMResponse<Concert> = await response.json()
    return {
      setlists: data.setlist as Concert[] || [],
      total: data.total as number || 0
    }
  } catch (error) {
    console.error('Error fetching setlists:', error)
    return { setlists: [], total: 0 }
  }
}

export async function getSetlistById(setlistId: string): Promise<Concert | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/setlist/${setlistId}`,
      { headers }
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data: Concert = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching setlist:', error)
    return null
  }
}
