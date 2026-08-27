import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, RotateCcw, CheckCircle, Lock, Volume2, VolumeX } from 'lucide-react'
import { useProgress } from '../utils/ProgressContext.jsx'
import { loadLessonFile } from '../utils/storage.js'
import TypingEngine from '../components/TypingEngine.jsx'

const TOTAL_LEVELS = 60

export default function LessonScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { progress, addXP, completeExercise } = useProgress()
  const [currentLevel, setCurrentLevel] = useState(1)
  const [currentExercise, setCurrentExercise] = useState(0)
  const [lessonData, setLessonData] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState([])
  const [soundEnabled, setSoundEnabled] = useState(progress.settings?.sound !== false)
  const [typingKey, setTypingKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const requested = Number.parseInt(id, 10) || progress.current || 1
    const level = Math.min(TOTAL_LEVELS, Math.max(1, requested))
    if (!progress.unlocked?.includes(level)) {
      navigate(`/lesson/${Math.min(TOTAL_LEVELS, Math.max(1, progress.current || 1))}`, { replace: true })
      return
    }
    setCurrentLevel(level)
    setLessonData(null)
    loadLessonFile(level).then(data => {
      if (!cancelled) {
        setLessonData(data)
        setCurrentExercise(0)
        setResults([])
        setShowResults(false)
        setTypingKey(k => k + 1)
      }
    })
    return () => { cancelled = true }
  }, [id, progress.current, progress.unlocked, navigate])

  if (!lessonData) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-termux-cyan border-t-transparent rounded-full animate-spin" /></div>

  const exercise = lessonData.exercises?.[currentExercise]
  if (!exercise) return <div className="glass-card p-6 text-termux-red">This level has no exercises.</div>

  const last = currentExercise === lessonData.exercises.length - 1
  const passed = results.find(r => r.exerciseId === exercise.id)?.success
  const allPassed = lessonData.exercises.every(e => results.find(r => r.exerciseId === e.id)?.success)
  const totalScore = results.filter(r => r.success).reduce((sum, r) => sum + r.score, 0)
  const avgAccuracy = results.length ? Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / results.length) : 0

  const complete = (result) => {
    addXP(result.score)
    completeExercise(exercise.id, currentLevel, result.accuracy)
    setResults(prev => [...prev.filter(r => r.exerciseId !== exercise.id), { ...result, exerciseId: exercise.id, success: true }])
    if (last) setShowResults(true)
  }

  const fail = (result) => setResults(prev => [...prev.filter(r => r.exerciseId !== exercise.id), { ...result, exerciseId: exercise.id, success: false }])
  const retry = () => { setResults(prev => prev.filter(r => r.exerciseId !== exercise.id)); setTypingKey(k => k + 1) }
  const next = () => { if (!last && passed) { setCurrentExercise(i => i + 1); setTypingKey(k => k + 1) } }
  const prev = () => { if (currentExercise > 0) { setCurrentExercise(i => i - 1); setTypingKey(k => k + 1) } }

  if (showResults) return <div className="space-y-6"><div className="glass-card p-6 text-center neon-border"><CheckCircle className="w-16 h-16 text-termux-green mx-auto mb-4" /><h2 className="text-2xl font-display font-bold text-white">Level Complete!</h2><div className="flex justify-center gap-8 mt-5"><div><div className="text-2xl font-bold text-termux-yellow">{totalScore}</div><div className="text-xs text-gray-500">XP</div></div><div><div className="text-2xl font-bold text-termux-cyan">{avgAccuracy}%</div><div className="text-xs text-gray-500">Accuracy</div></div><div><div className="text-2xl font-bold text-termux-green">{results.filter(r => r.success).length}/{lessonData.exercises.length}</div><div className="text-xs text-gray-500">Passed</div></div></div><div className="flex justify-center gap-3 mt-6"><button className="btn-secondary" onClick={() => navigate('/')}>Level List</button>{currentLevel < TOTAL_LEVELS && allPassed && progress.unlocked?.includes(currentLevel + 1) && <button className="btn-primary" onClick={() => navigate(`/lesson/${currentLevel + 1}`)}>Next Level <ArrowRight className="inline w-4 h-4" /></button>}</div></div></div>

  return <div className="space-y-4">
    <div className="flex items-center justify-between"><button onClick={() => navigate('/')} className="flex items-center gap-1 text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" />Back</button><div className="flex items-center gap-3"><button onClick={() => setSoundEnabled(v => !v)} className="p-2">{soundEnabled ? <Volume2 className="w-4 h-4 text-gray-400" /> : <VolumeX className="w-4 h-4 text-gray-600" />}</button><span className="text-xs text-gray-400 font-mono">{currentExercise + 1} / {lessonData.exercises.length}</span></div></div>
    <div className="glass-card p-4"><div className="flex items-center justify-between"><div><div className="text-xs text-termux-cyan font-mono mb-1">LEVEL {currentLevel} — {(exercise.category || exercise.type || 'coding').toUpperCase()}</div><h2 className="text-lg font-semibold text-white">{exercise.instruction}</h2></div><div className="text-right"><div className="text-xs text-gray-500">XP</div><div className="text-termux-yellow font-bold font-mono">+{exercise.xp || 0}</div></div></div></div>
    <TypingEngine key={typingKey} exercise={exercise} onComplete={complete} onFail={fail} soundEnabled={soundEnabled} />
    <div className="flex items-center justify-between pt-4"><button onClick={prev} disabled={currentExercise === 0} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-termux-card border border-termux-border text-gray-300 disabled:opacity-30"><ArrowLeft className="w-4 h-4" />Prev</button><button onClick={retry} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-termux-card border border-termux-border text-gray-300"><RotateCcw className="w-4 h-4" />Retry</button><button onClick={next} disabled={!passed || last} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-termux-card border border-termux-border text-gray-300 disabled:opacity-30">Next<ArrowRight className="w-4 h-4" /></button></div>
    {!progress.unlocked?.includes(currentLevel + 1) && currentLevel < TOTAL_LEVELS && <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-1"><Lock className="w-3 h-3" />Complete this level with 70%+ accuracy to unlock Level {currentLevel + 1}</div>}
  </div>
}
