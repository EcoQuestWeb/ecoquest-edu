import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface GameCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  path: string;
  color: 'green' | 'blue' | 'orange' | 'purple' | 'teal' | 'pink' | 'yellow';
}

const colorClasses = {
  green: 'from-eco-leaf to-primary',
  blue: 'from-eco-sky to-blue-500',
  orange: 'from-eco-sun to-orange-500',
  purple: 'from-purple-400 to-purple-600',
  teal: 'from-teal-400 to-teal-600',
  pink: 'from-pink-400 to-pink-600',
  yellow: 'from-yellow-400 to-yellow-600',
};

const bgColorClasses = {
  green: 'bg-eco-leaf/10',
  blue: 'bg-eco-sky/20',
  orange: 'bg-eco-sun/20',
  purple: 'bg-purple-100 dark:bg-purple-900/30',
  teal: 'bg-teal-100 dark:bg-teal-900/30',
  pink: 'bg-pink-100 dark:bg-pink-900/30',
  yellow: 'bg-yellow-100 dark:bg-yellow-900/30',
};

export function GameCard({ title, description, icon, path, color }: GameCardProps) {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate(path)}
      className="w-full text-left group touch-manipulation"
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <div className="eco-card transition-all duration-300 overflow-hidden relative h-full">
        {/* Gradient accent bar with animation */}
        <motion.div 
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses[color]}`}
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
        
        {/* Hover glow effect */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${colorClasses[color]} blur-xl -z-10`} />
        
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Icon with bounce effect */}
          <motion.div 
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${bgColorClasses[color]} flex items-center justify-center shrink-0`}
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
          >
            {icon}
          </motion.div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-base sm:text-lg text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
          
          {/* Arrow with slide animation */}
          <motion.div 
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
            whileHover={{ x: 4 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </div>
      </div>
    </motion.button>
  );
}
