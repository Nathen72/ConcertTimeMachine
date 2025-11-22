import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  MapPin,
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Music2,
  Info,
  LogIn,
  Disc
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useConcertStore } from '@/stores/useConcertStore'
import { searchTrack, isUserAuthenticated, getAuthorizationUrl } from '@/api/spotify'
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer'

export function Player() {
  const navigate = useNavigate()
  const {
    selectedConcert,
    currentSongIndex,
    isPlaying,
    setIsPlaying,
    nextSong,
    previousSong,
    setCurrentSongIndex,
    currentSpotifyTrack,
    setCurrentSpotifyTrack
  } = useConcertStore()

  const [allSongs, setAllSongs] = useState<any[]>([])
  const [isAuthenticated] = useState(isUserAuthenticated())

  const spotifyPlayer = useSpotifyPlayer()

  useEffect(() => {
    if (!selectedConcert) {
      navigate('/concerts')
      return
    }

    const songs = selectedConcert.sets?.set?.flatMap((set, setIndex) =>
      set.song.map((song, songIndex) => ({
        ...song,
        setName: set.name || `Set ${setIndex + 1}`,
        encore: set.encore,
        globalIndex: setIndex * 100 + songIndex
      }))
    ) || []

    setAllSongs(songs)
  }, [selectedConcert])

  useEffect(() => {
    const currentSong = allSongs[currentSongIndex]
    if (!currentSong || !selectedConcert) return

    const searchForTrack = async () => {
      try {
        const artistName = currentSong.cover?.name || selectedConcert.artist.name
        const track = await searchTrack(artistName, currentSong.name)
        setCurrentSpotifyTrack(track)
      } catch (error) {
        console.error('Error searching for track:', error)
        setCurrentSpotifyTrack(null)
      }
    }

    searchForTrack()
  }, [currentSongIndex, allSongs, selectedConcert, setCurrentSpotifyTrack])

  useEffect(() => {
    // Sync external player state (e.g. from Spotify app or auto-pause) to local state
    if (spotifyPlayer.isReady) {
      if (spotifyPlayer.isPaused && isPlaying) {
        setIsPlaying(false)
      } else if (!spotifyPlayer.isPaused && !isPlaying) {
        setIsPlaying(true)
      }
    }
  }, [spotifyPlayer.isPaused, spotifyPlayer.isReady])

  useEffect(() => {
    if (!isAuthenticated || !currentSpotifyTrack) return

    const managePlayback = async () => {
      // If player is not ready, we can't do much yet, but if we have a track and user wants to play,
      // we might be waiting for the player to initialize.

      if (isPlaying) {
        if (spotifyPlayer.isReady) {
          // If we are paused but should be playing, resume or play new track
          if (spotifyPlayer.isPaused) {
            // Check if we need to play a new track or just resume
            const currentUri = spotifyPlayer.currentTrack?.uri
            if (currentUri !== currentSpotifyTrack.uri) {
              await spotifyPlayer.playTrack(currentSpotifyTrack.uri)
            } else {
              await spotifyPlayer.togglePlayPause()
            }
          } else {
            // Already playing, check if it's the right track
            const currentUri = spotifyPlayer.currentTrack?.uri
            if (currentUri !== currentSpotifyTrack.uri) {
              await spotifyPlayer.playTrack(currentSpotifyTrack.uri)
            }
          }
        } else {
          // Player not ready, maybe try fallback or just wait (the hook handles fallback internally if we call playTrack)
          // But here we just wait for isReady to become true
        }
      } else {
        // We should be paused
        if (spotifyPlayer.isReady && !spotifyPlayer.isPaused) {
          await spotifyPlayer.togglePlayPause()
        }
      }
    }

    managePlayback()
  }, [isPlaying, currentSpotifyTrack, spotifyPlayer.isReady, isAuthenticated])

  if (!selectedConcert) return null

  const currentSong = allSongs[currentSongIndex]

  const formatDate = (dateString: string) => {
    const [day, month, year] = dateString.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handlePlayPause = async () => {
    if (!isAuthenticated) {
      handleSpotifyLogin()
      return
    }

    await spotifyPlayer.activateElement()
    setIsPlaying(!isPlaying)
  }

  const handleSpotifyLogin = () => {
    try {
      localStorage.setItem('spotify_auth_return_to', window.location.pathname)
      window.location.href = getAuthorizationUrl()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to generate Spotify authorization URL.')
    }
  }

  const handleNext = async () => {
    await spotifyPlayer.activateElement()
    nextSong()
  }

  const handlePrevious = async () => {
    await spotifyPlayer.activateElement()
    previousSong()
  }

  return (
    <div className="min-h-full p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-2 border-vintage-teal/10 pb-6">
        <div className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => navigate('/concerts')}
            className="text-vintage-teal/50 hover:text-vintage-teal p-0 h-auto font-mono text-xs tracking-wider mb-2"
          >
            <ArrowLeft className="mr-2 w-3 h-3" /> EJECT TAPE
          </Button>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-vintage-teal uppercase tracking-tight">
            {selectedConcert.artist.name}
          </h1>
          <div className="flex items-center gap-2 text-vintage-teal/70 font-mono text-xs md:text-sm">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(selectedConcert.eventDate)}</span>
            <span className="opacity-30">|</span>
            <MapPin className="w-3 h-3" />
            <span>{selectedConcert.venue.name}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {!isAuthenticated && (
            <Button
              variant="vintage"
              size="sm"
              onClick={handleSpotifyLogin}
              className="font-mono tracking-wider text-xs"
            >
              <LogIn className="w-3 h-3 mr-2" /> INSERT SPOTIFY KEY
            </Button>
          )}
          {spotifyPlayer.error && (
            <div className="bg-red-50 text-red-600 text-[10px] font-mono p-1 px-2 rounded border border-red-200">
              ERR: {spotifyPlayer.error}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">

        {/* VCR DECK (Player) */}
        <div className="lg:col-span-2 relative z-10">
          <div className="bg-zinc-800 rounded-xl p-1 shadow-2xl ring-1 ring-white/10">
            <div className="bg-zinc-900 rounded-lg border-t border-zinc-700 p-6 md:p-8 space-y-6 relative overflow-hidden">

              {/* VCR Window */}
              <div className="aspect-video bg-black rounded-lg border-8 border-zinc-800 relative shadow-[inset_0_0_40px_rgba(0,0,0,1)] overflow-hidden group ring-1 ring-white/5">
                {/* Screen Reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent z-20 pointer-events-none" />

                {/* Content */}
                <div className="absolute inset-0 flex items-center justify-center opacity-90">
                  {currentSpotifyTrack?.album?.images?.[0]?.url ? (
                    <img
                      src={currentSpotifyTrack.album.images[0].url}
                      className="h-full w-full object-contain drop-shadow-2xl"
                      alt="Album Art"
                    />
                  ) : (
                    <div className="text-zinc-800 font-mono text-4xl md:text-6xl tracking-widest font-bold opacity-50">
                      NO SIGNAL
                    </div>
                  )}
                </div>

                {/* Scanlines Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_4px,6px_100%] pointer-events-none" />

                {/* OSD */}
                <div className="absolute top-4 left-6 font-mono text-green-500 text-lg md:text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] z-30 flex items-center gap-2">
                  {isPlaying ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                  <span>{isPlaying ? 'PLAY' : 'PAUSE'}</span>
                </div>
                <div className="absolute bottom-4 right-6 font-mono text-white/80 text-sm z-30 drop-shadow-md">
                  SP 0:{String(Math.floor((currentSongIndex + 1) / 10)).padStart(1, '0')}:
                  {String((currentSongIndex + 1) % 60).padStart(2, '0')}
                </div>
              </div>

              {/* Control Panel */}
              <div className="bg-zinc-950 p-4 rounded border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6 relative">
                {/* LED Display */}
                <div className="flex-1 w-full bg-black border border-zinc-800 rounded p-3 px-4 font-mono text-green-500 shadow-[inset_0_0_15px_rgba(0,255,0,0.1)] relative overflow-hidden">
                  <div className="text-[10px] text-green-500/50 uppercase mb-1">Channel {currentSongIndex + 1}</div>
                  <div className="text-lg md:text-xl truncate leading-none tracking-tight">
                    {currentSong?.name || 'INSERT TAPE...'}
                  </div>
                  <div className="absolute right-3 top-3 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(255,0,0,0.8)]"></div>
                </div>

                {/* Physical Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handlePrevious}
                    disabled={currentSongIndex === 0}
                    className="h-12 w-16 bg-zinc-300 rounded-sm shadow-[0_4px_0_rgb(161,161,170),0_5px_5px_rgba(0,0,0,0.4)] active:shadow-none active:translate-y-1 transition-all border-t border-white/50 flex items-center justify-center text-zinc-800 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SkipBack className="w-5 h-5 fill-current" />
                  </button>

                  <button
                    onClick={handlePlayPause}
                    className="h-12 w-20 bg-zinc-300 rounded-sm shadow-[0_4px_0_rgb(161,161,170),0_5px_5px_rgba(0,0,0,0.4)] active:shadow-none active:translate-y-1 transition-all border-t border-white/50 flex items-center justify-center text-zinc-800 hover:bg-white"
                  >
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={currentSongIndex === allSongs.length - 1}
                    className="h-12 w-16 bg-zinc-300 rounded-sm shadow-[0_4px_0_rgb(161,161,170),0_5px_5px_rgba(0,0,0,0.4)] active:shadow-none active:translate-y-1 transition-all border-t border-white/50 flex items-center justify-center text-zinc-800 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SkipForward className="w-5 h-5 fill-current" />
                  </button>
                </div>
              </div>

              {/* Decorative Brand Badge */}
              <div className="absolute top-2 right-4 text-[10px] font-sans font-bold text-zinc-600 tracking-widest italic opacity-50">
                CONCERT TIME MACHINE <span className="not-italic text-red-700">HI-FI</span>
              </div>

              {/* Volume & Debug */}
              <div className="pt-4 border-t border-zinc-800/50">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider w-12">Volume</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    defaultValue="0.5"
                    onChange={(e) => spotifyPlayer.setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-vintage-teal hover:accent-vintage-orange transition-colors"
                  />
                </div>

                <details className="group">
                  <summary className="text-[10px] font-mono text-zinc-600 cursor-pointer hover:text-zinc-400 select-none flex items-center gap-2">
                    <span>▶</span> DEBUG INFO
                  </summary>
                  <div className="mt-2 p-2 bg-black/50 rounded border border-zinc-800 text-[10px] font-mono text-green-500/80 space-y-1">
                    <div className="flex justify-between"><span>Device ID:</span> <span className="text-white/70">{spotifyPlayer.deviceId || 'None'}</span></div>
                    <div className="flex justify-between"><span>Ready:</span> <span className="text-white/70">{spotifyPlayer.isReady ? 'Yes' : 'No'}</span></div>
                    <div className="flex justify-between"><span>Paused:</span> <span className="text-white/70">{spotifyPlayer.isPaused ? 'Yes' : 'No'}</span></div>
                    <div className="flex justify-between"><span>Active Track:</span> <span className="text-white/70 truncate max-w-[150px]">{currentSpotifyTrack?.name || 'None'}</span></div>
                    <div className="flex justify-between"><span>Store Playing:</span> <span className="text-white/70">{isPlaying ? 'Yes' : 'No'}</span></div>
                  </div>
                </details>
              </div>
            </div>
          </div>

          {/* Additional Concert Info Card */}
          {selectedConcert.info && (
            <div className="mt-6 bg-cassette-label border border-zinc-200 p-6 rounded shadow-md rotate-0 md:-rotate-1 max-w-2xl mx-auto">
              <h3 className="font-cassette text-sm text-vintage-teal mb-2 border-b border-vintage-teal/20 pb-1">TAPE NOTES</h3>
              <p className="font-mono text-sm text-vintage-teal/80 leading-relaxed">{selectedConcert.info}</p>
            </div>
          )}
        </div>

        {/* TRACKLIST (Cassette Insert) */}
        <div className="lg:col-span-1 relative">
          <div className="bg-cassette-label rounded-sm shadow-xl border border-zinc-200 p-0 overflow-hidden sticky top-24 rotate-1 hover:rotate-0 transition-transform duration-500">
            {/* Insert Spine styling */}
            <div className="h-12 bg-vintage-orange flex items-center px-4 justify-between text-vintage-cream shadow-md relative z-10">
              <span className="font-cassette text-sm tracking-widest">TRACK LISTING</span>
              <Music2 className="w-4 h-4 opacity-80" />
            </div>

            {/* Paper Texture */}
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-noise z-0"></div>

            <div className="p-0 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-vintage-teal/20">
              <div className="divide-y divide-vintage-teal/10">
                {selectedConcert.sets?.set?.map((set, setIndex) => (
                  <div key={setIndex}>
                    <div className="bg-vintage-teal/5 px-4 py-2 font-mono text-xs font-bold text-vintage-teal/60 uppercase tracking-wider">
                      {set.name || `SIDE ${String.fromCharCode(65 + setIndex)}`}
                      {set.encore && ` (ENCORE)`}
                    </div>

                    <div>
                      {set.song.map((song, songIndex) => {
                        const startOfSetIndex = selectedConcert.sets?.set?.slice(0, setIndex).reduce((acc, s) => acc + s.song.length, 0) || 0
                        const globalIndex = startOfSetIndex + songIndex
                        const isCurrentSong = globalIndex === currentSongIndex

                        return (
                          <button
                            key={songIndex}
                            onClick={() => setCurrentSongIndex(globalIndex)}
                            className={`w-full text-left px-4 py-3 transition-colors flex items-baseline gap-3 hover:bg-vintage-orange/5 group ${isCurrentSong ? 'bg-vintage-orange/10' : ''
                              }`}
                          >
                            <span className={`font-mono text-xs w-5 flex-shrink-0 text-right pt-0.5 ${isCurrentSong ? 'text-vintage-orange font-bold' : 'text-vintage-teal/40'}`}>
                              {songIndex + 1}
                            </span>

                            <div className="flex-1 min-w-0">
                              <div className={`font-display font-medium truncate text-sm ${isCurrentSong ? 'text-vintage-orange' : 'text-vintage-teal/80'}`}>
                                {song.name}
                              </div>
                              {song.cover && (
                                <div className="text-[10px] text-vintage-teal/50 italic truncate mt-0.5">
                                  orig. {song.cover.name}
                                </div>
                              )}
                            </div>

                            {isCurrentSong && (
                              <div className="w-2 h-2 rounded-full bg-vintage-orange animate-pulse flex-shrink-0 mt-1.5" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
