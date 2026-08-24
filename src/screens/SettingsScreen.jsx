import React from 'react'
import { motion } from 'framer-motion'
import { Globe, Volume2, Moon, Smartphone, Info, Github } from 'lucide-react'
import { useProgress } from '../utils/ProgressContext.jsx'

export default function SettingsScreen() {
  const { progress, updateSettings } = useProgress()
  const settings = progress.settings || { language: 'en', sound: true, theme: 'dark' }
  const lang = settings.language

  const toggleLanguage = () => {
    updateSettings({ language: settings.language === 'en' ? 'id' : 'en' })
  }

  const toggleSound = () => {
    updateSettings({ sound: !settings.sound })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-white">
        {lang === 'id' ? 'Pengaturan' : 'Settings'}
      </h1>

      <div className="space-y-3">
        {/* Language */}
        <motion.button
          onClick={toggleLanguage}
          className="w-full glass-card p-4 flex items-center justify-between hover:border-termux-cyan/30 transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-termux-cyan" />
            <div className="text-left">
              <div className="text-sm font-medium text-white">{lang === 'id' ? 'Bahasa' : 'Language'}</div>
              <div className="text-xs text-gray-500">{lang === 'id' ? 'Indonesia' : 'English'}</div>
            </div>
          </div>
          <div className={`w-10 h-6 rounded-full p-1 transition-colors ${settings.language === 'id' ? 'bg-termux-cyan' : 'bg-termux-border'}`}>
            <motion.div 
              className="w-4 h-4 bg-white rounded-full"
              animate={{ x: settings.language === 'id' ? 16 : 0 }}
            />
          </div>
        </motion.button>

        {/* Sound */}
        <motion.button
          onClick={toggleSound}
          className="w-full glass-card p-4 flex items-center justify-between hover:border-termux-cyan/30 transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-termux-green" />
            <div className="text-left">
              <div className="text-sm font-medium text-white">{lang === 'id' ? 'Suara' : 'Sound'}</div>
              <div className="text-xs text-gray-500">{settings.sound ? (lang === 'id' ? 'Aktif' : 'On') : (lang === 'id' ? 'Nonaktif' : 'Off')}</div>
            </div>
          </div>
          <div className={`w-10 h-6 rounded-full p-1 transition-colors ${settings.sound ? 'bg-termux-green' : 'bg-termux-border'}`}>
            <motion.div 
              className="w-4 h-4 bg-white rounded-full"
              animate={{ x: settings.sound ? 16 : 0 }}
            />
          </div>
        </motion.button>

        {/* Theme */}
        <div className="glass-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-termux-pink" />
            <div>
              <div className="text-sm font-medium text-white">{lang === 'id' ? 'Tema' : 'Theme'}</div>
              <div className="text-xs text-gray-500">Dark (Default)</div>
            </div>
          </div>
          <div className="w-10 h-6 rounded-full bg-termux-pink p-1">
            <div className="w-4 h-4 bg-white rounded-full translate-x-4" />
          </div>
        </div>

        {/* App Info */}
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-sm font-medium text-white">Termux Coding Learn</div>
              <div className="text-xs text-gray-500">v1.0.0 • Offline First</div>
            </div>
          </div>
          <div className="border-t border-termux-border/50 pt-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Info className="w-3.5 h-3.5" />
              <span>400+ lessons • 40 levels • Built with React + Vite</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Github className="w-3.5 h-3.5" />
            <span>by Iminthisera Team</span>
          </div>
        </div>

        {/* Reset Progress */}
        <button 
          onClick={() => {
            if (confirm(lang === 'id' ? 'Yakin reset semua progres?' : 'Reset all progress?')) {
              localStorage.clear()
              window.location.reload()
            }
          }}
          className="w-full glass-card p-4 text-termux-red hover:bg-termux-red/10 transition-colors text-sm font-medium"
        >
          {lang === 'id' ? 'Reset Semua Progres' : 'Reset All Progress'}
        </button>
      </div>
    </div>
  )
}
