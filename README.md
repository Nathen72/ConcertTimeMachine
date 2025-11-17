# 🎸 Concert Time Machine

Travel back in time to relive legendary concerts through their setlists. Search for your favorite artists, browse their concert history, and experience the music as if you were there.

## ✨ Features

- 🔍 **Artist Search**: Find your favorite artists using the setlist.fm database
- 📅 **Concert History**: Browse through historical concerts with detailed information
- 🎵 **Setlist Player**: Experience concerts song-by-song with a beautiful vintage interface
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
- Ready for music integration (Spotify, YouTube, etc.)

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) (or npm/yarn/pnpm)
- A setlist.fm API key (get one at [setlist.fm](https://api.setlist.fm/docs/1.0/index.html))

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

4. Add your setlist.fm API key to `.env`:
```env
VITE_SETLISTFM_API_KEY=your_api_key_here
```

5. Start the development server:
```bash
bun dev
```

6. Open your browser to `http://localhost:5173`

## 📖 Usage

1. **Search for an Artist**: Enter an artist name on the home page
2. **Select a Concert**: Browse through the artist's concert history and pick one
3. **Experience the Show**: Navigate through the setlist and enjoy the concert timeline

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

- [ ] Spotify integration for actual music playback
- [ ] YouTube video integration
- [ ] Save favorite concerts
- [ ] Share concert experiences
- [ ] 3D visualizations with Three.js
- [ ] Audio synthesis with Tone.js
- [ ] Social features with Pusher
- [ ] Offline support with IndexedDB

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- Concert data provided by [setlist.fm](https://www.setlist.fm/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
