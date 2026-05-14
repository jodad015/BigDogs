import type { ValidationResult } from '../../types/validation-result.ts';
import { ErrorCode } from '../../enums/error-code.ts';

export class ValidationEngine {
  async validate(criteria: any): Promise<ValidationResult> {
    // Dispatch to per-request-type validators as they are implemented
    // For now, pass through
    return { valid: true, errors: [] };
  }
}
