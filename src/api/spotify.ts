/**
 * Spotify API Client
 *
 * Handles authentication and API calls to Spotify Web API
 * Supports both Client Credentials flow (for search) and Authorization Code flow (for playback)
 */

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID?.trim()
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET?.trim()
// Spotify no longer allows 'localhost' - must use 127.0.0.1
const REDIRECT_URI = (import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:5173/callback').trim()

// Token storage
let accessToken: string | null = null
let tokenExpiry: number | null = null

/**
 * Verify Spotify credentials are valid
 * This can help diagnose configuration issues
 */
export async function verifySpotifyCredentials(): Promise<{ valid: boolean; error?: string }> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return { valid: false, error: 'Client ID or Client Secret not set' }
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
      },
      body: 'grant_type=client_credentials'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { 
        valid: false, 
        error: errorData.error_description || errorData.error || `HTTP ${response.status}` 
      }
    }

    return { valid: true }
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get access token using Client Credentials flow
 * Used for non-user-specific operations like search
 */
async function getClientCredentialsToken(): Promise<string> {
  // Check if we have a valid token
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
    },
    body: 'grant_type=client_credentials'
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMsg = errorData.error_description || errorData.error || 'Failed to authenticate with Spotify'
    throw new Error(`Spotify authentication failed: ${errorMsg}`)
  }

  const data = await response.json()
  accessToken = data.access_token
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000 // Subtract 1 minute for safety

  return accessToken!
}

/**
 * Get user access token from localStorage
 * Used for user-specific operations like playback
 */
export function getUserAccessToken(): string | null {
  const token = localStorage.getItem('spotify_access_token')
  const expiry = localStorage.getItem('spotify_token_expiry')

  if (token && expiry && Date.now() < parseInt(expiry)) {
    return token
  }

  return null
}

/**
 * Save user access token to localStorage
 */
export function saveUserAccessToken(token: string, expiresIn: number) {
  localStorage.setItem('spotify_access_token', token)
  localStorage.setItem('spotify_token_expiry', (Date.now() + expiresIn * 1000).toString())
}

/**
 * Clear user access token
 */
export function clearUserAccessToken() {
  localStorage.removeItem('spotify_access_token')
  localStorage.removeItem('spotify_token_expiry')
  localStorage.removeItem('spotify_refresh_token')
}

/**
 * Generate authorization URL for user login
 */
export function getAuthorizationUrl(): string {
  if (!CLIENT_ID) {
    throw new Error('VITE_SPOTIFY_CLIENT_ID is not set in environment variables')
  }

  if (!REDIRECT_URI) {
    throw new Error('VITE_SPOTIFY_REDIRECT_URI is not set in environment variables')
  }

  const scopes = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-modify-playback-state',
    'user-read-playback-state'
  ]

  // Log the redirect URI for debugging (only in development)
  if (import.meta.env.DEV) {
    console.log('🔍 Spotify Configuration Check:')
    console.log('  Client ID:', CLIENT_ID ? `${CLIENT_ID.substring(0, 8)}...${CLIENT_ID.substring(CLIENT_ID.length - 4)}` : '❌ NOT SET')
    console.log('  Redirect URI:', REDIRECT_URI)
    console.log('  Redirect URI length:', REDIRECT_URI.length, 'characters')
    console.log('  Redirect URI encoded:', encodeURIComponent(REDIRECT_URI))
    console.log('')
    console.log('⚠️  If you see a 400 error, verify:')
    console.log('  1. The redirect URI above matches EXACTLY in Spotify Dashboard')
    console.log('  2. No extra spaces or characters')
    console.log('  3. Client ID is correct')
    console.log('  4. Dashboard URL: https://developer.spotify.com/dashboard')
    console.log('')
  }

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: scopes.join(' '),
    show_dialog: 'false'
  })

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`
  
  if (import.meta.env.DEV) {
    console.group('🔍 Spotify Authorization Debug Info')
    console.log('Client ID:', CLIENT_ID)
    console.log('Redirect URI:', REDIRECT_URI)
    console.log('Redirect URI (encoded):', encodeURIComponent(REDIRECT_URI))
    console.log('Full Authorization URL:', authUrl)
    console.log('')
    console.log('⚠️  TROUBLESHOOTING 400 ERROR:')
    console.log('1. Copy the Redirect URI above')
    console.log('2. Go to: https://developer.spotify.com/dashboard')
    console.log('3. Select your app → Edit Settings')
    console.log('4. In "Redirect URIs", verify the URI matches EXACTLY')
    console.log('5. If not there, add it and click SAVE')
    console.log('6. Wait 30 seconds for changes to propagate')
    console.log('7. Try again')
    console.groupEnd()
  }
  
  return authUrl
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<void> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Spotify credentials are not configured. Please set VITE_SPOTIFY_CLIENT_ID and VITE_SPOTIFY_CLIENT_SECRET in your .env file.')
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData.error_description || errorData.error || 'Failed to exchange code for token'
    
    // Provide helpful error message for redirect URI issues
    if (errorMessage.includes('redirect_uri') || errorMessage.includes('INVALID_CLIENT')) {
      throw new Error(
        `Redirect URI mismatch. The redirect URI "${REDIRECT_URI}" must be added in your Spotify Developer Dashboard. ` +
        `Go to https://developer.spotify.com/dashboard, select your app, click "Edit Settings", ` +
        `and add "${REDIRECT_URI}" to the "Redirect URIs" list.`
      )
    }
    
    throw new Error(errorMessage)
  }

  const data = await response.json()
  saveUserAccessToken(data.access_token, data.expires_in)

  if (data.refresh_token) {
    localStorage.setItem('spotify_refresh_token', data.refresh_token)
  }
}

