import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Music, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getArtistSetlists } from '@/api/setlistfm'
import { useConcertStore, type Concert } from '@/stores/useConcertStore'

export function Concerts() {
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const navigate = useNavigate()
  const { selectedArtist, concerts, setConcerts, setSelectedConcert } = useConcertStore()

  useEffect(() => {
    if (!selectedArtist) {
      navigate('/')
      return
    }

    loadConcerts()
  }, [selectedArtist, page])

  const loadConcerts = async () => {
    if (!selectedArtist) return

    setIsLoading(true)
    const { setlists, total } = await getArtistSetlists(selectedArtist.mbid, page)
    setConcerts(setlists)
    setTotalPages(Math.ceil(total / 20))
    setIsLoading(false)
  }

  const handleSelectConcert = (concert: Concert) => {
    setSelectedConcert(concert)
    navigate('/player')
  }

  const formatDate = (dateString: string) => {
    const [day, month, year] = dateString.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!selectedArtist) return null

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="space-y-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-4 -ml-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>
            <h1 className="text-5xl font-display font-bold text-vintage-teal">
              {selectedArtist.name}
            </h1>
            <p className="text-xl text-vintage-teal/85 font-medium">
              Select a concert to relive the experience
            </p>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-vintage-teal/10 rounded w-3/4" />
                  <div className="h-4 bg-vintage-teal/10 rounded w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-vintage-teal/10 rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Concert Grid */}
        {!isLoading && concerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-6 md:grid-cols-2"
          >
            {concerts.map((concert, index) => {
              const songCount = concert.sets?.set?.reduce(
                (acc, set) => acc + (set.song?.length || 0),
                0
              ) || 0

              return (
                <motion.div
                  key={concert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    className="cursor-pointer transition-all duration-300 h-full"
                    onClick={() => handleSelectConcert(concert)}
                  >
                    <CardHeader>
                      <CardTitle className="text-2xl flex items-start gap-2">
                        <Calendar className="w-6 h-6 text-vintage-orange flex-shrink-0 mt-1" />
                        <span>{formatDate(concert.eventDate)}</span>
                      </CardTitle>
                      <CardDescription className="text-base">
                        <div className="flex items-start gap-2 mt-2">
                          <MapPin className="w-4 h-4 flex-shrink-0 mt-1" />
                          <span>
                            {concert.venue.name}
                            <br />
                            {concert.venue.city.name}
                            {concert.venue.city.state && `, ${concert.venue.city.state}`}
                            {concert.venue.city.country && `, ${concert.venue.city.country.name}`}
                          </span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-vintage-teal/80">
                        <Music className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {songCount} {songCount === 1 ? 'song' : 'songs'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && concerts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Music className="w-20 h-20 text-vintage-teal/30 mx-auto mb-4" />
            <h2 className="text-2xl font-display font-semibold text-vintage-teal mb-2">
              No concerts found
            </h2>
            <p className="text-vintage-teal/80 font-medium">
              This artist doesn't have any concerts in the database yet.
            </p>
          </motion.div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-4 pt-8"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Previous
            </Button>
            <span className="text-vintage-teal font-medium">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
