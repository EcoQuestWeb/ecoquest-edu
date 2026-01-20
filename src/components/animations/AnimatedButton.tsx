import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'default' | 'success' | 'danger';
}

export function AnimatedButton({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  type = 'button',
  variant = 'default'
}: AnimatedButtonProps) {
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    success: 'bg-accent text-accent-foreground hover:bg-accent/90',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold',
        'ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        'px-6 py-3 min-h-[48px] touch-manipulation',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </motion.button>
  );
}
