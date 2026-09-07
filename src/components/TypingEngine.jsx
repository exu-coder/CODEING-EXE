import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const normalize = (value = '') =>
  value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\t/g, '    ').trimEnd()

export default function TypingEngine({ exercise, onComplete, onFail, soundEnabled = true }) {
  const expected = exercise?.shadow_text || exercise?.command || exercise?.text || ''
  const multiline = expected.includes('\n')
  const [typed, setTyped] = useState('')
  const [status, setStatus] = useState('idle') // idle | typing | executing | success | error
  const [errors, setErrors] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [lastSubmitted, setLastSubmitted] = useState('')
  const [mismatchIndex, setMismatchIndex] = useState(-1)
  const inputRef = useRef(null)
  const finishTimer = useRef(null)

  // Reset when exercise changes
  useEffect(() => {
    setTyped('')
    setStatus('idle')
    setErrors(0)
    setStartTime(null)
    setElapsed(0)
    setLastSubmitted('')
    setMismatchIndex(-1)
    setShowHint(false)
    const t = setTimeout(() => inputRef.current?.focus(), 80)
    return () => {
      clearTimeout(t)
      clearTimeout(finishTimer.current)
    }
  }, [exercise])

  // Live timer
  useEffect(() => {
    if (status !== 'typing' || !startTime) return
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 250)
    return () => clearInterval(timer)
  }, [status, startTime])

  // Live error count (character-level while typing)
  useEffect(() => {
    let count = 0
    let firstBad = -1
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] !== expected[i]) {
        count++
        if (firstBad < 0) firstBad = i
      }
    }
    setErrors(count)
    setMismatchIndex(firstBad)
  }, [typed, expected])

  const accuracy =
    typed.length === 0
      ? 100
      : Math.max(0, Math.min(100, Math.round(((typed.length - errors) / typed.length) * 100)))
  const wpm = elapsed > 0 ? Math.round(typed.length / 5 / (elapsed / 60)) : 0
  const score = Math.max(
    0,
    Math.round(
      Math.min(25, expected.length / 3) +
        accuracy * 0.6 +
        Math.min(35, wpm) -
        errors * (exercise?.penalty_per_error || 2) +
        Math.max(0, (exercise?.time_limit || 45) - elapsed)
    )
  )

  const playTone = useCallback(
    (success) => {
      if (!soundEnabled) return
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        if (!AudioCtx) return
        const ctx = new AudioCtx()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = success ? 'sine' : 'sawtooth'
        osc.frequency.value = success ? 660 : 150
        gain.gain.setValueAtTime(0.06, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)
        osc.start()
        osc.stop(ctx.currentTime + 0.18)
        setTimeout(() => ctx.close().catch(() => {}), 300)
      } catch {
        /* ignore audio errors */
      }
    },
    [soundEnabled]
  )

  const submit = useCallback(() => {
    if (status === 'executing' || status === 'success') return
    if (!typed.length) return

    const submitted = normalize(typed)
    const target = normalize(expected)
    setLastSubmitted(typed)
    setStatus('executing')

    finishTimer.current = setTimeout(() => {
      // Strict match for commands; allow high accuracy fallback for longer code
      const exact = submitted === target
      const lenOk = Math.abs(submitted.length - target.length) <= 1
      const passed = exact || (lenOk && accuracy >= 85 && target.length > 20)

      if (passed) {
        setStatus('success')
        playTone(true)
        setTimeout(() => {
          onComplete?.({ score, wpm, accuracy: exact ? 100 : accuracy, errors, elapsed })
        }, 650)
      } else {
        setStatus('error')
        playTone(false)
        onFail?.({ score, wpm, accuracy, errors, elapsed })
      }
    }, 280)
  }, [status, typed, expected, accuracy, score, wpm, errors, elapsed, onComplete, onFail, playTone])

  const resumeTyping = () => {
    if (status === 'error') {
      setStatus('typing')
      if (!startTime) setStartTime(Date.now())
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }

  const handleKeyDown = (e) => {
    if (status === 'executing' || status === 'success') {
      e.preventDefault()
      return
    }
    // After a failed attempt, any key resumes typing
    if (status === 'error') {
      setStatus('typing')
      if (!startTime) setStartTime(Date.now())
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      const el = e.currentTarget
      const start = el.selectionStart ?? typed.length
      const end = el.selectionEnd ?? typed.length
      const next = typed.slice(0, start) + '    ' + typed.slice(end)
      setTyped(next)
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 4
      })
      if (status === 'idle') {
        setStatus('typing')
        setStartTime(Date.now())
      }
      return
    }

    // Enter submits (Ctrl/Cmd+Enter for multiline)
    if (e.key === 'Enter' && (!multiline || e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      submit()
      return
    }

    // Ignore pure modifiers
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return

    if (status === 'idle') {
      setStatus('typing')
      setStartTime(Date.now())
    }
  }

  const handleChange = (e) => {
    if (status === 'executing' || status === 'success') return
    let value = e.target.value
    if (!multiline) value = value.replace(/[\r\n]/g, '')
    // Soft length limit to avoid runaway input
    if (value.length > expected.length + 8) value = value.slice(0, expected.length + 8)
    setTyped(value)
    if (status === 'idle' && value.length) {
      setStatus('typing')
      setStartTime(Date.now())
    }
    if (status === 'error') setStatus('typing')
  }

  const renderExpected = () =>
    expected.split('').map((char, i) => {
      let cls = 'text-gray-500'
      if (i < typed.length) {
        cls = typed[i] === char ? 'text-termux-green' : 'text-termux-red bg-termux-red/20 rounded-sm'
      } else if (i === typed.length) {
        cls = 'text-termux-cyan bg-termux-cyan/15 rounded-sm underline decoration-termux-cyan/50'
      }
      return (
        <span key={i} className={cls}>
          {char === '\n' ? (
            <>
              <span className="text-gray-600">↵</span>
              <br />
            </>
          ) : char === ' ' ? (
            '\u00a0'
          ) : (
            char
          )}
        </span>
      )
    })

  const timeLimit = exercise?.time_limit || 45
  const progressPct = Math.min(100, (typed.length / Math.max(1, expected.length)) * 100)

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Metrics */}
      <div className="flex items-center justify-between mb-4 px-1 text-xs font-mono flex-wrap gap-2">
        <div className="flex gap-4">
          <span className="text-gray-400">
            WPM <b className="text-termux-cyan">{wpm}</b>
          </span>
          <span className="text-gray-400">
            ACC{' '}
            <b
              className={
                accuracy >= 90 ? 'text-termux-green' : accuracy >= 70 ? 'text-termux-yellow' : 'text-termux-red'
              }
            >
              {accuracy}%
            </b>
          </span>
          <span className="text-gray-400">
            ERR <b className="text-termux-red">{errors}</b>
          </span>
        </div>
        <span className={`font-mono ${elapsed > timeLimit ? 'text-termux-red' : 'text-gray-400'}`}>
          {elapsed}s / {timeLimit}s
        </span>
      </div>

      <div className="progress-bar mb-5">
        <div className="progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Terminal window */}
      <motion.div
        className={`terminal-window p-5 sm:p-6 mb-4 relative cursor-text ${
          status === 'error' ? 'ring-1 ring-termux-red/40' : status === 'success' ? 'ring-1 ring-termux-green/40' : ''
        }`}
        onClick={() => {
          resumeTyping()
          inputRef.current?.focus()
        }}
        animate={status === 'error' ? { x: [-5, 5, -4, 4, 0] } : {}}
        transition={{ duration: 0.28 }}
      >
        {multiline ? (
          <textarea
            ref={inputRef}
            value={typed}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10 resize-none"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            aria-label="Type the command or code"
          />
        ) : (
          <input
            ref={inputRef}
            value={typed}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            aria-label="Type the command"
          />
        )}

        <div className="terminal-header mb-3 pointer-events-none">
          <div className="terminal-dot bg-red-500" />
          <div className="terminal-dot bg-yellow-500" />
          <div className="terminal-dot bg-green-500" />
          <span className="text-xs text-gray-500 ml-2 font-mono">termux_practice</span>
        </div>

        <div className="font-mono text-base sm:text-lg leading-relaxed whitespace-pre-wrap break-all pointer-events-none">
          <span className="text-termux-green mr-2 select-none">$</span>
          {renderExpected()}
          {typed.length >= expected.length && expected.length > 0 && (
            <span className="text-termux-yellow ml-2 text-sm animate-pulse">
              {multiline ? 'Ctrl+Enter to run' : 'Enter to run'}
            </span>
          )}
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          type="button"
          onClick={submit}
          disabled={!typed.length || status === 'executing' || status === 'success'}
          className="btn-primary text-sm disabled:opacity-40"
        >
          Run ↵
        </button>
        <button type="button" onClick={() => setShowHint((v) => !v)} className="text-xs text-termux-cyan/80 hover:text-termux-cyan">
          {showHint ? 'Hide Hint' : 'Show Hint'} 💡
        </button>
        {status === 'error' && (
          <button type="button" onClick={resumeTyping} className="text-xs text-termux-yellow hover:underline">
            Keep editing
          </button>
        )}
      </div>

      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-4 mb-4 text-sm text-gray-300"
          >
            {exercise?.hint || 'Type the command exactly as shown, then press Enter.'}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {status === 'executing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="terminal-window p-4 text-termux-cyan font-mono text-sm">
            Running simulation...
          </motion.div>
        )}
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-4 border border-termux-green/40"
          >
            <div className="text-termux-green font-bold mb-2">✓ SUCCESS</div>
            {(exercise?.expected_output || []).map((line, i) => (
              <div key={i} className="font-mono text-sm text-termux-green/80">
                {line}
              </div>
            ))}
            <div className="mt-3 text-xs text-gray-400">
              +{score} XP · {wpm} WPM · {accuracy}% accuracy
            </div>
          </motion.div>
        )}
        {status === 'error' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 border border-termux-red/40">
            <div className="text-termux-red font-bold mb-2">✕ NOT QUITE</div>
            <div className="text-sm text-gray-300">
              Your input does not match the target. Fix the red characters and press Enter again.
            </div>
            {mismatchIndex >= 0 && (
              <div className="mt-2 text-xs text-gray-500">
                First mismatch near position {mismatchIndex + 1}
              </div>
            )}
            <div className="mt-3 text-xs text-gray-500">
              You typed:{' '}
              <span className="text-termux-red font-mono whitespace-pre-wrap break-all">{lastSubmitted || '(empty)'}</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Expected:{' '}
              <span className="text-termux-green font-mono whitespace-pre-wrap break-all">{expected}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
