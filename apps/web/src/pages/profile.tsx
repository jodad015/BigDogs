import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { useProfile, type ProfileUpdate } from '@/hooks/use-profile';
import { useChallenges } from '@/hooks/use-challenges';
import { AvatarPicker, avatarSrc } from '@/components/avatar-picker';
import { User, Pencil } from 'lucide-react';

function EditableField({
  label,
  value,
  displayValue,
  suffix,
  onSave,
  locked,
  lockReason,
}: {
  label: string;
  value: string;
  displayValue?: string;
  suffix?: string;
  onSave: (val: string) => Promise<void>;
  locked?: boolean;
  lockReason?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleSave = async () => {
    await onSave(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center justify-between py-3.5">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <input
            type={suffix ? 'number' : 'text'}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
            className="w-24 rounded-md border border-border bg-input px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button onClick={handleSave} className="text-xs font-semibold text-primary">Save</button>
          <button onClick={() => { setDraft(value); setEditing(false); }} className="text-xs text-muted-foreground">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-3.5">
      <div>
        <span className="text-sm text-muted-foreground">{label}</span>
        {locked && lockReason && (
          <p className="text-xs text-muted-foreground/60 mt-0.5">{lockReason}</p>
        )}
      </div>
      <button
        onClick={() => !locked && setEditing(true)}
        className={`flex items-center gap-2 text-sm font-semibold ${locked ? 'opacity-50 cursor-not-allowed' : 'hover:text-primary'} transition-colors`}
      >
        {displayValue || value || '—'}
        {suffix && value ? <span className="text-muted-foreground font-normal text-xs">{suffix}</span> : null}
        {!locked && <Pencil className="w-3 h-3 text-muted-foreground" />}
      </button>
    </div>
  );
}

function formatHeight(inches: number | null): string {
  if (!inches) return '—';
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

export default function ProfilePage() {
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { profile, isLoading, updateProfile } = useProfile();
  const { activeChallenge, hasActiveChallenge, leaveChallenge } = useChallenges();
  const [leaving, setLeaving] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [editingHeight, setEditingHeight] = useState(false);
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <User className="w-8 h-8 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  const saveField = (field: keyof ProfileUpdate) => async (val: string) => {
    const parsed = ['height_inches', 'age', 'personal_target_weight'].includes(field)
      ? val ? Number(val) : null
      : val;
    await updateProfile({ [field]: parsed });
  };

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

      {/* Personal Info Card */}
      <div className="rounded-xl bg-card px-4 divide-y divide-border mb-5">
        {/* Height — feet + inches editor */}
        <div className="flex items-center justify-between py-3.5">
          <span className="text-sm text-muted-foreground">Height</span>
          {editingHeight ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="3"
                max="8"
                value={heightFeet}
                onChange={(e) => setHeightFeet(e.target.value)}
                autoFocus
                className="w-12 rounded-md border border-border bg-input px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-xs text-muted-foreground">ft</span>
              <input
                type="number"
                min="0"
                max="11"
                value={heightInches}
                onChange={(e) => setHeightInches(e.target.value)}
                className="w-12 rounded-md border border-border bg-input px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-xs text-muted-foreground">in</span>
              <button
                onClick={async () => {
                  const total = (parseInt(heightFeet) || 0) * 12 + (parseInt(heightInches) || 0);
                  if (total > 0) await updateProfile({ height_inches: total });
                  setEditingHeight(false);
                }}
                className="text-xs font-semibold text-primary"
              >Save</button>
              <button onClick={() => setEditingHeight(false)} className="text-xs text-muted-foreground">Cancel</button>
            </div>
          ) : (
            <button
              onClick={() => {
                const ft = profile.height_inches ? Math.floor(profile.height_inches / 12) : 0;
                const inc = profile.height_inches ? profile.height_inches % 12 : 0;
                setHeightFeet(ft ? String(ft) : '');
                setHeightInches(inc ? String(inc) : '');
                setEditingHeight(true);
              }}
              className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
            >
              {formatHeight(profile.height_inches)}
              <Pencil className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>
        <EditableField
          label="Age"
          value={profile.age ? String(profile.age) : ''}
          onSave={saveField('age')}
        />
        <EditableField
          label="Personal Target"
          value={profile.personal_target_weight ? String(profile.personal_target_weight) : ''}
          suffix="lb"
          onSave={saveField('personal_target_weight')}
        />
      </div>

      {/* Challenge Section */}
      {hasActiveChallenge ? (
        <div className="rounded-xl bg-card px-4 py-4 mb-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Active Challenge</p>
          <p className="font-bold">{activeChallenge!.challenge.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5 capitalize">{activeChallenge!.status}</p>
          <button
            onClick={async () => {
              if (!confirm('Leave this challenge? This cannot be undone.')) return;
              setLeaving(true);
              await leaveChallenge();
              setLeaving(false);
            }}
            disabled={leaving}
            className="mt-3 text-xs text-destructive hover:underline disabled:opacity-50"
          >
            {leaving ? 'Leaving...' : 'Leave Challenge'}
          </button>
        </div>
      ) : (
        <div className="rounded-xl bg-card px-4 py-4 text-center mb-5">
          <p className="text-sm text-muted-foreground mb-1">No active challenge</p>
          <p className="text-sm font-semibold text-primary cursor-pointer hover:underline">
            Start a Challenge
          </p>
        </div>
      )}

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
