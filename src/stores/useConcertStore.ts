import { create } from 'zustand'

export interface Artist {
  mbid: string
  name: string
  sortName?: string
  disambiguation?: string
  url?: string
}

export interface Venue {
  id: string
  name: string
  city: {
    name: string
    state?: string
    stateCode?: string
    coords?: {
      lat: number
      long: number
    }
    country: {
      code: string
      name: string
    }
  }
}

export interface Song {
  name: string
  tape?: boolean
  cover?: {
    mbid: string
    name: string
  }
  info?: string
}

export interface Set {
  name?: string
  encore?: number
  song: Song[]
}

export interface Concert {
  id: string
  versionId: string
  eventDate: string
  artist: Artist
  venue: Venue
  sets: {
    set: Set[]
  }
  info?: string
  url?: string
}

interface ConcertStore {
  selectedArtist: Artist | null
  concerts: Concert[]
  selectedConcert: Concert | null
  currentSongIndex: number
  isPlaying: boolean

  setSelectedArtist: (artist: Artist | null) => void
  setConcerts: (concerts: Concert[]) => void
  setSelectedConcert: (concert: Concert | null) => void
  setCurrentSongIndex: (index: number) => void
  setIsPlaying: (isPlaying: boolean) => void
  nextSong: () => void
  previousSong: () => void
  reset: () => void
}

export const useConcertStore = create<ConcertStore>((set, get) => ({
  selectedArtist: null,
  concerts: [],
  selectedConcert: null,
  currentSongIndex: 0,
  isPlaying: false,

  setSelectedArtist: (artist) => set({ selectedArtist: artist }),
  setConcerts: (concerts) => set({ concerts }),
  setSelectedConcert: (concert) => set({ selectedConcert: concert, currentSongIndex: 0 }),
  setCurrentSongIndex: (index) => set({ currentSongIndex: index }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),

  nextSong: () => {
    const { selectedConcert, currentSongIndex } = get()
    if (!selectedConcert?.sets?.set) return

    const allSongs = selectedConcert.sets.set.flatMap(s => s.song)
    if (currentSongIndex < allSongs.length - 1) {
      set({ currentSongIndex: currentSongIndex + 1 })
    }
  },

  previousSong: () => {
    const { currentSongIndex } = get()
    if (currentSongIndex > 0) {
      set({ currentSongIndex: currentSongIndex - 1 })
    }
  },

  reset: () => set({
    selectedArtist: null,
    concerts: [],
    selectedConcert: null,
    currentSongIndex: 0,
    isPlaying: false,
  }),
}))
