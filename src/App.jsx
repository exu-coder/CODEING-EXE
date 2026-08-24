import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { OfflineProvider } from './utils/OfflineContext.jsx'
import { ProgressProvider } from './utils/ProgressContext.jsx'
import Layout from './components/Layout.jsx'
import HomeScreen from './screens/HomeScreen.jsx'
import LessonScreen from './screens/LessonScreen.jsx'
import TerminalScreen from './screens/TerminalScreen.jsx'
import PracticeScreen from './screens/PracticeScreen.jsx'
import CodingScreen from './screens/CodingScreen.jsx'
import ProfileScreen from './screens/ProfileScreen.jsx'
import SettingsScreen from './screens/SettingsScreen.jsx'
import SplashScreen from './screens/SplashScreen.jsx'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Initialize offline storage
    const init = async () => {
      try {
        const { initStorage } = await import('./utils/storage.js')
        await initStorage()
        setIsReady(true)
      } catch (e) {
        console.error('Storage init failed:', e)
        setIsReady(true)
      }
    }
    init()
  }, [])

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-termux-bg">
        <div className="text-termux-cyan animate-pulse font-display text-lg tracking-widest">
          LOADING...
        </div>
      </div>
    )
  }

  return (
    <OfflineProvider>
      <ProgressProvider>
        <Layout>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/lessons/:category?" element={<LessonScreen />} />
              <Route path="/lesson/:id" element={<LessonScreen />} />
              <Route path="/terminal" element={<TerminalScreen />} />
              <Route path="/practice" element={<PracticeScreen />} />
              <Route path="/coding" element={<CodingScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </Layout>
      </ProgressProvider>
    </OfflineProvider>
  )
}

export default App
