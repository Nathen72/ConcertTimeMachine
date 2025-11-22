import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { exchangeCodeForToken } from '../api/spotify'
import { Loader2, Disc } from 'lucide-react'

export default function SpotifyCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const hasCalledExchange = useRef(false)
  const [timer, setTimer] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  useEffect(() => {
    const handleCallback = async () => {
      if (hasCalledExchange.current) return
      
      // Get the authorization code from URL
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const errorParam = params.get('error')
      const errorDescription = params.get('error_description')

      if (errorParam) {
        hasCalledExchange.current = true
        let errorMsg = 'Failed to authorize with Spotify'
        
        // Provide specific error messages
        if (errorParam === 'access_denied') {
          errorMsg = 'ACCESS DENIED'
        } else if (errorParam === 'invalid_request') {
          errorMsg = 'INVALID REQUEST CONFIG'
        } else if (errorDescription) {
          errorMsg = `SPOTIFY ERR: ${decodeURIComponent(errorDescription).toUpperCase()}`
        } else {
          errorMsg = `ERR: ${errorParam.toUpperCase()}`
        }
        
        console.error('Spotify authorization error:', errorParam, errorDescription)
        setError(errorMsg)
        setTimeout(() => navigate('/'), 5000)
        return
      }

      if (!code) {
        hasCalledExchange.current = true
        setError('NO AUTH CODE RECEIVED')
        setTimeout(() => navigate('/'), 3000)
        return
      }

      try {
        hasCalledExchange.current = true
        // Exchange code for token
        await exchangeCodeForToken(code)

        // Redirect back to the page they came from or home
        const returnTo = localStorage.getItem('spotify_auth_return_to') || '/'
        localStorage.removeItem('spotify_auth_return_to')
        navigate(returnTo)
      } catch (err) {
        console.error('Error exchanging code for token:', err)
        const errorMessage = err instanceof Error ? err.message : 'AUTH FAILED'
        setError(errorMessage.toUpperCase())
        setTimeout(() => navigate('/'), 5000) // Give user more time to read the error
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center bg-[#0000AA] text-white font-mono relative overflow-hidden rounded-lg shadow-inner border-4 border-black/20">
      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none bg-[length:100%_4px] bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] z-10"></div>
      
      {/* Static/Noise Animation (Subtle) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] animate-pulse" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}></div>

      <div className="z-20 text-center space-y-8 px-4">
        {error ? (
          <>
            <div className="text-5xl md:text-7xl font-bold animate-pulse text-red-500 tracking-widest drop-shadow-md">ERROR</div>
            <div className="text-xl md:text-2xl max-w-2xl mx-auto border-2 border-red-500 p-4 bg-red-900/20">
               {error}
            </div>
            <div className="text-sm opacity-70 animate-bounce">EJECTING TAPE...</div>
          </>
        ) : (
          <>
            <div className="relative w-24 h-24 mx-auto mb-8">
               <Disc className="w-full h-full animate-spin text-white/90" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-[#0000AA] rounded-full"></div>
               </div>
            </div>
            
            <div className="text-4xl md:text-6xl font-bold animate-pulse tracking-widest drop-shadow-md">
              PLAY
            </div>
            <div className="text-lg md:text-xl opacity-90 tracking-wider">
              AUTHENTICATING SIGNAL...
            </div>
          </>
        )}
        
        <div className="absolute bottom-8 right-8 text-lg md:text-xl opacity-80 drop-shadow-md">
           SP {formatTime(timer)}
        </div>
        
        <div className="absolute top-8 left-8 text-lg md:text-xl opacity-80 drop-shadow-md flex items-center gap-2">
           <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div> REC
        </div>
      </div>
    </div>
  )
}
