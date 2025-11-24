import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Calendar, MapPin, LayoutGrid, GalleryHorizontalEnd } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getArtistSetlists } from '@/api/setlistfm'
import { useConcertStore, type Concert } from '@/stores/useConcertStore'
import { VHSRolodex } from '@/components/VHSRolodex'
import { CassetteDesktop } from '@/components/CassetteDesktop'

export function Concerts() {
   const [isLoading, setIsLoading] = useState(true)
   const [page] = useState(1)
   const [searchQuery, setSearchQuery] = useState('')
   const [searchDate, setSearchDate] = useState('')
   const [searchLocation, setSearchLocation] = useState('')
   const [selectedIndex, setSelectedIndex] = useState(0)
   const [viewMode, setViewMode] = useState<'rolodex' | 'desktop'>('rolodex')

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
      try {
         const { setlists } = await getArtistSetlists(selectedArtist.mbid, page)
         // Filter out concerts with no songs
         const validConcerts = setlists.filter(concert =>
            concert.sets?.set?.some(s => s.song?.length > 0)
         )
         setConcerts(validConcerts)
      } catch (e) {
         console.error('Error loading concerts', e)
      } finally {
         setIsLoading(false)
      }
   }

   const handleSelectConcert = (concert: Concert) => {
      setSelectedConcert(concert)
      navigate('/player')
   }

   // Filter concerts based on search criteria
   const filteredConcerts = useMemo(() => {
      return concerts.filter(concert => {
         const matchesQuery = searchQuery === '' ||
            concert.venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            concert.venue.city.name.toLowerCase().includes(searchQuery.toLowerCase())

         const matchesDate = searchDate === '' || concert.eventDate.includes(searchDate)

         const matchesLocation = searchLocation === '' ||
            concert.venue.city.name.toLowerCase().includes(searchLocation.toLowerCase()) ||
            (concert.venue.city.state && concert.venue.city.state.toLowerCase().includes(searchLocation.toLowerCase())) ||
            (concert.venue.city.country.name && concert.venue.city.country.name.toLowerCase().includes(searchLocation.toLowerCase()))

         return matchesQuery && matchesDate && matchesLocation
      })
   }, [concerts, searchQuery, searchDate, searchLocation])

   // Auto-select first match when filters change
   useEffect(() => {
      if (filteredConcerts.length > 0) {
         // Find the index of the first filtered concert in the original list to scroll to it
         // OR, if we are displaying only filtered concerts, reset to 0
         // The requirement says "UI would automatically 'flip' to that VHS concert"
         // This implies we keep the full list but scroll to the match.

         // Let's try to find the first match in the full list that satisfies the current filters
         // If the user is typing, we want to jump to the closest match.

         const firstMatchIndex = concerts.findIndex(c => filteredConcerts.includes(c))
         if (firstMatchIndex !== -1) {
            setSelectedIndex(firstMatchIndex)
         }
      }
   }, [filteredConcerts, concerts])

   if (!selectedArtist) return null

   return (
      <div className="w-full h-full flex flex-col bg-[#fdfbf7]">

         {/* Header & Filters */}
         <div className="z-50 bg-[#fdfbf7]/90 backdrop-blur-sm border-b border-vintage-teal/10 p-4 md:p-6 shadow-sm">
            <div className="max-w-6xl mx-auto w-full">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div className="flex items-center gap-4">
                     <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="text-vintage-teal/50 hover:text-vintage-teal p-0 h-auto hover:bg-transparent font-mono text-xs tracking-wider"
                     >
                        <ArrowLeft className="mr-2 w-4 h-4" /> EJECT
                     </Button>

                     {/* View Mode Toggle */}
                     <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
                        <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => setViewMode('rolodex')}
                           className={`h-7 px-2 text-xs font-mono ${viewMode === 'rolodex' ? 'bg-white shadow-sm text-vintage-teal' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                           <GalleryHorizontalEnd className="w-3 h-3 mr-1" /> ROLODEX
                        </Button>
                        <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => setViewMode('desktop')}
                           className={`h-7 px-2 text-xs font-mono ${viewMode === 'desktop' ? 'bg-white shadow-sm text-vintage-teal' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                           <LayoutGrid className="w-3 h-3 mr-1" /> DESKTOP
                        </Button>
                     </div>
                  </div>

                  <div className="text-right">
                     <h1 className="text-2xl md:text-3xl font-display font-bold text-vintage-teal uppercase tracking-tighter leading-none">
                        {selectedArtist.name}
                     </h1>
                     <div className="text-xs font-mono text-vintage-teal/60 tracking-widest">
                        ARCHIVE_ID: {selectedArtist.mbid.slice(0, 8)}
                     </div>
                  </div>
               </div>

               {/* Search Controls */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <Input
                        placeholder="Search venue..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white border-vintage-teal/20 focus:border-vintage-teal font-mono text-sm"
                     />
                  </div>
                  <div className="relative">
                     <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <Input
                        placeholder="Date (DD-MM-YYYY)..."
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="pl-9 bg-white border-vintage-teal/20 focus:border-vintage-teal font-mono text-sm"
                     />
                  </div>
                  <div className="relative">
                     <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <Input
                        placeholder="Location (City, State)..."
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="pl-9 bg-white border-vintage-teal/20 focus:border-vintage-teal font-mono text-sm"
                     />
                  </div>
               </div>
            </div>
         </div>

         {/* Main Content Area */}
         <div className="flex-1 relative flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/subtle-paper.png')] overflow-hidden">
            {isLoading ? (
               <div className="flex flex-col items-center gap-4 animate-pulse">
                  <div className="w-64 h-40 bg-gray-200 rounded-lg"></div>
                  <div className="font-mono text-vintage-teal/50 tracking-widest">LOADING ARCHIVES...</div>
               </div>
            ) : concerts.length > 0 ? (
               viewMode === 'rolodex' ? (
                  <div className="w-full max-w-4xl h-full flex items-center justify-center">
                     <VHSRolodex
                        concerts={concerts}
                        onSelect={handleSelectConcert}
                        selectedIndex={selectedIndex}
                     />
                  </div>
               ) : (
                  <CassetteDesktop
                     concerts={filteredConcerts.length > 0 ? filteredConcerts : concerts}
                     onPlay={handleSelectConcert}
                  />
               )
            ) : (
               <div className="text-center opacity-60">
                  <p className="font-mono text-vintage-teal tracking-widest">NO TAPES FOUND</p>
               </div>
            )}
         </div>

         {/* Footer Info */}
         <div className="bg-[#fdfbf7] border-t border-vintage-teal/10 p-2 text-center relative z-20">
            <p className="font-mono text-[10px] text-vintage-teal/40 uppercase tracking-[0.2em]">
               {filteredConcerts.length} MATCHES FOUND // {viewMode === 'rolodex' ? 'SCROLL TO BROWSE' : 'DRAG TAPE TO PLAY'}
            </p>
         </div>

      </div>
   )
}

