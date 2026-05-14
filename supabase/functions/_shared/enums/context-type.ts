export const ContextType = {
  System: 'system',
  User: 'user',
  Draft: 'draft',
} as const;

export type ContextType = (typeof ContextType)[keyof typeof ContextType];
