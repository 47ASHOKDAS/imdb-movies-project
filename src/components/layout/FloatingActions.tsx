import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

const FloatingActions: React.FC = () => {
  const [showTop, setShowTop] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-10 right-10 z-[60] flex flex-col gap-4">
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="w-14 h-14 bg-brand text-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all group"
            title="Scroll to Top"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingActions;
