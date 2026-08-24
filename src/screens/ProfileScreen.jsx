import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Zap, Target, Clock, TrendingUp, Award } from 'lucide-react'
import { useProgress } from '../utils/ProgressContext.jsx'

export default function ProfileScreen() {
  const { progress } = useProgress()
  const lang = progress.settings?.language || 'en'
  const completed = progress.completed?.length || 0
  const totalExercises = 400
  const percent = Math.round((completed / totalExercises) * 100)

  const stats = [
    { icon: Zap, label: 'Total XP', label_id: 'Total XP', value: progress.xp || 0, color: 'text-termux-yellow' },
    { icon: Target, label: 'Completed', label_id: 'Selesai', value: completed, color: 'text-termux-green' },
    { icon: Trophy, label: 'Accuracy', label_id: 'Akurasi', value: '87%', color: 'text-termux-cyan' },
    { icon: Clock, label: 'Time Spent', label_id: 'Waktu', value: '12h 30m', color: 'text-termux-pink' },
  ]

  const achievements = [
    { icon: Award, name: 'First Command', desc: 'Complete your first exercise', unlocked: completed >= 1 },
    { icon: Trophy, name: 'Level 10', desc: 'Complete Level 10', unlocked: completed >= 100 },
    { icon: Zap, name: 'Speed Demon', desc: 'Type at 80+ WPM', unlocked: false },
    { icon: Target, name: 'Perfect Run', desc: '100% accuracy on a level', unlocked: false },
    { icon: TrendingUp, name: 'Halfway There', desc: 'Complete 200 exercises', unlocked: completed >= 200 },
    { icon: Award, name: 'Master Coder', desc: 'Complete all 400 exercises', unlocked: completed >= 400 },
  ]

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="glass-card p-6 text-center neon-border">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-kali-green/30 to-termux-cyan/30 mx-auto mb-4 flex items-center justify-center border-2 border-kali-green/50">
          <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
            <path d="M20 80 Q30 50 50 45 Q70 40 80 20 Q75 35 60 50 Q50 60 55 75 Q60 85 75 90 Q55 85 45 75 Q35 65 20 80Z" stroke="#20c20e" strokeWidth="3" fill="none"/>
            <circle cx="85" cy="19" r="2" fill="#ff0000"/>
          </svg>
        </div>
        <h2 className="text-xl font-display font-bold text-white">Termux Coder</h2>
        <p className="text-gray-400 text-sm">Level {Math.floor((progress.xp || 0) / 100) + 1} • {lang === 'id' ? 'Pemula' : 'Beginner'}</p>

        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">{lang === 'id' ? 'Progres' : 'Progress'}</span>
            <span className="text-termux-cyan font-mono">{percent}%</span>
          </div>
          <div className="progress-bar">
            <motion.div 
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-4 text-center">
            <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
            <div className={`text-xl font-bold ${stat.color} font-mono`}>{stat.value}</div>
            <div className="text-xs text-gray-500">{lang === 'id' ? stat.label_id : stat.label}</div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div>
        <h3 className="text-lg font-display font-bold text-white mb-3">
          {lang === 'id' ? 'Pencapaian' : 'Achievements'}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((ach, i) => (
            <div 
              key={i} 
              className={`glass-card p-3 ${ach.unlocked ? 'border-termux-yellow/30' : 'opacity-40'}`}
            >
              <ach.icon className={`w-5 h-5 ${ach.unlocked ? 'text-termux-yellow' : 'text-gray-600'} mb-2`} />
              <div className="text-sm font-semibold text-white">{ach.name}</div>
              <div className="text-[10px] text-gray-500">{ach.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
