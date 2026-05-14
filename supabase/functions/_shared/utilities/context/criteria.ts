import type { ContextBase } from '../../types/context.ts';
import type { ResultBase } from '../../types/result-base.ts';

export interface ContextEnrichCriteria {
  context: ContextBase;
}

export interface ContextEnrichResult extends ResultBase {
  contexts?: ContextBase[];
}
