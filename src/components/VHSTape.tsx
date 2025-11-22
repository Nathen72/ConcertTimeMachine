import { motion } from 'framer-motion'
import { type Concert } from '@/stores/useConcertStore'

interface VHSTapeProps {
    concert: Concert
    isActive: boolean
    onClick: () => void
}

export function VHSTape({ concert, isActive, onClick }: VHSTapeProps) {
    const formatDate = (dateString: string) => {
        const [day, month, year] = dateString.split('-')
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <motion.div
            className={`relative w-full h-48 cursor-pointer transition-all duration-500 ${isActive ? 'scale-105 z-10' : 'scale-100 opacity-70 hover:opacity-100'
                }`}
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
        >
            {/* Tape Spine (Main View) */}
            <div className={`
        w-full h-full rounded-md overflow-hidden border-2 shadow-lg flex flex-col
        ${isActive ? 'border-vintage-orange shadow-vintage-orange/20' : 'border-gray-700 bg-gray-800'}
      `}>

                {/* Label Area */}
                <div className="flex-1 bg-[#f0f0e0] p-3 relative flex flex-col justify-center">
                    {/* Texture overlay */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')] pointer-events-none"></div>

                    {/* Top colored strip */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-vintage-teal/80"></div>

                    <div className="flex justify-between items-start">
                        <div className="flex-1 pr-2">
                            <h3 className="font-marker text-xl leading-none text-gray-900 mb-1 truncate">
                                {concert.venue.name}
                            </h3>
                            <div className="font-mono text-[10px] text-gray-500 flex items-center gap-2">
                                <span>{formatDate(concert.eventDate)}</span>
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                <span className="truncate">{concert.venue.city.name}</span>
                            </div>
                        </div>

                        {/* Logo / Icon */}
                        <div className="opacity-50">
                            <div className="w-6 h-6 border-2 border-gray-800 rounded-full flex items-center justify-center">
                                <span className="font-display font-bold text-xs text-gray-800">A</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Plastic Area */}
                <div className="h-10 bg-gray-900 relative flex items-center justify-between px-4 border-t border-gray-700">
                    {/* Reels */}
                    <div className="w-6 h-6 rounded-full bg-gray-800 border border-gray-700 shadow-inner flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                    </div>

                    {/* Window */}
                    <div className="w-24 h-5 bg-amber-900/30 border border-gray-700 rounded flex items-center justify-center overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
                        {/* Tape ribbon */}
                        <div className="w-full h-3 bg-amber-900/80"></div>
                    </div>

                    <div className="w-6 h-6 rounded-full bg-gray-800 border border-gray-700 shadow-inner flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                    </div>
                </div>

            </div>
        </motion.div>
    )
}
