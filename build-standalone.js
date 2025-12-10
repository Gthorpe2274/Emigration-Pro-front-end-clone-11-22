// Build script to create a standalone file converter
import { build } from 'vite';
import { resolve } from 'path';

async function buildStandalone() {
  try {
    await build({
      configFile: false,
      root: process.cwd(),
      build: {
        outDir: 'dist-standalone',
        emptyOutDir: true,
        rollupOptions: {
          input: resolve(process.cwd(), 'file-converter-standalone.html'),
          output: {
            entryFileNames: 'assets/[name].js',
            chunkFileNames: 'assets/[name].js',
            assetFileNames: 'assets/[name].[ext]'
          }
        }
      },
      resolve: {
        alias: {
          '@': resolve(process.cwd(), './src'),
        },
      },
      plugins: [require('@vitejs/plugin-react')()],
    });
    console.log('✅ Standalone file converter built successfully!');
    console.log('📁 Output directory: dist-standalone/');
    console.log('🌐 Open: dist-standalone/file-converter-standalone.html');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildStandalone();

