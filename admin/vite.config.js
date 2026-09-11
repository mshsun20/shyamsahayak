// import react from '@vitejs/plugin-react'
// import { defineConfig } from 'vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


import {
  defineConfig,
  loadEnv
} from 'vite'
import react, {
  reactCompilerPreset
} from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import {
  fileURLToPath
} from 'url'
import {
  dirname
} from 'path'
// import tailwindcss from "@tailwindcss/vite";

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  // Load .env files based on the current `mode`
  const env = loadEnv(mode, __dirname, '')
  const appenv = env.VITE_APP_ENV || 'development'

  const portDetails = {
    production: Number(env.VITE_APP_PORT_PRD) || 7060,
    quality: Number(env.VITE_APP_PORT_QAS) || 7061,
    development: Number(env.VITE_APP_PORT_DEV) || 7062,
  }

  return {
    plugins: [
      react(),
      // tailwindcss(),
      babel({
        presets: [reactCompilerPreset()]
      })
    ],
    server: {
      port: portDetails[appenv],
      host: true,
    },
  }
})