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
      if (p) {
        // Ensure unlocked always has at least level 1
        const unlocked = p.unlocked?.length > 0 ? p.unlocked : [1]
        setProgress({ ...p, unlocked: [...new Set(unlocked)] })
      }
      setLoaded(true)
    })
  }, [])

  const addXP = useCallback((amount) => {
    setProgress(prev => {
      const updated = { ...prev, xp: (prev.xp || 0) + amount }
      saveProgress(updated)
      return updated
    })
  }, [])

  const completeExercise = useCallback((exerciseId, levelNum, accuracy) => {
    setProgress(prev => {
      const completed = [...new Set([...(prev.completed || []), exerciseId])]
      const unlocked = [...(prev.unlocked || [1])]

      // Unlock next level if accuracy is good enough (70%+)
      if (accuracy >= 70 && !unlocked.includes(levelNum + 1) && levelNum < 40) {
        unlocked.push(levelNum + 1)
      }

      // Update current to the level just played (or next if completed)
      const nextLevel = unlocked.includes(levelNum + 1) ? levelNum + 1 : levelNum

      const updated = { 
        ...prev, 
        completed, 
        unlocked: [...new Set(unlocked)], 
        current: nextLevel 
      }
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
