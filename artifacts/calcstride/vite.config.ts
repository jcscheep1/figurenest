import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const rawPort = process.env.PORT ?? '3000';

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? '/';

export default defineConfig(async ({ isSsrBuild }) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const developmentPlugins = isProduction
    ? []
    : [
        await import('@replit/vite-plugin-runtime-error-modal').then(
          ({ default: runtimeErrorOverlay }) => runtimeErrorOverlay(),
        ),
        ...(process.env.REPL_ID !== undefined
          ? [
              await import('@replit/vite-plugin-cartographer').then((m) =>
                m.cartographer({
                  root: path.resolve(import.meta.dirname, '..'),
                }),
              ),
              await import('@replit/vite-plugin-dev-banner').then((m) =>
                m.devBanner(),
              ),
            ]
          : []),
      ];

  return {
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
      ...developmentPlugins,
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src'),
        '@assets': path.resolve(
          import.meta.dirname,
          '..',
          '..',
          'attached_assets',
        ),
      },
      dedupe: ['react', 'react-dom'],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, isSsrBuild ? 'dist/server' : 'dist/public'),
      emptyOutDir: !isSsrBuild,
      manifest: !isSsrBuild,
      ...(isSsrBuild ? {
        rollupOptions: {
          input: path.resolve(import.meta.dirname, 'src/entry-server.tsx'),
          output: { entryFileNames: 'entry-server.js' },
        },
      } : {}),
    },
    optimizeDeps: {
      exclude: ['@clerk/clerk-react'],
    },
    server: {
      port,
      strictPort: true,
      host: '0.0.0.0',
      allowedHosts: true,
      fs: {
        strict: true,
      },
    },
    preview: {
      port,
      host: '0.0.0.0',
      allowedHosts: true,
    },
  };
});
