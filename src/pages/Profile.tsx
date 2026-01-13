import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, School, MapPin, Globe, Trophy, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/dashboard/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Profile = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-sky">
        <div className="animate-pulse text-primary font-display text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen gradient-sky leaf-pattern">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="eco-card animate-fade-in">
          <CardHeader className="text-center pb-2">
            <div className="w-20 h-20 mx-auto rounded-full gradient-nature flex items-center justify-center mb-4 shadow-glow">
              <User className="w-10 h-10 text-primary-foreground" />
            </div>
            <CardTitle className="font-display text-2xl text-foreground">{profile.name}</CardTitle>
            <p className="text-muted-foreground text-sm">Eco Warrior since {formatDate(profile.created_at)}</p>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            {/* Points Badge */}
            <div className="bg-eco-sun/20 rounded-2xl p-4 text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Trophy className="w-6 h-6 text-eco-earth" />
                <span className="font-display text-3xl font-bold text-eco-earth">{profile.points}</span>
              </div>
              <p className="text-sm text-eco-earth/70">Total Points Earned</p>
            </div>

            {/* Profile Details */}
            <div className="space-y-3">
              <ProfileItem 
                icon={<School className="w-5 h-5 text-primary" />}
                label="Institution"
                value={profile.institution}
                delay="0.15s"
              />
              
              <ProfileItem 
                icon={<Calendar className="w-5 h-5 text-primary" />}
                label="Class"
                value={`Class ${profile.class}`}
                delay="0.2s"
              />
              
              <ProfileItem 
                icon={<MapPin className="w-5 h-5 text-primary" />}
                label="State"
                value={profile.state}
                delay="0.25s"
              />
              
              <ProfileItem 
                icon={<Globe className="w-5 h-5 text-primary" />}
                label="Country"
                value={profile.country}
                delay="0.3s"
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

interface ProfileItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay: string;
}

function ProfileItem({ icon, label, value, delay }: ProfileItemProps) {
  return (
    <div 
      className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl animate-fade-in"
      style={{ animationDelay: delay }}
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default Profile;