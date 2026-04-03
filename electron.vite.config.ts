import { resolve } from 'path'
import fs from 'fs'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { Plugin } from 'vite'

const PATCH_RE =
  /exports\.supportsWebCodecsH264Decode\s*=\s*supportsWebCodecsH264Decode\s*=\s*await\s+\S+\(\)/
const PATCH_REPLACEMENT =
  'exports.supportsWebCodecsH264Decode = supportsWebCodecsH264Decode = false'

// esbuild plugin — runs during optimizeDeps (dev mode pre-bundling)
const noVncEsbuildPlugin = {
  name: 'novnc-browser-patch-esbuild',
  setup(build: { onLoad: Function }) {
    build.onLoad({ filter: /browser\.js$/ }, (args: { path: string }) => {
      if (!args.path.includes('@novnc')) return null
      const code = fs.readFileSync(args.path, 'utf8')
      return { contents: code.replace(PATCH_RE, PATCH_REPLACEMENT), loader: 'js' }
    })
  }
}

// Vite plugin — runs during production build (Rollup transform phase)
const noVncVitePlugin: Plugin = {
  name: 'novnc-browser-patch-vite',
  transform(code, id) {
    if (!id.includes('@novnc') || !id.includes('browser.js')) return null
    return { code: code.replace(PATCH_RE, PATCH_REPLACEMENT), map: null }
  }
}

export default defineConfig({
  main: {
    build: { minify: false }
  },
  preload: {},
  renderer: {
    define: {
      'process.platform': JSON.stringify(process.platform)
    },
    plugins: [react(), tailwindcss(), noVncVitePlugin],
    optimizeDeps: {
      include: ['@novnc/novnc/lib/rfb'],
      esbuildOptions: { plugins: [noVncEsbuildPlugin] }
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
          vnc: resolve(__dirname, 'src/renderer/vnc.html')
        }
      }
    }
  }
})
