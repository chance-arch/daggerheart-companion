import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
// Single-file build: inline JS+CSS into one HTML so it opens via file:// (no server, no module CORS).
export default defineConfig({ plugins: [react(), viteSingleFile()], base: './' })
