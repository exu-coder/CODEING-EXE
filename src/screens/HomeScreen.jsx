import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Lock, Star, Trophy, Zap, ChevronRight, Flame } from 'lucide-react'
import { useProgress } from '../utils/ProgressContext.jsx'
import { loadLessonFile } from '../utils/storage.js'

const MAX_LEVEL = 60

export default function HomeScreen() {
  const { progress } = useProgress()
  const [levels, setLevels] = useState([])
  const [streak] = useState(3)

  useEffect(() => {
    let cancelled = false
    Promise.all(Array.from({ length: MAX_LEVEL }, (_, i) => loadLessonFile(i + 1))).then(items => {
      if (!cancelled) setLevels(items.filter(Boolean))
    })
    return () => { cancelled = true }
  }, [])

  const lang = progress.settings?.language || 'en'
  const totalExercises = levels.reduce((sum, l) => sum + (l.exercises?.length || l.total_exercises || 0), 0)
  const completedCount = progress.completed?.length || 0
  const percent = totalExercises ? Math.min(100, Math.round(completedCount / totalExercises * 100)) : 0
  const maxUnlocked = Math.min(MAX_LEVEL, Math.max(1, ...(progress.unlocked || [1])))

  return <div className="space-y-6">
    <div className="glass-card p-6 neon-border">
      <div className="flex items-center justify-between mb-4"><div><h1 className="text-2xl font-display font-bold text-white">{lang === 'id' ? 'Selamat Datang, Coder!' : 'Welcome, Coder!'}</h1><p className="text-gray-400 text-sm mt-1">{completedCount} / {totalExercises} exercises completed</p></div><div className="flex items-center gap-1 bg-orange-500/20 px-3 py-1.5 rounded-full"><Flame className="w-4 h-4 text-orange-400" /><span className="text-orange-400 font-bold text-sm">{streak}</span></div></div>
      <div className="space-y-2"><div className="flex justify-between text-xs"><span className="text-gray-400">Overall Progress</span><span className="text-termux-cyan font-mono">{percent}%</span></div><div className="progress-bar"><motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 1 }} /></div></div>
      <div className="grid grid-cols-3 gap-3 mt-4"><div className="bg-termux-bg/50 rounded-xl p-3 text-center"><Zap className="w-5 h-5 text-termux-yellow mx-auto mb-1" /><div className="text-termux-yellow font-bold font-mono">{progress.xp || 0}</div><div className="text-[10px] text-gray-500">XP</div></div><div className="bg-termux-bg/50 rounded-xl p-3 text-center"><Trophy className="w-5 h-5 text-termux-cyan mx-auto mb-1" /><div className="text-termux-cyan font-bold font-mono">{completedCount}</div><div className="text-[10px] text-gray-500">Done</div></div><div className="bg-termux-bg/50 rounded-xl p-3 text-center"><Star className="w-5 h-5 text-termux-pink mx-auto mb-1" /><div className="text-termux-pink font-bold font-mono">{levels.length}</div><div className="text-[10px] text-gray-500">Levels</div></div></div>
    </div>
    <Link to={`/lesson/${maxUnlocked}`}><motion.div className="glass-card p-4 neon-border-green flex items-center justify-between" whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }}><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-termux-green/20 flex items-center justify-center"><Play className="w-5 h-5 text-termux-green" /></div><div><div className="text-sm font-semibold text-white">Continue Learning</div><div className="text-xs text-gray-400">Level {maxUnlocked}</div></div></div><ChevronRight className="w-5 h-5 text-gray-500" /></motion.div></Link>
    <div><h2 className="text-lg font-display font-bold text-white mb-3">Level List</h2><div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{levels.map(level => { const unlocked = progress.unlocked?.includes(level.level); const done = level.exercises?.every(e => progress.completed?.includes(e.id)); const count = level.exercises?.filter(e => progress.completed?.includes(e.id)).length || 0; const pct = level.exercises?.length ? Math.round(count / level.exercises.length * 100) : 0; return <Link key={level.level} to={unlocked ? `/lesson/${level.level}` : '#'} onClick={e => !unlocked && e.preventDefault()}><motion.div className={`glass-card p-3 relative overflow-hidden ${unlocked ? 'cursor-pointer hover:border-termux-cyan/40' : 'opacity-50 cursor-not-allowed'} ${done ? 'border-termux-green/40' : ''}`} whileHover={unlocked ? { scale: 1.04 } : {}} whileTap={unlocked ? { scale: .97 } : {}}>{!unlocked && <div className="absolute inset-0 flex items-center justify-center bg-termux-bg/60 z-10"><Lock className="w-6 h-6 text-gray-600" /></div>}<div className="flex items-center justify-between mb-2"><span className="text-xs text-gray-500 font-mono">LV.{level.level}</span>{done && <Star className="w-3.5 h-3.5 text-termux-yellow fill-termux-yellow" />}</div><div className="text-sm font-semibold text-white truncate">{level.level_name || `Level ${level.level}`}</div><div className="text-[10px] text-gray-500 mt-1">{level.exercises?.length || 0} exercises</div><div className="progress-bar mt-2"><div className="h-full rounded-full bg-termux-cyan transition-all" style={{ width: `${pct}%` }} /></div></motion.div></Link> })}</div></div>
  </div>
}
