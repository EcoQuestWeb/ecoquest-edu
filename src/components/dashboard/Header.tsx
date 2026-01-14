import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trophy, BarChart3, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileModal } from './ProfileModal';

export function Header() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isDashboard = location.pathname === '/';

  return (
    <>
      <header className="bg-card/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="font-display font-bold text-xl text-foreground">🌱 EcoQuest</span>
            </button>

            {/* Right side - User info & actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Points badge */}
              <div className="hidden sm:flex items-center gap-2 bg-eco-sun/20 px-4 py-2 rounded-full">
                <Trophy className="w-4 h-4 text-eco-earth" />
                <span className="font-bold text-eco-earth">{profile?.points ?? 0}</span>
                <span className="text-sm text-eco-earth/70">pts</span>
              </div>

              {/* Mobile points */}
              <div className="sm:hidden flex items-center gap-1 bg-eco-sun/20 px-3 py-2 rounded-full">
                <Trophy className="w-4 h-4 text-eco-earth" />
                <span className="font-bold text-eco-earth text-sm">{profile?.points ?? 0}</span>
              </div>

              {/* Progress button */}
              <Button
                onClick={() => navigate('/progress')}
                variant="ghost"
                size="icon"
                className={`transition-colors ${isActive('/progress') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary'}`}
                title="View Progress"
              >
                <BarChart3 className="w-5 h-5" />
              </Button>

              {/* Leaderboard button */}
              <Button
                onClick={() => navigate('/leaderboard')}
                variant="ghost"
                size="icon"
                className={`transition-colors ${isActive('/leaderboard') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary'}`}
                title="Leaderboard"
              >
                <Crown className="w-5 h-5" />
              </Button>

              {/* Avatar - Only on dashboard */}
              {isDashboard && profile && (
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="w-10 h-10 rounded-full gradient-nature flex items-center justify-center shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  title="View Profile"
                >
                  {profile.gender === 'female' ? (
                    <span className="text-xl">👩</span>
                  ) : (
                    <span className="text-xl">👨</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <ProfileModal 
        open={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </>
  );
}
