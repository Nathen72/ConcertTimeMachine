import { Outlet, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Disc, Music, Radio, Search, Home as HomeIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CassetteLayout() {
  const location = useLocation()

  // Determine current page label
  const getPageLabel = () => {
    const path = location.pathname
    if (path === '/') return 'A SIDE: ARTIST SEARCH'
    if (path === '/concerts') return 'B SIDE: ARCHIVE'
    if (path === '/player') return 'PLAYBACK MODE'
    if (path === '/callback') return 'SYSTEM SETUP'
    return 'UNKNOWN TRACK'
  }

  return (
    <div className="min-h-screen w-full bg-vintage-bg text-vintage-teal font-sans overflow-x-hidden flex flex-col items-center justify-center p-2 md:p-6 relative selection:bg-vintage-orange selection:text-vintage-cream">
      {/* Global Background Texture/Noise */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* Main Cassette Shell Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl h-[85vh] max-h-[85vh] relative z-10 bg-cassette-body rounded-3xl shadow-2xl border-4 border-cassette-border flex flex-col overflow-hidden"
      >
        {/* Top Chrome (Screw heads & Spine Label) */}
        <div className="h-16 bg-cassette-dark/5 border-b-2 border-cassette-border/50 flex items-center justify-between px-6 relative">
          {/* Faux Screw Left */}
          <div className="w-3 h-3 rounded-full bg-zinc-400 shadow-inner border border-zinc-600 flex items-center justify-center transform rotate-45">
            <div className="w-full h-[1px] bg-zinc-600" />
            <div className="h-full w-[1px] bg-zinc-600 absolute" />
          </div>

          {/* Top Label Area */}
          <div className="bg-cassette-label px-8 py-1 transform -skew-x-6 shadow-sm border border-black/10">
            <h2 className="text-sm md:text-base font-mono font-bold tracking-widest transform skew-x-6 text-vintage-teal/80 uppercase">
              {getPageLabel()}
            </h2>
          </div>

          {/* Faux Screw Right */}
          <div className="w-3 h-3 rounded-full bg-zinc-400 shadow-inner border border-zinc-600 flex items-center justify-center transform -rotate-12">
            <div className="w-full h-[1px] bg-zinc-600" />
            <div className="h-full w-[1px] bg-zinc-600 absolute" />
          </div>
        </div>

        {/* Navigation Band */}
        <nav className="bg-cassette-dark/10 py-3 px-4 border-b border-cassette-border/20 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center justify-center gap-4 md:gap-8 max-w-md mx-auto bg-black/5 p-2 rounded-full shadow-inner">
            <NavLink to="/" active={location.pathname === '/'} icon={<Search className="w-4 h-4" />} label="Search" />
            <NavLink to="/concerts" active={location.pathname === '/concerts'} icon={<Music className="w-4 h-4" />} label="Concerts" />
            <NavLink to="/player" active={location.pathname === '/player'} icon={<Disc className="w-4 h-4" />} label="Player" />
          </div>
        </nav>

        {/* Content Area (The "Window") */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-vintage-cream/50 relative scrollbar-thin scrollbar-thumb-vintage-orange/50 scrollbar-track-transparent">
          {/* Inner shadow/gloss for the window effect */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.05)] z-20" />
          <div className="relative z-10 p-4 md:p-6 min-h-full">
            <Outlet />
          </div>
        </main>

        {/* Bottom Chrome */}
        <div className="h-12 bg-cassette-dark/5 border-t-2 border-cassette-border/50 flex items-center justify-between px-8">
          <div className="text-[10px] font-mono text-vintage-teal/40 tracking-widest">
            TYPE I (NORMAL) POSITION
          </div>
          <div className="flex gap-1">
            {/* Decorative grip lines */}
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-1 h-6 bg-cassette-border/20 rounded-full" />
            ))}
          </div>
          <div className="text-[10px] font-mono text-vintage-teal/40 tracking-widest">
            NR: ON
          </div>
        </div>
      </motion.div>

      {/* Footer Copyright */}
      <footer className="mt-6 text-vintage-teal/40 text-xs font-mono text-center">
        CONCERT TIME MACHINE © {new Date().getFullYear()} • HI-FI STEREO
      </footer>
    </div >
  )
}

function NavLink({ to, active, icon, label }: { to: string, active: boolean, icon: React.ReactNode, label: string }) {
  return (
    <Link to={to} className="relative group">
      <div className={cn(
        "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-200",
        active
          ? "bg-vintage-orange text-vintage-cream shadow-md transform scale-105"
          : "text-vintage-teal/60 hover:text-vintage-teal hover:bg-vintage-teal/10"
      )}>
        {icon}
        <span className="hidden md:inline">{label}</span>
      </div>
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-vintage-orange rounded-full"
        />
      )}
    </Link>
  )
}

