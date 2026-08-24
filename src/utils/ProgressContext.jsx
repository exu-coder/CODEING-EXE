import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getProgress, saveProgress } from './storage.js'

const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState({
    xp: 0, completed: [], unlocked: [1], current: 1, settings: { language: 'en', sound: true, theme: 'dark' }
  })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getProgress().then(p => {
      setProgress(p)
      setLoaded(true)
    })
  }, [])

  const addXP = useCallback((amount) => {
    setProgress(prev => {
      const updated = { ...prev, xp: prev.xp + amount }
      saveProgress(updated)
      return updated
    })
  }, [])

  const completeExercise = useCallback((exerciseId, levelNum, score) => {
    setProgress(prev => {
      const completed = [...new Set([...prev.completed, exerciseId])]
      const unlocked = [...prev.unlocked]
      if (score >= 70 && !unlocked.includes(levelNum + 1) && levelNum < 40) {
        unlocked.push(levelNum + 1)
      }
      const updated = { ...prev, completed, unlocked, current: levelNum }
      saveProgress(updated)
      return updated
    })
  }, [])

  const updateSettings = useCallback((newSettings) => {
    setProgress(prev => {
      const updated = { ...prev, settings: { ...prev.settings, ...newSettings } }
      saveProgress(updated)
      return updated
    })
  }, [])

  if (!loaded) return null

  return (
    <ProgressContext.Provider value={{ progress, addXP, completeExercise, updateSettings }}>
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgress = () => useContext(ProgressContext)
