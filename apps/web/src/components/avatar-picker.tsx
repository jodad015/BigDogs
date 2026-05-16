const AVATARS = [
  'coral', 'crimson', 'ember', 'gold', 'lavender', 'mint', 'orange', 'peach',
  'plum', 'rose', 'ruby', 'sage', 'sky', 'slate', 'sunshine', 'teal',
] as const;

export type AvatarName = typeof AVATARS[number];

export function avatarSrc(name: string): string {
  return `/avatars/bigdog-${name}.svg`;
}

interface AvatarPickerProps {
  selected: string;
  onSelect: (name: string) => void;
}

export function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs text-muted-foreground">Choose Avatar</p>
      <div className="grid grid-cols-8 gap-1.5">
        {AVATARS.map((name) => (
          <button
            key={name}
            onClick={() => onSelect(name)}
            className={`w-9 h-9 rounded-full overflow-hidden transition-all ${
              selected === name
                ? 'ring-2 ring-white ring-offset-2 ring-offset-background scale-110'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <img src={avatarSrc(name)} alt={name} className="w-full h-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
