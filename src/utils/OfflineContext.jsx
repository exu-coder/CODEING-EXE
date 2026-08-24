import React, { createContext, useContext, useState, useEffect } from 'react'

const OfflineContext = createContext({ online: true })

export function OfflineProvider({ children }) {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <OfflineContext.Provider value={{ online }}>
      {children}
    </OfflineContext.Provider>
  )
}

export const useOffline = () => useContext(OfflineContext)
