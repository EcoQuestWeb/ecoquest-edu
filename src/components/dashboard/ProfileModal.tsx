import { useState } from 'react';
import { X, User, School, MapPin, Globe, Trophy, Calendar, LogOut, Pencil, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { profile, signOut, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState({
    name: profile?.name || '',
    institution: profile?.institution || '',
    class: profile?.class || 1,
    gender: profile?.gender || 'male',
  });

  const handleLogout = async () => {
    await signOut();
    toast.success('See you soon, eco-warrior! 🌿');
    onClose();
  };

  const handleEdit = () => {
    setEditedData({
      name: profile?.name || '',
      institution: profile?.institution || '',
      class: profile?.class || 1,
      gender: profile?.gender || 'male',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: editedData.name,
          institution: editedData.institution,
          class: editedData.class,
          gender: editedData.gender,
        })
        .eq('id', profile.id);

      if (error) {
        toast.error('Failed to update profile');
        return;
      }

      await refreshProfile();
      toast.success('Profile updated successfully! 🌱');
      setIsEditing(false);
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({
      name: profile?.name || '',
      institution: profile?.institution || '',
      class: profile?.class || 1,
      gender: profile?.gender || 'male',
    });
  };

  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-0 top-0 p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex flex-col items-center pt-2">
            {/* Avatar - Shows edited gender in edit mode */}
            <div className="w-20 h-20 rounded-full gradient-nature flex items-center justify-center mb-3 shadow-glow">
              {(isEditing ? editedData.gender : profile.gender) === 'female' ? (
                <span className="text-4xl">👩</span>
              ) : (
                <span className="text-4xl">👨</span>
              )}
            </div>
            <DialogTitle className="font-display text-xl text-foreground">
              {isEditing ? 'Edit Profile' : profile.name}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Points Badge */}
          <div className="bg-eco-sun/20 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-eco-earth" />
              <span className="font-display text-2xl font-bold text-eco-earth">{profile.points}</span>
              <span className="text-sm text-eco-earth/70">Total Points</span>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="space-y-3">
            {isEditing ? (
              <>
                {/* Editable: Name */}
                <div className="space-y-1">
                  <Label htmlFor="edit-name" className="text-xs text-muted-foreground uppercase">Name</Label>
                  <Input
                    id="edit-name"
                    value={editedData.name}
                    onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                    className="bg-muted/50"
                  />
                </div>

                {/* Editable: Institution */}
                <div className="space-y-1">
                  <Label htmlFor="edit-institution" className="text-xs text-muted-foreground uppercase">College / School</Label>
                  <Input
                    id="edit-institution"
                    value={editedData.institution}
                    onChange={(e) => setEditedData({ ...editedData, institution: e.target.value })}
                    className="bg-muted/50"
                  />
                </div>

                {/* Editable: Class */}
                <div className="space-y-1">
                  <Label htmlFor="edit-class" className="text-xs text-muted-foreground uppercase">Class</Label>
                  <Select
                    value={editedData.class.toString()}
                    onValueChange={(value) => setEditedData({ ...editedData, class: parseInt(value) })}
                  >
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          Class {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Editable: Gender */}
                <div className="space-y-1">
                  <Label htmlFor="edit-gender" className="text-xs text-muted-foreground uppercase">Gender</Label>
                  <Select
                    value={editedData.gender}
                    onValueChange={(value) => setEditedData({ ...editedData, gender: value })}
                  >
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Read-only fields in edit mode */}
                <ProfileField icon={<MapPin className="w-4 h-4" />} label="State" value={profile.state} />
                <ProfileField icon={<Globe className="w-4 h-4" />} label="Country" value={profile.country} />
              </>
            ) : (
              <>
                <ProfileField icon={<User className="w-4 h-4" />} label="Name" value={profile.name} />
                <ProfileField icon={<School className="w-4 h-4" />} label="College / School" value={profile.institution} />
                <ProfileField icon={<Calendar className="w-4 h-4" />} label="Class" value={`Class ${profile.class}`} />
                <ProfileField icon={<User className="w-4 h-4" />} label="Gender" value={profile.gender === 'female' ? 'Female' : 'Male'} />
                <ProfileField icon={<MapPin className="w-4 h-4" />} label="State" value={profile.state} />
                <ProfileField icon={<Globe className="w-4 h-4" />} label="Country" value={profile.country} />
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 gradient-nature text-primary-foreground"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={handleEdit}
              className="w-full"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
          
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ProfileFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function ProfileField({ icon, label, value }: ProfileFieldProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground uppercase">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
