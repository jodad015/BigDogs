export const LogLevel = {
  Info: 'info',
  Warn: 'warn',
  Error: 'error',
} as const;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];
