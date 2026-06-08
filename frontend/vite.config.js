import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  const processEnv = {
    NODE_ENV: mode
  };
  for (const key in env) {
    if (key.startsWith('REACT_APP_')) {
      processEnv[key] = env[key];
    }
  }

  return {
    plugins: [react()],
    define: {
      'process.env': processEnv
    },
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: 'build',
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        }
      }
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
  };
});
