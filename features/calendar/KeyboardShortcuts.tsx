import { ChevronLeft, ChevronRight, Minus, Plus, Space } from 'lucide-react'
import React from 'react'
import { motion } from 'motion/react'

export default function KeyBoardShortcuts() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    hover: { scale: 1.05, transition: { duration: 0.2 } }
  }

  return (
    <motion.div
      className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 font-logo"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col sm:flex-row items-center justify-center space-x-0 sm:space-x-4 md:space-x-6 space-y-2 sm:space-y-0 text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-2 sm:gap-0">
        <motion.div className="flex items-center space-x-1" variants={itemVariants} whileHover="hover">
          <kbd className="px-1.5 sm:px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-[10px] sm:text-xs flex items-center">
            <ChevronLeft size={14} />
          </kbd>
          <kbd className="px-1.5 sm:px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-[10px] sm:text-xs flex items-center">
            <ChevronRight size={14} />
          </kbd>
          <span className="text-[10px] sm:text-xs">Navigate</span>
        </motion.div>
        <motion.div className="flex items-center space-x-1" variants={itemVariants} whileHover="hover">
          <kbd className="px-1.5 sm:px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-[10px] sm:text-xs flex items-center">
            <Space size={14} />
          </kbd>
          <span className="text-[10px] sm:text-xs">Toggle Stats</span>
        </motion.div>
        <motion.div className="flex items-center space-x-1" variants={itemVariants} whileHover="hover">
          <kbd className="px-1.5 sm:px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-[10px] sm:text-xs flex items-center">
            Esc
          </kbd>
          <span className="text-[10px] sm:text-xs">Clear Selection</span>
        </motion.div>
        <motion.div className="flex items-center space-x-1" variants={itemVariants} whileHover="hover">
          <kbd className="px-1.5 sm:px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-[10px] sm:text-xs flex items-center">
            <Plus size={14} />
          </kbd>
          <kbd className="px-1.5 sm:px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-[10px] sm:text-xs flex items-center">
            <Minus size={14} />
          </kbd>
          <span className="text-[10px] sm:text-xs">Zoom</span>
        </motion.div>
      </div>
    </motion.div>
  )
}