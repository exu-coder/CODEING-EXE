import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getProgress, saveProgress } from './storage.js'

const ProgressContext = createContext(null)
const MAX_LEVEL = 60

const normalizeProgress = (p) => {
  const unlocked = Array.isArray(p?.unlocked) && p.unlocked.length ? p.unlocked : [1]
  return {
    xp: Number(p?.xp) || 0,
    completed: Array.isArray(p?.completed) ? p.completed : [],
    unlocked: [...new Set(unlocked.filter(n => Number.isInteger(n) && n >= 1 && n <= MAX_LEVEL))],
    current: Math.min(MAX_LEVEL, Math.max(1, Number(p?.current) || 1)),
    settings: { language: 'en', sound: true, theme: 'dark', ...(p?.settings || {}) }
  }
}

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState(normalizeProgress(null))
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let mounted = true
    getProgress().then(p => {
      if (mounted) {
        setProgress(normalizeProgress(p))
        setLoaded(true)
      }
    }).catch(err => {
      console.error('Progress load failed:', err)
      if (mounted) setLoaded(true)
    })
    return () => { mounted = false }
  }, [])

  const persist = useCallback((updated) => {
    saveProgress(updated).catch(err => console.error('Progress save failed:', err))
    return updated
  }, [])

  const addXP = useCallback((amount) => {
    setProgress(prev => persist({ ...prev, xp: Math.max(0, (prev.xp || 0) + (Number(amount) || 0)) }))
  }, [persist])

  const completeExercise = useCallback((exerciseId, levelNum, accuracy) => {
    setProgress(prev => {
      const level = Number(levelNum)
      const completed = [...new Set([...(prev.completed || []), exerciseId])]
      const unlocked = [...new Set(prev.unlocked || [1])]
      if (Number(accuracy) >= 70 && level >= 1 && level < MAX_LEVEL) unlocked.push(level + 1)
      const nextLevel = unlocked.includes(level + 1) ? level + 1 : level
      return persist({ ...prev, completed, unlocked: unlocked.filter(n => n <= MAX_LEVEL), current: Math.min(MAX_LEVEL, nextLevel) })
    })
  }, [persist])

  const updateSettings = useCallback((newSettings) => {
    setProgress(prev => {
      const updated = { ...prev, settings: { ...prev.settings, ...newSettings } }
      saveProgress(updated).catch(err => console.error('Settings save failed:', err))
      return updated
    })
  }, [])

  if (!loaded) return null
  return <ProgressContext.Provider value={{ progress, addXP, completeExercise, updateSettings }}>{children}</ProgressContext.Provider>
}

export const useProgress = () => useContext(ProgressContext)
