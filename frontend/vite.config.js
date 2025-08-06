import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  const apiUrl = isDev ? 'http://localhost:3001/api' : '/api';
  return {
    plugins: [react()],
    define: {
      'API_URL': JSON.stringify(apiUrl),
    }
  }
});