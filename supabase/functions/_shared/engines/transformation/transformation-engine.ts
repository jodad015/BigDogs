import { ErrorCode } from '../../enums/error-code.ts';

export class TransformationEngine {
  transform(type: string, data: any): any {
    // Dispatch to per-type transformers as they are implemented
    throw new Error(`Transformation type '${type}' not implemented`);
  }
}
