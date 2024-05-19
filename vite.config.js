import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [react(), visualizer()],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          'react-router-dom': ['react-router-dom'],
          dexie: ['dexie'],
          rxdb: [
            'rxdb',
            'rxdb/plugins/storage-dexie',
            'rxdb/plugins/query-builder',
            'rxdb/plugins/replication',
          ],
        },
      },
    },
  },
});
