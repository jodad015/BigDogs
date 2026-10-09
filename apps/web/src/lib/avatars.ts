export const AVATARS = [
  'coral', 'crimson', 'ember', 'gold', 'lavender', 'mint', 'orange', 'peach',
  'plum', 'rose', 'ruby', 'sage', 'sky', 'slate', 'sunshine', 'teal',
] as const;

export type AvatarName = typeof AVATARS[number];

export function avatarSrc(name: string): string {
  return `/avatars/bigdog-${name}.svg`;
}
