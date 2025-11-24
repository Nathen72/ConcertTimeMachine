import { motion } from 'framer-motion'
import { type Concert } from '@/stores/useConcertStore'

interface CassetteTapeProps {
    concert: Concert
    onDragStart?: () => void
    onDrag?: (event: any, info: any) => void
    onDragEnd?: (event: any, info: any, concert: Concert) => void
    className?: string
    style?: React.CSSProperties
    rotate?: number
}

export function CassetteTape({ concert, onDragStart, onDrag, onDragEnd, className, style, rotate = 0 }: CassetteTapeProps) {
    const formatDate = (dateString: string) => {
        const [day, month, year] = dateString.split('-')
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    // Generate a random color for the cassette body based on the concert ID to keep it consistent but varied
    const getCassetteColor = (id: string) => {
        const colors = [
            'bg-zinc-800', // Black
            'bg-blue-900', // Dark Blue
            'bg-red-900',  // Dark Red
            'bg-amber-900', // Brown
            'bg-slate-800', // Dark Slate
        ]
        const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
        return colors[index]
    }

    return (
        <motion.div
            drag
            dragMomentum={false}
            whileDrag={{ scale: 1.05, rotate: rotate + 2, zIndex: 50, cursor: 'grabbing' }}
            whileHover={{ scale: 1.02, zIndex: 40, cursor: 'grab' }}
            onDragStart={onDragStart}
            onDrag={onDrag}
            onDragEnd={(e, info) => onDragEnd?.(e, info, concert)}
            className={`relative w-72 h-44 shadow-xl ${className}`}
            style={{
                ...style,
                rotate: rotate
            }}
        >
            {/* Cassette Body */}
            <div className={`w-full h-full rounded-xl overflow-hidden border-2 border-gray-700 shadow-lg flex flex-col ${getCassetteColor(concert.id)}`}>

                {/* Screw Holes (Top) */}
                <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-gray-600 shadow-inner border border-gray-800"></div>
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-gray-600 shadow-inner border border-gray-800"></div>

                {/* Label Area */}
                <div className="flex-1 mx-4 mt-4 mb-1 bg-[#f0f0e0] rounded-sm p-3 relative flex flex-col overflow-hidden shadow-sm">
                    {/* Texture overlay */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')] pointer-events-none"></div>

                    {/* Top colored strip */}
                    <div className="absolute top-0 left-0 w-full h-3 bg-vintage-teal/80"></div>

                    <div className="mt-3 flex-1 flex flex-col justify-center">
                        <h3 className="font-marker text-2xl leading-none text-gray-900 mb-1 line-clamp-2 tracking-tight">
                            {concert.venue.name}
                        </h3>
                        <div className="font-mono text-[10px] text-gray-600 flex items-center gap-2 font-bold uppercase tracking-tight">
                            <span>{formatDate(concert.eventDate)}</span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                            <span className="truncate max-w-[140px]">{concert.venue.city.name}</span>
                        </div>
                    </div>

                    {/* Side A mark */}
                    <div className="absolute bottom-1 right-2 font-bold text-sm text-gray-800 font-sans">A</div>
                    <div className="absolute bottom-1 left-2 font-mono text-[8px] text-gray-500">NR</div>
                </div>

                {/* Bottom Window Area */}
                <div className="h-14 mx-5 mb-4 bg-gray-900/50 rounded flex items-center justify-center relative">
                    {/* Reels */}
                    <div className="absolute left-5 w-10 h-10 rounded-full bg-white/90 border-4 border-gray-300 flex items-center justify-center animate-spin-slow" style={{ animationDuration: '0s' }}>
                        <div className="w-2.5 h-2.5 bg-black rounded-full"></div>
                        <div className="absolute w-1.5 h-3.5 bg-black/20 rotate-45"></div>
                        <div className="absolute w-1.5 h-3.5 bg-black/20 -rotate-45"></div>
                    </div>

                    <div className="absolute right-5 w-10 h-10 rounded-full bg-white/90 border-4 border-gray-300 flex items-center justify-center animate-spin-slow" style={{ animationDuration: '0s' }}>
                        <div className="w-2.5 h-2.5 bg-black rounded-full"></div>
                        <div className="absolute w-1.5 h-3.5 bg-black/20 rotate-45"></div>
                        <div className="absolute w-1.5 h-3.5 bg-black/20 -rotate-45"></div>
                    </div>

                    {/* Window Glass */}
                    <div className="w-24 h-8 bg-amber-900/20 border border-gray-600/50 rounded flex items-center justify-center overflow-hidden relative backdrop-blur-[1px]">
                        {/* Tape ribbon */}
                        <div className="w-full h-full flex items-center">
                            <div className="w-full h-5 bg-amber-900/90 shadow-sm"></div>
                        </div>
                    </div>
                </div>

                {/* Bottom Trapezoid Shape (Visual only) */}
                <div className="h-5 mx-10 bg-gray-700/50 rounded-b-xl mb-1"></div>
            </div>
        </motion.div>
    )
}
