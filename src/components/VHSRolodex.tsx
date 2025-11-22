import { useState, useEffect, useRef } from 'react'
import { motion, type PanInfo } from 'framer-motion'
import { VHSTape } from './VHSTape'
import { type Concert } from '@/stores/useConcertStore'

interface VHSRolodexProps {
    concerts: Concert[]
    onSelect: (concert: Concert) => void
    selectedIndex?: number
}

export function VHSRolodex({ concerts, onSelect, selectedIndex = 0 }: VHSRolodexProps) {
    const [currentIndex, setCurrentIndex] = useState(selectedIndex)
    const containerRef = useRef<HTMLDivElement>(null)
    const scrollAccumulator = useRef(0)

    // Constants for the wheel
    const VISIBLE_ITEMS = 5 // Number of items visible at once

    useEffect(() => {
        if (selectedIndex !== undefined && selectedIndex !== currentIndex) {
            setCurrentIndex(selectedIndex)
        }
    }, [selectedIndex])

    // Calculate the Y offset and Z translation for 3D effect
    const getTransform = (index: number) => {
        const diff = index - currentIndex
        const absDiff = Math.abs(diff)

        // Only render items that are close to the center to improve performance
        if (absDiff > VISIBLE_ITEMS) return { display: 'none' }

        const rotateX = diff * 20
        const z = -Math.abs(diff) * 50
        const y = diff * 160 // Increased spacing for larger tapes
        const opacity = 1 - (absDiff / VISIBLE_ITEMS)

        return {
            rotateX,
            z,
            y,
            opacity,
            display: 'block'
        }
    }

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 50
        if (info.offset.y > threshold) {
            setCurrentIndex(prev => Math.max(0, prev - 1))
        } else if (info.offset.y < -threshold) {
            setCurrentIndex(prev => Math.min(concerts.length - 1, prev + 1))
        }
    }

    const handleWheel = (e: React.WheelEvent) => {
        scrollAccumulator.current += e.deltaY

        const threshold = 50 // Threshold for triggering a scroll

        if (scrollAccumulator.current > threshold) {
            setCurrentIndex(prev => Math.min(concerts.length - 1, prev + 1))
            scrollAccumulator.current = 0
        } else if (scrollAccumulator.current < -threshold) {
            setCurrentIndex(prev => Math.max(0, prev - 1))
            scrollAccumulator.current = 0
        }

        // Reset accumulator if it gets too high without triggering (optional safety)
        if (Math.abs(scrollAccumulator.current) > threshold * 2) {
            scrollAccumulator.current = 0
        }
    }

    return (
        <div
            className="relative h-full min-h-[400px] w-full flex items-center justify-center overflow-hidden perspective-1000"
            onWheel={handleWheel}
            ref={containerRef}
        >
            {/* Overlay gradients for depth */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#fdfbf7] to-transparent z-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#fdfbf7] to-transparent z-20 pointer-events-none"></div>

            {/* Selection Indicator */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-36 border-y-2 border-vintage-orange/50 bg-vintage-orange/5 z-0 pointer-events-none"></div>

            <motion.div
                className="relative w-full max-w-md h-full flex items-center justify-center preserve-3d"
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                onDragEnd={handleDragEnd}
                style={{ perspective: '1000px' }}
            >
                {concerts.map((concert, index) => {
                    const transform = getTransform(index)
                    const isActive = index === currentIndex

                    return (
                        <motion.div
                            key={concert.id}
                            className="absolute w-full px-8"
                            initial={false}
                            animate={{
                                rotateX: transform.rotateX,
                                z: transform.z,
                                y: transform.y,
                                opacity: transform.opacity,
                                display: transform.display as string
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            style={{
                                transformStyle: 'preserve-3d',
                                zIndex: isActive ? 10 : 10 - Math.abs(index - currentIndex)
                            }}
                        >
                            <VHSTape
                                concert={concert}
                                isActive={isActive}
                                onClick={() => isActive ? onSelect(concert) : setCurrentIndex(index)}
                            />
                        </motion.div>
                    )
                })}
            </motion.div>

            {/* Scroll Indicator */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 h-48 w-1 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                    className="w-full bg-vintage-teal"
                    animate={{
                        height: `${(1 / concerts.length) * 100}%`,
                        y: `${(currentIndex / (concerts.length - 1)) * 192}px` // 192 is h-48 in pixels
                    }}
                />
            </div>
        </div>
    )
}
