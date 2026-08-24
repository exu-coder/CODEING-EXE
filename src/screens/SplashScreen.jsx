import React from 'react'
import { motion } from 'framer-motion'

export default function SplashScreen({ onComplete }) {
  React.useEffect(() => {
    const timer = setTimeout(onComplete, 3000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="min-h-screen bg-termux-bg flex flex-col items-center justify-center grid-bg">
      {/* Kali Dragon Logo */}
      <motion.svg 
        width="120" 
        height="120" 
        viewBox="0 0 100 100" 
        fill="none"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 1, type: 'spring' }}
      >
        {/* Dragon body */}
        <motion.path 
          d="M20 80 Q30 50 50 45 Q70 40 80 20 Q75 35 60 50 Q50 60 55 75 Q60 85 75 90 Q55 85 45 75 Q35 65 20 80Z"
          stroke="#20c20e" 
          strokeWidth="2" 
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
        {/* Dragon head */}
        <motion.path 
          d="M80 20 Q85 15 90 18 Q88 22 85 25 Q82 23 80 20Z"
          fill="#20c20e"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        />
        {/* Wings */}
        <motion.path 
          d="M50 45 Q30 30 25 10 Q35 25 45 40 M50 45 Q70 30 85 15 Q75 28 60 42"
          stroke="#20c20e" 
          strokeWidth="1.5" 
          fill="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1 }}
        />
        {/* Eye */}
        <motion.circle 
          cx="85" cy="19" r="1.5" 
          fill="#ff0000"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        />
      </motion.svg>

      <motion.h1 
        className="text-3xl font-display font-bold text-kali-green mt-6 tracking-widest"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        TERMUX CODING
      </motion.h1>

      <motion.p 
        className="text-termux-cyan font-mono text-sm mt-2 tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        LEARN • TYPE • CODE
      </motion.p>

      <motion.div 
        className="mt-8 w-48 h-1 bg-termux-border rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div 
          className="h-full bg-gradient-to-r from-kali-green to-termux-cyan"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, delay: 0.5 }}
        />
      </motion.div>

      <motion.p 
        className="text-gray-600 text-xs mt-4 font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        Loading 400+ lessons...
      </motion.p>

      <motion.p 
        className="text-gray-700 text-xs mt-2 font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
      >
        by Iminthisera Team
      </motion.p>
    </div>
  )
}
