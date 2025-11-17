# 🎸 Concert Time Machine

Travel back in time to relive legendary concerts through their setlists. Search for your favorite artists, browse their concert history, and experience the music as if you were there.

## ✨ Features

- 🔍 **Artist Search**: Find your favorite artists using the setlist.fm database
- 🖼️ **Artist Photos**: View artist photos from Spotify in search results
- 📅 **Concert History**: Browse through historical concerts with detailed information
- 🎵 **Setlist Player**: Experience concerts song-by-song with a beautiful vintage interface
- 🎧 **Spotify Playback**: Play actual songs from Spotify with seamless integration
- 💿 **Album Art Display**: See album cover art on the rotating vinyl record
- 🎨 **Vintage Design**: Beautiful, whimsical UI inspired by retro aesthetics
- ⚡ **Fast & Modern**: Built with React 19, Vite, and modern web technologies

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** for styling
- **Framer Motion** for smooth animations
- **Zustand** for state management
- **React Router** for navigation
- **shadcn/ui** components (built on Radix UI)
- **Lucide React** for beautiful icons

### APIs & Services
- **setlist.fm API** for concert and setlist data
- **Spotify Web API** for artist photos and track search
- **Spotify Web Playback SDK** for music playback

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) (or npm/yarn/pnpm)
- A setlist.fm API key (get one at [setlist.fm](https://api.setlist.fm/docs/1.0/index.html))
- A Spotify Developer account and app (for music playback and artist photos)
- Spotify Premium account (required for playback)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ConcertTimeMachine
```

2. Install dependencies:
```bash
bun install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Set up setlist.fm API:
   - Get your API key from [setlist.fm](https://api.setlist.fm/docs/1.0/index.html)
   - Add it to `.env`:
   ```env
   VITE_SETLISTFM_API_KEY=your_api_key_here
   ```

5. Set up Spotify API (for music playback and artist photos):
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - **IMPORTANT**: Click "Edit Settings" on your app
   - In the "Redirect URIs" section, add exactly: `http://127.0.0.1:5173/callback`
     - ⚠️ **Note**: Spotify no longer allows `localhost` - you must use `127.0.0.1`
     - The URI must match **exactly** (including the protocol `http://`, no trailing slash)
     - If you're using a different port, update the URI accordingly
   - Copy your Client ID and Client Secret
   - Add them to `.env`:
   ```env
   VITE_SPOTIFY_CLIENT_ID=your_client_id
   VITE_SPOTIFY_CLIENT_SECRET=your_client_secret
   VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/callback
   ```
   
   **Troubleshooting "INVALID_CLIENT: Insecure redirect URI" error:**
   - Make sure the redirect URI in your `.env` file matches exactly what's in Spotify Dashboard
   - Check that there are no trailing slashes or extra characters
   - Verify the port number matches (default is 5173 for Vite)
   - The URI must be added in the Spotify Dashboard before it will work
   - After adding the URI in Spotify Dashboard, wait a few seconds for changes to propagate

6. Start the development server:
```bash
bun dev
```

7. Open your browser to `http://localhost:5173`

## 📖 Usage

1. **Search for an Artist**: Enter an artist name on the home page
   - Artist photos from Spotify will be displayed automatically if available
2. **Select a Concert**: Browse through the artist's concert history and pick one
3. **Experience the Show**: Navigate through the setlist with these features:
   - Click the "Connect Spotify" button to enable music playback
   - Play/Pause songs with actual Spotify playback
   - See album cover art on the rotating vinyl record
   - Navigate through songs with Next/Previous buttons

### Spotify Features

- **Artist Photos**: Automatically fetched from Spotify and displayed in search results
- **Music Playback**: Requires Spotify Premium and authentication
- **Album Art**: Displayed on the vinyl record in the center (replaces the music icon)
- **Track Search**: Automatically searches Spotify for each song in the setlist
- **Cover Songs**: Correctly searches for covers by the original artist

## 🎨 Design Philosophy

The app features a vintage, whimsical aesthetic inspired by:
- [Tavus.io](https://www.tavus.io/) - Playful, modern design with personality
- [PostHog.com](https://posthog.com) - Clean, distinctive visual style

Color palette:
- Vintage Cream: `#F5E6D3`
- Vintage Orange: `#FF6B35`
- Vintage Teal: `#004E64`
- Vintage Yellow: `#F7B32B`
- Vintage Sage: `#9CAF88`

## 🔮 Future Enhancements

- [x] Spotify integration for actual music playback ✅
- [x] Artist photos from Spotify ✅
- [x] Album art display on vinyl record ✅
- [ ] YouTube video integration
- [ ] Save favorite concerts
- [ ] Share concert experiences
- [ ] 3D visualizations with Three.js
- [ ] Audio synthesis with Tone.js fallback (for non-Premium users)
- [ ] Social features with Pusher
- [ ] Offline support with IndexedDB
- [ ] Playlist generation from concert setlists
- [ ] Lyrics display

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- Concert data provided by [setlist.fm](https://www.setlist.fm/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
