import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  // Load .env files based on the current `mode`
  const env = loadEnv(mode, __dirname, '')

  const appenv = env.VITE_APP_ENV || 'dev'

  const portDetails = {
    production: Number(env.VITE_APP_PORT_PRD) || 3060,
    quality: Number(env.VITE_APP_PORT_QAS) || 3061,
    development: Number(env.VITE_APP_PORT_DEV) || 3062,
  }

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    server: {
      port: portDetails[appenv],
      host: true,
    },
  }
})