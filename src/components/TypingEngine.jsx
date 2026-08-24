import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── TYPING ENGINE COMPONENT ───
// Shadow text display + real-time typing + accuracy tracking
// Press ENTER to execute and validate

export default function TypingEngine({ 
  exercise, 
  onComplete, 
  onFail,
  soundEnabled = true 
}) {
  const [typed, setTyped] = useState('')
  const [cursorPos, setCursorPos] = useState(0)
  const [status, setStatus] = useState('idle') // idle | typing | executing | success | error
  const [errors, setErrors] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [showHint, setShowHint] = useState(false)
  const [shake, setShake] = useState(false)
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const timerRef = useRef(null)
  const shadowText = exercise.shadow_text

  // Focus input on mount and when exercise changes
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [exercise])

  // Keep focus on input
  useEffect(() => {
    const handleBlur = () => {
      if (status === 'idle' || status === 'typing') {
        setTimeout(() => inputRef.current?.focus(), 50)
      }
    }
    window.addEventListener('blur', handleBlur)
    return () => window.removeEventListener('blur', handleBlur)
  }, [status])

  // Timer
  useEffect(() => {
    if (status === 'typing' && startTime) {
      timerRef.current = setInterval(() => {
        const e = Math.floor((Date.now() - startTime) / 1000)
        setElapsed(e)
        // Calculate WPM
        const chars = typed.length
        const mins = e / 60
        if (mins > 0) setWpm(Math.round((chars / 5) / mins))
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [status, startTime, typed])

  // Calculate accuracy
  useEffect(() => {
    if (typed.length === 0) {
      setAccuracy(100)
      return
    }
    let errCount = 0
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] !== shadowText[i]) errCount++
    }
    setErrors(errCount)
    const acc = Math.max(0, Math.round(((typed.length - errCount) / typed.length) * 100))
    setAccuracy(acc)
  }, [typed, shadowText])

  // ===== MOBILE + DESKTOP INPUT HANDLER =====
  const handleInput = useCallback((e) => {
    if (status === 'executing' || status === 'success' || status === 'error') {
      e.preventDefault()
      return
    }

    const value = e.target.value
    const inputType = e.nativeEvent?.inputType || ''

    // Handle backspace/delete from mobile keyboard
    if (inputType === 'deleteContentBackward' || inputType === 'deleteContentForward') {
      setTyped(prev => {
        const newVal = value
        setCursorPos(newVal.length)
        return newVal
      })
      return
    }

    // Start timer on first input
    if (status === 'idle' && value.length > 0) {
      setStatus('typing')
      setStartTime(Date.now())
    }

    // Check if user pressed Enter (value ends with newline or has newline)
    if (value.includes('\n') || value.includes('\r')) {
      e.preventDefault()
      const cleanValue = value.replace(/\r?\n/g, '').trim()
      setTyped(cleanValue)
      setCursorPos(cleanValue.length)
      handleExecute(cleanValue)
      return
    }

    // Normal character input
    setTyped(value)
    setCursorPos(value.length)

    // Check for errors on the newly typed character
    const newCharIndex = value.length - 1
    if (newCharIndex >= 0 && newCharIndex < shadowText.length) {
      if (value[newCharIndex] !== shadowText[newCharIndex] && soundEnabled) {
        playErrorSound()
        setShake(true)
        setTimeout(() => setShake(false), 300)
      }
    }
  }, [status, shadowText, soundEnabled])

  // ===== KEYBOARD HANDLER (desktop fallback) =====
  const handleKeyDown = useCallback((e) => {
    if (status === 'executing' || status === 'success' || status === 'error') return

    // ENTER to execute
    if (e.key === 'Enter') {
      e.preventDefault()
      handleExecute(typed)
      return
    }

    // Backspace - let onInput handle it, but prevent default to avoid double handling
    if (e.key === 'Backspace') {
      // onInput will handle this
      return
    }

    // Ignore special keys (let onInput handle regular chars)
    if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) {
      e.preventDefault()
      return
    }

    // Start timer on first keystroke
    if (status === 'idle') {
      setStatus('typing')
      setStartTime(Date.now())
    }
  }, [status, typed])

  const handleExecute = (currentTyped) => {
    const textToCheck = currentTyped || typed
    setStatus('executing')

    // Simulate execution delay
    setTimeout(() => {
      const isMatch = textToCheck.trim() === shadowText.trim()
      const score = calculateScore(textToCheck)

      if (isMatch && score >= 50) {
        setStatus('success')
        playSuccessSound()
        setTimeout(() => onComplete({ score, wpm, accuracy, errors, elapsed }), 1500)
      } else {
        setStatus('error')
        playErrorSound()
        setTimeout(() => onFail({ score, wpm, accuracy, errors, elapsed }), 2000)
      }
    }, 800)
  }

  const calculateScore = (textToScore) => {
    const text = textToScore || typed
    const lengthBonus = Math.min(20, shadowText.length / 2)
    const accuracyBonus = accuracy * 0.5
    const speedBonus = Math.min(30, wpm)
    const errorPenalty = errors * exercise.penalty_per_error
    const timeBonus = Math.max(0, exercise.time_limit - elapsed) * 2
    return Math.max(0, Math.round(lengthBonus + accuracyBonus + speedBonus + timeBonus - errorPenalty))
  }

  const playSuccessSound = () => {
    if (!soundEnabled) return
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(523, ctx.currentTime) // C5
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1) // E5
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2) // G5
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.4)
    } catch (e) { /* silent fail */ }
  }

  const playErrorSound = () => {
    if (!soundEnabled) return
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(150, ctx.currentTime)
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.15)
    } catch (e) { /* silent fail */ }
  }

  // Render shadow text with highlighting
  const renderShadowText = () => {
    return shadowText.split('').map((char, i) => {
      let className = 'text-gray-500' // not yet typed
      if (i < typed.length) {
        className = typed[i] === char ? 'text-termux-green' : 'text-termux-red bg-termux-red/20'
      } else if (i === typed.length) {
        className = 'text-termux-cyan animate-pulse bg-termux-cyan/10'
      }
      return (
        <span key={i} className={className}>
          {char === '\n' ? '\n' : char === ' ' ? '·' : char}
        </span>
      )
    })
  }

  // Focus helper for mobile tap
  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  return (
    <div className="w-full max-w-3xl mx-auto" ref={containerRef}>
      {/* Status Bar */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">WPM</span>
            <span className="text-termux-cyan font-mono font-bold">{wpm}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Accuracy</span>
            <span className={`font-mono font-bold ${accuracy >= 90 ? 'text-termux-green' : accuracy >= 70 ? 'text-termux-yellow' : 'text-termux-red'}`}>
              {accuracy}%
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Errors</span>
            <span className="text-termux-red font-mono font-bold">{errors}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400 uppercase tracking-wider">Time</span>
          <span className={`font-mono font-bold ${elapsed > exercise.time_limit ? 'text-termux-red' : 'text-termux-cyan'}`}>
            {elapsed}s / {exercise.time_limit}s
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar mb-6">
        <div 
          className="progress-fill" 
          style={{ width: `${Math.min(100, (typed.length / shadowText.length) * 100)}%` }}
        />
      </div>

      {/* Shadow Text Display + Hidden Input Overlay */}
      <motion.div 
        className={`terminal-window p-6 mb-4 relative ${shake ? 'animate-shake' : ''}`}
        animate={shake ? { x: [-5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.3 }}
        onClick={handleContainerClick}
      >
        {/* Invisible full-size input overlay for mobile keyboard */}
        <input
          ref={inputRef}
          type="text"
          inputMode="text"
          enterKeyHint="done"
          value={typed}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
          style={{ fontSize: '16px' }} // prevent iOS zoom
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        <div className="terminal-header mb-3 pointer-events-none">
          <div className="terminal-dot bg-red-500" />
          <div className="terminal-dot bg-yellow-500" />
          <div className="terminal-dot bg-green-500" />
          <span className="text-xs text-gray-500 ml-2 font-mono">typing_practice.sh</span>
        </div>

        <div className="font-mono text-lg leading-relaxed whitespace-pre-wrap break-all pointer-events-none">
          <span className="text-gray-600 mr-2">$</span>
          {renderShadowText()}
          {typed.length >= shadowText.length && (
            <span className="text-termux-yellow animate-pulse ml-1">↵ Press ENTER</span>
          )}
        </div>
      </motion.div>

      {/* Hint Toggle */}
      <button 
        onClick={() => setShowHint(!showHint)}
        className="text-xs text-termux-cyan/60 hover:text-termux-cyan mb-4 transition-colors"
      >
        {showHint ? 'Hide Hint' : 'Show Hint'} 💡
      </button>

      <AnimatePresence>
        {showHint && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-4 mb-4 text-sm text-gray-300"
          >
            {exercise.hint}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Execution Results */}
      <AnimatePresence>
        {status === 'executing' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="terminal-window p-4"
          >
            <div className="flex items-center gap-2 text-termux-cyan">
              <div className="w-4 h-4 border-2 border-termux-cyan border-t-transparent rounded-full animate-spin" />
              <span className="font-mono">Executing command...</span>
            </div>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-4 border border-termux-green/40"
          >
            <div className="flex items-center gap-2 text-termux-green mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span className="font-bold">SUCCESS!</span>
            </div>
            <div className="font-mono text-sm text-gray-300 space-y-1">
              {exercise.expected_output.map((line, i) => (
                <div key={i} className="text-termux-green/80">{line}</div>
              ))}
            </div>
            <div className="mt-3 flex gap-4 text-xs">
              <span className="text-termux-cyan">+{calculateScore()} XP</span>
              <span className="text-gray-400">{wpm} WPM</span>
              <span className="text-gray-400">{accuracy}% Accuracy</span>
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-4 border border-termux-red/40"
          >
            <div className="flex items-center gap-2 text-termux-red mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              <span className="font-bold">ERROR!</span>
            </div>
            <div className="text-sm text-gray-300 mb-2">
              {typed.trim() !== shadowText.trim() 
                ? "Command doesn't match. Check your typing carefully!" 
                : "Score too low. Try to type faster with fewer errors!"}
            </div>
            <div className="text-xs text-gray-500">
              Expected: <span className="text-termux-green">{shadowText}</span>
            </div>
            <div className="text-xs text-gray-500">
              You typed: <span className="text-termux-red">{typed}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap to focus hint for mobile */}
      <div 
        className="text-center text-xs text-gray-600 mt-4 cursor-pointer select-none"
        onClick={handleContainerClick}
      >
        Tap terminal or press any key to focus
      </div>
    </div>
  )
}
