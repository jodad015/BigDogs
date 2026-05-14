import type { LogCriteria } from './criteria.ts';

export class LoggingUtility {
  log(criteria: LogCriteria): void {
    console[criteria.level](`[${criteria.level.toUpperCase()}] ${criteria.message}`, criteria.context ?? '');
  }
}
