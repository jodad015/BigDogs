import type { LogLevel } from '../../enums/log-level.ts';

export interface LogCriteria {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}
