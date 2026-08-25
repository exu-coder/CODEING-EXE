import localforage from 'localforage'

// Lessons are bundled by Vite at build time. This is important for Electron
// because the packaged renderer runs from a local file and cannot rely on
// fetch('/src/...') resolving to the source tree.
const lessonModules = import.meta.glob('../data/lessons/lesson-*.json', {
  eager: true,
  import: 'default'
})

const lessonFor = (levelNum) => {
  const filename = `lesson-${String(levelNum).padStart(2, '0')}.json`
  const key = `../data/lessons/${filename}`
  return lessonModules[key] || null
}

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
  const lesson = lessonFor(levelNum)
  if (lesson) return lesson

  console.error(`Lesson ${levelNum} is missing from the bundled lesson data.`)
  return null
}

export const getAllLessonFiles = async () => {
  return Object.entries(lessonModules)
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, lesson]) => lesson)
    .filter(Boolean)
}
