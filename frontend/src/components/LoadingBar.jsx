import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function LoadingBar() {
  const { dashboardData } = useAuth();
  const isRefreshing = dashboardData?.isRefreshing;

  return (
    <AnimatePresence>
      {isRefreshing && (
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ 
            scaleX: [0, 0.3, 0.7, 0.9],
            opacity: 1 
          }}
          exit={{ 
            scaleX: 1,
            opacity: 0,
            transition: { duration: 0.3 }
          }}
          transition={{ 
            duration: 2,
            times: [0, 0.1, 0.5, 1],
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 0.5
          }}
          className="fixed top-0 left-0 right-0 h-1 bg-brand shadow-glow-sm z-[9999] origin-left"
        />
      )}
    </AnimatePresence>
  );
}
