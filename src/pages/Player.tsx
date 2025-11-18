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
  LogIn
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  // Initialize Spotify player if authenticated
  const spotifyPlayer = useSpotifyPlayer()

  useEffect(() => {
    if (!selectedConcert) {
      navigate('/concerts')
      return
    }

    // Flatten all songs from all sets
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

  // Search for the current song on Spotify when it changes
  useEffect(() => {
    const currentSong = allSongs[currentSongIndex]
    if (!currentSong || !selectedConcert) return

    const searchForTrack = async () => {
      try {
        // Use the cover artist if this is a cover, otherwise use the concert artist
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

  // Auto-play new track when it changes (if already playing)
  useEffect(() => {
    if (!isAuthenticated || !spotifyPlayer.isReady || !currentSpotifyTrack) return
    if (!isPlaying) return // Only auto-play if we're already in playing state

    const playNewTrack = async () => {
      console.log('Playing new track:', currentSpotifyTrack.name)
      await spotifyPlayer.playTrack(currentSpotifyTrack.uri)
    }

    playNewTrack()
  }, [currentSpotifyTrack, isAuthenticated, spotifyPlayer.isReady, isPlaying])

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

    if (!spotifyPlayer.isReady || !currentSpotifyTrack) {
      // If player not ready, just start playing the current track
      setIsPlaying(true)
      if (spotifyPlayer.isReady && currentSpotifyTrack) {
        await spotifyPlayer.playTrack(currentSpotifyTrack.uri)
      }
      return
    }

    // Use player's pause state as source of truth
    if (spotifyPlayer.isPaused) {
      // Currently paused, so resume
      if (currentSpotifyTrack) {
        await spotifyPlayer.playTrack(currentSpotifyTrack.uri)
      }
      setIsPlaying(true)
    } else {
      // Currently playing, so pause
      await spotifyPlayer.togglePlayPause()
      setIsPlaying(false)
    }
  }

  const handleSpotifyLogin = () => {
    try {
      // Save current location to return to after auth
      localStorage.setItem('spotify_auth_return_to', window.location.pathname)
      const authUrl = getAuthorizationUrl()
      
      // Additional validation before redirecting
      if (import.meta.env.DEV) {
        console.log('🚀 Redirecting to Spotify authorization...')
        console.log('📋 Full URL:', authUrl)
        console.log('')
        console.log('💡 If you get a 400 error:')
        console.log('   1. Check the console above for the exact Redirect URI')
        console.log('   2. Go to https://developer.spotify.com/dashboard')
        console.log('   3. Select your app → Edit Settings')
        console.log('   4. Verify the Redirect URI matches EXACTLY (copy-paste to be sure)')
        console.log('   5. Make sure you clicked "Save" in the Dashboard')
        console.log('')
      }
      
      window.location.href = authUrl
    } catch (error) {
      console.error('❌ Error generating authorization URL:', error)
      alert(error instanceof Error ? error.message : 'Failed to generate Spotify authorization URL. Please check your configuration.')
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div className="space-y-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/concerts')}
              className="-ml-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Concerts
            </Button>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-vintage-teal">
              {selectedConcert.artist.name}
            </h1>
            <div className="flex flex-col gap-2 text-vintage-teal/70">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="text-lg">{formatDate(selectedConcert.eventDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">
                  {selectedConcert.venue.name}, {selectedConcert.venue.city.name}
                  {selectedConcert.venue.city.state && `, ${selectedConcert.venue.city.state}`}
                </span>
              </div>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="flex flex-col items-end gap-2">
              <Button
                variant="vintage"
                onClick={handleSpotifyLogin}
                className="flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Connect Spotify
              </Button>
              {import.meta.env.DEV && (
                <div className="text-xs text-vintage-teal/60 text-right max-w-xs space-y-1">
                  <p>
                    If you see a 400 error, check the browser console (F12) for detailed logs.
                  </p>
                  <p className="font-mono text-[10px] bg-vintage-cream/50 px-1 rounded break-all">
                    {import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:5173/callback'}
                  </p>
                  <p className="text-[10px]">
                    Make sure this EXACT URI is in Spotify Dashboard → Edit Settings → Redirect URIs
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Now Playing Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl">Now Playing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Vinyl Record Visual */}
                <div className="flex items-center justify-center py-8">
                  <motion.div
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{
                      duration: 3,
                      repeat: isPlaying ? Infinity : 0,
                      ease: "linear"
                    }}
                    className="relative"
                  >
                    <div className="w-64 h-64 rounded-full bg-gradient-to-br from-vintage-teal to-vintage-orange shadow-2xl flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-vintage-cream shadow-inner flex items-center justify-center overflow-hidden">
                        {currentSpotifyTrack?.album?.images?.[0]?.url ? (
                          <img
                            src={currentSpotifyTrack.album.images[0].url}
                            alt={currentSpotifyTrack.album.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Music2 className="w-10 h-10 text-vintage-teal" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Song Info */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSongIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-center space-y-4"
                  >
                    <h2 className="text-4xl font-display font-bold text-vintage-teal">
                      {currentSong?.name || 'Select a song'}
                    </h2>
                    {currentSong?.cover && (
                      <p className="text-lg text-vintage-teal/90 font-medium">
                        Originally by {currentSong.cover.name}
                      </p>
                    )}
                    {currentSong?.info && (
                      <div className="flex items-start gap-2 justify-center text-vintage-teal/70">
                        <Info className="w-4 h-4 mt-1 flex-shrink-0" />
                        <p className="text-sm">{currentSong.info}</p>
                      </div>
                    )}
                    <p className="text-vintage-teal/75 font-medium">
                      {currentSong?.setName}
                      {currentSong?.encore && ` • Encore ${currentSong.encore}`}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={previousSong}
                    disabled={currentSongIndex === 0}
                    className="h-12 w-12"
                  >
                    <SkipBack className="w-6 h-6" />
                  </Button>

                  <Button
                    variant="vintage"
                    size="icon"
                    onClick={handlePlayPause}
                    className="h-16 w-16"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8 ml-1" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextSong}
                    disabled={currentSongIndex === allSongs.length - 1}
                    className="h-12 w-12"
                  >
                    <SkipForward className="w-6 h-6" />
                  </Button>
                </div>

                {/* Progress */}
                <div className="text-center text-sm text-vintage-teal/75 font-medium">
                  Track {currentSongIndex + 1} of {allSongs.length}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Setlist */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="shadow-2xl h-full max-h-[800px] overflow-hidden flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-2xl">Setlist</CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto flex-1">
                <div className="space-y-6">
                  {selectedConcert.sets?.set?.map((set, setIndex) => (
                    <div key={setIndex} className="space-y-2">
                      <h3 className="font-display font-semibold text-vintage-teal sticky top-0 bg-white/80 backdrop-blur-sm py-2 -mx-6 px-6">
                        {set.name || `Set ${setIndex + 1}`}
                        {set.encore && ` (Encore ${set.encore})`}
                      </h3>
                      <div className="space-y-1">
                        {set.song.map((song, songIndex) => {
                          const globalIndex = allSongs.findIndex(
                            s => s.name === song.name && s.setName === (set.name || `Set ${setIndex + 1}`)
                          )
                          const isCurrentSong = globalIndex === currentSongIndex

                          return (
                            <motion.button
                              key={songIndex}
                              onClick={() => setCurrentSongIndex(globalIndex)}
                              className={`w-full text-left px-4 py-2 rounded-md transition-all duration-200 ${
                                isCurrentSong
                                  ? 'bg-vintage-orange text-vintage-cream font-semibold shadow-md'
                                  : 'text-vintage-teal/90 hover:bg-vintage-teal/15 hover:text-vintage-teal'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs opacity-60 w-6">
                                  {songIndex + 1}
                                </span>
                                <span className="flex-1">{song.name}</span>
                                {isCurrentSong && (
                                  <Music2 className="w-4 h-4 animate-pulse" />
                                )}
                              </div>
                              {song.cover && (
                                <div className="text-xs text-vintage-teal/70 ml-8 mt-1 font-medium">
                                  {song.cover.name} cover
                                </div>
                              )}
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Concert Info */}
        {selectedConcert.info && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Concert Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-vintage-teal/85 leading-relaxed">{selectedConcert.info}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
