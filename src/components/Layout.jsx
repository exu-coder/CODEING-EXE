import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, BookOpen, Terminal, Code, User, Settings, 
  Menu, X, Trophy, Zap 
} from 'lucide-react'
import { useProgress } from '../utils/ProgressContext.jsx'

const navItems = [
  { path: '/', icon: Home, label: 'Home', label_id: 'Beranda' },
  { path: '/lessons', icon: BookOpen, label: 'Lessons', label_id: 'Pelajaran' },
  { path: '/terminal', icon: Terminal, label: 'Terminal', label_id: 'Terminal' },
  { path: '/coding', icon: Code, label: 'Coding', label_id: 'Coding' },
  { path: '/profile', icon: User, label: 'Profile', label_id: 'Profil' },
]

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { progress } = useProgress()
  const location = useLocation()
  const lang = progress.settings?.language || 'en'

  return (
    <div className="min-h-screen bg-termux-bg grid-bg flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 glass-card border-b border-termux-border/50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
                <path d="M20 80 Q30 50 50 45 Q70 40 80 20 Q75 35 60 50 Q50 60 55 75 Q60 85 75 90 Q55 85 45 75 Q35 65 20 80Z" stroke="#20c20e" strokeWidth="3" fill="none"/>
                <circle cx="85" cy="19" r="2" fill="#ff0000"/>
              </svg>
              <span className="font-display font-bold text-kali-green text-sm tracking-wider hidden sm:block">
                TERMUX LEARN
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-xs">
              <Zap className="w-3.5 h-3.5 text-termux-yellow" />
              <span className="text-termux-yellow font-mono font-bold">{progress.xp || 0}</span>
              <span className="text-gray-500">XP</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Trophy className="w-3.5 h-3.5 text-termux-cyan" />
              <span className="text-termux-cyan font-mono font-bold">{progress.completed?.length || 0}</span>
              <span className="text-gray-500">Done</span>
            </div>
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-termux-border/30 transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5 text-gray-300" /> : <Menu className="w-5 h-5 text-gray-300" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card border-b border-termux-border/50 overflow-hidden"
          >
            <div className="max-w-4xl mx-auto px-4 py-2 space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    location.pathname === item.path 
                      ? 'bg-termux-cyan/10 text-termux-cyan' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-termux-border/20'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{lang === 'id' ? item.label_id : item.label}</span>
                </Link>
              ))}
              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-termux-border/20 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">{lang === 'id' ? 'Pengaturan' : 'Settings'}</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="sticky bottom-0 z-50 glass-card border-t border-termux-border/50 sm:hidden">
        <div className="flex items-center justify-around h-16">
          {navItems.slice(0, 4).map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors ${
                location.pathname === item.path 
                  ? 'text-termux-cyan' 
                  : 'text-gray-500'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px]">{lang === 'id' ? item.label_id : item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
