import type { ResultBase } from '../../types/result-base.ts';

export interface ConfigLoadCriteria {
  key: string;
}

export interface ConfigLoadResult extends ResultBase {
  value?: string;
}
