// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { copyFileSync, readdirSync, statSync, mkdirSync } from "fs";
import { join } from "path";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    {
      name: "copy-public-selective",
      closeBundle() {
        const publicDir = "public";
        const outDir = "dist";
        function copyDir(src, dest) {
          mkdirSync(dest, { recursive: true });
          const entries = readdirSync(src);
          for (const entry of entries) {
            if (entry.includes(" copy")) continue;
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
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "supabase-vendor": ["@supabase/supabase-js"],
          "ui-vendor": ["lucide-react", "react-helmet-async"],
          "admin": [
            "./src/pages/admin/Dashboard.tsx",
            "./src/pages/admin/Courses.tsx",
            "./src/pages/admin/News.tsx",
            "./src/pages/admin/Users.tsx",
            "./src/pages/admin/Settings.tsx"
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1e3
  },
  optimizeDeps: {
    exclude: ["lucide-react"]
  },
  publicDir: "public"
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBjb3B5RmlsZVN5bmMsIHJlYWRkaXJTeW5jLCBzdGF0U3luYywgbWtkaXJTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAge1xuICAgICAgbmFtZTogJ2NvcHktcHVibGljLXNlbGVjdGl2ZScsXG4gICAgICBjbG9zZUJ1bmRsZSgpIHtcbiAgICAgICAgY29uc3QgcHVibGljRGlyID0gJ3B1YmxpYyc7XG4gICAgICAgIGNvbnN0IG91dERpciA9ICdkaXN0JztcblxuICAgICAgICBmdW5jdGlvbiBjb3B5RGlyKHNyYzogc3RyaW5nLCBkZXN0OiBzdHJpbmcpIHtcbiAgICAgICAgICBta2RpclN5bmMoZGVzdCwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gICAgICAgICAgY29uc3QgZW50cmllcyA9IHJlYWRkaXJTeW5jKHNyYyk7XG5cbiAgICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgICAgIGlmIChlbnRyeS5pbmNsdWRlcygnIGNvcHknKSkgY29udGludWU7XG5cbiAgICAgICAgICAgIGNvbnN0IHNyY1BhdGggPSBqb2luKHNyYywgZW50cnkpO1xuICAgICAgICAgICAgY29uc3QgZGVzdFBhdGggPSBqb2luKGRlc3QsIGVudHJ5KTtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc3Qgc3RhdCA9IHN0YXRTeW5jKHNyY1BhdGgpO1xuICAgICAgICAgICAgICBpZiAoc3RhdC5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgY29weURpcihzcmNQYXRoLCBkZXN0UGF0aCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29weUZpbGVTeW5jKHNyY1BhdGgsIGRlc3RQYXRoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFNraXBwaW5nICR7ZW50cnl9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29weURpcihwdWJsaWNEaXIsIG91dERpcik7XG4gICAgICB9XG4gICAgfVxuICBdLFxuICBidWlsZDoge1xuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAncmVhY3QtdmVuZG9yJzogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVhY3Qtcm91dGVyLWRvbSddLFxuICAgICAgICAgICdzdXBhYmFzZS12ZW5kb3InOiBbJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcyddLFxuICAgICAgICAgICd1aS12ZW5kb3InOiBbJ2x1Y2lkZS1yZWFjdCcsICdyZWFjdC1oZWxtZXQtYXN5bmMnXSxcbiAgICAgICAgICAnYWRtaW4nOiBbXG4gICAgICAgICAgICAnLi9zcmMvcGFnZXMvYWRtaW4vRGFzaGJvYXJkLnRzeCcsXG4gICAgICAgICAgICAnLi9zcmMvcGFnZXMvYWRtaW4vQ291cnNlcy50c3gnLFxuICAgICAgICAgICAgJy4vc3JjL3BhZ2VzL2FkbWluL05ld3MudHN4JyxcbiAgICAgICAgICAgICcuL3NyYy9wYWdlcy9hZG1pbi9Vc2Vycy50c3gnLFxuICAgICAgICAgICAgJy4vc3JjL3BhZ2VzL2FkbWluL1NldHRpbmdzLnRzeCcsXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFsnbHVjaWRlLXJlYWN0J10sXG4gIH0sXG4gIHB1YmxpY0RpcjogJ3B1YmxpYycsXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsY0FBYyxhQUFhLFVBQVUsaUJBQWlCO0FBQy9ELFNBQVMsWUFBWTtBQUdyQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTjtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sY0FBYztBQUNaLGNBQU0sWUFBWTtBQUNsQixjQUFNLFNBQVM7QUFFZixpQkFBUyxRQUFRLEtBQWEsTUFBYztBQUMxQyxvQkFBVSxNQUFNLEVBQUUsV0FBVyxLQUFLLENBQUM7QUFDbkMsZ0JBQU0sVUFBVSxZQUFZLEdBQUc7QUFFL0IscUJBQVcsU0FBUyxTQUFTO0FBQzNCLGdCQUFJLE1BQU0sU0FBUyxPQUFPLEVBQUc7QUFFN0Isa0JBQU0sVUFBVSxLQUFLLEtBQUssS0FBSztBQUMvQixrQkFBTSxXQUFXLEtBQUssTUFBTSxLQUFLO0FBRWpDLGdCQUFJO0FBQ0Ysb0JBQU0sT0FBTyxTQUFTLE9BQU87QUFDN0Isa0JBQUksS0FBSyxZQUFZLEdBQUc7QUFDdEIsd0JBQVEsU0FBUyxRQUFRO0FBQUEsY0FDM0IsT0FBTztBQUNMLDZCQUFhLFNBQVMsUUFBUTtBQUFBLGNBQ2hDO0FBQUEsWUFDRixTQUFTLEdBQUc7QUFDVixzQkFBUSxLQUFLLFlBQVksS0FBSyxFQUFFO0FBQUEsWUFDbEM7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUVBLGdCQUFRLFdBQVcsTUFBTTtBQUFBLE1BQzNCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQSxVQUNaLGdCQUFnQixDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQSxVQUN6RCxtQkFBbUIsQ0FBQyx1QkFBdUI7QUFBQSxVQUMzQyxhQUFhLENBQUMsZ0JBQWdCLG9CQUFvQjtBQUFBLFVBQ2xELFNBQVM7QUFBQSxZQUNQO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLHVCQUF1QjtBQUFBLEVBQ3pCO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsY0FBYztBQUFBLEVBQzFCO0FBQUEsRUFDQSxXQUFXO0FBQ2IsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
