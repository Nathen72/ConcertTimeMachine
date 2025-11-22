import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Music, Play, Disc } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { searchArtists } from '@/api/setlistfm'
import { useConcertStore, type Artist } from '@/stores/useConcertStore'

export function Home() {
  const [query, setQuery] = useState('')
  const [artists, setArtists] = useState<Artist[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const setSelectedArtist = useConcertStore((state) => state.setSelectedArtist)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setError(null)
    try {
      const results = await searchArtists(query)
      setArtists(results)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while searching'
      setError(errorMessage)
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
    <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto space-y-8 pt-4 md:pt-8">
      
      {/* Main Search "Tape Label" */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full relative"
      >
         {/* Tape Label Container */}
         <div className="bg-cassette-label p-8 md:p-12 rounded-lg shadow-lg border border-gray-200 relative overflow-hidden cassette-shadow">
            {/* Decorative Stripes */}
            <div className="absolute top-0 left-0 w-full h-3 bg-vintage-orange opacity-80" />
            <div className="absolute top-4 left-0 w-full h-1 bg-vintage-teal opacity-60" />
            
            {/* Texture Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='%23000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` }} />

            <div className="text-center space-y-6 relative z-10">
               <div className="font-cassette text-lg md:text-xl text-vintage-teal/60 tracking-[0.3em]">
                  CONCERT TIME MACHINE
               </div>
               
               <h1 className="text-5xl md:text-7xl font-display font-bold text-vintage-teal tracking-tight">
                  ARTIST SEARCH
               </h1>

               <p className="text-vintage-teal/70 font-mono text-sm md:text-base max-w-lg mx-auto">
                 INSERT ARTIST NAME TO RETRIEVE ARCHIVED SETLISTS
               </p>

               {/* Search Input styled as handwritten label field */}
               <form onSubmit={handleSearch} className="max-w-lg mx-auto mt-8 relative">
                  <div className="relative flex items-center bg-white rounded-md border-2 border-vintage-teal/30 shadow-inner overflow-hidden focus-within:border-vintage-orange transition-colors">
                     <div className="pl-4 text-vintage-teal/40">
                       <Search className="w-5 h-5" />
                     </div>
                     <input
                       type="text"
                       className="flex-1 px-4 py-4 bg-transparent border-none outline-none text-xl font-display text-vintage-teal placeholder:text-vintage-teal/30 placeholder:font-mono uppercase"
                       placeholder="Artist Name..."
                       value={query}
                       onChange={(e) => setQuery(e.target.value)}
                       autoFocus
                     />
                     <button 
                       type="submit"
                       disabled={isLoading}
                       className="px-6 py-4 bg-vintage-teal text-vintage-cream font-bold font-mono uppercase hover:bg-vintage-orange disabled:opacity-50 transition-all duration-200 border-l-2 border-vintage-teal/30"
                     >
                       {isLoading ? 'LOADING...' : 'PLAY'}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </motion.div>

      {/* Results Grid - Mini Tapes */}
      {artists.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid gap-6 md:grid-cols-2 w-full"
        >
          {artists.map((artist, index) => (
            <motion.div
              key={artist.mbid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div
                className="group cursor-pointer relative h-32 md:h-40 bg-cassette-dark rounded-lg shadow-xl overflow-hidden transform transition-transform hover:scale-[1.02] hover:rotate-1"
                onClick={() => handleSelectArtist(artist)}
              >
                {/* Cassette Body */}
                <div className="absolute inset-1 bg-cassette-body rounded flex items-center p-2 md:p-3 gap-4 border border-gray-300">
                   
                   {/* "Reel" Window / Image */}
                   <div className="w-24 h-full bg-cassette-window rounded-md relative overflow-hidden shadow-inner flex-shrink-0 border border-gray-600">
                      {artist.spotifyImage ? (
                        <img
                          src={artist.spotifyImage}
                          alt={artist.name}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-30">
                           <Disc className="w-12 h-12 text-white animate-spin-slow" />
                        </div>
                      )}
                      {/* Window Glare */}
                      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/10 to-transparent pointer-events-none" />
                   </div>

                   {/* Label Area */}
                   <div className="flex-1 flex flex-col justify-center min-w-0 bg-cassette-label h-full rounded-sm px-4 py-2 shadow-sm relative border border-gray-200">
                      {/* Label Lines */}
                      <div className="absolute top-2 left-0 w-full h-[1px] bg-vintage-teal/10" />
                      <div className="absolute bottom-2 left-0 w-full h-[1px] bg-vintage-teal/10" />
                      
                      <h3 className="font-display font-bold text-xl md:text-2xl text-vintage-teal truncate">
                        {artist.name}
                      </h3>
                      {artist.disambiguation && (
                        <p className="font-mono text-xs text-vintage-teal/60 truncate uppercase tracking-tighter">
                          {artist.disambiguation}
                        </p>
                      )}
                      
                      {/* Side Indicator */}
                      <div className="absolute right-2 top-2 font-mono text-[10px] text-vintage-orange font-bold border border-vintage-orange px-1 rounded">
                        A
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-vintage-orange/10 border-2 border-vintage-orange/30 rounded-lg p-6 shadow-md text-center font-mono"
        >
           <p className="text-vintage-teal font-bold text-lg">TAPE EJECTED: ERROR</p>
           <p className="text-vintage-teal/80 mt-2">
              {error.includes('API_KEY_INVALID') ? (
                <>
                  API Key Required. Please check system configuration.
                </>
              ) : (
                error
              )}
            </p>
        </motion.div>
      )}

      {/* Empty State */}
      {artists.length === 0 && query && !isLoading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-vintage-teal/60 font-mono tracking-widest py-12"
        >
           [ NO RECORDINGS FOUND ]
        </motion.div>
      )}
    </div>
  )
}
