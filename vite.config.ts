import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: '127.0.0.1', // Ensure server is accessible on 127.0.0.1 for Spotify redirect
      proxy: {
        '/api/setlistfm': {
          target: 'https://api.setlist.fm/rest/1.0',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/setlistfm/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, _req, _res) => {
              const apiKey = env.VITE_SETLISTFM_API_KEY || 'demo-key'
              proxyReq.setHeader('x-api-key', apiKey)
              proxyReq.setHeader('Accept', 'application/json')
            })
          },
        },
      },
    },
  }
})
