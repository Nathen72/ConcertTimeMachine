import { type Concert } from '@/stores/useConcertStore'
import { CassetteTape } from './CassetteTape'

interface CassetteCrateProps {
    concerts: Concert[]
    onDragStart: (concert: Concert) => void
    onDragEnd: (event: any, info: any, concert: Concert) => void
}

export function CassetteCrate({ concerts, onDragStart, onDragEnd }: CassetteCrateProps) {
    return (
        <div className="w-full h-full bg-[#3e2723] rounded-lg border-8 border-[#2d1b18] shadow-2xl overflow-hidden flex flex-col relative">
            {/* Crate Header/Label */}
            <div className="bg-[#d7ccc8] p-4 border-b-4 border-[#2d1b18] shadow-inner flex justify-between items-center z-10 relative">
                <div className="font-marker text-2xl text-[#3e2723] rotate-1">MY COLLECTION</div>
                <div className="text-xs font-mono text-[#5d4037] border border-[#5d4037] px-2 py-1 rounded bg-[#efebe9]">
                    {concerts.length} TAPES
                </div>
            </div>

            {/* Wood Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] z-0"></div>

            {/* Scrollable Shelf Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-[#8d6e63] scrollbar-track-[#3e2723] relative z-0">
                <div className="grid grid-cols-1 gap-12 pb-12">
                    {concerts.map((concert) => (
                        <div key={concert.id} className="relative flex justify-center group perspective-1000">
                            {/* Shelf Shadow */}
                            <div className="absolute bottom-0 w-full h-4 bg-black/30 blur-md transform translate-y-2 rounded-full"></div>

                            <CassetteTape
                                concert={concert}
                                onDragStart={() => onDragStart(concert)}
                                onDragEnd={onDragEnd}
                                className="transform transition-transform hover:scale-105 hover:-rotate-1 cursor-grab active:cursor-grabbing"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Lip of Crate */}
            <div className="h-4 bg-[#2d1b18] shadow-lg relative z-10"></div>
        </div>
    )
}
