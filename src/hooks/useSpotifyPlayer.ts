/**
 * Spotify Web Playback SDK Hook
 *
 * Manages Spotify Web Playback SDK initialization and playback control
 */

import { useSpotifyPlayerContext } from '../contexts/SpotifyPlayerContext'

export { type SpotifyPlayerState } from '../contexts/SpotifyPlayerContext'

/**
 * Custom hook for Spotify Web Playback SDK
 * Now just a wrapper around the global context
 */
export function useSpotifyPlayer() {
  return useSpotifyPlayerContext()
}
