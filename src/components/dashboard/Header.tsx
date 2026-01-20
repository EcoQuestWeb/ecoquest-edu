import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, BarChart3, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileModal } from './ProfileModal';
import { PointsCounter } from '@/components/animations';
import { RunningAvatar } from '@/components/runner';

export function Header() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isDashboard = location.pathname === '/';

  return (
    <>
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50"
      >
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            {/* Logo with runner feel */}
            <motion.button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.span
                className="text-xl sm:text-2xl"
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                🌱
              </motion.span>
              <span className="font-display font-bold text-lg sm:text-xl text-foreground">EcoQuest</span>
              <motion.span
                className="hidden sm:inline-block text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Run for Earth!
              </motion.span>
            </motion.button>

            {/* Right side - User info & actions */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Points badge - coin style */}
              <motion.div 
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-eco-sun/30 to-eco-sun/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-eco-sun/30"
                whileHover={{ scale: 1.05 }}
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(251, 191, 36, 0)',
                    '0 0 10px 2px rgba(251, 191, 36, 0.3)',
                    '0 0 0 0 rgba(251, 191, 36, 0)',
                  ],
                }}
                transition={{ 
                  boxShadow: { duration: 2, repeat: Infinity },
                  scale: { type: 'spring', stiffness: 400 }
                }}
              >
                <motion.span
                  className="text-lg"
                  animate={{ rotateY: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  🪙
                </motion.span>
                <span className="font-bold text-eco-earth">
                  <PointsCounter value={profile?.points ?? 0} />
                </span>
                <span className="text-xs sm:text-sm text-eco-earth/70">pts</span>
              </motion.div>

              {/* Mobile points */}
              <motion.div 
                className="sm:hidden flex items-center gap-1 bg-eco-sun/20 px-2.5 py-1.5 rounded-full"
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  className="text-sm"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  🪙
                </motion.span>
                <span className="font-bold text-eco-earth text-xs">
                  <PointsCounter value={profile?.points ?? 0} />
                </span>
              </motion.div>

              {/* Progress button */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  onClick={() => navigate('/progress')}
                  variant="ghost"
                  size="icon"
                  className={`transition-colors h-9 w-9 sm:h-10 sm:w-10 ${isActive('/progress') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary'}`}
                  title="View Progress"
                >
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </motion.div>

              {/* Leaderboard button */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  onClick={() => navigate('/leaderboard')}
                  variant="ghost"
                  size="icon"
                  className={`transition-colors h-9 w-9 sm:h-10 sm:w-10 ${isActive('/leaderboard') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary'}`}
                  title="Leaderboard"
                >
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </motion.div>

              {/* Avatar - Only on dashboard - Running style */}
              {isDashboard && profile && (
                <motion.button
                  onClick={() => setShowProfileModal(true)}
                  className="relative cursor-pointer"
                  title="View Profile"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full gradient-nature flex items-center justify-center shadow-md">
                    <RunningAvatar size="sm" isRunning={false} />
                  </div>
                  {/* Online indicator */}
                  <motion.div
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-eco-leaf rounded-full border-2 border-card"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Profile Modal */}
      <ProfileModal 
        open={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </>
  );
}
