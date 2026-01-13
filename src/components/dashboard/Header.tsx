import { useNavigate, useLocation } from 'react-router-dom';
import { Leaf, LogOut, Trophy, User, BarChart3, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function Header() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    toast.success('See you soon, eco-warrior! 🌿');
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-card/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl gradient-nature flex items-center justify-center shadow-soft">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-display font-bold text-xl text-foreground">EcoQuest</span>
              <span className="text-xl">🌱</span>
            </div>
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

            {/* Profile button */}
            <Button
              onClick={() => navigate('/profile')}
              variant="ghost"
              size="icon"
              className={`transition-colors ${isActive('/profile') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary'}`}
              title="View Profile"
            >
              <User className="w-5 h-5" />
            </Button>

            {/* Logout */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
