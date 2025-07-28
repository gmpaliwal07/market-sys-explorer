"use client";
import {  Moon, Sun, User } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { setTheme } = useTheme();
  const handleToggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-16 border-b px-4 sm:px-6 flex items-center justify-between bg-background"
    >
      <div className="flex items-center gap-2 sm:gap-4">


        <motion.h1
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className=" ml-15 sm:ml-0 text-xl sm:text-3xl md:text-4xl font-bold font-title" 
        >
          Market  Analyzer
        </motion.h1>
      </div>

      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex items-center gap-2 sm:gap-4"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={handleToggleTheme}
            size="icon"
            variant="outline"
            className="relative"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key="sun"
                initial={{ rotate: -45, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 45, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Sun className="h-5 w-5 dark:hidden" />
              </motion.div>
              <motion.div
                key="moon"
                initial={{ rotate: 45, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -45, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute"
              >
                <Moon className="h-5 w-5 hidden dark:block" />
              </motion.div>
            </AnimatePresence>
          </Button>
        </motion.div>

        <motion.div

          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button variant="ghost" size="icon" className="relative">
            <User className="h-5 w-5" />
          </Button>
        </motion.div>
      </motion.div>
    </motion.header>
  );
}