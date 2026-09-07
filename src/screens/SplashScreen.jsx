import React from 'react'
import { motion } from 'framer-motion'
import logo from '../assets/icons/logo.png'

export default function SplashScreen({ onComplete }) {
  React.useEffect(() => {
    const timer = setTimeout(onComplete, 2800)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Soft green glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(32,194,14,0.12)_0%,transparent_60%)]" />

      <motion.img
        src={logo}
        alt="TermuxLearn"
        className="w-36 h-36 sm:w-44 sm:h-44 rounded-[28%] shadow-[0_0_40px_rgba(32,194,14,0.35)] object-cover relative z-10"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, type: 'spring' }}
      />

      <motion.h1
        className="text-3xl sm:text-4xl font-display font-bold mt-6 tracking-tight relative z-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <span className="text-white">Termux</span>
        <span className="text-[#20c20e]">Learn</span>
      </motion.h1>

      <motion.p
        className="text-gray-400 font-mono text-sm mt-2 tracking-[0.2em] relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
      >
        LEARN · TYPE · EXECUTE
      </motion.p>

      <motion.div
        className="mt-8 w-48 h-1 bg-zinc-800 rounded-full overflow-hidden relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-[#20c20e] to-cyan-400"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.8, delay: 0.4, ease: 'easeInOut' }}
        />
      </motion.div>

      <motion.p
        className="text-zinc-600 text-xs mt-4 font-mono relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        Loading lessons…
      </motion.p>
    </div>
  )
}
