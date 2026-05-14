import type { ErrorBase } from './error-base.ts';

export interface ValidationResult {
  valid: boolean;
  errors: ErrorBase[];
}
