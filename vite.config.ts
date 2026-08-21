import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { readFileSync } from 'node:fs'

type PackageMetadata = {
  version: string
}

const packageMetadata = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf-8'),
) as PackageMetadata

const deployedAt = new Date().toISOString()

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(packageMetadata.version),
    __APP_LAST_DEPLOYED_DATE__: JSON.stringify(deployedAt),
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
