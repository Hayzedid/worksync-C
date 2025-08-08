'use client';
import { motion } from 'framer-motion';

export default function LoadingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0FC2C0] via-[#0CABA8] to-[#023535] relative overflow-hidden">
      {/* Animated Blobs */}
      <motion.div
        className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full bg-[#0FC2C0] opacity-30 blur-3xl z-0"
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-140px] right-[-140px] w-[500px] h-[500px] rounded-full bg-[#008F8C] opacity-30 blur-3xl z-0"
        animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [0.8, 1.05, 0.95, 1], opacity: 1 }}
        transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div
          className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#0FC2C0] via-[#0CABA8] to-[#015958] shadow-2xl mb-8 animate-pulse"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
        <motion.h1
          className="text-4xl font-bold bg-gradient-to-r from-[#0FC2C0] to-[#015958] bg-clip-text text-transparent mb-4 drop-shadow"
          animate={{ letterSpacing: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        >
          Loading WorkSync...
        </motion.h1>
        <motion.p
          className="text-lg text-white/80"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          Getting your workspace ready with a dash of magic!
        </motion.p>
      </motion.div>
    </main>
  );
} 