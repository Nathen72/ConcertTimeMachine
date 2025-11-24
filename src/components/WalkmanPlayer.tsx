import { motion } from 'framer-motion'
import { forwardRef } from 'react'
import { useSpotifyPlayerContext } from '@/contexts/SpotifyPlayerContext'
import { useConcertStore } from '@/stores/useConcertStore'

interface WalkmanPlayerProps {
    isHovered?: boolean
    className?: string
}

export const WalkmanPlayer = forwardRef<HTMLDivElement, WalkmanPlayerProps>(({ isHovered, className }, ref) => {
    const { isPaused, togglePlayPause, player } = useSpotifyPlayerContext()
    const { nextSong, previousSong } = useConcertStore()

    const handlePlayPause = async () => {
        await togglePlayPause()
    }

    const handleNext = async () => {
        if (player) await player.activateElement()
        nextSong()
    }

    const handlePrev = async () => {
        if (player) await player.activateElement()
        previousSong()
    }

    return (
        <div ref={ref} className={`relative w-80 h-[520px] ${className}`}>
            <motion.div
                className="w-full h-full bg-[#1a3c7e] rounded-3xl shadow-2xl border-4 border-gray-300 relative overflow-hidden flex flex-col"
                animate={{ scale: isHovered ? 1.02 : 1 }}
                transition={{ duration: 0.2 }}
            >
                {/* Metallic sheen overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none z-20"></div>

                {/* Top Controls Area */}
                <div className="h-20 bg-gray-200 border-b border-gray-400 flex items-center justify-between px-6 relative z-10">
                    <div className="flex flex-col">
                        <div className="font-display font-bold text-2xl tracking-widest text-[#1a3c7e]">SONY</div>
                        <div className="text-[9px] font-mono text-gray-500 tracking-widest">WALKMAN</div>
                    </div>
                    <div className="flex gap-3 items-center">
                        <div className={`w-3 h-3 rounded-full shadow-sm border border-gray-400 transition-colors duration-300 ${!isPaused ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-red-900'}`}></div>
                        <div className="text-[10px] font-mono text-gray-600 font-bold">BATT</div>
                    </div>
                </div>

                {/* Cassette Window (The Drop Zone Visual) */}
                <div className="flex-1 p-6 bg-[#152e5e] relative flex flex-col justify-center">
                    <div className={`
                        w-full h-64 rounded-xl border-4 border-gray-400/50 bg-black/40 backdrop-blur-sm 
                        shadow-inner flex items-center justify-center overflow-hidden transition-colors duration-300 relative
                        ${isHovered ? 'bg-vintage-orange/10 border-vintage-orange/50' : ''}
                    `}>
                        {/* Internal Mechanism Details */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-40">
                            <div className="w-56 h-36 border-2 border-gray-500 rounded-lg flex justify-between px-6 items-center bg-black/20">
                                <div className={`w-12 h-12 rounded-full border-4 border-gray-500 flex items-center justify-center ${!isPaused ? 'animate-spin-slow' : ''}`}>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                </div>
                                <div className={`w-12 h-12 rounded-full border-4 border-gray-500 flex items-center justify-center ${!isPaused ? 'animate-spin-slow' : ''}`}>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        {/* Prompt Text */}
                        <motion.div
                            className="text-white/70 font-mono text-sm tracking-widest text-center z-10 bg-black/50 px-4 py-2 rounded backdrop-blur-md border border-white/10"
                            animate={{ opacity: isHovered ? 1 : 0.7, scale: isHovered ? 1.1 : 1 }}
                        >
                            {isHovered ? 'RELEASE TO PLAY' : 'INSERT CASSETTE'}
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Controls */}
                <div className="h-36 bg-gray-200 border-t border-gray-400 flex relative z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
                    {/* Main Buttons */}
                    <div className="flex-1 flex items-center justify-center gap-3 p-4">

                        {/* STOP Button */}
                        <button
                            onClick={async () => { if (!isPaused) await togglePlayPause() }}
                            className="flex flex-col items-center gap-1 group active:translate-y-1 transition-transform"
                        >
                            <div className="w-14 h-20 rounded-sm shadow-[0_4px_0_rgb(156,163,175),0_6px_6px_rgba(0,0,0,0.2)] border border-gray-400 bg-gray-300 flex items-center justify-center group-active:shadow-none group-active:translate-y-[4px] group-active:border-t-4 group-active:border-gray-400/50 transition-all">
                                <div className="w-4 h-4 bg-gray-600 rounded-sm"></div>
                            </div>
                            <span className="text-[9px] font-bold text-gray-600">STOP</span>
                        </button>

                        {/* PLAY Button */}
                        <button
                            onClick={handlePlayPause}
                            className="flex flex-col items-center gap-1 group active:translate-y-1 transition-transform"
                        >
                            <div className={`w-14 h-20 rounded-sm shadow-[0_4px_0_rgb(156,163,175),0_6px_6px_rgba(0,0,0,0.2)] border border-gray-400 flex items-center justify-center group-active:shadow-none group-active:translate-y-[4px] group-active:border-t-4 group-active:border-gray-400/50 transition-all ${!isPaused ? 'bg-vintage-orange translate-y-[4px] shadow-none border-t-4 border-black/10' : 'bg-gray-300'}`}>
                                <div className="w-0 h-0 border-l-[14px] border-l-gray-700 border-y-[8px] border-y-transparent ml-1"></div>
                            </div>
                            <span className="text-[9px] font-bold text-gray-600">PLAY</span>
                        </button>

                        {/* REW Button */}
                        <button
                            onClick={handlePrev}
                            className="flex flex-col items-center gap-1 group active:translate-y-1 transition-transform"
                        >
                            <div className="w-14 h-20 rounded-sm shadow-[0_4px_0_rgb(156,163,175),0_6px_6px_rgba(0,0,0,0.2)] border border-gray-400 bg-gray-300 flex items-center justify-center group-active:shadow-none group-active:translate-y-[4px] group-active:border-t-4 group-active:border-gray-400/50 transition-all">
                                <div className="flex gap-0.5">
                                    <div className="w-0 h-0 border-r-[8px] border-r-gray-600 border-y-[5px] border-y-transparent"></div>
                                    <div className="w-0 h-0 border-r-[8px] border-r-gray-600 border-y-[5px] border-y-transparent"></div>
                                </div>
                            </div>
                            <span className="text-[9px] font-bold text-gray-600">REW</span>
                        </button>

                        {/* FF Button */}
                        <button
                            onClick={handleNext}
                            className="flex flex-col items-center gap-1 group active:translate-y-1 transition-transform"
                        >
                            <div className="w-14 h-20 rounded-sm shadow-[0_4px_0_rgb(156,163,175),0_6px_6px_rgba(0,0,0,0.2)] border border-gray-400 bg-gray-300 flex items-center justify-center group-active:shadow-none group-active:translate-y-[4px] group-active:border-t-4 group-active:border-gray-400/50 transition-all">
                                <div className="flex gap-0.5">
                                    <div className="w-0 h-0 border-l-[8px] border-l-gray-600 border-y-[5px] border-y-transparent"></div>
                                    <div className="w-0 h-0 border-l-[8px] border-l-gray-600 border-y-[5px] border-y-transparent"></div>
                                </div>
                            </div>
                            <span className="text-[9px] font-bold text-gray-600">FF</span>
                        </button>
                    </div>
                </div>

                {/* Side Volume Slider (Visual) */}
                <div className="absolute right-3 top-28 bottom-44 w-10 bg-gray-300 rounded-full border border-gray-400 flex flex-col items-center py-4 shadow-inner">
                    <div className="text-[8px] font-mono -rotate-90 mb-4 whitespace-nowrap text-gray-500 font-bold">VOLUME</div>
                    <div className="w-6 h-10 bg-gray-400 rounded shadow-md border border-gray-500 relative">
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-black/20"></div>
                    </div>
                    <div className="flex-1 w-0.5 bg-gray-400/50 my-2"></div>
                </div>

                {/* Branding */}
                <div className="absolute bottom-4 left-6 z-20">
                    <div className="font-sans font-bold text-white text-xl tracking-wide drop-shadow-md">WALKMAN</div>
                    <div className="font-mono text-[9px] text-white/60 tracking-widest">STEREO CASSETTE PLAYER</div>
                </div>
            </motion.div>
        </div>
    )
})

WalkmanPlayer.displayName = 'WalkmanPlayer'
