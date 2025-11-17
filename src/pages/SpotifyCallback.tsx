/**
 * Spotify OAuth Callback Page
 *
 * Handles the OAuth callback from Spotify and exchanges the code for an access token
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { exchangeCodeForToken } from '../api/spotify'
import { Loader2 } from 'lucide-react'

export default function SpotifyCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      // Get the authorization code from URL
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const errorParam = params.get('error')

      if (errorParam) {
        setError('Failed to authorize with Spotify')
        setTimeout(() => navigate('/'), 3000)
        return
      }

      if (!code) {
        setError('No authorization code received')
        setTimeout(() => navigate('/'), 3000)
        return
      }

      try {
        // Exchange code for token
        await exchangeCodeForToken(code)

        // Redirect back to the page they came from or home
        const returnTo = localStorage.getItem('spotify_auth_return_to') || '/'
        localStorage.removeItem('spotify_auth_return_to')
        navigate(returnTo)
      } catch (err) {
        console.error('Error exchanging code for token:', err)
        setError('Failed to authenticate with Spotify')
        setTimeout(() => navigate('/'), 3000)
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-vintage-cream flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="text-6xl">❌</div>
            <h1 className="text-3xl font-display font-bold text-vintage-teal">
              Authentication Failed
            </h1>
            <p className="text-vintage-teal/70">{error}</p>
            <p className="text-sm text-vintage-teal/50">Redirecting to home...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-vintage-teal mx-auto" />
            <h1 className="text-3xl font-display font-bold text-vintage-teal">
              Connecting to Spotify...
            </h1>
            <p className="text-vintage-teal/70">Please wait while we complete the setup</p>
          </>
        )}
      </div>
    </div>
  )
}
