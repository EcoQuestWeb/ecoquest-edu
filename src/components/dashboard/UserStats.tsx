import { motion } from 'framer-motion';
import { Trophy, GraduationCap, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PointsCounter } from '@/components/animations';

export function UserStats() {
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <motion.div 
      className="eco-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <motion.div 
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl gradient-nature flex items-center justify-center shadow-glow"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
        </motion.div>
        <div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground">
            Hello, {profile.name}! 👋
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Ready for today's eco-adventure?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Class */}
        <motion.div 
          className="bg-muted/50 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-eco-sky/30 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-eco-forest" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Class</p>
            <p className="font-bold text-base sm:text-lg text-foreground">{profile.class}</p>
          </div>
        </motion.div>

        {/* Points */}
        <motion.div 
          className="bg-gradient-to-br from-eco-sun/20 to-eco-sun/5 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <motion.div 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-eco-sun/30 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-eco-earth" />
          </motion.div>
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Points</p>
            <p className="font-bold text-base sm:text-lg text-foreground">
              <PointsCounter value={profile.points} />
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
