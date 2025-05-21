
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { MicroservicesProvider } from './context/MicroservicesContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Import performance optimizations
import { initPerformanceOptimizations } from './utils/performanceOptimizations';

// Initialize performance optimizations
initPerformanceOptimizations();

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <MicroservicesProvider>
          <App />
          <Toaster position="top-center" offset={12} richColors closeButton />
        </MicroservicesProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
