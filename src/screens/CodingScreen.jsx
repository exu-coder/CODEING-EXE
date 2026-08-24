import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, RotateCcw, Copy, Check } from 'lucide-react'

const SNIPPETS = [
  { lang: 'Python', code: 'print("Hello, Termux!")\nname = "Coder"\nprint(f"Welcome, {name}")' },
  { lang: 'JavaScript', code: 'console.log("Hello, Node.js!");\nconst name = "Coder";\nconsole.log(`Welcome, ${name}`);' },
  { lang: 'Bash', code: '#!/bin/bash\necho "Hello, Terminal!"\nname="Coder"\necho "Welcome, $name"' },
]

export default function CodingScreen() {
  const [activeSnippet, setActiveSnippet] = useState(0)
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const runCode = () => {
    const snippet = SNIPPETS[activeSnippet]
    setOutput(`Running ${snippet.lang}...\n\n${snippet.code.split('\n').map((line, i) => `[${i+1}] ${line}`).join('\n')}\n\n✅ Execution successful!`)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(SNIPPETS[activeSnippet].code.replace(/\n/g, '\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-bold text-white">Code Playground</h1>

      <div className="flex gap-2">
        {SNIPPETS.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveSnippet(i)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeSnippet === i 
                ? 'bg-termux-cyan/20 text-termux-cyan border border-termux-cyan/40' 
                : 'bg-termux-card text-gray-400 border border-termux-border hover:text-gray-200'
            }`}
          >
            {s.lang}
          </button>
        ))}
      </div>

      <div className="terminal-window">
        <div className="terminal-header">
          <div className="terminal-dot bg-red-500" />
          <div className="terminal-dot bg-yellow-500" />
          <div className="terminal-dot bg-green-500" />
          <span className="text-xs text-gray-500 ml-2 font-mono">{SNIPPETS[activeSnippet].lang.toLowerCase()}_playground</span>
          <div className="flex-1" />
          <button onClick={copyCode} className="p-1 hover:bg-termux-border/30 rounded">
            {copied ? <Check className="w-3.5 h-3.5 text-termux-green" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
          </button>
        </div>
        <pre className="terminal-body text-sm">
          {SNIPPETS[activeSnippet].code}
        </pre>
      </div>

      <div className="flex gap-3">
        <button onClick={runCode} className="btn-primary flex items-center gap-2">
          <Play className="w-4 h-4" /> Run Code
        </button>
        <button onClick={() => setOutput('')} className="btn-secondary flex items-center gap-2">
          <RotateCcw className="w-4 h-4" /> Clear
        </button>
      </div>

      {output && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="terminal-window"
        >
          <div className="terminal-body text-sm text-termux-green">
            {output.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
