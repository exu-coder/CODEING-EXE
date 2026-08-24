import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Keyboard, Timer, Target, TrendingUp } from 'lucide-react'

export default function PracticeScreen() {
  const modes = [
    { icon: Keyboard, title: 'Command Typing', title_id: 'Ketik Perintah', desc: 'Practice typing Termux commands with shadow text', desc_id: 'Latih ketik perintah Termux dengan shadow text', path: '/lessons', color: 'cyan' },
    { icon: Timer, title: 'Speed Challenge', title_id: 'Tantangan Kecepatan', desc: 'Type as fast as you can with time limits', desc_id: 'Ketik secepat mungkin dengan batas waktu', path: '/lessons', color: 'yellow' },
    { icon: Target, title: 'Accuracy Mode', title_id: 'Mode Akurasi', desc: 'Focus on 100% accuracy, no error tolerance', desc_id: 'Fokus pada akurasi 100%, tanpa toleransi error', path: '/lessons', color: 'green' },
    { icon: TrendingUp, title: 'Daily Streak', title_id: 'Streak Harian', desc: 'Complete lessons daily to maintain your streak', desc_id: 'Selesaikan pelajaran harian untuk pertahankan streak', path: '/lessons', color: 'pink' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-white">Practice Modes</h1>
      <div className="grid gap-4">
        {modes.map((mode, i) => (
          <Link key={i} to={mode.path}>
            <motion.div
              className={`glass-card p-5 flex items-center gap-4 cursor-pointer hover:border-${mode.color === 'cyan' ? 'termux-cyan' : mode.color === 'yellow' ? 'termux-yellow' : mode.color === 'green' ? 'termux-green' : 'termux-pink'}/40 transition-colors`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                mode.color === 'cyan' ? 'bg-termux-cyan/10' : 
                mode.color === 'yellow' ? 'bg-termux-yellow/10' : 
                mode.color === 'green' ? 'bg-termux-green/10' : 'bg-termux-pink/10'
              }`}>
                <mode.icon className={`w-6 h-6 ${
                  mode.color === 'cyan' ? 'text-termux-cyan' : 
                  mode.color === 'yellow' ? 'text-termux-yellow' : 
                  mode.color === 'green' ? 'text-termux-green' : 'text-termux-pink'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{mode.title}</h3>
                <p className="text-sm text-gray-400">{mode.desc}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  )
}
