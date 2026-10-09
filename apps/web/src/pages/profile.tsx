import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { useProfile } from '@/hooks/use-profile';
import { AvatarPicker, avatarSrc } from '@/components/avatar-picker';
import { User, Pencil } from 'lucide-react';

export default function ProfilePage() {
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { profile, isLoading, updateProfile } = useProfile();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <User className="w-8 h-8 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-2 pb-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold text-center mb-5">Profile</h1>

      {/* Avatar + Identity */}
      <div className="flex flex-col items-center mb-6">
        <button
          onClick={() => setShowAvatarPicker(!showAvatarPicker)}
          className="relative group mb-3"
        >
          <img
            src={avatarSrc(profile.avatar)}
            alt=""
            className="w-16 h-16 rounded-full"
          />
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Pencil className="w-4 h-4 text-white" />
          </div>
        </button>
        {showAvatarPicker && (
          <div className="mb-3">
            <AvatarPicker
              selected={profile.avatar}
              onSelect={(name) => {
                updateProfile({ avatar: name });
                setShowAvatarPicker(false);
              }}
            />
          </div>
        )}
        {editingName ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && draftName.trim()) {
                  updateProfile({ display_name: draftName.trim() });
                  setEditingName(false);
                }
              }}
              autoFocus
              className="text-lg font-bold text-center bg-input border border-border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={() => {
                if (draftName.trim()) updateProfile({ display_name: draftName.trim() });
                setEditingName(false);
              }}
              className="text-xs font-semibold text-primary"
            >
              Save
            </button>
            <button onClick={() => setEditingName(false)} className="text-xs text-muted-foreground">
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setDraftName(profile.display_name); setEditingName(true); }}
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <p className="text-lg font-bold">{profile.display_name}</p>
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
        <p className="text-sm text-muted-foreground">{profile.email}</p>
      </div>

      {/* Appearance */}
      <div className="rounded-xl bg-card px-4 py-3.5 flex items-center justify-between mb-5">
        <span className="text-sm text-muted-foreground">Appearance</span>
        <div className="flex rounded-lg bg-input overflow-hidden">
          <button
            onClick={() => setTheme('dark')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              theme === 'dark' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            Dark
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              theme === 'light' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            Light
          </button>
        </div>
      </div>

      {/* Log Out */}
      <button
        onClick={signOut}
        className="w-full text-center text-destructive font-medium py-3 hover:underline"
      >
        Log Out
      </button>
    </div>
  );
}
