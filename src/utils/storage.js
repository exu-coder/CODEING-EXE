import localforage from 'localforage'

localforage.config({
  name: 'TermuxCodingLearn',
  storeName: 'progress',
  description: 'Offline progress storage for Termux Coding Learn'
})

export const initStorage = async () => {
  await localforage.ready()
  const exists = await localforage.getItem('initialized')
  if (!exists) {
    await localforage.setItem('initialized', true)
    await localforage.setItem('userXP', 0)
    await localforage.setItem('completedLessons', [])
    await localforage.setItem('unlockedLevels', [1])
    await localforage.setItem('currentLevel', 1)
    await localforage.setItem('settings', { language: 'en', sound: true, theme: 'dark' })
  }
}

export const getProgress = async () => ({
  xp: await localforage.getItem('userXP') || 0,
  completed: await localforage.getItem('completedLessons') || [],
  unlocked: await localforage.getItem('unlockedLevels') || [1],
  current: await localforage.getItem('currentLevel') || 1,
  settings: await localforage.getItem('settings') || { language: 'en', sound: true, theme: 'dark' }
})

export const saveProgress = async (data) => {
  await localforage.setItem('userXP', data.xp)
  await localforage.setItem('completedLessons', data.completed)
  await localforage.setItem('unlockedLevels', data.unlocked)
  await localforage.setItem('currentLevel', data.current)
}

export const saveSettings = async (settings) => {
  await localforage.setItem('settings', settings)
}

export const loadLessonFile = async (levelNum) => {
  try {
    const response = await fetch(`/src/data/lessons/lesson-${String(levelNum).padStart(2, '0')}.json`)
    if (!response.ok) throw new Error('File not found')
    return await response.json()
  } catch (e) {
    // Fallback: try dynamic import for bundled builds
    try {
      const mod = await import(`../data/lessons/lesson-${String(levelNum).padStart(2, '0')}.json`)
      return mod.default || mod
    } catch (e2) {
      console.error('Failed to load lesson:', e2)
      return null
    }
  }
}

export const getAllLessonFiles = async () => {
  const files = []
  for (let i = 1; i <= 40; i++) {
    const lesson = await loadLessonFile(i)
    if (lesson) files.push(lesson)
  }
  return files
}
