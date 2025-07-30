import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import App from './App.tsx'
import './styles/globals.css'

// Suppress React Router future flag warnings
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
}

// Register PWA service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
      })
      .catch((registrationError) => {
        // Only log if it's not a 404 error (which is expected in development)
        if (!registrationError.message.includes('404')) {
          console.log('SW registration failed: ', registrationError)
        }
      })
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter {...router}>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
) 