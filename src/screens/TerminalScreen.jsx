import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Trash2, Copy, Save } from 'lucide-react'

const COMMANDS = {
  'help': { output: ['Available commands:', '  ls, cd, pwd, mkdir, rm, cp, mv, cat, clear', '  pkg install, pkg update, pkg upgrade', '  git, python, node, npm', 'Type any command to practice!'] },
  'ls': { output: ['file1.txt  script.py  projects/  downloads/'] },
  'ls -la': { output: ['total 24', 'drwxr-xr-x  5 u0_a241 u0_a241 4096 Jul 12 10:20 .', 'drwxr-xr-x 10 u0_a241 u0_a241 4096 Jul 12 10:15 ..', '-rw-r--r--  1 u0_a241 u0_a241  220 Jul 12 10:15 .bashrc', 'drwxr-xr-x  2 u0_a241 u0_a241 4096 Jul 12 10:20 projects'] },
  'pwd': { output: ['/data/data/com.termux/files/home'] },
  'whoami': { output: ['u0_a241'] },
  'uname -a': { output: ['Linux localhost 4.19.113-android-g92a #1 SMP PREEMPT aarch64 Android'] },
  'clear': { output: [], clear: true },
  'pkg update': { output: ['Hit:1 https://packages.termux.dev/apt/termux-main stable InRelease', 'Reading package lists... Done', 'Building dependency tree... Done'] },
  'pkg install python': { output: ['Unpacking python (3.11.4)...', 'Setting up python (3.11.4)...', 'Installation complete!'] },
  'python --version': { output: ['Python 3.11.4'] },
  'node --version': { output: ['v20.5.0'] },
  'git --version': { output: ['git version 2.41.0'] },
}

export default function TerminalScreen() {
  const [history, setHistory] = useState([
    { type: 'system', text: 'Termux Simulator v1.0 - Type commands to practice' },
    { type: 'system', text: 'Type "help" for available commands' },
  ])
  const [input, setInput] = useState('')
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [commandHistory, setCommandHistory] = useState([])
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const executeCommand = (cmd) => {
    const trimmed = cmd.trim()
    if (!trimmed) return

    setCommandHistory(prev => [...prev, trimmed])
    setHistoryIndex(-1)

    const newHistory = [...history, { type: 'input', text: `$ ${trimmed}` }]

    const matched = Object.entries(COMMANDS).find(([key]) => trimmed.startsWith(key))

    if (matched) {
      const [, data] = matched
      if (data.clear) {
        setHistory([{ type: 'system', text: 'Terminal cleared.' }])
      } else {
        setHistory([...newHistory, ...data.output.map(line => ({ type: 'output', text: line }))])
      }
    } else {
      setHistory([...newHistory, { type: 'error', text: `Command not found: ${trimmed}` }, { type: 'output', text: 'Type "help" for available commands' }])
    }

    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1)
      setHistoryIndex(newIndex)
      if (commandHistory[commandHistory.length - 1 - newIndex]) {
        setInput(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const newIndex = Math.max(historyIndex - 1, -1)
      setHistoryIndex(newIndex)
      setInput(newIndex === -1 ? '' : commandHistory[commandHistory.length - 1 - newIndex])
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-display font-bold text-white">Terminal Simulator</h1>

      <div className="terminal-window" style={{ minHeight: '400px' }}>
        <div className="terminal-header">
          <div className="terminal-dot bg-red-500" />
          <div className="terminal-dot bg-yellow-500" />
          <div className="terminal-dot bg-green-500" />
          <span className="text-xs text-gray-500 ml-2 font-mono">termux_simulator.sh</span>
          <div className="flex-1" />
          <button onClick={() => setHistory([{ type: 'system', text: 'Terminal cleared.' }])} className="p-1 hover:bg-termux-border/30 rounded">
            <Trash2 className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>

        <div className="terminal-body" style={{ minHeight: '350px' }}>
          {history.map((entry, i) => (
            <div key={i} className={`
              ${entry.type === 'input' ? 'text-termux-cyan' : ''}
              ${entry.type === 'error' ? 'text-termux-red' : ''}
              ${entry.type === 'system' ? 'text-gray-500 italic' : ''}
              ${entry.type === 'output' ? 'text-gray-300' : ''}
            `}>
              {entry.text}
            </div>
          ))}

          <div className="flex items-center gap-2 mt-2">
            <span className="text-termux-green">~ $</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-gray-100 font-mono outline-none"
              placeholder="Type a command..."
              autoFocus
            />
          </div>
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['ls', 'pwd', 'whoami', 'pkg update', 'clear', 'help'].map(cmd => (
          <button
            key={cmd}
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
