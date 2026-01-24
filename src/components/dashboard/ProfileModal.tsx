import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { PointsCounter } from '@/components/animations';

// Class options matching AuthForm
const CLASS_OPTIONS = [
  { value: 0, label: 'Nursery' },
  { value: 1, label: 'Class 1' },
  { value: 2, label: 'Class 2' },
  { value: 3, label: 'Class 3' },
  { value: 4, label: 'Class 4' },
  { value: 5, label: 'Class 5' },
  { value: 6, label: 'Class 6' },
  { value: 7, label: 'Class 7' },
  { value: 8, label: 'Class 8' },
  { value: 9, label: 'Class 9' },
  { value: 10, label: 'Class 10' },
  { value: 11, label: 'Others (College/Above)' },
];

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

  // Gender-based avatar emoji
  const avatarEmoji = (isEditing ? editedData.gender : profile.gender) === 'female' ? '👩' : '👨';

  // Get display label for class
  const getClassLabel = (classNum: number) => {
    const option = CLASS_OPTIONS.find(o => o.value === classNum);
    return option ? option.label : `Class ${classNum}`;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-[95vw] max-w-md mx-auto bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <motion.button
            onClick={onClose}
            className="absolute right-0 top-0 p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Close"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </motion.button>
          <div className="flex flex-col items-center pt-2">
            {/* Avatar - Gender-based */}
            <motion.div 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full gradient-nature flex items-center justify-center mb-3 shadow-glow"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-3xl sm:text-4xl">{avatarEmoji}</span>
            </motion.div>
            <DialogTitle className="font-display text-lg sm:text-xl text-foreground">
              {isEditing ? 'Edit Profile' : profile.name}
            </DialogTitle>
          </div>
        </DialogHeader>

        <motion.div 
          className="space-y-3 sm:space-y-4 py-3 sm:py-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Points Badge */}
          <motion.div 
            className="bg-eco-sun/20 rounded-xl p-3 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Trophy className="w-5 h-5 text-eco-earth" />
              </motion.div>
              <span className="font-display text-xl sm:text-2xl font-bold text-eco-earth">
                <PointsCounter value={profile.points} />
              </span>
              <span className="text-xs sm:text-sm text-eco-earth/70">Total Points</span>
            </div>
          </motion.div>

          {/* Profile Fields */}
          <div className="space-y-2 sm:space-y-3">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="editing"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
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
                      <SelectContent className="bg-popover max-h-60">
                        {CLASS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
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
                </motion.div>
              ) : (
                <motion.div
                  key="viewing"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-2"
                >
                  <ProfileField icon={<User className="w-4 h-4" />} label="Name" value={profile.name} />
                  <ProfileField icon={<School className="w-4 h-4" />} label="College / School" value={profile.institution} />
                  <ProfileField icon={<Calendar className="w-4 h-4" />} label="Class" value={getClassLabel(profile.class)} />
                  <ProfileField icon={<User className="w-4 h-4" />} label="Gender" value={profile.gender === 'female' ? 'Female' : 'Male'} />
                  <ProfileField icon={<MapPin className="w-4 h-4" />} label="State" value={profile.state} />
                  <ProfileField icon={<Globe className="w-4 h-4" />} label="Country" value={profile.country} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          {isEditing ? (
            <div className="flex gap-2">
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="w-full"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </motion.div>
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleSave}
                  className="w-full gradient-nature text-primary-foreground"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                onClick={handleEdit}
                className="w-full"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </motion.div>
          )}
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </motion.div>
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
    <motion.div 
      className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-muted/50 rounded-lg"
      whileHover={{ x: 4 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] sm:text-xs text-muted-foreground uppercase">{label}</p>
        <p className="text-xs sm:text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </motion.div>
  );
}
