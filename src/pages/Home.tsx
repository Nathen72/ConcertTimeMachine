import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Music, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { searchArtists } from '@/api/setlistfm'
import { useConcertStore, type Artist } from '@/stores/useConcertStore'
import { getArtistInfo } from '@/api/spotify'

export function Home() {
  const [query, setQuery] = useState('')
  const [artists, setArtists] = useState<Artist[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const setSelectedArtist = useConcertStore((state) => state.setSelectedArtist)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    try {
      const results = await searchArtists(query)

      // Fetch Spotify artist info for each result to get photos
      const artistsWithPhotos = await Promise.all(
        results.map(async (artist) => {
          const spotifyInfo = await getArtistInfo(artist.name)
          return {
            ...artist,
            spotifyImage: spotifyInfo?.images?.[0]?.url
          }
        })
      )

      setArtists(artistsWithPhotos)
    } catch (error) {
      console.error('Error searching artists:', error)
      setArtists([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectArtist = (artist: Artist) => {
    setSelectedArtist(artist)
    navigate('/concerts')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-vintage-orange/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-vintage-teal/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-vintage-yellow/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full space-y-8 relative z-10"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center gap-3"
          >
            <Clock className="w-12 h-12 text-vintage-orange" strokeWidth={2} />
            <h1 className="text-6xl font-display font-bold text-vintage-teal">
              Concert Time Machine
            </h1>
            <Music className="w-12 h-12 text-vintage-orange" strokeWidth={2} />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl text-vintage-teal/70 font-medium"
          >
            Travel back in time to relive legendary concerts through their setlists
          </motion.p>
        </div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-6 h-6" />
                Search for an Artist
              </CardTitle>
              <CardDescription>
                Find your favorite artist to explore their concert history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Enter artist name..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="text-lg"
                  autoFocus
                />
                <Button
                  type="submit"
                  variant="vintage"
                  size="lg"
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        {artists.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid gap-4 md:grid-cols-2"
          >
            {artists.map((artist, index) => (
              <motion.div
                key={artist.mbid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
                  className="cursor-pointer hover:scale-[1.02] transition-transform overflow-hidden"
                  onClick={() => handleSelectArtist(artist)}
                >
                  {artist.spotifyImage && (
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={artist.spotifyImage}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      {!artist.spotifyImage && (
                        <Music className="w-5 h-5 text-vintage-orange" />
                      )}
                      {artist.name}
                    </CardTitle>
                    {artist.disambiguation && (
                      <CardDescription>{artist.disambiguation}</CardDescription>
                    )}
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {artists.length === 0 && query && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-vintage-teal/60 text-lg"
          >
            No artists found. Try a different search.
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
