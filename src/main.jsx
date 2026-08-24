import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Remove loading screen
const loadingScreen = document.getElementById('loading-screen')
if (loadingScreen) {
  setTimeout(() => {
    loadingScreen.style.opacity = '0'
    loadingScreen.style.transition = 'opacity 0.5s'
    setTimeout(() => loadingScreen.remove(), 500)
  }, 1500)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
