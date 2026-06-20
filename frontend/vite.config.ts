import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isGithubPages = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  plugins: [react()],
  base: isGithubPages ? '/DeepGuard-an-AI-powered-deepfake-detection-platform/' : '/',
  server: {
    proxy: {
      '/api/gemini': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gemini/, ''),
      }
    }
  }
})

