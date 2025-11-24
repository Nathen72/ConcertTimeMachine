import { useRef, useState } from 'react'
import { type Concert } from '@/stores/useConcertStore'
import { WalkmanPlayer } from './WalkmanPlayer'
import { CassetteCrate } from './CassetteCrate'

interface CassetteDesktopProps {
    concerts: Concert[]
    onPlay: (concert: Concert) => void
}

export function CassetteDesktop({ concerts, onPlay }: CassetteDesktopProps) {
    const walkmanRef = useRef<HTMLDivElement>(null)
    const [isHoveringPlayer, setIsHoveringPlayer] = useState(false)
    const [draggedConcert, setDraggedConcert] = useState<Concert | null>(null)

    const handleDragStart = (concert: Concert) => {
        setDraggedConcert(concert)
    }

    const handleDragEnd = (event: any, _info: any, concert: Concert) => {
        setDraggedConcert(null)
        setIsHoveringPlayer(false)

        if (!walkmanRef.current) return

        const playerRect = walkmanRef.current.getBoundingClientRect()
        const dropPoint = {
            x: event.clientX,
            y: event.clientY
        }

        // Check if dropped within the player bounds
        // We expand the bounds slightly to make it easier to drop
        if (
            dropPoint.x >= playerRect.left - 50 &&
            dropPoint.x <= playerRect.right + 50 &&
            dropPoint.y >= playerRect.top - 50 &&
            dropPoint.y <= playerRect.bottom + 50
        ) {
            onPlay(concert)
        }
    }

    const handleDragMove = (event: any) => {
        if (!walkmanRef.current) return

        const playerRect = walkmanRef.current.getBoundingClientRect()
        const point = {
            x: event.clientX,
            y: event.clientY
        }

        const isOver =
            point.x >= playerRect.left - 50 &&
            point.x <= playerRect.right + 50 &&
            point.y >= playerRect.top - 50 &&
            point.y <= playerRect.bottom + 50

        if (isOver !== isHoveringPlayer) {
            setIsHoveringPlayer(isOver)
        }
    }

    return (
        <div className="w-full h-full relative overflow-hidden bg-[#e6e2d3] p-4 md:p-8 flex flex-col md:flex-row gap-8 items-center justify-center">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-30 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dust.png')]"></div>

            {/* Left Side: Crate */}
            <div className="flex-1 h-full max-w-2xl w-full relative z-10 min-h-0">
                <CassetteCrate
                    concerts={concerts}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                />
            </div>

            {/* Right Side: Walkman Player */}
            <div className="flex-shrink-0 relative z-20">
                <div className="relative">
                    {/* Shadow for the player */}
                    <div className="absolute -bottom-8 -right-8 w-full h-full bg-black/20 blur-xl rounded-full transform scale-90"></div>

                    <WalkmanPlayer
                        ref={walkmanRef}
                        isHovered={isHoveringPlayer}
                        className="transform rotate-1"
                    />
                </div>

                {/* Instructions */}
                <div className="absolute -bottom-16 left-0 right-0 text-center">
                    <p className="font-mono text-xs text-gray-500 tracking-widest uppercase">
                        {draggedConcert ? 'DROP TAPE HERE' : 'DRAG A TAPE TO LISTEN'}
                    </p>
                </div>
            </div>
        </div>
    )
}
