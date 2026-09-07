import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    ssr: 'scripts/production-server.ts',
    outDir: 'dist/runtime',
    emptyOutDir: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        entryFileNames: 'production-server.mjs',
      },
    },
  },
});