import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const normalize = (value = '') => value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\t/g, '    ').trimEnd()

export default function TypingEngine({ exercise, onComplete, onFail, soundEnabled = true }) {
  const expected = exercise?.shadow_text || ''
  const multiline = expected.includes('\n')
  const [typed, setTyped] = useState('')
  const [status, setStatus] = useState('idle')
  const [errors, setErrors] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [lastSubmitted, setLastSubmitted] = useState('')
  const inputRef = useRef(null)
  const finishTimer = useRef(null)

  useEffect(() => {
    setTyped('')
    setStatus('idle')
    setErrors(0)
    setStartTime(null)
    setElapsed(0)
    setLastSubmitted('')
    setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(finishTimer.current)
  }, [exercise])

  useEffect(() => {
    if (status !== 'typing' || !startTime) return
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 250)
    return () => clearInterval(timer)
  }, [status, startTime])

  useEffect(() => {
    let count = 0
    for (let i = 0; i < typed.length; i++) if (typed[i] !== expected[i]) count++
    setErrors(count)
  }, [typed, expected])

  const accuracy = typed.length ? Math.max(0, Math.round(((typed.length - errors) / typed.length) * 100)) : 100
  const wpm = elapsed > 0 ? Math.round((typed.length / 5) / (elapsed / 60)) : 0
  const score = Math.max(0, Math.round(Math.min(25, expected.length / 3) + accuracy * 0.6 + Math.min(35, wpm) - errors * (exercise?.penalty_per_error || 2) + Math.max(0, (exercise?.time_limit || 30) - elapsed)))

  const playTone = useCallback((success) => {
    if (!soundEnabled) return
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = success ? 'sine' : 'sawtooth'
      osc.frequency.value = success ? 660 : 150
      gain.gain.setValueAtTime(0.06, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)
      osc.start(); osc.stop(ctx.currentTime + 0.18)
    } catch {}
  }, [soundEnabled])

  const submit = useCallback(() => {
    if (status === 'executing' || status === 'success') return
    const submitted = normalize(typed)
    const target = normalize(expected)
    setLastSubmitted(typed)
    setStatus('executing')
    finishTimer.current = setTimeout(() => {
      const passed = submitted === target && accuracy >= 50
      if (passed) {
        setStatus('success'); playTone(true)
        setTimeout(() => onComplete?.({ score, wpm, accuracy, errors, elapsed }), 700)
      } else {
        setStatus('error'); playTone(false)
        setTimeout(() => onFail?.({ score, wpm, accuracy, errors, elapsed }), 900)
      }
    }, 300)
  }, [status, typed, expected, accuracy, score, wpm, errors, elapsed, onComplete, onFail, playTone])

  const handleKeyDown = (e) => {
    if (status === 'executing' || status === 'success') { e.preventDefault(); return }
    if (e.key === 'Tab') {
      e.preventDefault()
      const el = e.currentTarget
      const start = el.selectionStart ?? typed.length
      const end = el.selectionEnd ?? typed.length
      const next = typed.slice(0, start) + '    ' + typed.slice(end)
      setTyped(next)
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 4 })
      if (status === 'idle') { setStatus('typing'); setStartTime(Date.now()) }
      return
    }
    if (e.key === 'Enter' && (!multiline || e.ctrlKey || e.metaKey)) {
      e.preventDefault(); submit(); return
    }
    if (e.key.length > 1 && !['Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key)) return
    if (status === 'idle') { setStatus('typing'); setStartTime(Date.now()) }
  }

  const handleChange = (e) => {
    if (status === 'executing' || status === 'success') return
    let value = e.target.value
    if (!multiline) value = value.replace(/[\r\n]/g, '')
    if (value.length > expected.length + 2) value = value.slice(0, expected.length + 2)
    setTyped(value)
    if (status === 'idle' && value.length) { setStatus('typing'); setStartTime(Date.now()) }
  }

  const renderExpected = () => expected.split('').map((char, i) => {
    const cls = i < typed.length ? (typed[i] === char ? 'text-termux-green' : 'text-termux-red bg-termux-red/20') : i === typed.length ? 'text-termux-cyan bg-termux-cyan/10' : 'text-gray-500'
    return <span key={i} className={cls}>{char === '\n' ? <><span className="text-gray-600">↵</span><br /></> : char === ' ' ? '\u00a0' : char}</span>
  })

  return <div className="w-full max-w-3xl mx-auto">
    <div className="flex items-center justify-between mb-4 px-2 text-xs font-mono">
      <div className="flex gap-4"><span className="text-gray-400">WPM <b className="text-termux-cyan">{wpm}</b></span><span className="text-gray-400">ACC <b className={accuracy >= 90 ? 'text-termux-green' : accuracy >= 70 ? 'text-termux-yellow' : 'text-termux-red'}>{accuracy}%</b></span><span className="text-gray-400">ERR <b className="text-termux-red">{errors}</b></span></div>
      <span className="text-gray-400">{elapsed}s / {exercise?.time_limit || 30}s</span>
    </div>
    <div className="progress-bar mb-6"><div className="progress-fill" style={{ width: `${Math.min(100, typed.length / Math.max(1, expected.length) * 100)}%` }} /></div>

    <motion.div className="terminal-window p-6 mb-4 relative" onClick={() => inputRef.current?.focus()} animate={status === 'error' ? { x: [-4, 4, -4, 4, 0] } : {}} transition={{ duration: 0.25 }}>
      {multiline ? <textarea ref={inputRef} value={typed} onChange={handleChange} onKeyDown={handleKeyDown} className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10 resize-none" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" /> : <input ref={inputRef} value={typed} onChange={handleChange} onKeyDown={handleKeyDown} className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" />}
      <div className="terminal-header mb-3 pointer-events-none"><div className="terminal-dot bg-red-500" /><div className="terminal-dot bg-yellow-500" /><div className="terminal-dot bg-green-500" /><span className="text-xs text-gray-500 ml-2 font-mono">coding_practice</span></div>
      <div className="font-mono text-lg leading-relaxed whitespace-pre-wrap break-all pointer-events-none"><span className="text-gray-600 mr-2">$</span>{renderExpected()}{typed.length >= expected.length && <span className="text-termux-yellow ml-1">{multiline ? '⌘ ENTER to run' : '↵ ENTER to run'}</span>}</div>
    </motion.div>

    <button onClick={() => setShowHint(v => !v)} className="text-xs text-termux-cyan/70 hover:text-termux-cyan mb-4">{showHint ? 'Hide Hint' : 'Show Hint'} 💡</button>
    <AnimatePresence>{showHint && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass-card p-4 mb-4 text-sm text-gray-300">{exercise?.hint || 'Type the code exactly as shown.'}</motion.div>}</AnimatePresence>

    <AnimatePresence>
      {status === 'executing' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="terminal-window p-4 text-termux-cyan font-mono">Running simulation...</motion.div>}
      {status === 'success' && <motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-4 border border-termux-green/40"><div className="text-termux-green font-bold mb-2">✓ SUCCESS</div>{(exercise?.expected_output || []).map((line, i) => <div key={i} className="font-mono text-sm text-termux-green/80">{line}</div>)}<div className="mt-3 text-xs text-gray-400">+{score} XP · {wpm} WPM · {accuracy}% accuracy</div></motion.div>}
      {status === 'error' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 border border-termux-red/40"><div className="text-termux-red font-bold mb-2">✕ TRY AGAIN</div><div className="text-sm text-gray-300">Your code does not match the target. Fix the highlighted characters and run it again.</div><div className="mt-3 text-xs text-gray-500">Typed: <span className="text-termux-red font-mono whitespace-pre-wrap">{lastSubmitted || '(empty)'}</span></div></motion.div>}
    </AnimatePresence>
  </div>
}
