import React, { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react'
import { getUserAccessToken, playTrack as playOnActiveDevice } from '../api/spotify'

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

interface SpotifyPlayerContextType {
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
    setVolume: (volume: number) => Promise<void>
    activateElement: () => Promise<void>
    error: string | null
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextType | null>(null)

export function SpotifyPlayerProvider({ children }: { children: ReactNode }) {
    const [player, setPlayer] = useState<any>(null)
    const [deviceId, setDeviceId] = useState<string | null>(null)
    const [isReady, setIsReady] = useState(false)
    const [currentTrack, setCurrentTrack] = useState<SpotifyPlayerState['track_window']['current_track'] | null>(null)
    const [isPaused, setIsPaused] = useState(true)
    const [position, setPosition] = useState(0)
    const [duration, setDuration] = useState(0)
    const [error, setError] = useState<string | null>(null)
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

        // If script is already added but not ready, just wait for the callback
        if (document.getElementById('spotify-player-script')) {
            window.onSpotifyWebPlaybackSDKReady = () => {
                initializePlayer(token)
            }
            return
        }

        // Load Spotify Web Playback SDK
        const script = document.createElement('script')
        script.id = 'spotify-player-script'
        script.src = 'https://sdk.scdn.co/spotify-player.js'
        script.async = true
        document.body.appendChild(script)

        window.onSpotifyWebPlaybackSDKReady = () => {
            initializePlayer(token)
        }

        return () => {
            // We generally don't want to disconnect on unmount of the provider unless the app is closing,
            // but for hot-reloading safety we can keep it.
            if (playerRef.current) {
                playerRef.current.disconnect()
            }
        }
    }, [])

    const initializePlayer = (token: string) => {
        console.log('Initializing Spotify Player...')
        const spotifyPlayer = new window.Spotify.Player({
            name: 'Concert Time Machine',
            getOAuthToken: (cb: (token: string) => void) => {
                const freshToken = getUserAccessToken() || token
                cb(freshToken)
            },
            volume: 0.5
        })

        // Error handling
        spotifyPlayer.addListener('initialization_error', ({ message }: any) => {
            console.error('Initialization error:', message)
            if (message.includes('EME') || message.includes('keysystem')) {
                setError('Your browser does not support secure playback (DRM). Please try Chrome, Firefox, or Edge.')
            } else {
                setError(`Failed to initialize player: ${message}`)
            }
        })

        spotifyPlayer.addListener('authentication_error', ({ message }: any) => {
            console.error('Authentication error:', message)
            setError('Authentication failed. Please log in again.')
        })

        spotifyPlayer.addListener('account_error', ({ message }: any) => {
            console.error('Account error:', message)
            setError('Premium account required for Web Player.')
        })

        spotifyPlayer.addListener('playback_error', ({ message }: any) => {
            console.error('Playback error:', message)
        })

        // Ready
        spotifyPlayer.addListener('ready', ({ device_id }: any) => {
            console.log('Spotify Player Ready with Device ID', device_id)
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
        spotifyPlayer.connect().then((success: boolean) => {
            if (success) {
                console.log('The Web Playback SDK successfully connected to Spotify!')
            } else {
                console.error('The Web Playback SDK failed to connect to Spotify')
            }
        })

        setPlayer(spotifyPlayer)
        playerRef.current = spotifyPlayer
    }

    const playTrack = useCallback(async (uri: string): Promise<boolean> => {
        if (!deviceId) {
            console.warn('Web Player device ID not available. Falling back to active device control.')
            return await playOnActiveDevice(uri)
        }

        const token = getUserAccessToken()
        if (!token) {
            console.error('No access token available for playback')
            return false
        }

        try {
            console.log(`Attempting to play ${uri} on device ${deviceId}`)
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

            if (!response.ok) {
                const errorText = await response.text()
                console.error('Error playing track response:', response.status, errorText)

                if (response.status === 404) {
                    console.log('Device not found, trying to transfer playback...')
                }

                return false
            }

            console.log('Playback started successfully on Web Player')
            return true
        } catch (error) {
            console.error('Error playing track:', error)
            return false
        }
    }, [deviceId])

    const togglePlayPause = useCallback(async () => {
        if (!player || !isReady) {
            const token = getUserAccessToken()
            if (token) {
                try {
                    const stateRes = await fetch('https://api.spotify.com/v1/me/player', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })

                    if (stateRes.ok) {
                        const data = await stateRes.json()
                        if (data.is_playing) {
                            await fetch('https://api.spotify.com/v1/me/player/pause', {
                                method: 'PUT',
                                headers: { 'Authorization': `Bearer ${token}` }
                            })
                        } else {
                            await fetch('https://api.spotify.com/v1/me/player/play', {
                                method: 'PUT',
                                headers: { 'Authorization': `Bearer ${token}` }
                            })
                        }
                    }
                } catch (e) {
                    console.error('Fallback toggle failed', e)
                }
            }
            return
        }

        try {
            await player.togglePlay()
        } catch (e) {
            console.error('Error toggling play/pause:', e)
        }
    }, [player, isReady])

    const seek = useCallback(async (positionMs: number) => {
        if (!player) return
        await player.seek(positionMs)
    }, [player])

    const setVolume = useCallback(async (volume: number) => {
        if (!player) return
        try {
            await player.setVolume(volume)
        } catch (e) {
            console.error('Error setting volume:', e)
        }
    }, [player])

    const activateElement = useCallback(async () => {
        if (player) {
            await player.activateElement()
        }
    }, [player])

    const value = {
        player,
        deviceId,
        isReady,
        currentTrack,
        isPaused,
        position,
        duration,
        playTrack,
        togglePlayPause,
        seek,
        setVolume,
        activateElement,
        error
    }

    return (
        <SpotifyPlayerContext.Provider value={value}>
            {children}
        </SpotifyPlayerContext.Provider>
    )
}

export function useSpotifyPlayerContext() {
    const context = useContext(SpotifyPlayerContext)
    if (!context) {
        throw new Error('useSpotifyPlayerContext must be used within a SpotifyPlayerProvider')
    }
    return context
}
