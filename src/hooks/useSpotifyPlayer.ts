/**
 * Spotify Web Playback SDK Hook
 *
 * Manages Spotify Web Playback SDK initialization and playback control
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import { getUserAccessToken } from '../api/spotify'

// Extend Window interface for Spotify SDK
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void
    Spotify: any
  }
}

export interface SpotifyPlayerState {
  paused: boolean
  position: number
  duration: number
  track_window: {
    current_track: {
      id: string
      name: string
      artists: Array<{ name: string }>
      album: {
        name: string
        images: Array<{ url: string }>
      }
      uri: string
    }
  }
}

interface UseSpotifyPlayerReturn {
  player: any
  deviceId: string | null
  isReady: boolean
  currentTrack: SpotifyPlayerState['track_window']['current_track'] | null
  isPaused: boolean
  position: number
  duration: number
  playTrack: (uri: string) => Promise<boolean>
  togglePlayPause: () => Promise<void>
  seek: (positionMs: number) => Promise<void>
}

/**
 * Custom hook for Spotify Web Playback SDK
 */
export function useSpotifyPlayer(): UseSpotifyPlayerReturn {
  const [player, setPlayer] = useState<any>(null)
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<SpotifyPlayerState['track_window']['current_track'] | null>(null)
  const [isPaused, setIsPaused] = useState(true)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const playerRef = useRef<any>(null)

  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    const token = getUserAccessToken()

    if (!token) {
      console.log('No Spotify access token available. User needs to login.')
      return
    }

    // Check if SDK is already loaded
    if (window.Spotify) {
      initializePlayer(token)
      return
    }

    // Load Spotify Web Playback SDK
    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true
    document.body.appendChild(script)

    window.onSpotifyWebPlaybackSDKReady = () => {
      initializePlayer(token)
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect()
      }
    }
  }, [])

  const initializePlayer = (token: string) => {
    const spotifyPlayer = new window.Spotify.Player({
      name: 'Concert Time Machine',
      getOAuthToken: (cb: (token: string) => void) => {
        cb(token)
      },
      volume: 0.8
    })

    // Error handling
    spotifyPlayer.addListener('initialization_error', ({ message }: any) => {
      console.error('Initialization error:', message)
    })

    spotifyPlayer.addListener('authentication_error', ({ message }: any) => {
      console.error('Authentication error:', message)
    })

    spotifyPlayer.addListener('account_error', ({ message }: any) => {
      console.error('Account error:', message)
    })

    spotifyPlayer.addListener('playback_error', ({ message }: any) => {
      console.error('Playback error:', message)
    })

    // Ready
    spotifyPlayer.addListener('ready', ({ device_id }: any) => {
      console.log('Ready with Device ID', device_id)
      setDeviceId(device_id)
      setIsReady(true)
    })

    // Not Ready
    spotifyPlayer.addListener('not_ready', ({ device_id }: any) => {
      console.log('Device ID has gone offline', device_id)
      setIsReady(false)
    })

    // Player state changed
    spotifyPlayer.addListener('player_state_changed', (state: SpotifyPlayerState | null) => {
      if (!state) {
        return
      }

      setCurrentTrack(state.track_window.current_track)
      setIsPaused(state.paused)
      setPosition(state.position)
      setDuration(state.duration)
    })

    // Connect to the player
    spotifyPlayer.connect()

    setPlayer(spotifyPlayer)
    playerRef.current = spotifyPlayer
  }

  const playTrack = useCallback(async (uri: string): Promise<boolean> => {
    if (!deviceId) {
      console.error('No device ID available')
      return false
    }

    const token = getUserAccessToken()
    if (!token) {
      return false
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris: [uri]
        })
      })

      return response.ok
    } catch (error) {
      console.error('Error playing track:', error)
      return false
    }
  }, [deviceId])

  const togglePlayPause = useCallback(async () => {
    if (!player) {
      return
    }

    if (isPaused) {
      await player.resume()
    } else {
      await player.pause()
    }
  }, [player, isPaused])

  const seek = useCallback(async (positionMs: number) => {
    if (!player) {
      return
    }

    await player.seek(positionMs)
  }, [player])

  return {
    player,
    deviceId,
    isReady,
    currentTrack,
    isPaused,
    position,
    duration,
    playTrack,
    togglePlayPause,
    seek
  }
}
