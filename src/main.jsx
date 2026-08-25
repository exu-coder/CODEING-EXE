import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Remove the static loading screen after the React app has had time to mount.
const loadingScreen = document.getElementById('loading-screen')
if (loadingScreen) {
  setTimeout(() => {
    loadingScreen.style.opacity = '0'
    loadingScreen.style.transition = 'opacity 0.5s'
    setTimeout(() => loadingScreen.remove(), 500)
  }, 1500)
}

// HashRouter is required for the packaged Electron file:// build.
// BrowserRouter expects an HTTP server to resolve routes such as /lesson/1.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
)
