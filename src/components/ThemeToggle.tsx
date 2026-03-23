"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="fixed bottom-6 right-6 sm:bottom-auto sm:top-6 sm:right-6 z-[60]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="glass-effect-light dark:glass-effect-dark p-1.5 sm:p-2 rounded-2xl flex items-center gap-2 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden"
      >
        <button
          onClick={toggleTheme}
          className="relative group flex items-center justify-between w-16 h-8 sm:w-20 sm:h-10 p-1 rounded-full skeuo-input cursor-pointer focus:outline-none overflow-hidden transition-all duration-300"
          aria-label="Toggle Night Mode"
        >
          {/* Animated Background Indicator */}
          <motion.div
            className="absolute top-1 left-1 bottom-1 w-6 sm:w-8 rounded-full z-0 skeuo-button-primary"
            animate={{
              x: theme === "dark" ? (typeof window !== 'undefined' && window.innerWidth < 640 ? 32 : 40) : 0,
              backgroundColor: theme === "dark" ? "#1e3a8a" : "#3b82f6",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />

          {/* Icons */}
          <div className="flex w-full items-center justify-around z-10">
            <motion.div
              animate={{
                scale: theme === "light" ? 1.1 : 0.8,
                color: theme === "light" ? "#f59e0b" : "#94a3b8",
              }}
            >
              <Sun className="w-4 h-4 sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
            </motion.div>
            <motion.div
              animate={{
                scale: theme === "dark" ? 1.1 : 0.8,
                color: theme === "dark" ? "#e0e7ff" : "#94a3b8",
              }}
            >
              <Moon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
            </motion.div>
          </div>

          {/* Hover Glow Effect */}
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </button>
      </motion.div>
    </div>
  );
}
