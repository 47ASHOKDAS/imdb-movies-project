import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorMessage = ({ message, onRetry, className = "" }: ErrorMessageProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center p-8 text-center bg-current/5 rounded-3xl border border-current/10 backdrop-blur-md ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-xl font-bold mb-2">Oops! Something went wrong</h3>
      <p className="text-zinc-500 max-w-md mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand/20"
        >
          <RefreshCcw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </motion.div>
  );
};

export default ErrorMessage;
