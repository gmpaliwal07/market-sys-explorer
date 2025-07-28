"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  Calendar,
  ChevronLeft,
  
  GitCompare,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";

const links = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Performance", href: "/performance", icon: BarChart3 },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Compare", href: "/compare", icon: GitCompare }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Handle escape key for mobile
  useEffect(() => {
    const handleEscape = (e : KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileOpen(false);
      }
    };

    if (isMobileOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  const sidebarVariants = {
    expanded: {
      width: "16rem",
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 40
      }
    },
    collapsed: {
      width: "4rem",
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 40
      }
    }
  };

  const linkVariants = {
    hover: {
      x: 4,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        type: "spring" as const,
        stiffness: 600,
        damping: 30
      }
    }
  };

  const iconVariants = {
    hover: {
      scale: 1.1,
      rotate: [0, -10, 10, 0],
      transition: {
        scale: {
          type: "spring" as const,
          stiffness: 400,
          damping: 25
        },
        rotate: {
          duration: 0.5
        }
      }
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.div 
        className="md:hidden fixed top-4 left-4 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileOpen(true)}
          className="bg-background border shadow-md"
        >
          <Menu className="w-4 h-4" />
        </Button>
      </motion.div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={isCollapsed ? "collapsed" : "expanded"}
        initial="expanded"
        className="hidden md:flex bg-background border-r   flex-col overflow-hidden font-text relative m-4 itmes-center "
      >
        {/* Collapse Button */}
        <motion.div 
          className="absolute right-3 top-4 z-10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            variant="outline"
    
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="bg-background border shadow-md rounded-full w-8 h-8 p-0"
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <ChevronLeft className="w-8 h-8" />
            </motion.div>
          </Button>
        </motion.div>

        <nav className="flex flex-col gap-6 mt-20 p-2 ">
          {links.map(({ name, href, icon: Icon }, index : number) => (
            <motion.div
              key={href}
              variants={linkVariants}
              whileHover="hover"
              whileTap="tap"
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              className="relative"
            >
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-lg font-medium hover:bg-muted transition-colors relative overflow-hidden",
                  pathname === href ? "bg-muted" : "bg-transparent"
                )}
              >
                {/* Active indicator */}
                {pathname === href && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r"
                    transition={{ type: "spring", stiffness: 400, damping: 40 }}
                  />
                )}

                {/* Hover effect */}
                {hoveredIndex === index && (
                  <motion.div
                    layoutId="hoverEffect"
                    className="absolute inset-0 bg-muted/50 rounded-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  />
                )}

                <motion.div
                  variants={iconVariants}
                  whileHover="hover"
                  className="relative z-10 flex-shrink-1"
                >
                  <Icon className="w-6 h-6" />
                </motion.div>

                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ 
                        duration: 0.2,
                        delay: isCollapsed ? 0 : 0.1
                      }}
                      className="relative z-10 whitespace-nowrap"
                    >
                      {name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* Tooltip for collapsed state */}
              <AnimatePresence>
                {isCollapsed && hoveredIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, x: -10, scale: 0.8 }}
                    animate={{ opacity: 1, x: 10, scale: 1 }}
                    exit={{ opacity: 0, x: -10, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-sm shadow-md border z-50 whitespace-nowrap"
                  >
                    {name}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </nav>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 40 
            }}
            className="md:hidden fixed left-0 top-0 h-full w-64 bg-background border-r z-50 p-4 flex flex-col font-text shadow-xl"
          >
            {/* Close Button */}
            <motion.div 
              className="flex justify-end mb-4"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileOpen(false)}
                className="rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>

            <nav className="flex flex-col gap-2">
              {links.map(({ name, href, icon: Icon }, index) => (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    delay: 0.1 + (index * 0.05),
                    type: "spring",
                    stiffness: 400,
                    damping: 25
                  }}
                  variants={linkVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onHoverStart={() => setHoveredIndex(index)}
                  onHoverEnd={() => setHoveredIndex(null)}
                  className="relative"
                >
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-lg font-medium hover:bg-muted transition-colors relative overflow-hidden",
                      pathname === href ? "bg-muted" : "bg-transparent"
                    )}
                  >
                    {/* Active indicator */}
                    {pathname === href && (
                      <motion.div
                        layoutId="mobileActiveTab"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r"
                        transition={{ type: "spring", stiffness: 400, damping: 40 }}
                      />
                    )}

                    {/* Hover effect */}
                    {hoveredIndex === index && (
                      <motion.div
                        layoutId="mobileHoverEffect"
                        className="absolute inset-0 bg-muted/50 rounded-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      />
                    )}

                    <motion.div
                      variants={iconVariants}
                      whileHover="hover"
                      className="relative z-10"
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>
                    <span className="relative z-10">{name}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}