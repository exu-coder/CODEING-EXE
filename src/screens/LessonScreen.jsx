import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, RotateCcw, CheckCircle, XCircle, Volume2, VolumeX } from 'lucide-react'
import { useProgress } from '../utils/ProgressContext.jsx'
import { loadLessonFile } from '../utils/storage.js'
import TypingEngine from '../components/TypingEngine.jsx'

export default function LessonScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { progress, addXP, completeExercise } = useProgress()
  const [currentLevel, setCurrentLevel] = useState(1)
  const [currentExercise, setCurrentExercise] = useState(0)
  const [lessonData, setLessonData] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [sessionResults, setSessionResults] = useState([])
  const [soundEnabled, setSoundEnabled] = useState(progress.settings?.sound !== false)
  const lang = progress.settings?.language || 'en'

  useEffect(() => {
    const load = async () => {
      const level = id ? parseInt(id) : (progress.current || 1)
      setCurrentLevel(level)
      const data = await loadLessonFile(level)
      setLessonData(data)
    }
    load()
  }, [id, progress.current])

  if (!lessonData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-termux-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const exercise = lessonData.exercises[currentExercise]
  const isLastExercise = currentExercise >= lessonData.exercises.length - 1

  const handleComplete = (result) => {
    addXP(result.score)
    completeExercise(exercise.id, currentLevel, result.accuracy)
    setSessionResults(prev => [...prev, { ...result, exerciseId: exercise.id, success: true }])

    if (isLastExercise) {
      setShowResults(true)
    }
  }

  const handleFail = (result) => {
    setSessionResults(prev => [...prev, { ...result, exerciseId: exercise.id, success: false }])
    // Allow retry - don't advance
  }

  const nextExercise = () => {
    if (!isLastExercise) {
      setCurrentExercise(prev => prev + 1)
    }
  }

  const prevExercise = () => {
    if (currentExercise > 0) {
      setCurrentExercise(prev => prev - 1)
    }
  }

  const retryExercise = () => {
    setSessionResults(prev => prev.filter(r => r.exerciseId !== exercise.id))
  }

  const totalScore = sessionResults.filter(r => r.success).reduce((sum, r) => sum + r.score, 0)
  const avgAccuracy = sessionResults.length > 0 
    ? Math.round(sessionResults.reduce((sum, r) => sum + r.accuracy, 0) / sessionResults.length) 
    : 0

  if (showResults) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6 text-center neon-border">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            <CheckCircle className="w-16 h-16 text-termux-green mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">
            {lang === 'id' ? 'Level Selesai!' : 'Level Complete!'}
          </h2>
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-termux-yellow">{totalScore}</div>
              <div className="text-xs text-gray-500">XP Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-termux-cyan">{avgAccuracy}%</div>
              <div className="text-xs text-gray-500">Avg Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-termux-green">
                {sessionResults.filter(r => r.success).length}/{lessonData.exercises.length}
              </div>
              <div className="text-xs text-gray-500">Passed</div>
            </div>
          </div>
          <div className="flex gap-3 justify-center mt-6">
            <button 
              onClick={() => navigate('/lessons')}
              className="btn-secondary"
            >
              {lang === 'id' ? 'Daftar Level' : 'Level List'}
            </button>
            {!isLastExercise && (
              <button 
                onClick={() => {
                  setShowResults(false)
                  setCurrentExercise(0)
                  setSessionResults([])
                  setCurrentLevel(prev => prev + 1)
                }}
                className="btn-primary"
              >
                {lang === 'id' ? 'Level Berikutnya' : 'Next Level'} →
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/lessons')}
          className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{lang === 'id' ? 'Kembali' : 'Back'}</span>
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg hover:bg-termux-border/30 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-gray-400" /> : <VolumeX className="w-4 h-4 text-gray-600" />}
          </button>
          <div className="text-xs text-gray-400 font-mono">
            {currentExercise + 1} / {lessonData.exercises.length}
          </div>
        </div>
      </div>

      {/* Level Info */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-termux-cyan font-mono mb-1">
              LEVEL {currentLevel} — {exercise.category?.toUpperCase()}
            </div>
            <h2 className="text-lg font-semibold text-white">
              {lang === 'id' && exercise.instruction_id ? exercise.instruction_id : exercise.instruction}
            </h2>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">XP</div>
            <div className="text-termux-yellow font-bold font-mono">+{exercise.xp}</div>
          </div>
        </div>
      </div>

      {/* Typing Engine */}
      <TypingEngine 
        exercise={exercise}
        onComplete={handleComplete}
        onFail={handleFail}
        soundEnabled={soundEnabled}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button 
          onClick={prevExercise}
          disabled={currentExercise === 0}
          className="flex items-center gap-1 px-4 py-2 rounded-xl bg-termux-card border border-termux-border text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:border-termux-cyan/40 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {lang === 'id' ? 'Sebelumnya' : 'Prev'}
        </button>

        <button 
          onClick={retryExercise}
          className="flex items-center gap-1 px-4 py-2 rounded-xl bg-termux-card border border-termux-border text-gray-300 hover:border-termux-yellow/40 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          {lang === 'id' ? 'Ulang' : 'Retry'}
        </button>

        <button 
          onClick={nextExercise}
          disabled={!sessionResults.find(r => r.exerciseId === exercise.id)?.success}
          className="flex items-center gap-1 px-4 py-2 rounded-xl bg-termux-card border border-termux-border text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:border-termux-cyan/40 transition-colors"
        >
          {lang === 'id' ? 'Berikutnya' : 'Next'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
