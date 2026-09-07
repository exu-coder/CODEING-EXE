import React, { useState, useRef, useEffect } from 'react'
import { Trash2 } from 'lucide-react'

const COMMANDS = {
  help: {
    output: [
      'Available practice commands:',
      '  ls, ls -la, cd, pwd, mkdir, rm, cp, mv, cat, clear, whoami',
      '  pkg update, pkg upgrade, pkg install <pkg>',
      '  python --version, node --version, git --version',
      '  uname -a, date, echo <text>',
      'Type any command to practice safely (simulated).'
    ]
  },
  ls: { output: ['file1.txt  script.py  projects/  downloads/'] },
  'ls -la': {
    output: [
      'total 24',
      'drwxr-xr-x  5 u0_a241 u0_a241 4096 Jul 12 10:20 .',
      'drwxr-xr-x 10 u0_a241 u0_a241 4096 Jul 12 10:15 ..',
      '-rw-r--r--  1 u0_a241 u0_a241  220 Jul 12 10:15 .bashrc',
      'drwxr-xr-x  2 u0_a241 u0_a241 4096 Jul 12 10:20 projects'
    ]
  },
  pwd: { output: ['/data/data/com.termux/files/home'] },
  whoami: { output: ['u0_a241'] },
  'uname -a': { output: ['Linux localhost 4.19.113-android-g92a #1 SMP PREEMPT aarch64 Android'] },
  clear: { output: [], clear: true },
  'pkg update': {
    output: [
      'Hit:1 https://packages.termux.dev/apt/termux-main stable InRelease',
      'Reading package lists... Done',
      'Building dependency tree... Done'
    ]
  },
  'pkg upgrade': { output: ['Calculating upgrade... Done', '0 upgraded, 0 newly installed.'] },
  'pkg install python': {
    output: ['Unpacking python (3.11.4)...', 'Setting up python (3.11.4)...', 'Installation complete!']
  },
  'python --version': { output: ['Python 3.11.4'] },
  'node --version': { output: ['v20.5.0'] },
  'git --version': { output: ['git version 2.41.0'] },
  date: { output: [new Date().toString()] },
  cd: { output: [''] },
  'cd ~': { output: [''] },
  'cd ..': { output: [''] },
  mkdir: { output: [''] },
  cat: { output: ['(empty file or file not found in simulator)'] }
}

function resolveCommand(trimmed) {
  // Exact match first
  if (COMMANDS[trimmed]) return COMMANDS[trimmed]
  // Prefix / pattern matches
  if (trimmed.startsWith('echo ')) {
    return { output: [trimmed.slice(5)] }
  }
  if (trimmed.startsWith('pkg install ')) {
    const pkg = trimmed.slice('pkg install '.length).trim() || 'package'
    return {
      output: [`Unpacking ${pkg}...`, `Setting up ${pkg}...`, 'Installation complete!']
    }
  }
  if (trimmed.startsWith('mkdir ')) return { output: [''] }
  if (trimmed.startsWith('cd ')) return { output: [''] }
  if (trimmed.startsWith('cat ')) return { output: [`# contents of ${trimmed.slice(4)} (simulated)`] }
  if (trimmed.startsWith('rm ')) return { output: [''] }
  if (trimmed.startsWith('ls')) return COMMANDS.ls
  // Longest key prefix
  const keys = Object.keys(COMMANDS).sort((a, b) => b.length - a.length)
  for (const key of keys) {
    if (trimmed === key || trimmed.startsWith(key + ' ')) return COMMANDS[key]
  }
  return null
}

export default function TerminalScreen() {
  const [history, setHistory] = useState([
    { type: 'system', text: 'Termux Simulator — practice commands safely' },
    { type: 'system', text: 'Type "help" for available commands' }
  ])
  const [input, setInput] = useState('')
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [commandHistory, setCommandHistory] = useState([])
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const executeCommand = (cmd) => {
    const trimmed = (cmd || '').trim()
    if (!trimmed) return

    setCommandHistory((prev) => [...prev, trimmed])
    setHistoryIndex(-1)

    const matched = resolveCommand(trimmed)

    if (matched?.clear) {
      setHistory([{ type: 'system', text: 'Terminal cleared.' }])
      setInput('')
      return
    }

    const newHistory = [...history, { type: 'input', text: `$ ${trimmed}` }]

    if (matched) {
      const lines = (matched.output || []).filter((l) => l !== undefined)
      setHistory([
        ...newHistory,
        ...lines.map((line) => ({ type: 'output', text: line === '' ? ' ' : line }))
      ])
    } else {
      setHistory([
        ...newHistory,
        { type: 'error', text: `Command not found: ${trimmed}` },
        { type: 'output', text: 'Type "help" for available commands' }
      ])
    }

    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      executeCommand(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!commandHistory.length) return
      const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1)
      setHistoryIndex(newIndex)
      setInput(commandHistory[commandHistory.length - 1 - newIndex] || '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const newIndex = Math.max(historyIndex - 1, -1)
      setHistoryIndex(newIndex)
      setInput(newIndex === -1 ? '' : commandHistory[commandHistory.length - 1 - newIndex] || '')
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault()
      setInput('')
      setHistory((h) => [...h, { type: 'system', text: '^C' }])
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-display font-bold text-white">Terminal Simulator</h1>
        <p className="text-sm text-gray-500 mt-1">Practice Termux commands offline — nothing is executed on your device.</p>
      </div>

      <div className="terminal-window" style={{ minHeight: '400px' }}>
        <div className="terminal-header">
          <div className="terminal-dot bg-red-500" />
          <div className="terminal-dot bg-yellow-500" />
          <div className="terminal-dot bg-green-500" />
          <span className="text-xs text-gray-500 ml-2 font-mono">termux_simulator</span>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => setHistory([{ type: 'system', text: 'Terminal cleared.' }])}
            className="p-1.5 hover:bg-termux-border/30 rounded"
            title="Clear"
          >
            <Trash2 className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>

        <div
          className="terminal-body font-mono text-sm"
          style={{ minHeight: '350px' }}
          onClick={() => inputRef.current?.focus()}
        >
          {history.map((entry, i) => (
            <div
              key={i}
              className={`
                ${entry.type === 'input' ? 'text-termux-cyan' : ''}
                ${entry.type === 'error' ? 'text-termux-red' : ''}
                ${entry.type === 'system' ? 'text-gray-500 italic' : ''}
                ${entry.type === 'output' ? 'text-gray-300' : ''}
                whitespace-pre-wrap break-all
              `}
            >
              {entry.text}
            </div>
          ))}

          <div className="flex items-center gap-2 mt-2">
            <span className="text-termux-green shrink-0">~ $</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-gray-100 font-mono outline-none caret-termux-green"
              placeholder="Type a command..."
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
              autoFocus
            />
          </div>
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['ls', 'pwd', 'whoami', 'pkg update', 'help', 'clear'].map((cmd) => (
          <button
            key={cmd}
            type="button"
            onClick={() => executeCommand(cmd)}
            className="px-3 py-1.5 text-xs bg-termux-card border border-termux-border rounded-lg text-gray-300 hover:border-termux-cyan/40 transition-colors"
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  )
}