/**
 * Refresh user access token
 */
export async function refreshUserToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('spotify_refresh_token')

  if (!refreshToken) {
    return null
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  })

  if (!response.ok) {
    return null
  }

  const data = await response.json()
  saveUserAccessToken(data.access_token, data.expires_in)

  return data.access_token
}

/**
 * Check if user is authenticated
 */
export function isUserAuthenticated(): boolean {
  return getUserAccessToken() !== null
}

// Type definitions
export interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string; id: string }>
  album: {
    name: string
    images: Array<{ url: string; height: number; width: number }>
  }
  uri: string
  duration_ms: number
  preview_url: string | null
}

export interface SpotifyArtist {
  id: string
  name: string
  images: Array<{ url: string; height: number; width: number }>
  genres: string[]
  followers: { total: number }
}

/**
 * Search for a track by artist and song name
 */
export async function searchTrack(artistName: string, songName: string): Promise<SpotifyTrack | null> {
  try {
    const token = await getClientCredentialsToken()

    // Clean up the query
    const query = `track:${songName} artist:${artistName}`

    const response = await fetch(
      `https://api.spotify.com/v1/search?${new URLSearchParams({
        q: query,
        type: 'track',
        limit: '1'
      })}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      console.error('Failed to search track:', response.statusText)
      return null
    }

    const data = await response.json()

    if (data.tracks.items.length === 0) {
      return null
    }

    return data.tracks.items[0]
  } catch (error) {
    console.error('Error searching track:', error)
    return null
  }
}

/**
 * Get artist information including photos
 */
export async function getArtistInfo(artistName: string): Promise<SpotifyArtist | null> {
  try {
    const token = await getClientCredentialsToken()

    // First search for the artist
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?${new URLSearchParams({
        q: artistName,
        type: 'artist',
        limit: '1'
      })}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!searchResponse.ok) {
      console.error('Failed to search artist:', searchResponse.statusText)
      return null
    }

    const searchData = await searchResponse.json()

    if (searchData.artists.items.length === 0) {
      return null
    }

    return searchData.artists.items[0]
  } catch (error) {
    console.error('Error fetching artist info:', error)
    return null
  }
}

/**
 * Get multiple tracks for a setlist
 */
export async function searchTracks(songs: Array<{ artist: string; title: string }>): Promise<Map<string, SpotifyTrack>> {
  const results = new Map<string, SpotifyTrack>()

  // Search tracks in parallel but with rate limiting
  const batchSize = 5
  for (let i = 0; i < songs.length; i += batchSize) {
    const batch = songs.slice(i, i + batchSize)
    const promises = batch.map(song => searchTrack(song.artist, song.title))
    const batchResults = await Promise.all(promises)

    batchResults.forEach((track, index) => {
      if (track) {
        const song = batch[index]
        results.set(`${song.artist}-${song.title}`, track)
      }
    })

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < songs.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return results
}

/**
 * Play a track using Spotify Web Playback SDK
 */
export async function playTrack(trackUri: string): Promise<boolean> {
  const token = getUserAccessToken()

  if (!token) {
    console.error('No user access token available')
    return false
  }

  try {
    // Get available devices
    const devicesResponse = await fetch('https://api.spotify.com/v1/me/player/devices', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!devicesResponse.ok) {
      console.error('Failed to get devices')
      return false
    }

    const devicesData = await devicesResponse.json()
    const activeDevice = devicesData.devices.find((d: any) => d.is_active) || devicesData.devices[0]

    if (!activeDevice) {
      console.error('No active Spotify device found')
      return false
    }

    // Play the track
    const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${activeDevice.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uris: [trackUri]
      })
    })

    return response.ok
  } catch (error) {
    console.error('Error playing track:', error)
    return false
  }
}

/**
 * Pause playback
 */
export async function pausePlayback(): Promise<boolean> {
  const token = getUserAccessToken()

  if (!token) {
    return false
  }

  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/pause', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    return response.ok || response.status === 204
  } catch (error) {
    console.error('Error pausing playback:', error)
    return false
  }
}

/**
 * Resume playback
 */
export async function resumePlayback(): Promise<boolean> {
  const token = getUserAccessToken()

  if (!token) {
    return false
  }

  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/play', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    return response.ok || response.status === 204
  } catch (error) {
    console.error('Error resuming playback:', error)
    return false
  }
}
