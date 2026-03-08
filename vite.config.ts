import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-public-selective',
      closeBundle() {
        const publicDir = 'public';
        const outDir = 'dist';

        function copyDir(src: string, dest: string) {
          mkdirSync(dest, { recursive: true });
          const entries = readdirSync(src);

          for (const entry of entries) {
            if (entry.includes(' copy')) continue;

            const srcPath = join(src, entry);
            const destPath = join(dest, entry);

            try {
              const stat = statSync(srcPath);
              if (stat.isDirectory()) {
                copyDir(srcPath, destPath);
              } else {
                copyFileSync(srcPath, destPath);
              }
            } catch (e) {
              console.warn(`Skipping ${entry}`);
            }
          }
        }

        copyDir(publicDir, outDir);
      }
    }
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['lucide-react', 'react-helmet-async'],
          'admin': [
            './src/pages/admin/Dashboard.tsx',
            './src/pages/admin/Courses.tsx',
            './src/pages/admin/News.tsx',
            './src/pages/admin/Users.tsx',
            './src/pages/admin/Settings.tsx',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  publicDir: false,
});
